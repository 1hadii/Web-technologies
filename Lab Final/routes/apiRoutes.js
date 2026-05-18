const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const apiController = require("../controllers/apiController");

// 1. Auth Endpoint
router.post("/auth/login", apiController.login);

// 2. Public Endpoints
router.get("/products", apiController.getProducts);
router.get("/products/:id", apiController.getProductById);

// 3. Protected Endpoints (require JWT)
router.use(verifyToken);

router.get("/user/profile", apiController.getProfile);
router.post("/orders", apiController.createOrder);
router.get("/orders", apiController.getOrders);

module.exports = router;
