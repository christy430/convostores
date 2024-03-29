
const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  discountOn: {
    type: String,
    enum: ["product", "category"],
    required: true,
  },

  discountValue: {
    type: Number,
    required: true,
  },
  maxAmt: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  discountedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  discountedCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
});


module.exports = mongoose.model("Offer", offerSchema);
