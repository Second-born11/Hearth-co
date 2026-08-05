/* ════════════════════════════════════════════════
   cart.js — Cart state & drawer (Robust API + Fallback)
   ════════════════════════════════════════════════ */

const CartModule = (() => {
  let cartData = { items: [], subtotal: 0, itemCount: 0 };

  /* Safe price formatter fallback in case global fmt is missing */
  function _formatCurrency(amount) {
    if (typeof fmt === "function") return fmt(amount);
    return "$" + (Number(amount) || 0).toFixed(2);
  }

  /* Helper to normalize cart data shape from backend or local */
  function _normalizeCartData(data) {
    if (!data) return { items: [], subtotal: 0, itemCount: 0 };
    const rawItems = data.items || data.cart?.items || [];
    const items = rawItems.map(item => ({
      cartItemId: item.cartItemId || item.id || "item-" + Math.random().toString(36).substring(2, 7),
      productId:  item.productId  || item.id  || "",
      title:      item.title      || "Product",
      price:      Number(item.price) || 0,
      emoji:      item.emoji      || "👗",
      variantTitle: item.variantTitle || item.variant || "Default",
      qty:        Number(item.qty || item.quantity) || 1
    }));

    const subtotal  = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

    return { items, subtotal, itemCount };
  }

  /* ── Fetch cart from backend ────────────────── */
  async function _fetchCart() {
    try {
      const res = await API.Cart.get();
      cartData = _normalizeCartData(res);
    } catch {
      // Keep existing local cartData if backend fails
    }
    _sync();
  }

  /* ── Add item ───────────────────────────────── */
  async function addItem(product, variantTitle) {
    if (!product) return;

    try {
      const res = await API.Cart.add(product.id, variantTitle, 1);
      cartData = _normalizeCartData(res);
      _sync();
      showToast(`✓ ${product.title || "Item"} added to cart`, "terra");
    } catch (err) {
      console.warn("Backend API unavailable, adding to local cart:", err);

      const items = cartData.items || [];
      const vTitle = variantTitle || "Default";
      const existing = items.find(i => (i.productId === product.id || i.cartItemId === product.id) && i.variantTitle === vTitle);

      if (existing) {
        existing.qty += 1;
      } else {
        items.push({
          cartItemId: "item-" + Date.now(),
          productId:  product.id || "prod-" + Date.now(),
          title:      product.title || "Dress",
          price:      Number(product.price) || 0,
          emoji:      product.emoji || "👗",
          variantTitle: vTitle,
          qty:        1
        });
      }

      cartData = _normalizeCartData({ items });
      _sync();
      showToast(`✓ ${product.title || "Item"} added to cart`, "terra");
    }
  }

  /* ── Update qty ─────────────────────────────── */
  async function updateQty(cartItemId, newQty) {
    try {
      if (newQty <= 0) {
        const res = await API.Cart.removeItem(cartItemId);
        cartData = _normalizeCartData(res);
      } else {
        const res = await API.Cart.updateQty(cartItemId, newQty);
        cartData = _normalizeCartData(res);
      }
    } catch {
      // Local qty adjustment fallback
      if (newQty <= 0) {
        cartData.items = cartData.items.filter(i => i.cartItemId !== cartItemId);
      } else {
        const item = cartData.items.find(i => i.cartItemId === cartItemId);
        if (item) item.qty = newQty;
      }
      cartData = _normalizeCartData({ items: cartData.items });
    }
    _sync();
  }

  /* ── Clear cart ─────────────────────────────── */
  async function clear() {
    try { await API.Cart.clear(); } catch {}
    cartData = { items: [], subtotal: 0, itemCount: 0 };
    _sync();
  }

  function getItems()  { return cartData.items || []; }
  function getCount()  { return cartData.itemCount || 0; }
  function getTotal()  { return cartData.subtotal || 0; }

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
    if (totalEl) totalEl.textContent = _formatCurrency(getTotal());

    if (items.length === 0) {
      container.innerHTML = "";
      emptyEl?.classList.remove("hidden");
      footer?.classList.add("hidden");
      return;
    }

    emptyEl?.classList.add("hidden");
    footer?.classList.remove("hidden");

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-variant">${item.variantTitle}</div>
          <div class="qty-control">
            <button class="qty-btn" data-id="${item.cartItemId}" data-qty="${item.qty - 1}">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-id="${item.cartItemId}" data-qty="${item.qty + 1}">+</button>
          </div>
        </div>
        <div class="cart-item-price">${_formatCurrency(item.price * item.qty)}</div>
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
  function open() {
    _fetchCart();
    document.getElementById("cart-drawer")?.classList.add("open");
    document.getElementById("cart-overlay")?.classList.remove("hidden");
  }

  function close() {
    document.getElementById("cart-drawer")?.classList.remove("open");
    document.getElementById("cart-overlay")?.classList.add("hidden");
  }

  /* ── Init ───────────────────────────────────── */
  function init() {
    document.getElementById("cart-toggle")?.addEventListener("click", open);
    document.getElementById("cart-close")?.addEventListener("click", close);
    document.getElementById("cart-overlay")?.addEventListener("click", close);
    document.getElementById("clear-cart-btn")?.addEventListener("click", clear);
    document.getElementById("checkout-btn")?.addEventListener("click", () => {
      close();
      if (typeof Checkout !== "undefined") Checkout.open(getItems(), getTotal());
    });
    _fetchCart();
  }

  return { init, addItem, updateQty, clear, getItems, getCount, getTotal, open, close };
})();

window.cart = CartModule;
window.Cart = CartModule;