const mongoose = require("mongoose");

const SellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // MUST MATCH backend index.js
  displayName: { type: String, default: "" },
  tagline: { type: String, default: "" },
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },

  mainCategory: { type: String, default: "" },
  skills: { type: [String], default: [] },
  experienceLevel: { type: String, default: "" },

  languages: { type: Array, default: [] },
  portfolio: { type: Array, default: [] },

  socialLinks: { type: Object, default: {} },
  payoutWallet: { type: String, default: "" },

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SellerProfile", SellerProfileSchema);
