const mongoose = require('mongoose');

const SellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Step 1: Identity
  displayName: { type: String, required: true },
  tagline: { type: String, required: true },
  bio: { type: String, required: true, minlength: 50 },
  profileImage: { type: String, default: '' }, // URL

  // Step 2: Professional Info
  mainCategory: { type: String, required: true },
  skills: [{ type: String }], // Array of tags
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' },
  languages: [{ language: String, level: String }],

  // Step 3: Portfolio & Social
  portfolio: [{ title: String, link: String, description: String }],
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String
  },

  // Step 4: Security & Stats
  payoutWallet: { type: String, required: true }, // Crypto Wallet Address
  isVerified: { type: Boolean, default: false },
  badges: [{ type: String }], // ['New Seller', 'Verified Pro']
  
  // Operational
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SellerProfile', SellerProfileSchema);