const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String }], // act as a category for getting related items
    img: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Blog", BlogSchema);
