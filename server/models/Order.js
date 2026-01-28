const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  amount: { type: String, required: true }, // Storing crypto amount as string is safer
  txHash: { type: String, required: true },
  itemTitle: { type: String },
  status: { 
    type: String, 
    enum: ['PAID', 'DELIVERED', 'COMPLETED', 'DISPUTED'], 
    default: 'PAID' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);