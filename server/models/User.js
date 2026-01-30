const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'], 
    default: 'buyer' 
  },
  // --- SENDGRID VERIFICATION ---
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  // --- WEB3 PAYOUTS ---
  wallet_address: { 
    type: String, 
    unique: true, 
    sparse: true,
    lowercase: true 
  },
  // --- THE GATEKEEPER FLAG (NEW) ---
  // If a seller has this set to false, the dashboard will kick them back to onboarding
  onboardingCompleted: { 
    type: Boolean, 
    default: false 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);