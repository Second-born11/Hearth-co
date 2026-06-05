// routes/products.js — CRUD for products
const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

// GET /api/products  — list with optional filters
router.get("/", (req, res) => {
  let list = [...db.products];
  const { category, tag, search, sort, active } = req.query;

  if (category && category !== "All") list = list.filter(p => p.category === category);
  if (tag)    list = list.filter(p => p.tag === tag);
  if (active !== undefined) list = list.filter(p => p.active === (active === "true"));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name")       list.sort((a, b) => a.title.localeCompare(b.title));

  res.json({ products: list, total: list.length });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.products.find(p => p.id === req.params.id || p.handle === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST /api/products — create
router.post("/", (req, res) => {
  const { title, price, compareAt, category, tag, emoji, description, variants, stock } = req.body;
  if (!title || !price) return res.status(400).json({ error: "title and price are required" });

  const product = {
    id: "p" + uuidv4().slice(0, 6),
    handle: title.toLowerCase().replace(/\s+/g, "-"),
    title, price: parseFloat(price),
    compareAt: compareAt ? parseFloat(compareAt) : null,
    category: category || "General",
    tag: tag || null,
    emoji: emoji || "",
    description: description || "",
    variants: variants || [{ id: uuidv4(), title: "Default", available: true }],
    stock: parseInt(stock) || 0,
    active: true,
    createdAt: new Date().toISOString().split("T")[0]
  };

  db.products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — update
router.put("/:id", (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  const allowed = ["title","price","compareAt","category","tag","emoji","description","variants","stock","active"];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) db.products[idx][key] = req.body[key];
  });
  if (req.body.price)    db.products[idx].price    = parseFloat(req.body.price);
  if (req.body.compareAt !== undefined) db.products[idx].compareAt = req.body.compareAt ? parseFloat(req.body.compareAt) : null;
  if (req.body.stock !== undefined) db.products[idx].stock = parseInt(req.body.stock);

  res.json(db.products[idx]);
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  const removed = db.products.splice(idx, 1)[0];
  res.json({ message: "Product deleted", product: removed });
});

module.exports = router;