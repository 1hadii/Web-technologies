require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const connectDB = require("./config/db");
const setLocals = require("./middlewares/locals");

// Initialize Express
const app = express();

// Database Connection
connectDB();

// View Engine
app.set("view engine", "ejs");

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions & Flash
app.use(
  session({
    secret: "cougar_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);
app.use(flash());

// Global Locals (runs on every request)
app.use(setLocals);

// Mount Routes
app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/productRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/checkout", require("./routes/checkoutRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/api/v1", require("./routes/apiRoutes"));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});