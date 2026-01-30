const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// --- IMPORT MODELS ---
const User = require("./models/User");
const Listing = require("./models/Listing");
const SellerProfile = require("./models/SellerProfile");
const Order = require("./models/Order");

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.status(200).send("HashMarket backend running ✅");
});

// --- SENDGRID CONFIG ---
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY missing in environment");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// --- MONGODB CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
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
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// --- ADMIN MIDDLEWARE ---
const adminAuth = async (req, res, next) => {
  auth(req, res, async () => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ msg: "Access Denied: Admins Only" });
      }
      next();
    } catch (err) {
      return res.status(500).json({ msg: "Server Error", error: err.message });
    }
  });
};

// =========================================================================
// 1) AUTH ROUTES
// =========================================================================

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "buyer",
      isVerified: false,
    });

    await user.save();

    // Generate verification token (24h)
    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    if (!process.env.EMAIL_FROM) {
      return res.status(500).json({ msg: "EMAIL_FROM missing in backend env" });
    }

    // Send email
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Verify your HashMarket Account",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#0f172a;">Welcome to HashMarket!</h2>
          <p style="color:#475569;">Click the button below to verify your email address.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${verifyUrl}" style="background-color:#06b6d4;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email Address</a>
          </div>
          <p style="font-size:12px;color:#94a3b8;">Link expires in 24 hours.</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return res.json({ msg: "Registration successful! Please check your email." });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ msg: "Token is missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.isVerified) return res.status(200).json({ msg: "User already verified" });

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ msg: "Email verified successfully! You can now log in." });
  } catch (err) {
    return res.status(400).json({ msg: "Token is invalid or has expired." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    if (!user.isVerified) {
      return res.status(401).json({ msg: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      return res.json({
        token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// =========================================================================
// 2) SELLER PROFILE ROUTES
// =========================================================================

app.post("/api/seller/onboard", auth, async (req, res) => {
  const {
    displayName,
    tagline,
    bio,
    profileImage,
    mainCategory,
    skills,
    experienceLevel,
    languages,
    portfolio,
    socialLinks,
    payoutWallet,
  } = req.body;

  try {
    const profileFields = {
      user: req.user.id,
      displayName,
      tagline,
      bio,
      profileImage,
      mainCategory,
      skills,
      experienceLevel,
      languages,
      portfolio,
      socialLinks,
      payoutWallet,
    };

    await User.findByIdAndUpdate(req.user.id, {
      role: "seller",
      wallet_address: payoutWallet,
      onboardingCompleted: true,
    });

    let profile = await SellerProfile.findOne({ user: req.user.id });

    if (profile) {
      profile = await SellerProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
    } else {
      profile = new SellerProfile(profileFields);
      await profile.save();
    }

    return res.json(profile);
  } catch (err) {
    console.error("Seller onboard error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// =========================================================================
// 3) MARKETPLACE ROUTES
// =========================================================================

app.get("/api/listings", async (req, res) => {
  const { seller, cat } = req.query;

  try {
    let filter = { status: "APPROVED" };

    if (seller) {
      const sellerUser = await User.findOne({ username: seller });
      if (sellerUser) filter.seller = sellerUser.id;
    }

    if (cat) filter.category = { $regex: cat.replace("-", " "), $options: "i" };

    const listings = await Listing.find(filter).populate(
      "seller",
      "username wallet_address created_at"
    );

    const formatted = listings.map((item) => ({
      ...item._doc,
      sellerName: item.seller?.username || "Unknown",
      sellerWalletAddress: item.seller?.wallet_address || "",
      isNewSeller:
        item.seller?.created_at &&
        (new Date() - new Date(item.seller.created_at)) / (1000 * 60 * 60 * 24) < 30,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("❌ /api/listings error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "username wallet_address created_at"
    );

    if (!listing) return res.status(404).json({ msg: "Item not found" });

    const profile = await SellerProfile.findOne({ user: listing.seller._id });

    return res.json({
      ...listing._doc,
      sellerName: listing.seller.username,
      sellerWalletAddress: listing.seller.wallet_address,
      sellerImage: profile?.profileImage || "",
    });
  } catch (err) {
    console.error("Listing detail error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

app.post("/api/listings", auth, async (req, res) => {
  try {
    const newListing = new Listing({
      seller: req.user.id,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image_url: req.body.imageUrl || req.body.image_url || "",
      status: "PENDING",
    });

    const listing = await newListing.save();
    return res.json(listing);
  } catch (err) {
    console.error("Create listing error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// =========================================================================
// 4) ORDERS & DASHBOARD
// =========================================================================

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
      status: "PAID",
    });

    const order = await newOrder.save();
    return res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

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
      txHash: o.txHash,
      createdAt: o.createdAt,
    });

    return res.json({
      purchases: purchases.map(formatOrder),
      sales: sales.map(formatOrder),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

app.put("/api/orders/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// =========================================================================
// 5) ADMIN ROUTES
// =========================================================================

app.get("/api/admin/listings", adminAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ status: "PENDING" }).populate("seller", "username");
    return res.json(listings);
  } catch (err) {
    console.error("Admin listings error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

app.put("/api/admin/moderate/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.json(listing);
  } catch (err) {
    console.error("Admin moderate error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// =========================================================================
// START SERVER
// =========================================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HashMarket Server running on port ${PORT}`));
