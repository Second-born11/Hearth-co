// routes/analytics.js
const express = require("express");
const router  = express.Router();
const db = require("../db");

// GET /api/analytics/summary
router.get("/summary", (_req, res) => {
  const totalRevenue  = db.orders.reduce((s, o) => s + o.total, 0);
  const totalOrders   = db.orders.length;
  const totalProducts = db.products.filter(p => p.active).length;
  const totalStock    = db.products.reduce((s, p) => s + p.stock, 0);
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const fulfilledOrders = db.orders.filter(o => o.status === "Fulfilled").length;

  res.json({
    totalRevenue:    +totalRevenue.toFixed(2),
    totalOrders,
    totalProducts,
    totalStock,
    avgOrderValue:   +avgOrderValue.toFixed(2),
    fulfilledOrders,
    conversionRate:  "3.2%",
    totalCustomers:  db.customers.length
  });
});

// 🌟 FIXED PATH: GET /api/analytics/category (matches api.js)
router.get("/category", (_req, res) => {
  const map = {};
  db.orders.forEach(order => {
    order.items.forEach(item => {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) return;
      const cat = product.category;
      if (!map[cat]) map[cat] = { category: cat, revenue: 0, units: 0 };
      map[cat].revenue += item.price * item.qty;
      map[cat].units   += item.qty;
    });
  });
  const results = Object.values(map)
    .map(c => ({ ...c, revenue: +c.revenue.toFixed(2) }))
    .sort((a, b) => b.revenue - a.revenue);
  res.json({ salesByCategory: results });
});

// 🌟 FIXED PATH: GET /api/analytics/weekly (matches api.js)
router.get("/weekly", (_req, res) => {
  // Simulated 7-day revenue data
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const data  = [310, 520, 390, 680, 590, 445, 720];
  res.json({
    weeklyRevenue: days.map((day, i) => ({ day, revenue: data[i] })),
    total: data.reduce((s, v) => s + v, 0)
  });
});

// 🌟 FIXED PATH: GET /api/analytics/top (matches api.js)
router.get("/top", (_req, res) => {
  const map = {};
  db.orders.forEach(order => {
    order.items.forEach(item => {
      if (!map[item.productId]) map[item.productId] = { productId: item.productId, units: 0, revenue: 0 };
      map[item.productId].units   += item.qty;
      map[item.productId].revenue += item.price * item.qty;
    });
  });

  const results = Object.values(map).map(entry => {
    const product = db.products.find(p => p.id === entry.productId);
    return {
      ...entry,
      title:   product?.title   || "Unknown",
      emoji:   product?.emoji   || "",
      revenue: +entry.revenue.toFixed(2)
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  res.json({ topProducts: results });
});

module.exports = router;