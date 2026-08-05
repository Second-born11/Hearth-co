// routes/cart.js — Session-based cart
// FIX: clothing products use "sizes" array not "variants"
// FIX: variantTitle matched against sizes OR variants correctly

const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

function getOrCreateCart(sessionId) {
  if (!db.carts[sessionId]) {
    db.carts[sessionId] = { sessionId, items: [], createdAt: new Date().toISOString() };
  }
  return db.carts[sessionId];
}

function calcTotals(cart) {
  const subtotal  = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.items.reduce((s, i) => s + i.qty, 0);
  return { ...cart, subtotal: +subtotal.toFixed(2), itemCount };
}

// GET /api/cart/:sessionId
router.get("/:sessionId", (req, res) => {
  const cart = getOrCreateCart(req.params.sessionId);
  res.json(calcTotals(cart));
});

// POST /api/cart/:sessionId/add
router.post("/:sessionId/add", (req, res) => {
  const { productId, variantTitle, qty = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });

  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  // FIX: clothing uses "sizes" array (strings), old products used "variants" (objects)
  // resolve the variant label safely for both formats
  let resolvedVariant = variantTitle || "";
  if (!resolvedVariant) {
    if (product.sizes && product.sizes.length > 0) {
      resolvedVariant = product.sizes[0];
    } else if (product.variants && product.variants.length > 0) {
      const v = product.variants[0];
      resolvedVariant = typeof v === "object" ? v.title : v;
    } else {
      resolvedVariant = "One Size";
    }
  }

  const cart     = getOrCreateCart(req.params.sessionId);
  const existing = cart.items.find(
    i => i.productId === productId && i.variantTitle === resolvedVariant
  );

  if (existing) {
    existing.qty += parseInt(qty);
  } else {
    cart.items.push({
      cartItemId:   uuidv4(),
      productId:    product.id,
      title:        product.title,
      emoji:        product.emoji || "👗",
      variantTitle: resolvedVariant,
      price:        product.price,
      qty:          parseInt(qty)
    });
  }

  res.json(calcTotals(cart));
});

// PUT /api/cart/:sessionId/item/:cartItemId — update qty
router.put("/:sessionId/item/:cartItemId", (req, res) => {
  const cart = db.carts[req.params.sessionId];
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const item = cart.items.find(i => i.cartItemId === req.params.cartItemId);
  if (!item) return res.status(404).json({ error: "Item not found in cart" });

  const newQty = parseInt(req.body.qty);
  if (newQty <= 0) {
    cart.items = cart.items.filter(i => i.cartItemId !== req.params.cartItemId);
  } else {
    item.qty = newQty;
  }

  res.json(calcTotals(cart));
});

// DELETE /api/cart/:sessionId/item/:cartItemId — remove one item
router.delete("/:sessionId/item/:cartItemId", (req, res) => {
  const cart = db.carts[req.params.sessionId];
  if (!cart) return res.status(404).json({ error: "Cart not found" });
  cart.items = cart.items.filter(i => i.cartItemId !== req.params.cartItemId);
  res.json(calcTotals(cart));
});

// DELETE /api/cart/:sessionId — clear entire cart
router.delete("/:sessionId", (req, res) => {
  if (db.carts[req.params.sessionId]) {
    db.carts[req.params.sessionId].items = [];
  }
  res.json({ message: "Cart cleared", items: [], subtotal: 0, itemCount: 0 });
});

module.exports = router;
