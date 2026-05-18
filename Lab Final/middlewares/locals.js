const { getSessionCart, getCartCount } = require("../services/cartService");

// Global variables for views — runs on every request
const setLocals = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  // Expose cart count to every view so the badge always shows
  const cart = getSessionCart(req);
  res.locals.cartCount = getCartCount(cart);
  next();
};

module.exports = setLocals;
