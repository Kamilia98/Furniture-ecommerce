const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    // username: { type: String},
    email: { type: String, unique: true },
    phone: { type: String },
    bio: { type: String },
    country: { type: String },
    city: { type: String },
    password: { type: String },
    googleId: { type: String },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "MANAGER", "SUPPORT", "EDITOR"],
      default: "USER",
    },
    thumbnail: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
    },
    gender: {
      type: String,
      enum: ["male", "female", "N/A","unknown"],
      default: "N/A",
    },
    resetToken: String,
    resetTokenExpiry: Date,
  
      status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "inactive",
    },
    invitationToken: {
      type: String,
      select: false,
    },
    invitationTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
