const Order = require("../models/Order");
const { getSessionCart, getCartCount } = require("../services/cartService");

// GET /orders — Customer order history
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id })
      .sort({ createdAt: -1 })
      .populate("products.product", "name image");
    res.render("my-orders", { orders, cartCount: getCartCount(getSessionCart(req)) });
  } catch (err) {
    console.error("My Orders error:", err);
    req.flash("error_msg", "Could not load your orders.");
    res.redirect("/");
  }
};
