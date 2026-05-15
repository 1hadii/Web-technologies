let express = require("express");
let mongoose = require("mongoose");
let multer = require("multer");
let path = require("path");
let Product = require("./models/Product");

let app = express();

// ── View Engine ────────────────────────────────────────────────────────────────
app.set("view engine", "ejs");

// ── Static Files & Middleware ──────────────────────────────────────────────────
app.use(express.static("public"));
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

// ── Routes ─────────────────────────────────────────────────────────────────────

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

// ── Start Server ───────────────────────────────────────────────────────────────

app.listen(3000, function () {
  console.log("🚀  Server running on http://localhost:3000");
});