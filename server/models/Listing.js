const mongoose = require('mongoose');
const ListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image_url: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SOLD'], default: 'PENDING' },
  created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Listing', ListingSchema);