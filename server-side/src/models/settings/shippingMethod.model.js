const mongoose = require('mongoose');
const ShippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model('ShippingMethod', ShippingMethodSchema);