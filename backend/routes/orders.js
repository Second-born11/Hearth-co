// routes/orders.js — Orders CRUD
const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const VALID_STATUSES = ["Pending","Processing","Shipped","Fulfilled","Cancelled","Refunded"];

// GET /api/orders — list with optional status filter
router.get("/", (req, res) => {
  let list = [...db.orders];
  if (req.query.status) list = list.filter(o => o.status === req.query.status);
  if (req.query.customer) {
    const q = req.query.customer.toLowerCase();
    list = list.filter(o => o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q));
  }
  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders: list, total: list.length });
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id || o.number === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// POST /api/orders — place a new order (called by checkout)
router.post("/", (req, res) => {
  const { customer, items, subtotal, shipping, shippingMethod, address, discountCode } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: "customer and items are required" });
  }

  // Apply discount if provided
  let discountAmount = 0;
  if (discountCode) {
    const disc = db.discounts.find(d => d.code === discountCode && d.active);
    if (disc) {
      if (disc.type === "percentage") discountAmount = (subtotal * disc.value) / 100;
      if (disc.type === "fixed")      discountAmount = disc.value;
      if (disc.type === "shipping")   discountAmount = shipping;
      disc.uses += 1;
    }
  }

  const total = Math.max(0, (subtotal || 0) + (shipping || 0) - discountAmount);
  const number = "#" + (1043 + db.orders.length);

  const order = {
    id: "ord-" + uuidv4().slice(0, 8),
    number,
    customer,
    items,
    subtotal:   +(subtotal || 0).toFixed(2),
    shipping:   +(shipping  || 0).toFixed(2),
    discount:   +discountAmount.toFixed(2),
    total:      +total.toFixed(2),
    shippingMethod: shippingMethod || "Standard",
    address:    address || {},
    discountCode: discountCode || null,
    status:     "Processing",
    createdAt:  new Date().toISOString().split("T")[0]
  };

  // Decrement stock
  items.forEach(item => {
    const product = db.products.find(p => p.id === item.productId);
    if (product) product.stock = Math.max(0, product.stock - item.qty);
  });

  db.orders.push(order);
  res.status(201).json(order);
});

// PUT /api/orders/:id/status — update order status
router.put("/:id/status", (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

module.exports = router;

