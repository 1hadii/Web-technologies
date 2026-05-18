const Product = require("../models/Product");
const Order = require("../models/Order");
const { getSessionCart, getCartCount, getCartTotal } = require("../services/cartService");

// GET /checkout — Show checkout form
exports.getCheckout = (req, res) => {
  const cart = getSessionCart(req);
  if (cart.length === 0) {
    req.flash("error_msg", "Your cart is empty. Add some items first!");
    return res.redirect("/cart");
  }

  res.render("checkout", {
    cartItems:  cart,
    cartCount:  getCartCount(cart),
    cartTotal:  getCartTotal(cart),
  });
};

// POST /checkout — Place the order with full stock validation
exports.postCheckout = async (req, res) => {
  try {
    const cart = getSessionCart(req);
    if (cart.length === 0) {
      req.flash("error_msg", "Your cart is empty.");
      return res.redirect("/cart");
    }

    const { fullName, email, phone, address, city, postalCode, province, notes } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !address || !city || !province) {
      req.flash("error_msg", "Please fill in all required shipping fields.");
      return res.redirect("/checkout");
    }

    // ── Stock Validation & Deduction (atomic per-product) ──────────────────────
    const orderProducts = [];
    const stockErrors   = [];

    for (const item of cart) {
      // Use findOneAndUpdate with $inc to atomically decrement stock
      // The $gte condition ensures we never go below 0
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        // Could not decrement — fetch real stock to show useful error
        const real = await Product.findById(item.productId).select("name stock");
        const available = real ? real.stock : 0;
        stockErrors.push(
          available === 0
            ? `"${item.name}" is out of stock.`
            : `"${item.name}" — only ${available} available, you requested ${item.quantity}.`
        );
      } else {
        orderProducts.push({
          product:  item.productId,
          name:     item.name,        // snapshot name at time of order
          quantity: item.quantity,
          price:    item.price,       // snapshot price at time of order
        });
      }
    }

    if (stockErrors.length > 0) {
      // Roll back successfully decremented products
      for (const op of orderProducts) {
        await Product.findByIdAndUpdate(op.product, { $inc: { stock: op.quantity } });
      }
      req.flash("error_msg", "Stock issue(s): " + stockErrors.join(" | ") + " Please update your cart.");
      return res.redirect("/cart");
    }

    // ── Calculate totals ──────────────────────────────────────────────────────
    const subtotal       = getCartTotal(cart);
    const shippingCharge = subtotal >= 3000 ? 0 : 250;
    const totalAmount    = subtotal + shippingCharge;

    const shippingAddress = `${fullName}, ${address}, ${city}${postalCode ? ' ' + postalCode : ''}, ${province}`;

    // ── Save Order to DB ──────────────────────────────────────────────────────
    const newOrder = new Order({
      user:            req.session.user.id,
      products:        orderProducts,
      totalAmount,
      shippingAddress,
      notes:           notes || "",
    });
    await newOrder.save();

    // Clear the session cart after successful order
    req.session.cart = [];

    // Render confirmation page
    res.render("order-confirmation", {
      order: {
        _id:             newOrder._id,
        products:        orderProducts,
        totalAmount,
        shippingAddress,
        status:          newOrder.status,
      },
      cartCount: 0,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    req.flash("error_msg", "A server error occurred during checkout. Please try again.");
    res.redirect("/checkout");
  }
};
