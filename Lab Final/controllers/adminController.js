const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /admin — Dashboard with product list
exports.getDashboard = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin-dashboard", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};

// GET /admin/orders — View all orders in system
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.render("admin-orders", { orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    res.status(500).send("Server error loading orders.");
  }
};

// POST /admin/order/status/:id — Update status of a specific order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      req.flash("error_msg", "Invalid order status.");
      return res.redirect("back");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      req.flash("error_msg", "Order not found.");
      return res.redirect("back");
    }

    req.flash("success_msg", `Order status updated to "${status.toUpperCase()}".`);
    res.redirect("back");
  } catch (err) {
    console.error("Order status update error:", err);
    req.flash("error_msg", "Could not update order status.");
    res.redirect("back");
  }
};

// GET /admin/product/new — New product form
exports.getNewProduct = (req, res) => {
  res.render("admin-product-form");
};

// POST /admin/product/new — Save new product
exports.postNewProduct = async (req, res) => {
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
};

// GET /admin/product/edit/:id — Edit product form
exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("admin-product-form", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
};

// POST /admin/product/edit/:id — Update product
exports.postEditProduct = async (req, res) => {
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
};

// POST /admin/product/delete/:id — Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while deleting product.");
  }
};
