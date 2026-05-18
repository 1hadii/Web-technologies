const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// GET /register
router.get("/register", authController.getRegister);

// POST /register
router.post("/register", authController.postRegister);

// GET /login
router.get("/login", authController.getLogin);

// POST /login
router.post("/login", authController.postLogin);

// GET /logout
router.get("/logout", authController.getLogout);

module.exports = router;
