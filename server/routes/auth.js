const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const {
  login,
  register,
  verifyEmail,
  loginWithMetamask,
  loginWithGoogle
} = require('../controllers/authController');


// =============================
// Auth Middleware
// =============================
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};


// =============================
// Routes
// =============================
router.post('/login', login);
router.post('/register', register);

// ✅ THIS IS THE MISSING ROUTE
router.get('/verify-email', verifyEmail);

router.post('/metamask', loginWithMetamask);
router.post('/google', loginWithGoogle);


// =============================
// GET current logged-in user
// =============================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
