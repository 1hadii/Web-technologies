require("dotenv").config();
let express = require("express");
let mongoose = require("mongoose");
let multer = require("multer");
let path = require("path");
let session = require("express-session");
let MongoStore = require("connect-mongo").MongoStore;
let flash = require("connect-flash");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let Product = require("./models/Product");
let User = require("./models/User");
let Order = require("./models/Order");

let app = express();

// ── View Engine ────────────────────────────────────────────────────────────────
app.set("view engine", "ejs");

// ── Static Files & Middleware ──────────────────────────────────────────────────
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Multer Configuration ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ── MongoDB Connection ─────────────────────────────────────────────────────────
const MONGO_URI = "mongodb://127.0.0.1:27017/cougar_store";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  Connected to MongoDB"))
  .catch((err) => console.error("❌  MongoDB connection error:", err.message));

// ── Sessions & Flash Middleware ────────────────────────────────────────────────
app.use(
  session({
    secret: "cougar_super_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.use(flash());

// Global variables for views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// ── JWT Middleware ─────────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, role, ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
  }
};

// ── Auth Middlewares ───────────────────────────────────────────────────────────
const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash("error_msg", "Please log in to view this resource.");
  res.redirect("/login");
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.flash("error_msg", "Access Denied: Admins Only.");
  res.redirect("/");
};

// ── Helper: build a product listing query from request params ──────────────────
async function getProductData(req, category) {
  const LIMIT = 8;

  const page     = Math.max(1, parseInt(req.query.page) || 1);
  const search      = (req.query.search || "").trim();
  const subCategory = (req.query.subCategory || "").trim();
  const minPrice    = parseFloat(req.query.minPrice) || 0;
  const maxPrice    = parseFloat(req.query.maxPrice) || Infinity;

  // Build filter
  let filter = { category };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  
  if (subCategory) {
    filter.subCategory = subCategory;
  }

  filter.price = {};
  if (minPrice > 0)          filter.price.$gte = minPrice;
  if (maxPrice !== Infinity) filter.price.$lte = maxPrice;
  if (Object.keys(filter.price).length === 0) delete filter.price;

  const totalProducts = await Product.countDocuments(filter);
  const totalPages    = Math.ceil(totalProducts / LIMIT);
  const currentPage   = Math.min(page, totalPages || 1);
  const skip          = (currentPage - 1) * LIMIT;

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(LIMIT);

  return {
    products,
    totalProducts,
    totalPages,
    currentPage,
    limit: LIMIT,
    filters: { search, subCategory, minPrice, maxPrice },
  };
}

// ── Auth Routes ────────────────────────────────────────────────────────────────

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "Email is already registered.");
      return res.redirect("/register");
    }

    // Create new user
    user = new User({ name, email, password });
    await user.save();
    
    req.flash("success_msg", "Registration successful! Please log in.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
       let msgs = Object.values(err.errors).map(val => val.message);
       req.flash("error_msg", msgs.join(', '));
       return res.redirect("/register");
    }
    req.flash("error_msg", "Server error during registration.");
    res.redirect("/register");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash("error_msg", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash("success_msg", `Welcome back, ${user.name}!`);
    if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Server error during login.");
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Session destruction error:", err);
    res.redirect("/login");
  });
});

// ── Product Listing Routes ─────────────────────────────────────────────────────

app.get("/", function (req, res) {
  return res.render("homepage");
});

app.get("/men", async function (req, res) {
  try {
    const data = await getProductData(req, "Men");
    res.render("men", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
});

app.get("/women", async function (req, res) {
  try {
    const data = await getProductData(req, "Women");
    res.render("women", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
});

app.get("/kids", async function (req, res) {
  try {
    const data = await getProductData(req, "Kids");
    res.render("kids", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
});

app.get("/sale", async function (req, res) {
  try {
    const data = await getProductData(req, "Sale");
    res.render("sale", data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error. Please try again.");
  }
});

// ── Admin Routes ───────────────────────────────────────────────────────────────

app.use("/admin", isAdmin);

app.get("/admin", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin-dashboard", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

app.get("/admin/product/new", (req, res) => {
  res.render("admin-product-form");
});

app.post("/admin/product/new", upload.single("image"), async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      subCategory: req.body.subCategory,
      rating: req.body.rating,
      stock: req.body.stock,
      description: req.body.description,
      image: req.file ? "/uploads/" + req.file.filename : ""
    });
    await newProduct.save();
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while saving product.");
  }
});

app.get("/admin/product/edit/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("admin-product-form", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

app.post("/admin/product/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      subCategory: req.body.subCategory,
      rating: req.body.rating,
      stock: req.body.stock,
      description: req.body.description,
    };
    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }
    
    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while updating product.");
  }
});

app.post("/admin/product/delete/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while deleting product.");
  }
});

// ── API v1 Routes (Headless Architecture) ──────────────────────────────────────

// 1. Auth Endpoint
app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT Token
    const payload = { user_id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("API Login Error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
});

// 2. Public Endpoints
app.get("/api/v1/products", async (req, res) => {
  try {
    const LIMIT = 8;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();
    const subCategory = (req.query.subCategory || "").trim();
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (subCategory) filter.subCategory = subCategory;

    filter.price = {};
    if (minPrice > 0) filter.price.$gte = minPrice;
    if (maxPrice !== Infinity) filter.price.$lte = maxPrice;
    if (Object.keys(filter.price).length === 0) delete filter.price;

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / LIMIT);
    const currentPage = Math.min(page, totalPages || 1);
    const skip = (currentPage - 1) * LIMIT;

    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(LIMIT);

    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage,
        limit: LIMIT
      }
    });
  } catch (err) {
    console.error("API Get Products Error:", err);
    res.status(500).json({ error: "Server error while fetching products." });
  }
});

app.get("/api/v1/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    console.error("API Get Product Error:", err);
    res.status(500).json({ error: "Server error while fetching product." });
  }
});

// 3. Protected Endpoints
app.get("/api/v1/user/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ user });
  } catch (err) {
    console.error("API Profile Error:", err);
    res.status(500).json({ error: "Server error while fetching profile." });
  }
});

app.post("/api/v1/orders", verifyToken, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;
    
    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one product." });
    }
    
    if (!totalAmount) {
      return res.status(400).json({ error: "Total amount is required." });
    }

    const newOrder = new Order({
      user: req.user.user_id,
      products,
      totalAmount,
      shippingAddress
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("API Create Order Error:", err);
    res.status(500).json({ error: "Server error while processing order." });
  }
});

// ── Start Server ───────────────────────────────────────────────────────────────

app.listen(3000, function () {
  console.log("🚀  Server running on http://localhost:3000");
});