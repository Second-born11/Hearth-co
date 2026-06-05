// ════════════════════════════════════════════════════════════
//  db.js — In-memory database (replace with MongoDB/Postgres
//           in production, or swap for real Shopify API calls)
// ════════════════════════════════════════════════════════════

const { v4: uuidv4 } = require("uuid");

// ── Products ─────────────────────────────────────────────────
const products = [
  {
    id: "p1", handle: "artisan-ceramic-mug",
    title: "Artisan Ceramic Mug", price: 34.99, compareAt: 44.99,
    category: "Kitchen", tag: "Bestseller", emoji: "☕",
    description: "Hand-thrown stoneware with a warm speckled glaze. Holds 12oz. Dishwasher safe, microwave friendly.",
    variants: [
      { id: "v1a", title: "Oat",       available: true  },
      { id: "v1b", title: "Slate",     available: true  },
      { id: "v1c", title: "Terracotta",available: false }
    ],
    stock: 12, active: true, createdAt: "2025-01-15"
  },
  {
    id: "p2", handle: "linen-throw-pillow",
    title: "Linen Throw Pillow", price: 58.00, compareAt: null,
    category: "Home", tag: "New", emoji: "🛋️",
    description: "Belgian linen, feather insert. 18×18 in. Machine washable cover.",
    variants: [
      { id: "v2a", title: "Natural", available: true },
      { id: "v2b", title: "Sage",    available: true },
      { id: "v2c", title: "Blush",   available: true }
    ],
    stock: 8, active: true, createdAt: "2025-02-01"
  },
  {
    id: "p3", handle: "beeswax-candle-set",
    title: "Beeswax Candle Set", price: 42.50, compareAt: 55.00,
    category: "Lifestyle", tag: "Sale", emoji: "️",
    description: "Set of 3 hand-poured beeswax pillars. 40hr burn each. Natural honey scent.",
    variants: [
      { id: "v3a", title: "Unscented", available: true },
      { id: "v3b", title: "Cedar",     available: true },
      { id: "v3c", title: "Honey",     available: true }
    ],
    stock: 20, active: true, createdAt: "2025-01-20"
  },
  {
    id: "p4", handle: "rattan-market-basket",
    title: "Rattan Market Basket", price: 75.00, compareAt: null,
    category: "Home", tag: null, emoji: "🧺",
    description: "Handwoven rattan with leather handles. 14\" diameter.",
    variants: [
      { id: "v4a", title: "Natural",  available: true },
      { id: "v4b", title: "Bleached", available: true }
    ],
    stock: 5, active: true, createdAt: "2025-01-28"
  },
  {
    id: "p5", handle: "wool-felt-coasters",
    title: "Wool Felt Coasters", price: 22.00, compareAt: 28.00,
    category: "Kitchen", tag: "Sale", emoji: "🟤",
    description: "Set of 6 — 100% merino wool, naturally stain-resistant. 4\" diameter.",
    variants: [
      { id: "v5a", title: "Oat",    available: true },
      { id: "v5b", title: "Rust",   available: true },
      { id: "v5c", title: "Forest", available: true }
    ],
    stock: 30, active: true, createdAt: "2025-02-10"
  },
  {
    id: "p6", handle: "clay-planter-pot",
    title: "Clay Planter Pot", price: 48.00, compareAt: null,
    category: "Garden", tag: "New", emoji: "🪴",
    description: "Terracotta with drainage hole and matching saucer. 6\" pot.",
    variants: [
      { id: "v6a", title: "Raw",       available: true },
      { id: "v6b", title: "Whitewash", available: true },
      { id: "v6c", title: "Ebony",     available: false }
    ],
    stock: 14, active: true, createdAt: "2025-02-20"
  },
  {
    id: "p7", handle: "linen-tea-towels",
    title: "Linen Tea Towels", price: 29.00, compareAt: null,
    category: "Kitchen", tag: null, emoji: "🧣",
    description: "Set of 2 — stonewashed linen, hemstitched edges.",
    variants: [
      { id: "v7a", title: "Oatmeal", available: true },
      { id: "v7b", title: "Striped", available: true },
      { id: "v7c", title: "Check",   available: true }
    ],
    stock: 25, active: true, createdAt: "2025-03-01"
  },
  {
    id: "p8", handle: "hammered-brass-tray",
    title: "Hammered Brass Tray", price: 88.00, compareAt: 110.00,
    category: "Home", tag: "Bestseller", emoji: "✨",
    description: "Artisan-hammered solid brass. 12\" oval serving tray.",
    variants: [
      { id: "v8a", title: "Antique", available: true },
      { id: "v8b", title: "Polished",available: true }
    ],
    stock: 7, active: true, createdAt: "2025-01-05"
  }
];

// ── Carts (keyed by sessionId) ───────────────────────────────
const carts = {};

// ── Orders ───────────────────────────────────────────────────
const orders = [
  {
    id: "ord-1042", number: "#1042",
    customer: { name: "Sarah Miller",  email: "sarah@example.com" },
    items: [{ productId: "p1", title: "Artisan Ceramic Mug", variant: "Oat", qty: 2, price: 34.99 }],
    subtotal: 69.98, shipping: 4.99, total: 74.97,
    shippingMethod: "Standard",
    address: { line1: "12 Rose Lane", city: "London", zip: "SW1A 1AA", country: "United Kingdom" },
    status: "Fulfilled", createdAt: "2025-04-20"
  },
  {
    id: "ord-1041", number: "#1041",
    customer: { name: "James Roberts", email: "james@example.com" },
    items: [{ productId: "p8", title: "Hammered Brass Tray", variant: "Antique", qty: 1, price: 88.00 }],
    subtotal: 88.00, shipping: 12.99, total: 100.99,
    shippingMethod: "Express",
    address: { line1: "45 Oak Street", city: "Manchester", zip: "M1 2AB", country: "United Kingdom" },
    status: "Processing", createdAt: "2025-04-20"
  },
  {
    id: "ord-1040", number: "#1040",
    customer: { name: "Lena König",    email: "lena@example.com" },
    items: [
      { productId: "p3", title: "Beeswax Candle Set", variant: "Cedar", qty: 2, price: 42.50 },
      { productId: "p5", title: "Wool Felt Coasters",  variant: "Rust",  qty: 1, price: 22.00 }
    ],
    subtotal: 107.00, shipping: 0, total: 107.00,
    shippingMethod: "Free",
    address: { line1: "8 Elm Crescent", city: "Edinburgh", zip: "EH1 1YZ", country: "United Kingdom" },
    status: "Fulfilled", createdAt: "2025-04-19"
  }
];

// ── Customers ────────────────────────────────────────────────
const customers = [
  { id: "cust-1", name: "Sarah Miller",  email: "sarah@example.com",  orders: 4, totalSpent: 289.96, joined: "2025-01-10", status: "Active" },
  { id: "cust-2", name: "James Roberts", email: "james@example.com",  orders: 2, totalSpent: 158.00, joined: "2025-02-14", status: "Active" },
  { id: "cust-3", name: "Lena König",    email: "lena@example.com",   orders: 6, totalSpent: 412.50, joined: "2024-11-03", status: "Active" },
  { id: "cust-4", name: "Tom Walsh",     email: "tom@example.com",    orders: 1, totalSpent: 48.00,  joined: "2025-04-01", status: "Active" },
  { id: "cust-5", name: "Mia Chen",      email: "mia@example.com",    orders: 3, totalSpent: 225.00, joined: "2025-03-08", status: "Active" },
  { id: "cust-6", name: "Olivia Hayes",  email: "olivia@example.com", orders: 5, totalSpent: 568.00, joined: "2024-12-20", status: "VIP"    }
];

// ── Discounts ────────────────────────────────────────────────
const discounts = [
  { code: "WELCOME10", type: "percentage", value: 10,  minOrder: 0,   expires: null,         uses: 142, active: true },
  { code: "SUMMER25",  type: "percentage", value: 25,  minOrder: 75,  expires: "2025-06-30", uses: 38,  active: true },
  { code: "FREESHIP",  type: "shipping",   value: 100, minOrder: 50,  expires: null,         uses: 215, active: true },
  { code: "HEARTH20",  type: "fixed",      value: 20,  minOrder: 100, expires: "2025-05-31", uses: 17,  active: true }
];

module.exports = { products, carts, orders, customers, discounts };