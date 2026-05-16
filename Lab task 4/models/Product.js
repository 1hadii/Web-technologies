const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids", "Accessories", "Sale"],
    },
    subCategory: {
      type: String,
      enum: ["Jackets", "T-Shirts", "Pants", "Other"],
      default: "Other",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
