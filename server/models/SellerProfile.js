const mongoose = require('mongoose');

const SellerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  display_name: String,
  tagline: String,
  bio: String,
  profile_image: String,
  main_category: String,
  skills: [String],
  experience_level: String,
  languages: Array,
  portfolio: Array,
  social_links: Object,
  payout_wallet: String,
  badges: [String],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SellerProfile', SellerProfileSchema);