// routes/cart.js — Session-based cart (simulates Shopify Cart API)
const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

// Helper function to fetch or instantiate a user session cart
function getOrCreateCart(sessionId) {
  if (!db.carts) db.carts = {}; // Safety check to ensure db.carts object exists
  if (!db.carts[sessionId]) {
    db.carts[sessionId] = { sessionId, items: [], createdAt: new Date().toISOString() };
  }
  return db.carts[sessionId];
}

// Helper function to calculate subtotal and item counts
function calcTotals(cart) {
  const subtotal = cart.items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
  return { 
    ...cart, 
    subtotal: +subtotal.toFixed(2), 
    itemCount: cart.items.reduce((s, i) => s + (i.qty || 0), 0) 
  };
}

// ── GET /api/cart/:sessionId ──────────────────────────────────
router.get("/:sessionId", (req, res) => {
  try {
    const cart = getOrCreateCart(req.params.sessionId);
    res.json(calcTotals(cart));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error loading cart" });
  }
});

// ── POST /api/cart/:sessionId/add ──────────────────────────────
router.post("/:sessionId/add", (req, res) => {
  try {
    const { productId, variantTitle, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: "productId is required" });

    const product = db.products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const variant = product.variants.find(v => v.title === variantTitle) || product.variants[0];
    const cart    = getOrCreateCart(req.params.sessionId);
    const existing = cart.items.find(i => i.productId === productId && i.variantTitle === variant.title);

    if (existing) {
      existing.qty += parseInt(qty);
    } else {
      cart.items.push({
        cartItemId:   uuidv4(),
        productId:    product.id,
        title:        product.title,
        emoji:        product.emoji,
        variantTitle: variant.title,
        price:        product.price,
        qty:          parseInt(qty)
      });
    }

    res.json(calcTotals(cart));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error adding to cart" });
  }
});

// ── PUT /api/cart/:sessionId/item/:cartItemId ──────────────────
router.put("/:sessionId/item/:cartItemId", (req, res) => {
  try {
    const cart = db.carts[req.params.sessionId];
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find(i => i.cartItemId === req.params.cartItemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const newQty = parseInt(req.body.qty);
    if (newQty <= 0) {
      cart.items = cart.items.filter(i => i.cartItemId !== req.params.cartItemId);
    } else {
      item.qty = newQty;
    }

    res.json(calcTotals(cart));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error updating item quantity" });
  }
});

// ── DELETE /api/cart/:sessionId/item/:cartItemId ───────────────
router.delete("/:sessionId/item/:cartItemId", (req, res) => {
  try {
    const cart = db.carts[req.params.sessionId];
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = cart.items.filter(i => i.cartItemId !== req.params.cartItemId);
    res.json(calcTotals(cart));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error deleting item" });
  }
});

// ── DELETE /api/cart/:sessionId ────────────────────────────────
router.delete("/:sessionId", (req, res) => {
  try {
    if (db.carts && db.carts[req.params.sessionId]) {
      db.carts[req.params.sessionId].items = [];
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error clearing cart" });
  }
});

module.exports = router;

