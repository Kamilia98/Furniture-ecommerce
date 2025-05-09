const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
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
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    thumbnail: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
    },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },   
    resetToken: String,
    resetTokenExpiry: Date,
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
