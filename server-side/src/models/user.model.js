const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String },
    password: { type: String },
    googleId: { type: String },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
