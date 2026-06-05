// routes/discounts.js
const express = require("express");
const router  = express.Router();
const db = require("../db");

// GET /api/discounts
router.get("/", (_req, res) => {
  res.json({ discounts: db.discounts, total: db.discounts.length });
});

// POST /api/discounts — create discount code
router.post("/", (req, res) => {
  const { code, type, value, minOrder, expires } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: "code, type, and value are required" });
  }
  if (!["percentage","fixed","shipping"].includes(type)) {
    return res.status(400).json({ error: "type must be percentage, fixed, or shipping" });
  }
  if (db.discounts.find(d => d.code === code.toUpperCase())) {
    return res.status(409).json({ error: "Discount code already exists" });
  }
  const discount = {
    code: code.toUpperCase(),
    type, value: parseFloat(value),
    minOrder: parseFloat(minOrder) || 0,
    expires: expires || null,
    uses: 0, active: true
  };
  db.discounts.push(discount);
  res.status(201).json(discount);
});

// POST /api/discounts/validate — check if a code is valid for a given cart total
router.post("/validate", (req, res) => {
  const { code, cartTotal } = req.body;
  const discount = db.discounts.find(d => d.code === code?.toUpperCase() && d.active);
  if (!discount) return res.status(404).json({ valid: false, error: "Invalid or expired code" });
  if (discount.minOrder && cartTotal < discount.minOrder) {
    return res.status(400).json({ valid: false, error: `Minimum order of $${discount.minOrder} required` });
  }
  if (discount.expires && new Date(discount.expires) < new Date()) {
    return res.status(400).json({ valid: false, error: "This code has expired" });
  }

  let savings = 0;
  if (discount.type === "percentage") savings = (cartTotal * discount.value) / 100;
  if (discount.type === "fixed")      savings = discount.value;
  if (discount.type === "shipping")   savings = 0; // applied at shipping step

  res.json({ valid: true, discount, savings: +savings.toFixed(2) });
});

// DELETE /api/discounts/:code — deactivate
router.delete("/:code", (req, res) => {
  const discount = db.discounts.find(d => d.code === req.params.code.toUpperCase());
  if (!discount) return res.status(404).json({ error: "Discount not found" });
  discount.active = false;
  res.json({ message: "Discount deactivated", discount });
});

module.exports = router;

