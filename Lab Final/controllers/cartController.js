const Product = require("../models/Product");
const { getSessionCart, getCartCount, getCartTotal } = require("../services/cartService");

// GET /cart — View cart
exports.getCart = async (req, res) => {
  try {
    const cart = getSessionCart(req);

    // Refresh stock levels from DB so warnings are accurate
    const ids = cart.map(i => i.productId);
    const freshProducts = await Product.find({ _id: { $in: ids } }).select("_id stock");
    const stockMap = {};
    freshProducts.forEach(p => { stockMap[p._id.toString()] = p.stock; });

    const cartItems = cart.map(item => ({
      ...item,
      stock: stockMap[item.productId] !== undefined ? stockMap[item.productId] : item.stock,
    }));

    res.render("cart", {
      cartItems,
      cartCount: getCartCount(cart),
      cartTotal: getCartTotal(cart),
    });
  } catch (err) {
    console.error("Cart GET error:", err);
    res.status(500).send("Server error loading cart.");
  }
};

// POST /cart/add — Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      req.flash("error_msg", "Invalid product.");
      return res.redirect("back");
    }

    // Fetch live product data from DB
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error_msg", "Product not found.");
      return res.redirect("back");
    }
    if (product.stock === 0) {
      req.flash("error_msg", `"${product.name}" is out of stock.`);
      return res.redirect("back");
    }

    const cart = getSessionCart(req);
    const existingIdx = cart.findIndex(i => i.productId === productId);

    if (existingIdx !== -1) {
      // Already in cart — increment if stock allows
      if (cart[existingIdx].quantity < product.stock) {
        cart[existingIdx].quantity += 1;
        req.flash("success_msg", `Quantity updated for "${product.name}".`);
      } else {
        req.flash("error_msg", `Cannot add more — only ${product.stock} in stock.`);
      }
    } else {
      // New cart item
      cart.push({
        productId:  product._id.toString(),
        name:       product.name,
        price:      product.price,
        image:      product.image || "",
        stock:      product.stock,
        quantity:   1,
      });
      req.flash("success_msg", `"${product.name}" added to cart!`);
    }

    req.session.cart = cart;
    res.redirect("/cart");
  } catch (err) {
    console.error("Cart add error:", err);
    req.flash("error_msg", "Could not add item to cart.");
    res.redirect("back");
  }
};

// POST /cart/update — Increase or decrease quantity
exports.updateCart = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const cart = getSessionCart(req);
    const idx  = cart.findIndex(i => i.productId === productId);

    if (idx === -1) {
      req.flash("error_msg", "Item not found in cart.");
      return res.redirect("/cart");
    }

    if (action === "increase") {
      // Re-check live stock
      const product = await Product.findById(productId).select("stock");
      const liveStock = product ? product.stock : cart[idx].stock;
      if (cart[idx].quantity < liveStock) {
        cart[idx].quantity += 1;
        cart[idx].stock = liveStock; // keep fresh
      } else {
        req.flash("error_msg", `Only ${liveStock} unit(s) available.`);
      }
    } else if (action === "decrease") {
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1;
      } else {
        // Remove item if it would go to 0
        cart.splice(idx, 1);
      }
    }

    req.session.cart = cart;
    res.redirect("/cart");
  } catch (err) {
    console.error("Cart update error:", err);
    req.flash("error_msg", "Could not update cart.");
    res.redirect("/cart");
  }
};

// POST /cart/remove — Remove a specific item
exports.removeFromCart = (req, res) => {
  const { productId } = req.body;
  const cart = getSessionCart(req);
  req.session.cart = cart.filter(i => i.productId !== productId);
  req.flash("success_msg", "Item removed from cart.");
  res.redirect("/cart");
};

// POST /cart/clear — Empty the whole cart
exports.clearCart = (req, res) => {
  req.session.cart = [];
  req.flash("success_msg", "Cart cleared.");
  res.redirect("/cart");
};
