const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const adminController = require("../controllers/adminController");

// All admin routes require admin role
router.use(isAdmin);

// GET /admin — Dashboard
router.get("/", adminController.getDashboard);

// GET /admin/orders — View all orders
router.get("/orders", adminController.getOrders);

// POST /admin/order/status/:id — Update order status
router.post("/order/status/:id", adminController.updateOrderStatus);

// GET /admin/product/new — New product form
router.get("/product/new", adminController.getNewProduct);

// POST /admin/product/new — Save new product (with image upload)
router.post("/product/new", upload.single("image"), adminController.postNewProduct);

// GET /admin/product/edit/:id — Edit product form
router.get("/product/edit/:id", adminController.getEditProduct);

// POST /admin/product/edit/:id — Update product (with image upload)
router.post("/product/edit/:id", upload.single("image"), adminController.postEditProduct);

// POST /admin/product/delete/:id — Delete product
router.post("/product/delete/:id", adminController.deleteProduct);

module.exports = router;
