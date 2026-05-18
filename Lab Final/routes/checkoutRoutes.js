const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth");
const checkoutController = require("../controllers/checkoutController");

// GET /checkout — Show checkout form (must be logged in)
router.get("/", isLoggedIn, checkoutController.getCheckout);

// POST /checkout — Place the order (must be logged in)
router.post("/", isLoggedIn, checkoutController.postCheckout);

module.exports = router;
