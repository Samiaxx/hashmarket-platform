const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

// --- CORS CONFIGURATION (Allow All Origins) ---
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- SUPABASE CONNECTION ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- ROOT ROUTE (Health Check) ---
app.get("/", (_, res) => res.send("HashMarket Crypto-Gateway API is Running on Render!"));

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Check if user exists
    const { data: existing } = await supabase.from("users").select("*").eq("email", email).single();
    if (existing) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create User
    const { data, error } = await supabase.from("users").insert([{ 
      username, email, password: hashed, role: role || "buyer", created_at: new Date() 
    }]).select().single();
    
    if (error) throw error;
    
    const payload = { user: { id: data.id, username, role: data.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Invalid credentials" });
    
    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch { res.status(500).send("Server error"); }
});

// --- LISTINGS ROUTES (Physical, Digital, Freelance) ---
app.get("/api/listings", async (req, res) => {
  const { seller } = req.query;
  try {
    let query = supabase.from("listings").select("*, users(username, created_at)").eq("status", "APPROVED");
    if (seller) {
      const { data: user } = await supabase.from("users").select("id").eq("username", seller).single();
      if (user) query = query.eq("seller_id", user.id);
    }
    const { data } = await query;
    
    // Format for frontend (Calculates "New Seller" status dynamically)
    const formatted = data.map(item => ({
      ...item,
      _id: item.id, // Frontend expects _id
      sellerName: item.users?.username,
      isNewSeller: (new Date() - new Date(item.users?.created_at)) / (1000 * 60 * 60 * 24) < 30
    }));
    res.json(formatted);
  } catch { res.status(500).send("Server error"); }
});

app.post("/api/listings", auth, async (req, res) => {
  const { title, description, price, category, imageUrl } = req.body;
  try {
    const { data, error } = await supabase.from("listings").insert([{
      seller_id: req.user.id, title, description, price, category, image_url: imageUrl, status: "APPROVED"
    }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch { res.status(500).send("Server error"); }
});

// --- SELLER PROFILE (Top Rated Logic) ---
app.get("/api/sellers/:id", async (req, res) => {
  try {
    let { data: user } = await supabase.from("users").select("*").eq("username", req.params.id).single();
    if (!user) {
      const { data: byId } = await supabase.from("users").select("*").eq("id", req.params.id).single();
      user = byId;
    }
    if (!user) return res.status(404).json({ msg: "Seller not found" });

    const { data: listings } = await supabase.from("listings").select("id").eq("seller_id", user.id);
    const { data: reviews } = await supabase.from("reviews").select("rating").eq("seller_id", user.id);
    
    const ratingAvg = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) : 0;
    const isTopRated = ratingAvg >= 4.5 && reviews.length >= 5;
    const isNew = (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24) < 30;

    res.json({
      ...user,
      stats: {
        listings: listings.length,
        reviews: reviews.length,
        rating: ratingAvg.toFixed(1),
        isTopRated,
        isNew
      }
    });
  } catch (err) { res.status(500).send("Server error"); }
});

// --- ORDERS (Crypto Escrow) ---
app.post("/api/orders", auth, async (req, res) => {
  const { listingId, amount, txHash } = req.body;
  try {
    const { data: listing } = await supabase.from("listings").select("*").eq("id", listingId).single();
    if (!listing) return res.status(404).json({ msg: "Item not found" });

    const { data: order, error } = await supabase.from("orders").insert([{
      buyer_id: req.user.id,
      seller_id: listing.seller_id,
      listing_id: listingId,
      amount: amount,
      status: "PAID",
      tx_hash: txHash,
      created_at: new Date()
    }]).select().single();

    if (error) throw error;
    res.json(order);
  } catch { res.status(500).send("Server Error"); }
});

// --- REVIEWS (Verified Buyers Only) ---
app.post("/api/reviews", auth, async (req, res) => {
  const { listingId, rating, comment } = req.body;
  try {
    const { data: order } = await supabase.from("orders")
      .select("*")
      .eq("buyer_id", req.user.id)
      .eq("listing_id", listingId)
      .single();

    if (!order) return res.status(403).json({ msg: "You must purchase this item with crypto before reviewing." });

    const { data: listing } = await supabase.from("listings").select("seller_id").eq("id", listingId).single();

    const { data, error } = await supabase.from("reviews").insert([{
      buyer_id: req.user.id,
      seller_id: listing.seller_id,
      listing_id: listingId,
      rating,
      comment,
      created_at: new Date()
    }]).select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).send(err.message); }
});

// --- START SERVER (REQUIRED FOR RENDER) ---
// This is the critical part for your Render deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});