const mongoose = require('mongoose');
const StoreSettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: '' },
  defaultCurrency: { type: String, default: 'USD' },
  defaultLanguage: { type: String, default: 'en' },
}, { timestamps: true });
module.exports = mongoose.model('StoreSettings', StoreSettingsSchema);