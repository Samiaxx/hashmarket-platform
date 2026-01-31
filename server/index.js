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

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// CORS (FIXED)
// =====================================================
const allowedOrigins = [
  process.env.CLIENT_URL,           // e.g. https://hashmarket.buzz
  "https://hashmarket.buzz",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman/curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
  })
);

// Fix preflight for all routes
app.options("*", cors());

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/", (req, res) => {
  res.status(200).send("HashMarket backend running ✅");
});

// =====================================================
// SENDGRID CONFIG
// =====================================================
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY missing in environment");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ SendGrid API Key loaded");
}

// =====================================================
// MONGODB CONNECTION
// =====================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// =====================================================
// AUTH MIDDLEWARE
// =====================================================
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// =====================================================
// ADMIN MIDDLEWARE
// =====================================================
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
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Username, email and password are required" });
    }

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

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

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
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

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

// =========================================================================
// GLOBAL ERROR HANDLER (IMPORTANT)
// =========================================================================
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  return res.status(500).json({ msg: "Server error", error: err.message });
});

// =========================================================================
// START SERVER
// =========================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HashMarket Server running on port ${PORT}`));
