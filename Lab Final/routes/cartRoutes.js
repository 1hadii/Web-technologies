const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// GET /cart — View cart
router.get("/", cartController.getCart);

// POST /cart/add — Add product to cart
router.post("/add", cartController.addToCart);

// POST /cart/update — Increase or decrease quantity
router.post("/update", cartController.updateCart);

// POST /cart/remove — Remove a specific item
router.post("/remove", cartController.removeFromCart);

// POST /cart/clear — Empty the whole cart
router.post("/clear", cartController.clearCart);

module.exports = router;
