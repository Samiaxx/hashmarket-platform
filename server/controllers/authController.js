const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const { OAuth2Client } = require('google-auth-library');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ===============================
// Helpers
// ===============================
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const buildVerifyLink = (token) => {
  // Frontend link user clicks
  return `${process.env.CLIENT_URL}/verify-email?token=${token}`;
};


// ===============================
// 1) REGISTER (Email + Password)
// ===============================
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Username, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "buyer",
      isVerified: false
    });

    await user.save();

    // create verification token
    const verifyToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verifyLink = buildVerifyLink(verifyToken);

    // send email
    await sgMail.send({
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: "Verify your HashMarket account",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to HashMarket 👋</h2>
          <p>Please verify your email address to activate your account.</p>
          <a href="${verifyLink}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">
            Verify Email
          </a>
          <p style="margin-top:14px;font-size:12px;color:#666;">
            If you didn't create this account, ignore this email.
          </p>
        </div>
      `
    });

    return res.json({ msg: "Registration successful! Please check your email." });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// ===============================
// 2) VERIFY EMAIL
// ===============================
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ msg: "Token is required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isVerified = true;
    await user.save();

    return res.json({ msg: "Email verified successfully. You can now login." });

  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(400).json({ msg: "Invalid or expired token" });
  }
};


// ===============================
// 3) LOGIN (Email + Password)
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // block login until verified
    if (!user.isVerified) {
      return res.status(403).json({ msg: "Please verify your email before logging in." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// ===============================
// 4) METAMASK LOGIN
// ===============================
exports.loginWithMetamask = async (req, res) => {
  const { address, signature, message } = req.body;

  try {
    const signerAddr = ethers.verifyMessage(message, signature);

    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ msg: "Invalid signature verification" });
    }

    let user = await User.findOne({ walletAddress: address });
    if (!user) {
      user = new User({
        walletAddress: address,
        role: 'buyer',
        username: `User_${address.substring(0, 6)}`,
        isVerified: true
      });
      await user.save();
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        walletAddress: user.walletAddress
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Wallet login failed" });
  }
};


// ===============================
// 5) GOOGLE LOGIN
// ===============================
exports.loginWithGoogle = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        username: name,
        profileImage: picture,
        role: 'buyer',
        provider: 'google',
        isVerified: true
      });
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user });

  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Google authentication failed" });
  }
};
