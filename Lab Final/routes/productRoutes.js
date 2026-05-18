const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// GET / — Homepage
router.get("/", productController.getHomepage);

// GET /men
router.get("/men", productController.getMen);

// GET /women
router.get("/women", productController.getWomen);

// GET /kids
router.get("/kids", productController.getKids);

// GET /sale
router.get("/sale", productController.getSale);

// GET /onsale-products
router.get("/onsale-products", productController.getOnSaleProducts);

module.exports = router;
