const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer",
  },

  // Email verification
  isVerified: {
    type: Boolean,
    default: false,
  },

  // Wallet address
  wallet_address: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },

  onboardingCompleted: {
    type: Boolean,
    default: false,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

// ✅ FIX OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
