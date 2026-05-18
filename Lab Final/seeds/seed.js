// seed.js — run once with: node seed.js
// Clears existing products and inserts 30 sample products.

const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URI = "mongodb://127.0.0.1:27017/cougar_store";

const products = [
  // ── MEN (10 items) ──────────────────────────────────────────────────────────
  {
    name: "Cougar Classic Polo",
    price: 2499,
    category: "Men",
    rating: 4.5,
    stock: 120,
    description: "A timeless pique cotton polo with embroidered logo.",
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400",
  },
  {
    name: "Men's Slim Fit Chinos",
    price: 3299,
    category: "Men",
    subCategory: "Pants",
    rating: 4.2,
    stock: 85,
    description: "Versatile slim-fit chinos in stretch cotton blend.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400",
  },
  {
    name: "Cougar Linen Kurta",
    price: 2799,
    category: "Men",
    rating: 4.7,
    stock: 60,
    description: "Light breathable linen kurta, perfect for summer.",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
  },
  {
    name: "Men's Graphic Tee",
    price: 1299,
    category: "Men",
    subCategory: "T-Shirts",
    rating: 4.0,
    stock: 200,
    description: "100% cotton crew-neck tee with bold graphic print.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    name: "Cougar Denim Jacket",
    price: 5499,
    category: "Men",
    subCategory: "Jackets",
    rating: 4.6,
    stock: 40,
    description: "Classic denim jacket with distressed detailing.",
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400",
  },
  {
    name: "Men's Fleece Hoodie",
    price: 3999,
    category: "Men",
    rating: 4.4,
    stock: 95,
    description: "Cozy fleece hoodie with kangaroo pocket.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400",
  },
  {
    name: "Cougar Formal Shirt",
    price: 2199,
    category: "Men",
    rating: 4.3,
    stock: 110,
    description: "Crisp cotton formal shirt for office or occasions.",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  },
  {
    name: "Men's Cargo Shorts",
    price: 1899,
    category: "Men",
    rating: 3.9,
    stock: 75,
    description: "Multi-pocket cargo shorts in durable cotton canvas.",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400",
  },
  {
    name: "Cougar Sweatpants",
    price: 2599,
    category: "Men",
    rating: 4.1,
    stock: 130,
    description: "Soft fleece sweatpants with elasticated waist.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  },
  {
    name: "Men's Blazer",
    price: 7999,
    category: "Men",
    rating: 4.8,
    stock: 25,
    description: "Tailored single-breasted blazer in premium wool blend.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400",
  },

  // ── WOMEN (10 items) ─────────────────────────────────────────────────────────
  {
    name: "Cougar Floral Kurta",
    price: 2299,
    category: "Women",
    rating: 4.6,
    stock: 150,
    description: "Elegant floral-printed lawn kurta with embroidery.",
    image: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=400",
  },
  {
    name: "Women's Palazzo Set",
    price: 3499,
    category: "Women",
    rating: 4.4,
    stock: 70,
    description: "Chic palazzo set in soft georgette fabric.",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400",
  },
  {
    name: "Cougar Embroidered Kameez",
    price: 4999,
    category: "Women",
    rating: 4.9,
    stock: 35,
    description: "Hand-embroidered kameez in fine cotton fabric.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
  },
  {
    name: "Women's Casual Tee",
    price: 999,
    category: "Women",
    subCategory: "T-Shirts",
    rating: 4.0,
    stock: 220,
    description: "Comfortable everyday tee in soft jersey cotton.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
  },
  {
    name: "Cougar Printed Dupatta",
    price: 1499,
    category: "Women",
    rating: 4.3,
    stock: 90,
    description: "Vibrant digital-printed dupatta in chiffon.",
    image: "https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=400",
  },
  {
    name: "Women's Denim Jeans",
    price: 3299,
    category: "Women",
    subCategory: "Pants",
    rating: 4.2,
    stock: 80,
    description: "High-waist skinny jeans in stretchable denim.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
  },
  {
    name: "Cougar Linen Co-ord Set",
    price: 5299,
    category: "Women",
    rating: 4.7,
    stock: 45,
    description: "Matching linen co-ord set for a polished summer look.",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400",
  },
  {
    name: "Women's Puffer Jacket",
    price: 6499,
    category: "Women",
    subCategory: "Jackets",
    rating: 4.5,
    stock: 30,
    description: "Lightweight quilted puffer jacket for cooler months.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
  },
  {
    name: "Cougar Printed Shirt",
    price: 1999,
    category: "Women",
    rating: 4.1,
    stock: 100,
    description: "Trendy abstract-printed shirt in relaxed fit.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
  },
  {
    name: "Women's Maxi Dress",
    price: 4299,
    category: "Women",
    rating: 4.6,
    stock: 55,
    description: "Flowing maxi dress with gathered waist and floral print.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400",
  },

  // ── KIDS (5 items) ───────────────────────────────────────────────────────────
  {
    name: "Kids' Graphic Tee",
    price: 799,
    category: "Kids",
    subCategory: "T-Shirts",
    rating: 4.3,
    stock: 180,
    description: "Fun graphic tee for boys and girls in soft cotton.",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
  },
  {
    name: "Cougar Kids Dungaree",
    price: 1999,
    category: "Kids",
    rating: 4.5,
    stock: 65,
    description: "Denim dungaree set with adjustable straps.",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ac6823b?w=400",
  },
  {
    name: "Kids' Winter Hoodie",
    price: 2299,
    category: "Kids",
    rating: 4.4,
    stock: 50,
    description: "Cozy printed hoodie to keep little ones warm.",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400",
  },
  {
    name: "Girls' Frock Set",
    price: 2599,
    category: "Kids",
    rating: 4.7,
    stock: 40,
    description: "Cute printed frock with matching trouser.",
    image: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400",
  },
  {
    name: "Boys' Cargo Pants",
    price: 1799,
    category: "Kids",
    subCategory: "Pants",
    rating: 4.0,
    stock: 70,
    description: "Durable cargo pants with elastic waistband.",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400",
  },



  // ── SALE (2 items) ───────────────────────────────────────────────────────────
  {
    name: "Cougar Summer Shirt (Sale)",
    price: 999,
    category: "Sale",
    rating: 3.8,
    stock: 200,
    description: "Last season's summer shirt at a massive discount.",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400",
  },
  {
    name: "Women's Lawn 3-Piece (Sale)",
    price: 2499,
    category: "Sale",
    rating: 4.1,
    stock: 120,
    description: "Unstitched lawn 3-piece suit at clearance price.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB");

    await Product.deleteMany({});
    console.log("🗑   Cleared existing products");

    // Duplicate products to ensure we have enough for pagination testing (> 10 items)
    let expandedProducts = [];
    for (let i = 0; i < 3; i++) {
      expandedProducts = expandedProducts.concat(
        products.map((p) => ({
          ...p,
          name: `${p.name} (Batch ${i + 1})`,
          // Make 80% of items on sale to test pagination properly
          isOnSale: Math.random() > 0.2
        }))
      );
    }

    const inserted = await Product.insertMany(expandedProducts);
    console.log(`🌱  Seeded ${inserted.length} products successfully`);
  } catch (err) {
    console.error("❌  Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
  }
}

seed();
