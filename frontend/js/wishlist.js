/* ════════════════════════════════════════════════
   wishlist.js — Wishlist state & page rendering
   ════════════════════════════════════════════════ */

const Wishlist = (() => {
  const KEY = "hearth_wishlist";
  let ids = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));

  function _save() {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  }

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
    _syncButtons(productId);
  }

  function has(productId) { return ids.has(productId); }
  function getIds()       { return [...ids]; }
  function count()        { return ids.size; }

  function _syncBadge() {
    const badge = document.getElementById("wishlist-badge");
    if (!badge) return;
    badge.textContent = ids.size;
    badge.classList.toggle("hidden", ids.size === 0);
  }

  function _syncButtons(productId) {
    document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
      btn.classList.toggle("active", ids.has(productId));
      btn.textContent = ids.has(productId) ? "❤️" : "🤍";
    });
  }

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

    grid.innerHTML = products.map(p => `
      <div class="product-card wishlist-card" data-id="${p.id}">
        <div class="product-img">
          ${p.tag ? `<span class="product-tag" style="background:${TAG_COLORS[p.tag]}">${p.tag}</span>` : ""}
          <span class="product-category">${p.category}</span>
          <span>${p.emoji}</span>
          <button class="wishlist-btn active" data-id="${p.id}">❤️</button>
        </div>
        <div class="product-body">
          <div class="product-name">${p.title}</div>
          <div class="product-desc">${p.description}</div>
          <div class="variant-pills">
            ${p.variants.map((v, i) => `<button class="variant-pill${i===0?" active":""}" data-pid="${p.id}" data-v="${v}">${v}</button>`).join("")}
          </div>
          <div class="product-footer">
            <div>
              <span class="product-price">${fmt(p.price)}</span>
              ${p.compare ? `<span class="price-compare">${fmt(p.compare)}</span>` : ""}
            </div>
            <button class="add-btn" data-pid="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join("");

    // Variant selection
    grid.querySelectorAll(".variant-pill").forEach(pill => {
      pill.addEventListener("click", e => {
        e.stopPropagation();
        const card = pill.closest(".product-card");
        card.querySelectorAll(".variant-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      });
    });

    // Add to cart
    grid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const card = btn.closest(".product-card");
        const product = PRODUCTS.find(p => p.id === btn.dataset.pid);
        const selected = card.querySelector(".variant-pill.active")?.dataset.v || product.variants[0];
        Cart.add({ ...product, selectedVariant: selected });
        btn.textContent = "✓ Added";
        btn.classList.add("added");
        setTimeout(() => { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1500);
      });
    });

    // Wishlist toggle
    grid.querySelectorAll(".wishlist-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        toggle(btn.dataset.id);
        // re-render since item was removed
        setTimeout(renderPage, 300);
      });
    });

    // Card click → detail modal
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const product = PRODUCTS.find(p => p.id === card.dataset.id);
        if (product) ProductDetail.open(product);
      });
    });
  }

  function init() {
    _syncBadge();
  }

  return { init, toggle, has, getIds, count, renderPage };
})();
