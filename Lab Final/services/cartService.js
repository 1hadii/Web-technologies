// Get the session cart (array of {productId, name, price, image, stock, quantity})
function getSessionCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

// Compute total item count across all lines
function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Compute subtotal (before shipping)
function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

module.exports = { getSessionCart, getCartCount, getCartTotal };
