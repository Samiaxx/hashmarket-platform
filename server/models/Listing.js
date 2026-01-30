const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  // Image is optional to prevent API crash
  image_url: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "SOLD"],
    default: "PENDING",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

// ✅ FIX OverwriteModelError
module.exports =
  mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
