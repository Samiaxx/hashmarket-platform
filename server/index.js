const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const { ethers } = require("ethers"); // Required for MetaMask verification
const { OAuth2Client } = require('google-auth-library'); // Required for Google Login
require("dotenv").config();

const app = express();

// --- CORS CONFIGURATION ---
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- SUPABASE CONNECTION ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// =========================================================================
// 1. AUTHENTICATION ROUTES (Register, Login, MetaMask, Google)
// =========================================================================

// REGISTER (Email/Password)
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const { data: existing } = await supabase.from("users").select("*").eq("email", email).single();
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from("users").insert([{ 
      username, email, password: hashed, role: role || "buyer", created_at: new Date() 
    }]).select().single();
    
    if (error) throw error;
    
    const payload = { user: { id: data.id, username: data.username, role: data.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// LOGIN (Email/Password)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Invalid credentials" });
    
    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch { res.status(500).send("Server error"); }
});

// LOGIN (MetaMask / SIWE)
app.post("/api/auth/metamask", async (req, res) => {
  const { address, signature, message } = req.body;
  try {
    // Verify Signature
    const signerAddr = ethers.verifyMessage(message, signature);
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ msg: "Invalid signature verification" });
    }

    // Find or Create User
    let { data: user } = await supabase.from("users").select("*").eq("wallet_address", address).single();
    
    if (!user) {
      const { data: newUser, error } = await supabase.from("users").insert([{
        wallet_address: address,
        username: `User_${address.substring(0,6)}`,
        role: "buyer",
        created_at: new Date()
      }]).select().single();
      if (error) throw error;
      user = newUser;
    }

    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch (err) { res.status(500).json({ msg: "Wallet login failed" }); }
});

// LOGIN (Google)
app.post("/api/auth/google", async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name, picture } = ticket.getPayload();

    let { data: user } = await supabase.from("users").select("*").eq("email", email).single();

    if (!user) {
      const { data: newUser, error } = await supabase.from("users").insert([{
        email, username: name, profile_image: picture, role: "buyer", created_at: new Date()
      }]).select().single();
      if (error) throw error;
      user = newUser;
    }

    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (_, token) => res.json({ token, user: payload.user }));
  } catch (err) { res.status(401).json({ msg: "Google login failed" }); }
});

// LOGIN (Google Manual - for useGoogleLogin hook)
app.post("/api/auth/google-manual", async (req, res) => {
  const { email, name, picture } = req.body;
  
  try {
    let { data: user } = await supabase.from("users").select("*").eq("email", email).single();

    if (!user) {
      const { data: newUser, error } = await supabase.from("users").insert([{
        email, 
        username: name, 
        profile_image: picture, 
        role: "buyer", 
        created_at: new Date()
      }]).select().single();
      
      if (error) throw error;
      user = newUser;
    }

    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (_, token) => res.json({ token, user: payload.user }));
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error during Google Login" });
  }
});


// =========================================================================
// 2. SELLER ONBOARDING ROUTE (The Wizard)
// =========================================================================
app.post("/api/seller/onboard", auth, async (req, res) => {
  const { 
    displayName, tagline, bio, profileImage, 
    mainCategory, skills, experienceLevel, languages,
    portfolio, socialLinks, payoutWallet 
  } = req.body;

  try {
    // 1. Create/Update Seller Profile
    const { data, error } = await supabase.from("seller_profiles").upsert([{
      user_id: req.user.id,
      display_name: displayName,
      tagline,
      bio,
      profile_image: profileImage,
      main_category: mainCategory,
      skills, // Assumes Supabase column is TEXT[]
      experience_level: experienceLevel,
      languages, // JSONB
      portfolio, // JSONB
      social_links: socialLinks, // JSONB
      payout_wallet: payoutWallet,
      badges: ['New Seller'],
      created_at: new Date()
    }]).select().single();

    if (error) throw error;

    // 2. Upgrade User Role
    await supabase.from("users").update({ role: 'seller' }).eq("id", req.user.id);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error: " + err.message);
  }
});


// =========================================================================
// 3. MARKETPLACE LISTINGS
// =========================================================================
app.get("/api/listings", async (req, res) => {
  const { seller, cat } = req.query;
  try {
    let query = supabase.from("listings").select("*, users(username, created_at)").eq("status", "APPROVED");
    
    if (seller) {
      const { data: user } = await supabase.from("users").select("id").eq("username", seller).single();
      if (user) query = query.eq("seller_id", user.id);
    }
    
    if (cat) {
      query = query.ilike('category', `%${cat.replace('-', ' ')}%`);
    }

    const { data } = await query;
    
    const formatted = data ? data.map(item => ({
      ...item,
      _id: item.id,
      sellerName: item.users?.username || 'Unknown',
      isNewSeller: (new Date() - new Date(item.users?.created_at)) / (1000 * 60 * 60 * 24) < 30
    })) : [];
    
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


// =========================================================================
// 4. DASHBOARD & ORDERS
// =========================================================================

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
      item_title: listing.title,
      created_at: new Date()
    }]).select().single();

    if (error) throw error;
    res.json(order);
  } catch { res.status(500).send("Server Error"); }
});

app.get("/api/dashboard", auth, async (req, res) => {
  try {
    const { data: purchases } = await supabase.from("orders")
      .select("*")
      .eq("buyer_id", req.user.id)
      .order('created_at', { ascending: false });

    const { data: sales } = await supabase.from("orders")
      .select("*")
      .eq("seller_id", req.user.id)
      .order('created_at', { ascending: false });

    const formatOrder = (o) => ({
      id: o.id,
      itemTitle: o.item_title || "Item",
      amount: o.amount,
      status: o.status,
      buyerId: o.buyer_id,
      sellerId: o.seller_id
    });

    res.json({
      purchases: purchases ? purchases.map(formatOrder) : [],
      sales: sales ? sales.map(formatOrder) : []
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Dashboard Error");
  }
});

app.put("/api/orders/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  try {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch { res.status(500).send("Update Failed"); }
});


// =========================================================================
// 5. SERVER START
// =========================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HashMarket Server running on port ${PORT}`);
});