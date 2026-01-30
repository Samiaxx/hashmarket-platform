const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },

    amount: { type: Number, required: true },

    itemTitle: { type: String, default: "" },
    txHash: { type: String, default: "" },

    status: { type: String, default: "PAID" },
  },
  { timestamps: true } // gives createdAt + updatedAt
);

module.exports = mongoose.model("Order", OrderSchema);
