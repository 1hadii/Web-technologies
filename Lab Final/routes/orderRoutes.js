const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth");
const orderController = require("../controllers/orderController");

// GET /orders — Customer order history (must be logged in)
router.get("/", isLoggedIn, orderController.getMyOrders);

module.exports = router;
