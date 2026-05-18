const Product = require("../models/Product");

// Helper: build a product listing query from request params
async function getProductData(req, category) {
  const LIMIT = 8;

  const page        = Math.max(1, parseInt(req.query.page) || 1);
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

module.exports = { getProductData };
