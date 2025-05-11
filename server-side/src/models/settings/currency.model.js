const mongoose = require('mongoose');
const CurrencySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Currency', CurrencySchema);
