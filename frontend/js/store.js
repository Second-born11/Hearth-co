/* ================================================================
   store.js — Product grid + ProductDetail module
   REPLACE: _cardHTML() if you change product card layout
   REPLACE: ProductDetail.openPage() to change the detail page path
   ================================================================ */

const Store = (() => {
  let activeCategory = "All";
  let sortBy         = "default";
  let searchQuery    = "";
  let allProducts    = [];

  /* ── Fetch products from backend API ─────────────────────────
     REPLACE: API.Products.list() call if you change the endpoint */
  async function _fetchProducts() {
    const grid = document.getElementById("product-grid");
    if (grid) grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--mid)">
        Loading products…
      </div>`;
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery)              params.search   = searchQuery;
      if (sortBy !== "default")     params.sort     = sortBy;
      const data  = await API.Products.list(params);
      allProducts = data.products || [];
      _renderGrid(allProducts);
    } catch (err) {
      /* REPLACE: Fallback to local PRODUCTS array if backend is down */
      console.warn("Backend unreachable — using local data:", err.message);
      allProducts = _filterLocal(PRODUCTS);
      _renderGrid(allProducts);
    }
  }

  /* ── Local filter (fallback only) ────────────────────────────
     REPLACE: Sort/filter logic here if needed                   */
  function _filterLocal(list) {
    let out = list
      .filter(p => activeCategory === "All" || p.category === activeCategory)
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "price-asc")  out.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sortBy === "name")       out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }

  /* ── Category filter pills ───────────────────────────────────
     REPLACE: CATEGORIES array in data.js to change filters      */
  function _renderPills() {
    const container = document.getElementById("category-pills");
    if (!container) return;
    container.innerHTML = CATEGORIES.map(c => `
      <button class="cat-pill${c === activeCategory ? " active" : ""}" data-cat="${c}">${c}</button>
    `).join("");
    container.querySelectorAll(".cat-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        _renderPills();
        _fetchProducts();
      });
    });
  }

  /* ── Render the product grid ─────────────────────────────────
     REPLACE: _cardHTML() below to change card design            */
  function _renderGrid(products) {
    const grid  = document.getElementById("product-grid");
    const empty = document.getElementById("empty-state");
    if (!grid) return;
    if (!products || products.length === 0) {
      grid.innerHTML = "";
      empty && empty.classList.remove("hidden");
      return;
    }
    empty && empty.classList.add("hidden");
    grid.innerHTML = products.map(p => _cardHTML(p)).join("");
    _attachCardListeners(grid, products);
  }

  /* ── REPLACE: Product card HTML ──────────────────────────────
     Fields used: emoji, tag, category, title, rating,
     reviewCount, description, sizes, price, compareAt          */
  function _cardHTML(p) {
    const isWished = Wishlist.has(p.id);
    /* Support sizes array OR variants array from backend */
    const sizes = p.sizes || (p.variants || []).map(v =>
      typeof v === "object" ? v.title : v
    );
    return `
      <div class="product-card" data-id="${p.id}">

        <!-- Image / emoji area -->
        <div class="product-img">
          ${p.tag
            ? `<span class="product-tag" style="background:${TAG_COLORS[p.tag] || "#333"}">${p.tag}</span>`
            : ""}
          <span class="product-category">${p.category}</span>
          ${p.emoji || "👗"}
          <button class="wishlist-btn${isWished ? " active" : ""}"
                  data-id="${p.id}"
                  title="Save to wishlist">
            ${isWished ? "❤️" : "🤍"}
          </button>
        </div>

        <!-- Info area -->
        <div class="product-body">
          <div class="product-name">${p.title}</div>

          <!-- Star rating row -->
          <div class="product-rating">
            <span style="color:#C8A84B;font-size:12px">
              ${"★".repeat(Math.round(p.rating || 0))}${"☆".repeat(5 - Math.round(p.rating || 0))}
            </span>
            <span class="rating-count">
              (${p.reviewCount || p.reviews?.length || 0})
            </span>
          </div>

          <div class="product-desc">${p.description}</div>

          <!-- Size quick-select pills -->
          <div class="variant-pills">
            ${sizes.slice(0, 5).map((s, i) =>
              `<button class="variant-pill${i === 0 ? " active" : ""}" data-v="${s}">${s}</button>`
            ).join("")}
          </div>

          <!-- Price + Add to Cart -->
          <div class="product-footer">
            <div>
              <span class="product-price">${fmt(p.price)}</span>
              ${p.compareAt || p.compare
                ? `<span class="price-compare">${fmt(p.compareAt || p.compare)}</span>`
                : ""}
            </div>
            <button class="add-btn" data-pid="${p.id}">Add to Cart</button>
          </div>
        </div>

        <!-- Click hint -->
        <div class="card-view-hint">View Details →</div>
      </div>
    `;
  }

  /* ── Event listeners on each card ─────────────────────────── */
  function _attachCardListeners(grid, products) {

    /* Size pill selection — stop propagation so card click fires separately */
    grid.querySelectorAll(".variant-pill").forEach(pill => {
      pill.addEventListener("click", e => {
        e.stopPropagation();
        pill.closest(".product-card")
          .querySelectorAll(".variant-pill")
          .forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      });
    });

    /* Add to cart button */
    grid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card    = btn.closest(".product-card");
        const product = products.find(p => p.id === btn.dataset.pid);
        const variant = card.querySelector(".variant-pill.active")?.dataset.v
                        || (product.sizes?.[0] || "One Size");
        await Cart.addItem(product, variant);
        btn.textContent = "✓ Added";
        btn.classList.add("added");
        setTimeout(() => {
          btn.textContent = "Add to Cart";
          btn.classList.remove("added");
        }, 1500);
      });
    });

    /* Wishlist heart button */
    grid.querySelectorAll(".wishlist-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        Wishlist.toggle(btn.dataset.id);
        const wishedNow = Wishlist.has(btn.dataset.id);
        btn.textContent = wishedNow ? "❤️" : "🤍";
        btn.classList.toggle("active", wishedNow);
      });
    });

    /* ── REPLACE: Card click → open product.html as a new page ──
       Stores product data in sessionStorage so product.html
       can read it without needing a backend call               */
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const product = products.find(p => p.id === card.dataset.id);
        if (product) ProductDetail.openPage(product);
      });
    });
  }

  /* ── Search and sort controls ────────────────────────────────
     REPLACE: debounce timing (300ms) if needed                 */
  function _bindControls() {
    const search = document.getElementById("search-input");
    const sort   = document.getElementById("sort-select");
    let debounce;
    search?.addEventListener("input", e => {
      clearTimeout(debounce);
      searchQuery = e.target.value;
      debounce = setTimeout(_fetchProducts, 300);
    });
    sort?.addEventListener("change", e => {
      sortBy = e.target.value;
      _fetchProducts();
    });
  }

  function init()    { _renderPills(); _fetchProducts(); _bindControls(); }
  function refresh() { _fetchProducts(); }

  return { init, refresh };
})();


/* ================================================================
   ProductDetail — Opens product.html as a separate page
   REPLACE: openPage() storage key or page path if needed
   ================================================================ */
const ProductDetail = (() => {

  /* ── REPLACE: Opens product.html in same tab as new page ──────
     Saves product to sessionStorage so product.html can read it  */
  function openPage(product) {
    /* Save full product data to sessionStorage */
    sessionStorage.setItem("hearth_product", JSON.stringify(product));
    /* Open product.html — it reads sessionStorage on load */
    window.open("product.html", "_blank");
  }

  /* ── Listen for messages back from product.html ──────────────
     product.html posts ADD_TO_CART / TOGGLE_WISHLIST / NEW_REVIEW */
  function initMessageListener() {
    window.addEventListener("message", async (e) => {
      if (!e.data || !e.data.type) return;

      /* Cart update from product page */
      if (e.data.type === "ADD_TO_CART") {
        await Cart.addItem(e.data.product, e.data.variant);
      }

      /* Wishlist toggle from product page */
      if (e.data.type === "TOGGLE_WISHLIST") {
        Wishlist.toggle(e.data.productId);
      }

      /* New review submitted — add to local data */
      if (e.data.type === "NEW_REVIEW") {
        const product = PRODUCTS.find(p => p.id === e.data.productId);
        if (product) {
          product.reviews = product.reviews || [];
          product.reviews.unshift(e.data.review);
          showToast("✓ Review submitted — thank you!", "green");
        }
      }
    });
  }

  function init() { initMessageListener(); }

  return { init, openPage };
})();
