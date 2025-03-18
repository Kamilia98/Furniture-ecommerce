const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true }, 
    content: { type: String, required: true }, 
    category: { type: String, required: true }, 
    tags: [{ type: String, index: true }], 
    img: { type: String, required: true }, 
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Blog", BlogSchema);
