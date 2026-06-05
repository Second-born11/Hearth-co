/* ════════════════════════════════════════════════
   cart.js — Cart state & drawer (API-connected)
   ════════════════════════════════════════════════ */

// 🌟 Fixed declaration name to match global application scope mapping
const CartModule = (() => {
  let cartData = { items: [], subtotal: 0, itemCount: 0 };

  /* ── Fetch cart from backend ────────────────── */
  async function _fetchCart() {
    try {
      cartData = await API.Cart.get();
    } catch {
      cartData = { items: [], subtotal: 0, itemCount: 0 };
    }
    _sync();
  }

  /* ── Add item ───────────────────────────────── */
  async function addItem(product, variantTitle) {
    try {
      cartData = await API.Cart.add(product.id, variantTitle, 1);
      _sync();
      showToast(`✓ ${product.title} added to cart`, "terra");
    } catch (err) {
      showToast("Could not add to cart", "");
    }
  }

  /* ── Update qty ─────────────────────────────── */
  async function updateQty(cartItemId, newQty) {
    try {
      if (newQty <= 0) {
        cartData = await API.Cart.removeItem(cartItemId);
      } else {
        cartData = await API.Cart.updateQty(cartItemId, newQty);
      }
      _sync();
    } catch { _fetchCart(); }
  }

  /* ── Clear cart ─────────────────────────────── */
  async function clear() {
    try {
      await API.Cart.clear();
      cartData = { items: [], subtotal: 0, itemCount: 0 };
      _sync();
    } catch { _fetchCart(); }
  }

  function getItems()  { return cartData.items  || []; }
  function getCount()  { return cartData.itemCount || 0; }
  function getTotal()  { return cartData.subtotal  || 0; }

  /* ── Sync UI ────────────────────────────────── */
  function _sync() {
    _renderBadge();
    _renderDrawer();
  }

  function _renderBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    const count = getCount();
    badge.textContent = count;
    badge.classList.toggle("hidden", count === 0);
  }

  function _renderDrawer() {
    const container = document.getElementById("cart-items");
    const footer    = document.getElementById("cart-footer");
    const emptyEl   = document.getElementById("cart-empty");
    const label     = document.getElementById("cart-count-label");
    const totalEl   = document.getElementById("cart-total");
    if (!container) return;

    const items = getItems();
    const count = getCount();

    if (label)   label.textContent = `${count} item${count !== 1 ? "s" : ""}`;
    if (totalEl) totalEl.textContent = fmt(getTotal());

    if (items.length === 0) {
      container.innerHTML = "";
      emptyEl?.classList.remove("hidden");
      footer ?.classList.add("hidden");
      return;
    }

    emptyEl?.classList.add("hidden");
    footer ?.classList.remove("hidden");

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji || "📦"}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-variant">${item.variantTitle}</div>
          <div class="qty-control">
            <button class="qty-btn" data-id="${item.cartItemId}" data-qty="${item.qty - 1}">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-id="${item.cartItemId}" data-qty="${item.qty + 1}">+</button>
          </div>
        </div>
        <div class="cart-item-price">${fmt(item.price * item.qty)}</div>
      </div>
    `).join("");

    container.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        updateQty(btn.dataset.id, parseInt(btn.dataset.qty));
      });
    });
  }

  /* ── Drawer open/close ──────────────────────── */
  function open()  {
    _fetchCart();
    document.getElementById("cart-drawer") ?.classList.add("open");
    document.getElementById("cart-overlay")?.classList.remove("hidden");
  }
  function close() {
    document.getElementById("cart-drawer") ?.classList.remove("open");
    document.getElementById("cart-overlay")?.classList.add("hidden");
  }

  /* ── Init ───────────────────────────────────── */
  function init() {
    document.getElementById("cart-toggle") ?.addEventListener("click", open);
    document.getElementById("cart-close")  ?.addEventListener("click", close);
    document.getElementById("cart-overlay")?.addEventListener("click", close);
    document.getElementById("clear-cart-btn")?.addEventListener("click", clear);
    document.getElementById("checkout-btn")  ?.addEventListener("click", () => {
      close();
      Checkout.open(getItems(), getTotal());
    });
    _fetchCart();
  }

  return { init, addItem, updateQty, clear, getItems, getCount, getTotal, open, close };
})();