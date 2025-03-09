require("dotenv").config();

const mongoose = require("mongoose");


const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully ✅");
  } catch (error) {
    console.error("MongoDB Connection Failed ❌", error);
    process.exit(1);
  }
};

module.exports = connectDB;
