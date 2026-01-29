const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
require("dotenv").config();

// --- IMPORT MODELS ---
const User = require("./models/User");
const Listing = require("./models/Listing");
const SellerProfile = require("./models/SellerProfile");
const Order = require("./models/Order"); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: HashMarket Production DB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// --- ADMIN MIDDLEWARE ---
const adminAuth = async (req, res, next) => {
  auth(req, res, async () => {
    try {
      const user = await User.findById(req.user.id);
      if (user.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied: Admins Only" });
      }
      next();
    } catch (err) {
      res.status(500).send("Server Error");
    }
  });
};

// =========================================================================
// 1. AUTH ROUTES
// =========================================================================

// Register User
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword, role: role || "buyer" });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });
  } catch (err) { res.status(500).send("Server error"); }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });
  } catch (err) { res.status(500).send("Server error"); }
});

// =========================================================================
// 2. SELLER & PROFILE ROUTES
// =========================================================================

// Onboard Seller (And save their payout wallet)
app.post("/api/seller/onboard", auth, async (req, res) => {
  const { displayName, tagline, bio, profileImage, mainCategory, skills, experienceLevel, languages, portfolio, socialLinks, payoutWallet } = req.body;
  try {
    const profileFields = {
      user: req.user.id, displayName, tagline, bio, profileImage, mainCategory, skills, experienceLevel, languages, portfolio, socialLinks, payoutWallet
    };

    // Update User model with wallet for easier access
    await User.findByIdAndUpdate(req.user.id, { 
      role: "seller", 
      wallet_address: payoutWallet // Save wallet to User model too
    });

    let profile = await SellerProfile.findOne({ user: req.user.id });
    if (profile) {
      profile = await SellerProfile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
    } else {
      profile = new SellerProfile(profileFields);
      await profile.save();
    }
    
    res.json(profile);
  } catch (err) { res.status(500).send("Server Error"); }
});

// =========================================================================
// 3. MARKETPLACE ROUTES
// =========================================================================

// GET ALL LISTINGS
app.get("/api/listings", async (req, res) => {
  const { seller, cat } = req.query;
  try {
    let filter = { status: "APPROVED" };
    if (seller) {
      const sellerUser = await User.findOne({ username: seller });
      if (sellerUser) filter.seller = sellerUser.id;
    }
    if (cat) filter.category = { $regex: cat.replace('-', ' '), $options: "i" };

    // Populate seller and their wallet address
    const listings = await Listing.find(filter).populate("seller", "username wallet_address created_at");
    
    const formatted = listings.map(item => ({
      ...item._doc,
      sellerName: item.seller?.username || "Unknown",
      sellerWalletAddress: item.seller?.wallet_address || "",
      isNewSeller: item.seller?.created_at && (new Date() - new Date(item.seller.created_at)) / (1000 * 60 * 60 * 24) < 30
    }));
    res.json(formatted);
  } catch (err) { res.status(500).send("Server Error"); }
});

// GET SINGLE LISTING (Crucial for Checkout)
app.get("/api/listings/:id", async (req, res) => {
  try {
    // We populate 'wallet_address' so the frontend can send it to the Escrow contract
    const listing = await Listing.findById(req.params.id).populate("seller", "username wallet_address created_at");
    if (!listing) return res.status(404).json({ msg: "Item not found" });
    
    const profile = await SellerProfile.findOne({ user: listing.seller._id });
    res.json({
      ...listing._doc,
      sellerName: listing.seller.username,
      sellerWalletAddress: listing.seller.wallet_address, // Needed for createOrder()
      sellerImage: profile?.profileImage || profile?.profile_image
    });
  } catch (err) { res.status(500).send("Server Error"); }
});

// Create New Listing
app.post("/api/listings", auth, async (req, res) => {
  try {
    const newListing = new Listing({
      seller: req.user.id,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image_url: req.body.imageUrl || req.body.image_url, 
      status: "PENDING"
    });
    const listing = await newListing.save();
    res.json(listing);
  } catch (err) { res.status(500).send("Server Error"); }
});

// =========================================================================
// 4. ORDERS & DASHBOARD
// =========================================================================

// Create Order after Blockchain Payment
app.post("/api/orders", auth, async (req, res) => {
  try {
    const { listingId, amount, txHash } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ msg: "Listing not found" });

    const newOrder = new Order({
      buyer: req.user.id, 
      seller: listing.seller, 
      listing: listingId,
      amount, 
      txHash, 
      itemTitle: listing.title, 
      status: "PAID" // Initial state after buyer deposits to contract
    });
    const order = await newOrder.save();
    res.json(order);
  } catch (err) { res.status(500).send("Server Error"); }
});

// Dashboard Data
app.get("/api/dashboard", auth, async (req, res) => {
  try {
    const purchases = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    const sales = await Order.find({ seller: req.user.id }).sort({ createdAt: -1 });
    
    const formatOrder = (o) => ({ 
      id: o._id, 
      itemTitle: o.itemTitle, 
      amount: o.amount, 
      status: o.status, 
      buyerId: o.buyer, 
      sellerId: o.seller,
      txHash: o.txHash 
    });

    res.json({ 
      purchases: purchases.map(formatOrder), 
      sales: sales.map(formatOrder) 
    });
  } catch (err) { res.status(500).send("Server Error"); }
});

// Update Order Status (e.g., PAID -> SHIPPED -> COMPLETED)
app.put("/api/orders/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) { res.status(500).send("Server Error"); }
});

// =========================================================================
// 5. ADMIN ROUTES
// =========================================================================
app.get("/api/admin/listings", adminAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ status: "PENDING" }).populate("seller", "username");
    res.json(listings);
  } catch (err) { res.status(500).send("Server Error"); }
});

app.put("/api/admin/moderate/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(listing);
  } catch (err) { res.status(500).send("Server Error"); }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HashMarket Server running on port ${PORT}`));