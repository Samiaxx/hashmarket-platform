const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'], 
    default: 'buyer' 
  },
  wallet_address: { type: String, unique: true, sparse: true }, // Sparse allows null values
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);