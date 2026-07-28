/* ================================================================
   wishlist.js — Wishlist with localStorage persistence
   REPLACE: The renderPage card HTML if you change product fields
   ================================================================ */

const Wishlist = (() => {
  const KEY = "hearth_wishlist";
  let ids = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));

  function _save() { localStorage.setItem(KEY, JSON.stringify([...ids])); }

  /* ── REPLACE: Toggle a product in/out of wishlist ── */
  function toggle(productId) {
    if (ids.has(productId)) {
      ids.delete(productId);
      showToast("Removed from wishlist");
    } else {
      ids.add(productId);
      showToast("❤️ Added to wishlist", "terra");
    }
    _save();
    _syncBadge();
  }

  function has(productId)  { return ids.has(productId); }
  function getIds()        { return [...ids]; }
  function count()         { return ids.size; }

  function _syncBadge() {
    const badge = document.getElementById("wishlist-badge");
    if (!badge) return;
    badge.textContent = ids.size;
    badge.classList.toggle("hidden", ids.size === 0);
  }

  /* ── REPLACE: Wishlist page renderer ── */
  function renderPage() {
    const grid  = document.getElementById("wishlist-grid");
    const empty = document.getElementById("wishlist-empty");
    if (!grid) return;

    const products = PRODUCTS.filter(p => ids.has(p.id));
    if (products.length === 0) {
      grid.innerHTML = "";
      empty && empty.classList.remove("hidden");
      return;
    }
    empty && empty.classList.add("hidden");

    /* REPLACE: Wishlist card HTML (clothing-focused) */
    grid.innerHTML = products.map(p => {
      const sizes = p.sizes || p.variants || [];
      return `
        <div class="product-card" data-id="${p.id}">
          <div class="product-img">
            ${p.tag ? `<span class="product-tag" style="background:${TAG_COLORS[p.tag]||"#333"}">${p.tag}</span>` : ""}
            <span class="product-category">${p.category}</span>
            <span class="product-emoji">${p.emoji || "👗"}</span>
            <button class="wishlist-btn active" data-id="${p.id}">❤️</button>
          </div>
          <div class="product-body">
            <div class="product-name">${p.title}</div>
            <div class="product-rating">
              ${renderStars(p.rating || 0, true)}
              <span class="rating-count">(${p.reviewCount || p.reviews?.length || 0})</span>
            </div>
            <div class="product-desc">${p.description}</div>
            <div class="variant-pills">
              ${sizes.slice(0,5).map((s,i) => {
                const label = typeof s === "object" ? s.title : s;
                return `<button class="variant-pill${i===0?" active":""}" data-v="${label}">${label}</button>`;
              }).join("")}
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
    }).join("");

    /* Size pill selection */
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
        const product = PRODUCTS.find(p => p.id === btn.dataset.pid);
        const variant = card.querySelector(".variant-pill.active")?.dataset.v
                        || (product.sizes?.[0] || "One Size");
        await Cart.addItem(product, variant);
        btn.textContent = "✓ Added";
        btn.classList.add("added");
        setTimeout(() => { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1500);
      });
    });

    /* Wishlist remove */
    grid.querySelectorAll(".wishlist-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        toggle(btn.dataset.id);
        setTimeout(renderPage, 300);
      });
    });

    /* Card click → product detail window */
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const product = PRODUCTS.find(p => p.id === card.dataset.id);
        if (product) ProductDetail.openWindow(product);
      });
    });
  }

  function init() { _syncBadge(); }

  return { init, toggle, has, getIds, count, renderPage };
})();
