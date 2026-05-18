const { getProductData } = require("../services/productService");

// GET /
exports.getHomepage = (req, res) => {
  return res.render("homepage");
};

// GET /men
exports.getMen = async (req, res) => {
  try {
    const data = await getProductData(req, "Men");
    res.render("men", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
};

// GET /women
exports.getWomen = async (req, res) => {
  try {
    const data = await getProductData(req, "Women");
    res.render("women", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
};

// GET /kids
exports.getKids = async (req, res) => {
  try {
    const data = await getProductData(req, "Kids");
    res.render("kids", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
};

// GET /sale
exports.getSale = async (req, res) => {
  try {
    const data = await getProductData(req, "Sale");
    res.render("sale", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
};

// GET /onsale-products
const Product = require("../models/Product");
exports.getOnSaleProducts = async (req, res) => {
  try {
    // Fetch all products that are on sale (unpaginated server-side)
    const products = await Product.find({ isOnSale: true }).sort({ createdAt: -1 });
    res.render("onsale", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
};
