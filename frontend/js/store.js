/* ════════════════════════════════════════════════
   store.js — Product grid (API-connected)
   ════════════════════════════════════════════════ */

const Store = (() => {
  let activeCategory = "All";
  let sortBy         = "default";
  let searchQuery    = "";
  let allProducts    = [];   // fetched from backend

  /* ── Fetch from API ─────────────────────────── */
  async function _fetchProducts() {
    const grid = document.getElementById("product-grid");
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--mid)">Loading products…</div>`;
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery)              params.search   = searchQuery;
      if (sortBy !== "default")     params.sort     = sortBy;

      const data   = await API.Products.list(params);
      allProducts  = data.products || [];
      _renderGrid(allProducts);
    } catch (err) {
      // Fallback to local data if backend is unreachable
      console.warn("Backend unreachable, using local data");
      allProducts = PRODUCTS;
      _renderGrid(_filterLocal(allProducts));
    }
  }

  function _filterLocal(list) {
    let filtered = list
      .filter(p => activeCategory === "All" || p.category === activeCategory)
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "price-asc")  filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "name")       filtered.sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }

  /* ── Render category pills ──────────────────── */
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

  /* ── Render grid ────────────────────────────── */
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

  function _cardHTML(p) {
    const isWished  = Wishlist.has(p.id);
    // Support both variants as objects {title} or plain strings
    const variantList = (p.variants || []).map(v => typeof v === "object" ? v.title : v);
    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-img">
          ${p.tag ? `<span class="product-tag" style="background:${TAG_COLORS[p.tag]||"#999"}">${p.tag}</span>` : ""}
          <span class="product-category">${p.category}</span>
          <span>${p.emoji || "📦"}</span>
          <button class="wishlist-btn${isWished ? " active" : ""}" data-id="${p.id}">${isWished ? "❤️" : "🤍"}</button>
        </div>
        <div class="product-body">
          <div class="product-name">${p.title}</div>
          <div class="product-desc">${p.description}</div>
          <div class="variant-pills">
            ${variantList.map((v, i) => `<button class="variant-pill${i===0?" active":""}" data-v="${v}">${v}</button>`).join("")}
          </div>
          <div class="product-footer">
            <div>
              <span class="product-price">${fmt(p.price)}</span>
              ${p.compareAt||p.compare ? `<span class="price-compare">${fmt(p.compareAt||p.compare)}</span>` : ""}
            </div>
            <button class="add-btn" data-pid="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  }

  function _attachCardListeners(grid, products) {
    grid.querySelectorAll(".variant-pill").forEach(pill => {
      pill.addEventListener("click", e => {
        e.stopPropagation();
        pill.closest(".product-card").querySelectorAll(".variant-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      });
    });

    grid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card    = btn.closest(".product-card");
        const product = products.find(p => p.id === btn.dataset.pid);
        const variant = card.querySelector(".variant-pill.active")?.dataset.v || (product.variants[0]?.title || product.variants[0]);
        
        // Fixed to CartModule to resolve reference errors
        await CartModule.addItem(product, variant);
        
        btn.textContent = "✓ Added";
        btn.classList.add("added");
        setTimeout(() => { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1500);
      });
    });

    grid.querySelectorAll(".wishlist-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        Wishlist.toggle(btn.dataset.id);
      });
    });

    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const product = products.find(p => p.id === card.dataset.id);
        if (product) ProductDetail.open(product);
      });
    });
  }

  /* ── Controls ───────────────────────────────── */
  function _bindControls() {
    const search = document.getElementById("search-input");
    const sort   = document.getElementById("sort-select");
    let debounce;
    search?.addEventListener("input", e => {
      clearTimeout(debounce);
      searchQuery = e.target.value;
      debounce = setTimeout(_fetchProducts, 300);
    });
    sort?.addEventListener("change", e => { sortBy = e.target.value; _fetchProducts(); });
  }

  function init() {
    _renderPills();
    _fetchProducts();
    _bindControls();
  }

  function refresh() { _fetchProducts(); }

  return { init, refresh };
})();

/* ════════════════════════════════════════════════
   ProductDetail — full product modal
   ════════════════════════════════════════════════ */
const ProductDetail = (() => {
  function open(product) {
    const content = document.getElementById("product-detail-content");
    const modal   = document.getElementById("product-modal");
    const overlay = document.getElementById("product-overlay");
    if (!content || !modal) return;

    const isWished    = Wishlist.has(product.id);
    const variantList = (product.variants || []).map(v => typeof v === "object" ? v.title : v);
    const reviews     = product.reviews || [];

    content.innerHTML = `
      <div class="product-detail-wrap">
        <div class="pd-header">
          <div class="pd-img">${product.emoji || "📦"}</div>
          <div class="pd-info">
            <div class="pd-name">${product.title}</div>
            <div class="pd-price">${fmt(product.price)}
              ${product.compareAt||product.compare ? `<span style="font-size:15px;color:var(--light);text-decoration:line-through;font-family:var(--font-body)">${fmt(product.compareAt||product.compare)}</span>` : ""}
            </div>
            <div class="pd-category">${product.category}${product.tag ? ` · <span style="color:${TAG_COLORS[product.tag]||"#999"};font-weight:700">${product.tag}</span>` : ""}</div>
            <div class="pd-desc">${product.description}</div>
            <div class="pd-stock">✓ ${product.stock} in stock</div>
          </div>
        </div>
        <div class="pd-variants">
          <div class="pd-variants-label">Choose variant</div>
          <div class="variant-pills">
            ${variantList.map((v, i) => `<button class="variant-pill${i===0?" active":""}" data-v="${v}">${v}</button>`).join("")}
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-primary" id="pd-add-btn" style="flex:1">Add to Cart</button>
          <button class="btn-outline" id="pd-wish-btn" style="padding:13px 18px">${isWished ? "❤️ Wishlisted" : "🤍 Wishlist"}</button>
        </div>
        ${reviews.length ? `
        <div class="pd-reviews">
          <div class="pd-reviews-title">Customer Reviews (${reviews.length})</div>
          ${reviews.map(r => `
            <div class="review">
              <div class="review-author">${r.author}</div>
              <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5-r.stars)}</div>
              <div class="review-text">${r.text}</div>
            </div>
          `).join("")}
        </div>` : ""}
      </div>
    `;

    content.querySelectorAll(".variant-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        content.querySelectorAll(".variant-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      });
    });

    content.querySelector("#pd-add-btn").addEventListener("click", async () => {
      const variant = content.querySelector(".variant-pill.active")?.dataset.v || variantList[0];
      
      // Fixed to CartModule to resolve reference errors inside full modals
      await CartModule.addItem(product, variant);
      close();
    });

    content.querySelector("#pd-wish-btn").addEventListener("click", e => {
      Wishlist.toggle(product.id);
      e.currentTarget.textContent = Wishlist.has(product.id) ? "❤️ Wishlisted" : "🤍 Wishlist";
    });

    overlay?.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.classList.add("open");
  }

  function close() {
    document.getElementById("product-modal") ?.classList.remove("open");
    document.getElementById("product-overlay")?.classList.add("hidden");
  }

  function init() {
    document.getElementById("product-close")  ?.addEventListener("click", close);
    document.getElementById("product-overlay")?.addEventListener("click", close);
  }

  return { init, open, close };
})();