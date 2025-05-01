const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    profile: {
      name: { type: String },
      email: { type: String },
      picture: { type: String }
    },
    theme: {
      mode: { 
        type: String, 
        enum: ['light', 'dark', 'system'],
        default: 'light'
      },
      primaryColor: { type: String, default: '#4f46e5' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    security: {
      twoFactor: { 
        type: String, 
        enum: ['enabled', 'disabled'],
        default: 'disabled'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);