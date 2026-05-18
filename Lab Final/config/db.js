const mongoose = require("mongoose");

const MONGO_URI = "mongodb://127.0.0.1:27017/cougar_store";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB");
  } catch (err) {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
