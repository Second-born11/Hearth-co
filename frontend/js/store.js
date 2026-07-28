/* ================================================================
   store.js — Product grid & product detail PAGE (new window)
    The Store and ProductDetail modules below
   ================================================================ */

/* ──  Store module — product listing page ────────────────
   Fetches from backend API, falls back to local PRODUCTS array.
   Renders category pills, search, sort, and product cards.       */
const Store = (() => {
  let activeCategory = "All";
  let sortBy         = "default";
  let searchQuery    = "";
  let allProducts    = [];

  /* ── Fetch products from backend ──────────────────────────── */
  async function _fetchProducts() {
    const grid = document.getElementById("product-grid");
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--mid)">Loading…</div>`;
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery)              params.search   = searchQuery;
      if (sortBy !== "default")     params.sort     = sortBy;
      const data  = await API.Products.list(params);
      allProducts = data.products || [];
      _renderGrid(allProducts);
    } catch {
      /* Fallback data source if backend unreachable */
      console.warn("Backend unreachable — using local data");
      allProducts = _filterLocal(PRODUCTS);
      _renderGrid(allProducts);
    }
  }

  /* ──Local filter logic (used as fallback) ───────── */
  function _filterLocal(list) {
    let filtered = list
      .filter(p => activeCategory === "All" || p.category === activeCategory)
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === "price-asc")  filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "name")       filtered.sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }

  /* ──Category filter pills ──────────────────────── */
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

  /* ── Product grid renderer ──────────────────────── */
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

  /* ── Product card HTML template ─────────────────── */
  function _cardHTML(p) {
    const isWished  = Wishlist.has(p.id);
    const sizes     = (p.sizes   || p.variants || []);
    const firstSize = Array.isArray(sizes) ? (typeof sizes[0] === "object" ? sizes[0].title : sizes[0]) : "";
    return `
      <div class="product-card" data-id="${p.id}" title="Click to view details">
        <!-- Product image area -->
        <div class="product-img">
          ${p.tag ? `<span class="product-tag" style="background:${TAG_COLORS[p.tag]||"#333"}">${p.tag}</span>` : ""}
          <span class="product-category">${p.category}</span>
          <span class="product-emoji">${p.emoji || "👗"}</span>
          <!-- Wishlist heart button -->
          <button class="wishlist-btn${isWished?" active":""}" data-id="${p.id}" title="Add to wishlist">
            ${isWished ? "❤️" : "🤍"}
          </button>
        </div>
        <!-- Product info -->
        <div class="product-body">
          <div class="product-name">${p.title}</div>
          <!-- Star rating summary -->
          <div class="product-rating">
            ${renderStars(p.rating || 0, true)}
            <span class="rating-count">(${p.reviewCount || p.reviews?.length || 0})</span>
          </div>
          <div class="product-desc">${p.description}</div>
          <!-- Size quick-select -->
          <div class="variant-pills">
            ${sizes.slice(0, 5).map((s, i) => {
              const label = typeof s === "object" ? s.title : s;
              return `<button class="variant-pill${i===0?" active":""}" data-v="${label}">${label}</button>`;
            }).join("")}
          </div>
          <!-- Price and add to cart -->
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

  /* ── Card event listeners ───────────────────────── */
  function _attachCardListeners(grid, products) {
    /* Size/variant pill selection */
    grid.querySelectorAll(".variant-pill").forEach(pill => {
      pill.addEventListener("click", e => {
        e.stopPropagation();
        pill.closest(".product-card").querySelectorAll(".variant-pill")
          .forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      });
    });

    /* Add to cart */
    grid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        e.stopPropagation();
        const card    = btn.closest(".product-card");
        const product = products.find(p => p.id === btn.dataset.pid);
        const variant = card.querySelector(".variant-pill.active")?.dataset.v
                        || (product.sizes?.[0] || product.variants?.[0]?.title || "One Size");
        await Cart.addItem(product, variant);
        btn.textContent = "✓ Added";
        btn.classList.add("added");
        setTimeout(() => { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1500);
      });
    });

    /* Wishlist toggle */
    grid.querySelectorAll(".wishlist-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        Wishlist.toggle(btn.dataset.id);
        btn.textContent = Wishlist.has(btn.dataset.id) ? "❤️" : "🤍";
        btn.classList.toggle("active", Wishlist.has(btn.dataset.id));
      });
    });

    /* Card click → opens product detail in NEW WINDOW */
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const product = products.find(p => p.id === card.dataset.id);
        if (product) ProductDetail.openWindow(product);
      });
    });
  }

  /* ── Search and sort controls ───────────────────── */
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

  function init() {
    _renderPills();
    _fetchProducts();
    _bindControls();
  }

  function refresh() { _fetchProducts(); }

  return { init, refresh };
})();


/* ================================================================
   ProductDetail — Opens product in a NEW BROWSER WINDOW
   The openWindow method and the HTML template inside it
   ================================================================ */
const ProductDetail = (() => {

  /* ── Opens a full product detail page in new window ─
     This writes a complete HTML page into the new window.
     Includes: about section, size/colour selector, ratings,
     reviews list, and a customer review submission form.         */
  function openWindow(product) {
    const win = window.open("", "_blank", "width=900,height=900,scrollbars=yes,resizable=yes");
    if (!win) { alert("Please allow popups for this site."); return; }

    const sizes  = product.sizes   || [];
    const colors = product.colors  || [];
    const reviews = product.reviews || [];
    const avgRating = product.rating || 0;

    /* ── Full HTML written into the new window ──────── */
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${product.title} — Hearth & Co.</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    /* ── Product detail window styles ── */
    :root {
      --cream:#FAF7F2; --sand:#F0EAE0; --charcoal:#1A1A2E;
      --mid:#7A6F65; --light:#B5ADA5; --white:#fff;
      --accent:#1A1A2E; --gold:#C8A84B; --red:#C84A4A; --green:#2D6A4F;
      --font-display:'Playfair Display',Georgia,serif;
      --font-body:'DM Sans',system-ui,sans-serif;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:var(--font-body);background:var(--cream);color:var(--charcoal);line-height:1.6;-webkit-font-smoothing:antialiased;}
    button{font-family:var(--font-body);cursor:pointer;border:none;background:none;}

    /* Header */
    .pd-header{background:var(--charcoal);color:#fff;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;}
    .pd-logo{font-family:var(--font-display);font-size:20px;font-weight:700;letter-spacing:-0.3px;}
    .pd-back{color:rgba(255,255,255,0.7);font-size:13px;cursor:pointer;transition:color .2s;}
    .pd-back:hover{color:#fff;}

    /* Main layout */
    .pd-main{max-width:860px;margin:0 auto;padding:48px 24px 80px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;}

    /* Product image panel */
    .pd-img-panel{position:sticky;top:24px;}
    .pd-img-box{background:linear-gradient(135deg,var(--sand),var(--cream));border-radius:16px;height:420px;display:flex;align-items:center;justify-content:center;font-size:120px;position:relative;}
    .pd-img-tag{position:absolute;top:16px;left:16px;padding:4px 12px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#fff;}
    .pd-img-category{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.85);color:var(--mid);padding:4px 12px;border-radius:100px;font-size:10px;font-weight:600;}

    /* Product info panel */
    .pd-info{}
    .pd-category-label{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--mid);margin-bottom:8px;}
    .pd-title{font-family:var(--font-display);font-size:32px;font-weight:700;color:var(--charcoal);line-height:1.2;margin-bottom:12px;letter-spacing:-.5px;}
    .pd-rating-row{display:flex;align-items:center;gap:8px;margin-bottom:16px;}
    .pd-stars{color:var(--gold);font-size:17px;}
    .pd-rating-num{font-size:14px;font-weight:700;color:var(--charcoal);}
    .pd-review-count{font-size:13px;color:var(--mid);}
    .pd-price-row{display:flex;align-items:baseline;gap:10px;margin-bottom:6px;}
    .pd-price{font-family:var(--font-display);font-size:28px;font-weight:700;color:var(--charcoal);}
    .pd-compare{font-size:16px;color:var(--light);text-decoration:line-through;}
    .pd-stock{font-size:12px;color:var(--green);font-weight:600;margin-bottom:20px;}
    .pd-divider{height:1px;background:var(--sand);margin:20px 0;}

    /* Size & colour selectors */
    .pd-label{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--mid);margin-bottom:10px;}
    .pd-options{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
    .pd-opt{padding:7px 16px;border-radius:100px;border:1.5px solid var(--sand);font-size:12px;font-weight:600;color:var(--mid);cursor:pointer;transition:all .15s;}
    .pd-opt:hover{border-color:var(--charcoal);color:var(--charcoal);}
    .pd-opt.active{background:var(--charcoal);color:#fff;border-color:var(--charcoal);}
    .pd-color-opt{width:32px;height:32px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:all .15s;position:relative;}
    .pd-color-opt.active{border-color:var(--charcoal);}
    .pd-color-opt::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1.5px solid var(--charcoal);opacity:0;transition:opacity .15s;}
    .pd-color-opt.active::after{opacity:1;}

    /* CTA buttons */
    .pd-cta{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;}
    .btn-primary{background:var(--charcoal);color:#fff;padding:14px 28px;border-radius:100px;font-size:14px;font-weight:700;transition:all .2s;flex:1;}
    .btn-primary:hover{background:#2D2D4A;transform:translateY(-1px);}
    .btn-outline{background:transparent;color:var(--charcoal);border:1.5px solid var(--sand);padding:14px 18px;border-radius:100px;font-size:14px;font-weight:600;transition:all .2s;}
    .btn-outline:hover{border-color:var(--charcoal);}

    /* About section */
    .pd-about{margin-top:4px;}
    .pd-about-title{font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--charcoal);margin-bottom:8px;}
    .pd-about-text{font-size:14px;color:var(--mid);line-height:1.8;}

    /* Reviews section */
    .reviews-section{max-width:860px;margin:0 auto;padding:0 24px 80px;}
    .reviews-title{font-family:var(--font-display);font-size:26px;font-weight:700;color:var(--charcoal);margin-bottom:6px;}
    .reviews-sub{font-size:13px;color:var(--mid);margin-bottom:32px;}

    /* Rating summary bar */
    .rating-summary{display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;background:#fff;border-radius:16px;padding:28px;margin-bottom:32px;box-shadow:0 2px 12px rgba(0,0,0,.05);}
    .rating-big{text-align:center;}
    .rating-big-num{font-family:var(--font-display);font-size:56px;font-weight:700;color:var(--charcoal);line-height:1;}
    .rating-big-stars{color:var(--gold);font-size:20px;margin:6px 0;}
    .rating-big-count{font-size:12px;color:var(--mid);}
    .rating-bars{display:flex;flex-direction:column;gap:8px;flex:1;}
    .rating-bar-row{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--mid);}
    .rating-bar-label{width:30px;text-align:right;font-weight:600;}
    .rating-bar-track{flex:1;height:8px;background:var(--sand);border-radius:4px;overflow:hidden;}
    .rating-bar-fill{height:100%;background:var(--gold);border-radius:4px;}
    .rating-bar-count{width:28px;color:var(--mid);}

    /* Individual reviews */
    .review-list{display:flex;flex-direction:column;gap:20px;margin-bottom:40px;}
    .review-card{background:#fff;border-radius:16px;padding:22px 24px;box-shadow:0 2px 10px rgba(0,0,0,.05);}
    .review-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:8px;}
    .review-author-name{font-weight:700;font-size:14px;color:var(--charcoal);}
    .review-verified{font-size:10px;color:var(--green);font-weight:700;letter-spacing:.5px;background:#E8F5E9;padding:2px 8px;border-radius:100px;}
    .review-stars{color:var(--gold);font-size:14px;margin-bottom:4px;}
    .review-meta{font-size:11px;color:var(--light);margin-bottom:10px;}
    .review-text{font-size:14px;color:var(--mid);line-height:1.7;}
    .review-purchase{font-size:11px;color:var(--light);margin-top:8px;}

    /* Customer review form */
    .review-form-wrap{background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.05);}
    .review-form-title{font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--charcoal);margin-bottom:6px;}
    .review-form-sub{font-size:13px;color:var(--mid);margin-bottom:22px;}
    .form-group{margin-bottom:16px;}
    .form-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--mid);display:block;margin-bottom:6px;}
    .form-input{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid var(--sand);font-size:14px;color:var(--charcoal);outline:none;background:var(--cream);font-family:var(--font-body);transition:border-color .2s;}
    .form-input:focus{border-color:var(--charcoal);background:#fff;}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .star-picker{display:flex;gap:6px;margin-bottom:4px;}
    .star-pick{font-size:26px;cursor:pointer;color:var(--sand);transition:color .15s;}
    .star-pick.active,.star-pick:hover{color:var(--gold);}
    .form-textarea{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid var(--sand);font-size:14px;color:var(--charcoal);outline:none;background:var(--cream);font-family:var(--font-body);resize:vertical;min-height:100px;transition:border-color .2s;}
    .form-textarea:focus{border-color:var(--charcoal);background:#fff;}
    .submit-btn{background:var(--charcoal);color:#fff;padding:13px 32px;border-radius:100px;font-size:14px;font-weight:700;transition:all .2s;margin-top:8px;}
    .submit-btn:hover{background:#2D2D4A;}
    .form-success{background:#E8F5E9;color:var(--green);border-radius:12px;padding:14px 18px;font-size:14px;font-weight:600;margin-top:12px;display:none;}
    .form-error{background:#FDECEA;color:var(--red);border-radius:12px;padding:14px 18px;font-size:14px;font-weight:600;margin-top:12px;display:none;}

    /* Color map for swatches */
    .color-swatch{display:inline-block;width:22px;height:22px;border-radius:50%;vertical-align:middle;margin-right:4px;}

    @media(max-width:640px){
      .pd-main{grid-template-columns:1fr;}
      .rating-summary{grid-template-columns:1fr;}
      .form-row{grid-template-columns:1fr;}
    }
  </style>
</head>
<body>

<!-- ── Product detail window header ── -->
<div class="pd-header">
  <div class="pd-logo">🌿 Hearth & Co.</div>
  <button class="pd-back" onclick="window.close()">← Back to Store</button>
</div>

<!-- ── Main product layout ── -->
<div class="pd-main">

  <!-- Left: product image -->
  <div class="pd-img-panel">
    <div class="pd-img-box">
      ${product.tag ? `<span class="pd-img-tag" style="background:${TAG_COLORS[product.tag]||"#333"}">${product.tag}</span>` : ""}
      <span class="pd-img-category">${product.category}</span>
      <span>${product.emoji || "👗"}</span>
    </div>
  </div>

  <!-- Right: product info -->
  <div class="pd-info">
    <div class="pd-category-label">${product.category}</div>
    <h1 class="pd-title">${product.title}</h1>

    <!-- Rating summary -->
    <div class="pd-rating-row">
      <span class="pd-stars">${"★".repeat(Math.round(avgRating))}${"☆".repeat(5-Math.round(avgRating))}</span>
      <span class="pd-rating-num">${avgRating.toFixed(1)}</span>
      <span class="pd-review-count">(${product.reviewCount || reviews.length} reviews)</span>
    </div>

    <!-- Price -->
    <div class="pd-price-row">
      <span class="pd-price">${fmt(product.price)}</span>
      ${product.compareAt||product.compare ? `<span class="pd-compare">${fmt(product.compareAt||product.compare)}</span>` : ""}
    </div>
    <div class="pd-stock">✓ ${product.stock} in stock</div>

    <div class="pd-divider"></div>

    <!--  Size selector ── -->
    ${sizes.length ? `
    <div class="pd-label">Size</div>
    <div class="pd-options" id="size-opts">
      ${sizes.map((s, i) => `<button class="pd-opt${i===0?" active":""}" data-size="${s}">${s}</button>`).join("")}
    </div>` : ""}

    <!-- Colour selector ── -->
    ${colors.length ? `
    <div class="pd-label">Colour</div>
    <div class="pd-options" id="colour-opts">
      ${colors.map((c, i) => `<button class="pd-opt${i===0?" active":""}" data-colour="${c}">${c}</button>`).join("")}
    </div>` : ""}

    <!-- CTA buttons -->
    <div class="pd-cta">
      <button class="btn-primary" id="add-to-cart-btn">Add to Cart</button>
      <button class="btn-outline" id="wishlist-btn" title="Save to wishlist">🤍</button>
    </div>

    <div class="pd-divider"></div>

    <!--  About the product section ── -->
    <div class="pd-about">
      <div class="pd-about-title">About this piece</div>
      <div class="pd-about-text">${product.about || product.description}</div>
    </div>
  </div>
</div>

<!-- ──  Reviews section ── -->
<div class="reviews-section">
  <div class="reviews-title">Customer Reviews</div>
  <div class="reviews-sub">${reviews.length} verified purchase${reviews.length !== 1 ? "s" : ""}</div>

  <!-- Rating breakdown bars -->
  <div class="rating-summary">
    <div class="rating-big">
      <div class="rating-big-num">${avgRating.toFixed(1)}</div>
      <div class="rating-big-stars">${"★".repeat(Math.round(avgRating))}${"☆".repeat(5-Math.round(avgRating))}</div>
      <div class="rating-big-count">out of 5</div>
    </div>
    <div class="rating-bars">
      ${[5,4,3,2,1].map(star => {
        const count = reviews.filter(r => r.stars === star).length;
        const pct   = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
        return `
          <div class="rating-bar-row">
            <span class="rating-bar-label">${star}★</span>
            <div class="rating-bar-track"><div class="rating-bar-fill" style="width:${pct}%"></div></div>
            <span class="rating-bar-count">${count}</span>
          </div>`;
      }).join("")}
    </div>
  </div>

  <!-- Individual review cards -->
  <div class="review-list" id="review-list">
    ${reviews.map(r => `
      <div class="review-card">
        <div class="review-top">
          <div>
            <span class="review-author-name">${r.author}</span>
            ${r.verified ? `<span class="review-verified" style="margin-left:8px">✓ Verified Purchase</span>` : ""}
          </div>
          <span style="font-size:12px;color:var(--light)">${r.date || ""}</span>
        </div>
        <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5-r.stars)}</div>
        <div class="review-text">${r.text}</div>
        ${(r.size||r.color) ? `<div class="review-purchase">Purchased: ${[r.size,r.color].filter(Boolean).join(" / ")}</div>` : ""}
      </div>
    `).join("")}
  </div>

  <!-- Customer review submission form ── -->
  <div class="review-form-wrap">
    <div class="review-form-title">Write a Review</div>
    <div class="review-form-sub">Share your experience to help other shoppers</div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Your Name</label>
        <input class="form-input" id="r-name" placeholder="Jane Smith" />
      </div>
      <div class="form-group">
        <label class="form-label">Email (not published)</label>
        <input class="form-input" id="r-email" type="email" placeholder="jane@example.com" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Size Purchased</label>
        <select class="form-input" id="r-size">
          <option value="">Select size</option>
          ${sizes.map(s => `<option>${s}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Colour Purchased</label>
        <select class="form-input" id="r-colour">
          <option value="">Select colour</option>
          ${colors.map(c => `<option>${c}</option>`).join("")}
        </select>
      </div>
    </div>

    <!-- Star rating picker -->
    <div class="form-group">
      <label class="form-label">Your Rating</label>
      <div class="star-picker" id="star-picker">
        ${[1,2,3,4,5].map(n => `<span class="star-pick" data-star="${n}">★</span>`).join("")}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Your Review</label>
      <textarea class="form-textarea" id="r-text" placeholder="What did you love about it? How does it fit? Would you recommend it?"></textarea>
    </div>

    <button class="submit-btn" id="submit-review-btn">Submit Review</button>
    <div class="form-success" id="review-success">✓ Thank you! Your review has been submitted.</div>
    <div class="form-error"   id="review-error"></div>
  </div>
</div>

<script>
  /* ── Interactive logic for product detail window ── */

  /* Size selection */
  document.querySelectorAll('#size-opts .pd-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#size-opts .pd-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Colour selection */
  document.querySelectorAll('#colour-opts .pd-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#colour-opts .pd-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Add to cart — sends message to parent window */
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    const size   = document.querySelector('#size-opts .pd-opt.active')?.dataset.size   || '';
    const colour = document.querySelector('#colour-opts .pd-opt.active')?.dataset.colour || '';
    const variant = [size, colour].filter(Boolean).join(' / ');
    /* Post message to parent window so cart updates */
    window.opener?.postMessage({
      type: 'ADD_TO_CART',
      product: ${JSON.stringify({ id: product.id, title: product.title, price: product.price, emoji: product.emoji || "👗", stock: product.stock })},
      variant
    }, '*');
    const btn = document.getElementById('add-to-cart-btn');
    btn.textContent = '✓ Added to Cart';
    btn.style.background = '#2D6A4F';
    setTimeout(() => { btn.textContent = 'Add to Cart'; btn.style.background = ''; }, 2000);
  });

  /* Wishlist toggle */
  document.getElementById('wishlist-btn')?.addEventListener('click', function() {
    this.textContent = this.textContent === '🤍' ? '❤️' : '🤍';
    window.opener?.postMessage({ type: 'TOGGLE_WISHLIST', productId: '${product.id}' }, '*');
  });

  /* Star rating picker */
  let selectedStars = 0;
  document.querySelectorAll('.star-pick').forEach(star => {
    star.addEventListener('click', () => {
      selectedStars = parseInt(star.dataset.star);
      document.querySelectorAll('.star-pick').forEach((s, i) => {
        s.classList.toggle('active', i < selectedStars);
      });
    });
    star.addEventListener('mouseover', () => {
      const n = parseInt(star.dataset.star);
      document.querySelectorAll('.star-pick').forEach((s, i) => {
        s.style.color = i < n ? 'var(--gold)' : '';
      });
    });
    star.addEventListener('mouseout', () => {
      document.querySelectorAll('.star-pick').forEach((s, i) => {
        s.style.color = i < selectedStars ? 'var(--gold)' : '';
      });
    });
  });

  /*  Review form submission ── */
  document.getElementById('submit-review-btn')?.addEventListener('click', () => {
    const name   = document.getElementById('r-name').value.trim();
    const email  = document.getElementById('r-email').value.trim();
    const text   = document.getElementById('r-text').value.trim();
    const size   = document.getElementById('r-size').value;
    const colour = document.getElementById('r-colour').value;
    const errEl  = document.getElementById('review-error');
    const sucEl  = document.getElementById('review-success');
    errEl.style.display = 'none';
    sucEl.style.display = 'none';

    /* Validation */
    if (!name)          { errEl.textContent = 'Please enter your name.';         errEl.style.display='block'; return; }
    if (!email)         { errEl.textContent = 'Please enter your email.';        errEl.style.display='block'; return; }
    if (!selectedStars) { errEl.textContent = 'Please select a star rating.';   errEl.style.display='block'; return; }
    if (!text)          { errEl.textContent = 'Please write your review.';       errEl.style.display='block'; return; }

    /* Build review object */
    const review = {
      author:   name,
      stars:    selectedStars,
      date:     new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
      size, colour,
      verified: false,
      text
    };

    /* Add review card to the page immediately */
    const list = document.getElementById('review-list');
    const card = document.createElement('div');
    card.className = 'review-card';
    card.style.border = '1.5px solid #E8F5E9';
    card.innerHTML = \`
      <div class="review-top">
        <span class="review-author-name">\${review.author}</span>
        <span style="font-size:12px;color:var(--light)">\${review.date}</span>
      </div>
      <div class="review-stars">\${'★'.repeat(review.stars)}\${'☆'.repeat(5-review.stars)}</div>
      <div class="review-text">\${review.text}</div>
      \${(review.size||review.colour)?'<div class="review-purchase">Purchased: '+[review.size,review.colour].filter(Boolean).join(' / ')+'</div>':''}
    \`;
    list.prepend(card);

    /* Post review back to parent window to save */
    window.opener?.postMessage({ type: 'NEW_REVIEW', productId: '${product.id}', review }, '*');

    /* Reset form */
    document.getElementById('r-name').value  = '';
    document.getElementById('r-email').value = '';
    document.getElementById('r-text').value  = '';
    document.getElementById('r-size').value  = '';
    document.getElementById('r-colour').value= '';
    selectedStars = 0;
    document.querySelectorAll('.star-pick').forEach(s => { s.classList.remove('active'); s.style.color=''; });
    sucEl.style.display = 'block';
    setTimeout(() => sucEl.style.display='none', 4000);
  });
</script>
</body>
</html>`);
    win.document.close();
  }

  /* ──  Listen for messages from product detail window ─
     Handles ADD_TO_CART, TOGGLE_WISHLIST, and NEW_REVIEW events */
  function initMessageListener() {
    window.addEventListener("message", async (e) => {
      if (!e.data || !e.data.type) return;

      /* Add to cart from product window */
      if (e.data.type === "ADD_TO_CART") {
        await Cart.addItem(e.data.product, e.data.variant);
      }

      /* Wishlist toggle from product window */
      if (e.data.type === "TOGGLE_WISHLIST") {
        Wishlist.toggle(e.data.productId);
      }

      /* New review submitted from product window */
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

  function init() {
    initMessageListener();
  }

  return { init, openWindow };
})();
