const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Ensure you have auth middleware
const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User');

// POST /api/seller/onboard
router.post('/onboard', auth, async (req, res) => {
  try {
    const { 
      displayName, tagline, bio, profileImage, 
      mainCategory, skills, experienceLevel, languages,
      portfolio, socialLinks, payoutWallet 
    } = req.body;

    // 1. Create Seller Profile
    const newProfile = new SellerProfile({
      user: req.user.id,
      displayName, tagline, bio, profileImage,
      mainCategory, skills, experienceLevel, languages,
      portfolio, socialLinks, payoutWallet,
      badges: ['New Seller']
    });

    await newProfile.save();

    // 2. Upgrade User Role
    await User.findByIdAndUpdate(req.user.id, { role: 'seller' });

    res.json(newProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;