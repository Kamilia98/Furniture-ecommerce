const mongoose = require('mongoose');
const LanguageSchema = new mongoose.Schema(
  {
    code: { type: String, default: 'CODE' },
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Language', LanguageSchema);
