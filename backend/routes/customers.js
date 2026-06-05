// routes/customers.js
const express = require("express");
const router  = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

// GET /api/customers
router.get("/", (req, res) => {
  let list = [...db.customers];
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }
  res.json({ customers: list, total: list.length });
});

// GET /api/customers/:id
router.get("/:id", (req, res) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  const customerOrders = db.orders.filter(o => o.customer.email === customer.email);
  res.json({ ...customer, orderHistory: customerOrders });
});

// POST /api/customers
router.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email required" });
  if (db.customers.find(c => c.email === email)) {
    return res.status(409).json({ error: "Customer with this email already exists" });
  }
  const customer = {
    id: "cust-" + uuidv4().slice(0, 6),
    name, email, orders: 0, totalSpent: 0,
    joined: new Date().toISOString().split("T")[0],
    status: "Active"
  };
  db.customers.push(customer);
  res.status(201).json(customer);
});

module.exports = router;

