const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // ROLE SELECTION
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'], // Kept 'admin' for your use
    default: 'buyer' 
  },

  // --- NEW: VERIFICATION FIELDS ---
  isVerified: { type: Boolean, default: false }, // false until email link is clicked
  verificationToken: { type: String }, // Stores the random token sent to email

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);