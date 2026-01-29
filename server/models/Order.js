const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  amount: { type: Number, required: true },
  itemTitle: String, txHash: String,
  status: { type: String, default: 'PAID' },
  created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);