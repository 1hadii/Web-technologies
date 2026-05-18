# 🛠️ Implementation Guide: On-Sale Promotional Items & Client-Side Pagination

This guide provides a detailed walkthrough of how the "Promotional Items" page and its jQuery-based client-side pagination were implemented in the `Lab Final` E-Commerce project. It breaks down the exact code changes and logic used across the database, server, and frontend layers.

---

## 1. Database Model Modification (`models/Product.js`)

To identify which products are promotional items without interfering with standard categories (Men, Women, Kids), a new boolean field was introduced into the `Product` schema.

**Changes made:**
Added the `isOnSale` attribute. This guarantees that all new or existing products can simply be toggled "on sale" via a true/false flag.

```javascript
// Inside models/Product.js
isOnSale: {
  type: Boolean,
  default: false,
},
```

---

## 2. Test Data Seeding (`seeds/seed.js`)

In order to properly test client-side pagination, the database needed a substantial number of items (more than 10).

**Changes made:**
Modified the `seed.js` file to duplicate the base 27 products three times to create an expanded array. During this expansion, a math randomizer was used to dynamically assign `isOnSale: true` to approximately 80% of the products.

```javascript
// Inside seeds/seed.js
let expandedProducts = [];
for (let i = 0; i < 3; i++) {
  expandedProducts = expandedProducts.concat(
    products.map((p) => ({
      ...p,
      name: `${p.name} (Batch ${i + 1})`,
      isOnSale: Math.random() > 0.2 // Roughly 80% chance to be on sale
    }))
  );
}
```

---

## 3. Backend Controller & Routing

The server needed to fetch *all* on-sale products at once and pass them entirely to the EJS view template, bypassing standard database-level pagination.

**Changes made:**
1. **Controller (`controllers/productController.js`)**: Added a new method `getOnSaleProducts`.
   ```javascript
   exports.getOnSaleProducts = async (req, res) => {
     try {
       // Fetch ALL products that are on sale
       const products = await Product.find({ isOnSale: true }).sort({ createdAt: -1 });
       res.render("onsale", { products });
     } catch (err) { ... }
   };
   ```

2. **Route Mapping (`routes/productRoutes.js`)**: Registered the URL endpoint `GET /onsale-products`.
   ```javascript
   router.get("/onsale-products", productController.getOnSaleProducts);
   ```

---

## 4. Frontend View & Layout (`views/onsale.ejs`)

A dedicated view was built to mimic the design language of the established layout (reusing existing header, footer, sidebar, and CSS classes).

**Changes made:**
*   Rendered a container with `id="product-list"`.
*   Iterated over the `products` array and rendered every single product as a child element with the class `.onsale-item`.
*   Added the required pagination container below the grid.

```html
<!-- Inside views/onsale.ejs -->
<div class="row" id="product-list">
  <% products.forEach(function(product) { %>
    <div class="onsale-item">
      <!-- Product image, title, price, and add-to-cart form -->
    </div>
  <% }); %>
</div>

<div class="pagination-controls">
  <button id="prev-btn">Previous</button>
  <span id="page-indicator">Page 1</span>
  <button id="next-btn">Next</button>
</div>
```

---

## 5. Client-Side jQuery Pagination Logic

Because the server passed *all* items at once, the browser receives a potentially massive HTML DOM. jQuery is utilized to conceal the overflow and only display 10 items at a time without needing to refresh the page or make API calls.

**Changes made:**
*   Added the jQuery CDN script tag to the `<head>`.
*   Wrote the pagination algorithm at the bottom of the body.

### The jQuery Logic Explained

1. **State Initialization**:
   Count the total items loaded in the DOM. Calculate total pages (`Math.ceil(totalItems / 10)`).
   ```javascript
   const $items = $('.onsale-item');
   const itemsPerPage = 10;
   let currentPage = 1;
   const totalPages = Math.ceil($items.length / itemsPerPage) || 1;
   ```

2. **The Render Engine (`showPage`)**:
   Every time the page changes, hide *all* elements using `.hide()`. Then, use `.slice(startIndex, endIndex)` to isolate exactly the 10 elements that belong on the current page, and execute `.show()` on them.
   ```javascript
   function showPage(page) {
     $items.hide();
     const startIndex = (page - 1) * itemsPerPage;
     const endIndex = startIndex + itemsPerPage;
     
     $items.slice(startIndex, endIndex).show();
     $('#page-indicator').text(`Page ${page} of ${totalPages}`);
     
     // Update button disabling (boundary checks)
     $('#prev-btn').prop('disabled', page <= 1);
     $('#next-btn').prop('disabled', page >= totalPages);
   }
   ```

3. **Event Listeners**:
   Attach click events to the buttons. The variables are incremented/decremented, the `showPage()` renderer is triggered, and a short animation smoothly scrolls the user back to the top of the grid.
   ```javascript
   $('#next-btn').click(function() {
     if (currentPage < totalPages) {
       currentPage++;
       showPage(currentPage);
       $('html, body').animate({ scrollTop: $('#product-list').offset().top - 100 }, 200);
     }
   });
   ```

---

### End Result
By separating concerns—Mongoose handling data aggregation and jQuery handling DOM manipulation—the resulting `/onsale-products` storefront satisfies the requirements of a fast, API-free client-side paginated experience while seamlessly integrating into the existing Express architecture.
