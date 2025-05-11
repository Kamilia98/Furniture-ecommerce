const mongoose = require('mongoose');
const LanguageSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: null },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Language', LanguageSchema);
