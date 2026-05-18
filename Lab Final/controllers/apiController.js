const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT Token
    const payload = { user_id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("API Login Error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
};

// GET /api/v1/products
exports.getProducts = async (req, res) => {
  try {
    const LIMIT = 8;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();
    const subCategory = (req.query.subCategory || "").trim();
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (subCategory) filter.subCategory = subCategory;

    filter.price = {};
    if (minPrice > 0) filter.price.$gte = minPrice;
    if (maxPrice !== Infinity) filter.price.$lte = maxPrice;
    if (Object.keys(filter.price).length === 0) delete filter.price;

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / LIMIT);
    const currentPage = Math.min(page, totalPages || 1);
    const skip = (currentPage - 1) * LIMIT;

    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(LIMIT);

    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage,
        limit: LIMIT
      }
    });
  } catch (err) {
    console.error("API Get Products Error:", err);
    res.status(500).json({ error: "Server error while fetching products." });
  }
};

// GET /api/v1/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    console.error("API Get Product Error:", err);
    res.status(500).json({ error: "Server error while fetching product." });
  }
};

// GET /api/v1/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ user });
  } catch (err) {
    console.error("API Profile Error:", err);
    res.status(500).json({ error: "Server error while fetching profile." });
  }
};

// POST /api/v1/orders
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one product." });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: "A valid total amount is required." });
    }

    // ── Stock Validation & Atomic Deduction ──────────────────────────────────
    const orderProducts = [];
    const stockErrors   = [];

    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        stockErrors.push(`Invalid item entry in order.`);
        continue;
      }

      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        const real = await Product.findById(item.product).select("name stock");
        const available = real ? real.stock : 0;
        stockErrors.push(
          `"${real ? real.name : item.product}" — only ${available} in stock, requested ${item.quantity}.`
        );
      } else {
        orderProducts.push({
          product:  item.product,
          name:     updated.name,
          quantity: item.quantity,
          price:    item.price || updated.price,
        });
      }
    }

    if (stockErrors.length > 0) {
      // Roll back any decrements that succeeded
      for (const op of orderProducts) {
        await Product.findByIdAndUpdate(op.product, { $inc: { stock: op.quantity } });
      }
      return res.status(409).json({
        error: "Stock validation failed.",
        details: stockErrors,
      });
    }

    const newOrder = new Order({
      user: req.user.user_id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("API Create Order Error:", err);
    res.status(500).json({ error: "Server error while processing order." });
  }
};

// GET /api/v1/orders — Authenticated: list current user's orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.user_id })
      .sort({ createdAt: -1 })
      .populate("products.product", "name image price");
    res.json({ orders });
  } catch (err) {
    console.error("API Get Orders Error:", err);
    res.status(500).json({ error: "Server error fetching orders." });
  }
};
