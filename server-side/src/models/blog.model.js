const mongoose = require("mongoose");
const User = require("./user.model");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    categories: [{ type: String, required: true }],
    img: { type: String, required: true },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const user = await User.findById(value);
          return user && user.role === "ADMIN";
        },
        message: "adminUser must have the 'ADMIN' role",
      },
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
