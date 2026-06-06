// ════════════════════════════════════════════════════════════
//  server.js — Hearth & Co. Backend
//  Run:  node server.js   (or: npm run dev)
//  API:  http://localhost:3001
// ════════════════════════════════════════════════════════════

const express = require("express");
const cors    = require("cors");
const app     = express();
const PORT    = process.env.PORT 

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ── Request logger ────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Auth (unprotected) ────────────────────────────────────────
//const { router: authRouter, requireAuth } = require("./routes/auth");
//app.use("/api/auth", authRouter);

const authData = require("./routes/auth");
const authRouter = authData.router || authData;
app.use("/api/auth", authRouter);
const requireAuth = authData.requireAuth || ((req, res, next) => next());

// ── Public routes (storefront) ────────────────────────────────
app.use("/api/products",  require("./routes/products"));
app.use("/api/cart",      require("./routes/cart"));
app.use("/api/orders",    require("./routes/orders"));
app.use("/api/discounts", require("./routes/discounts"));

// ── Protected routes (admin only) ────────────────────────────
app.use("/api/customers", requireAuth, require("./routes/customers"));
app.use("/api/analytics", requireAuth, require("./routes/analytics"));

// ── Health check ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name:    "Hearth & Co. API",
    version: "1.0.0",
    status:  "running",
    endpoints: [
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET  /api/auth/me",
      "GET  /api/products",
      "GET  /api/products/:id",
      "POST /api/products",
      "PUT  /api/products/:id",
      "DELETE /api/products/:id",
      "GET  /api/cart/:sessionId",
      "POST /api/cart/:sessionId/add",
      "PUT  /api/cart/:sessionId/item/:cartItemId",
      "DELETE /api/cart/:sessionId/item/:cartItemId",
      "GET  /api/orders  [auth required]",
      "POST /api/orders",
      "PUT  /api/orders/:id/status  [auth required]",
      "GET  /api/customers  [auth required]",
      "GET  /api/analytics/summary  [auth required]",
      "GET  /api/analytics/weekly-revenue  [auth required]",
      "GET  /api/analytics/top-products  [auth required]",
    ]
  });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 Hearth & Co. API running on ${PORT}`);
});
