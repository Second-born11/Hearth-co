// ================================================================
//  db.js — In-memory database seeded with CLOTHING products
//  REPLACE: The products array with your real Shopify product data
//  REPLACE: orders, customers, discounts as needed
// ================================================================

const { v4: uuidv4 } = require("uuid");

// ── REPLACE: Clothing product catalog ────────────────────────────
const products = [
  {
    id: "c1", handle: "oversized-linen-shirt",
    title: "Oversized Linen Shirt", price: 89.00, compareAt: 115.00,
    category: "Tops", tag: "Bestseller", emoji: "👕",
    description: "Relaxed-fit linen shirt with drop shoulders and a chest pocket.",
    about: "Cut from 100% European flax linen. Softens with every wash. Coconut shell buttons. Model is 6'1\" wearing size M.",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Sand","White","Olive","Navy"],
    stock: 34, rating: 4.7, reviewCount: 128, active: true,
    createdAt: "2025-01-15",
    reviews: [
      { author: "Amara O.", stars: 5, date: "Apr 12 2025", size: "M", color: "Sand",  verified: true,  text: "So soft and the fit is exactly right — relaxed without being sloppy." },
      { author: "James K.", stars: 4, date: "Mar 28 2025", size: "L", color: "Olive", verified: true,  text: "Great quality. Runs slightly large so size down." },
      { author: "Priya M.", stars: 5, date: "Mar 10 2025", size: "S", color: "White", verified: true,  text: "My third purchase from this brand. Perfect summer top." }
    ]
  },
  {
    id: "c2", handle: "wide-leg-trousers",
    title: "Wide Leg Trousers", price: 112.00, compareAt: null,
    category: "Bottoms", tag: "New", emoji: "👖",
    description: "High-rise wide leg trousers in a fluid crepe fabric. Elastic waist for all-day comfort.",
    about: "Cut from a lightweight crepe. High-rise waist with hidden elastic panel, two slash pockets. Model is 5'8\" wearing size S.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Black","Camel","Slate","Ivory"],
    stock: 18, rating: 4.5, reviewCount: 64, active: true,
    createdAt: "2025-02-01",
    reviews: [
      { author: "Sofia R.", stars: 5, date: "May 01 2025", size: "S", color: "Black", verified: true, text: "The most flattering trousers I own." },
      { author: "David L.", stars: 4, date: "Apr 20 2025", size: "M", color: "Camel", verified: false, text: "Good fit, nice fabric." }
    ]
  },
  {
    id: "c3", handle: "ribbed-knit-cardigan",
    title: "Ribbed Knit Cardigan", price: 134.00, compareAt: 168.00,
    category: "Knitwear", tag: "Sale", emoji: "🧥",
    description: "Open-front ribbed cardigan in a merino-cotton blend. Longline silhouette.",
    about: "70% merino / 30% organic cotton. Longline cut hits mid-thigh. Machine washable. Model is 5'9\" wearing size M.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Oatmeal","Charcoal","Rust","Forest"],
    stock: 22, rating: 4.8, reviewCount: 211, active: true,
    createdAt: "2025-01-20",
    reviews: [
      { author: "Nina G.", stars: 5, date: "Apr 05 2025", size: "M", color: "Oatmeal",  verified: true, text: "I wear this every single day." },
      { author: "Tom B.",  stars: 5, date: "Mar 22 2025", size: "L", color: "Charcoal", verified: true, text: "So soft, not itchy at all." },
      { author: "Yuki T.", stars: 4, date: "Feb 14 2025", size: "S", color: "Rust",     verified: true, text: "Slightly longer than expected but I actually like it." }
    ]
  },
  {
    id: "c4", handle: "slip-midi-dress",
    title: "Slip Midi Dress", price: 145.00, compareAt: null,
    category: "Dresses", tag: null, emoji: "👗",
    description: "Bias-cut satin slip dress with adjustable straps. Falls to midi length.",
    about: "Cut on the bias from satin-finish fabric. Adjustable spaghetti straps, subtle cowl neckline. Fully lined. Model is 5'7\" wearing size S.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Champagne","Midnight","Blush","Sage"],
    stock: 11, rating: 4.6, reviewCount: 89, active: true,
    createdAt: "2025-02-10",
    reviews: [
      { author: "Chloe W.",   stars: 5, date: "May 10 2025", size: "S", color: "Champagne", verified: true, text: "Wore this to a wedding. Got so many compliments." },
      { author: "Beatriz S.", stars: 4, date: "Apr 18 2025", size: "M", color: "Midnight",  verified: true, text: "Stunning dress. Only 4 stars because straps slipped a little." }
    ]
  },
  {
    id: "c5", handle: "tailored-blazer",
    title: "Tailored Blazer", price: 198.00, compareAt: 248.00,
    category: "Outerwear", tag: "Bestseller", emoji: "🧣",
    description: "Single-breasted blazer with a slim lapel. Half-canvas construction.",
    about: "Half-canvas construction for a cleaner drape. Slim notch lapel, two-button front, welt pockets. Fully lined. Model is 5'10\" wearing size M.",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Black","Camel","Chalk","Navy"],
    stock: 15, rating: 4.9, reviewCount: 176, active: true,
    createdAt: "2025-02-20",
    reviews: [
      { author: "Marcus A.", stars: 5, date: "May 05 2025", size: "M", color: "Black", verified: true,  text: "Best blazer I have ever owned." },
      { author: "Lena K.",   stars: 5, date: "Apr 30 2025", size: "S", color: "Camel", verified: true,  text: "Received more compliments wearing this than anything else I own." },
      { author: "Chris P.",  stars: 4, date: "Apr 12 2025", size: "L", color: "Navy",  verified: false, text: "Very well made. Sleeves were slightly long but easy to alter." }
    ]
  },
  {
    id: "c6", handle: "cotton-turtleneck",
    title: "Cotton Turtleneck", price: 68.00, compareAt: null,
    category: "Tops", tag: "New", emoji: "🐢",
    description: "Fitted cotton-modal turtleneck. Smooth, breathable, impossibly versatile.",
    about: "60% Supima cotton / 40% modal. Fitted but not tight. Flatlock seams. Model is 5'9\" wearing size M.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Black","White","Camel","Slate","Forest"],
    stock: 50, rating: 4.4, reviewCount: 92, active: true,
    createdAt: "2025-03-01",
    reviews: [
      { author: "Rachel T.", stars: 5, date: "Mar 15 2025", size: "S", color: "Black", verified: true, text: "I bought every colour. Unbelievably soft." },
      { author: "Oliver N.", stars: 4, date: "Feb 28 2025", size: "M", color: "White", verified: true, text: "Slightly sheer so wear a nude underneath." }
    ]
  },
  {
    id: "c7", handle: "pleated-midi-skirt",
    title: "Pleated Midi Skirt", price: 96.00, compareAt: 120.00,
    category: "Bottoms", tag: "Sale", emoji: "👘",
    description: "Knife-pleated midi skirt in lightweight satin. Elastic waist, fully lined.",
    about: "Inspired by 1940s pleated skirts. Concealed elastic waist. Fully lined. Model is 5'7\" wearing size S.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Champagne","Black","Sage","Burgundy"],
    stock: 28, rating: 4.5, reviewCount: 73, active: true,
    createdAt: "2025-03-10",
    reviews: [
      { author: "Fatima A.", stars: 5, date: "Apr 28 2025", size: "S", color: "Champagne", verified: true, text: "So elegant. I felt like a million dollars." },
      { author: "Hannah B.", stars: 4, date: "Apr 10 2025", size: "M", color: "Black",     verified: true, text: "Waist runs slightly small so size up if between sizes." }
    ]
  },
  {
    id: "c8", handle: "structured-trench-coat",
    title: "Structured Trench Coat", price: 285.00, compareAt: 340.00,
    category: "Outerwear", tag: "Bestseller", emoji: "🧥",
    description: "Classic double-breasted trench in water-resistant cotton gabardine.",
    about: "Tightly woven cotton gabardine with DWR finish. Double-breasted, storm flaps, belted waist. Cupro lining. Model is 6'0\" wearing size M.",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Camel","Black","Stone"],
    stock: 9, rating: 4.9, reviewCount: 304, active: true,
    createdAt: "2025-01-05",
    reviews: [
      { author: "Elena V.", stars: 5, date: "May 08 2025", size: "S",  color: "Camel", verified: true,  text: "Worth every penny. This is the coat I will wear for the next 20 years." },
      { author: "Ben O.",   stars: 5, date: "Apr 25 2025", size: "M",  color: "Stone", verified: true,  text: "The gabardine holds its shape perfectly." },
      { author: "Zara M.",  stars: 4, date: "Apr 02 2025", size: "XS", color: "Black", verified: false, text: "Belt loops slightly stiff at first but soften quickly." }
    ]
  }
];

// ── REPLACE: Carts (session-based, keyed by sessionId) ───────────
const carts = {};

// ── REPLACE: Orders ───────────────────────────────────────────────
const orders = [
  { id: "ord-1042", number: "#1042", customer: { name: "Amara O.",  email: "amara@example.com"  }, items: [{ productId: "c1", title: "Oversized Linen Shirt",  variant: "Sand / M",     qty: 1, price: 89.00  }], subtotal: 89.00,  shipping: 4.99,  total: 93.99,  shippingMethod: "Standard", address: { line1: "12 Rose Lane", city: "London",     zip: "SW1A 1AA", country: "UK" }, status: "Fulfilled",  createdAt: "2025-05-10" },
  { id: "ord-1041", number: "#1041", customer: { name: "Sofia R.",  email: "sofia@example.com"  }, items: [{ productId: "c2", title: "Wide Leg Trousers",       variant: "Black / S",    qty: 1, price: 112.00 }], subtotal: 112.00, shipping: 0,     total: 112.00, shippingMethod: "Free",     address: { line1: "45 Oak St",    city: "Manchester", zip: "M1 2AB",   country: "UK" }, status: "Shipped",    createdAt: "2025-05-08" },
  { id: "ord-1040", number: "#1040", customer: { name: "Marcus A.", email: "marcus@example.com" }, items: [{ productId: "c5", title: "Tailored Blazer",          variant: "Black / M",    qty: 1, price: 198.00 }], subtotal: 198.00, shipping: 0,     total: 198.00, shippingMethod: "Free",     address: { line1: "8 Elm Cres",   city: "Edinburgh",  zip: "EH1 1YZ",  country: "UK" }, status: "Fulfilled",  createdAt: "2025-05-05" },
  { id: "ord-1039", number: "#1039", customer: { name: "Nina G.",   email: "nina@example.com"   }, items: [{ productId: "c3", title: "Ribbed Knit Cardigan",     variant: "Oatmeal / M",  qty: 2, price: 134.00 }], subtotal: 268.00, shipping: 4.99,  total: 272.99, shippingMethod: "Standard", address: { line1: "22 Park Ave",  city: "Bristol",    zip: "BS1 1AA",  country: "UK" }, status: "Processing", createdAt: "2025-05-03" },
];

// ── REPLACE: Customers ────────────────────────────────────────────
const customers = [
  { id: "cust-1", name: "Amara O.",   email: "amara@example.com",   orders: 3, totalSpent: 312.97,  joined: "2025-01-10", status: "Active" },
  { id: "cust-2", name: "Sofia R.",   email: "sofia@example.com",   orders: 5, totalSpent: 689.50,  joined: "2025-02-14", status: "VIP"    },
  { id: "cust-3", name: "Marcus A.",  email: "marcus@example.com",  orders: 2, totalSpent: 396.00,  joined: "2025-03-08", status: "Active" },
  { id: "cust-4", name: "Nina G.",    email: "nina@example.com",    orders: 8, totalSpent: 1124.00, joined: "2024-11-03", status: "VIP"    },
  { id: "cust-5", name: "Chloe W.",   email: "chloe@example.com",   orders: 1, totalSpent: 149.99,  joined: "2025-04-01", status: "Active" },
  { id: "cust-6", name: "Elena V.",   email: "elena@example.com",   orders: 4, totalSpent: 892.00,  joined: "2024-12-20", status: "VIP"    }
];

// ── REPLACE: Discount codes ───────────────────────────────────────
const discounts = [
  { code: "WELCOME10", type: "percentage", value: 10,  minOrder: 0,   expires: null,         uses: 142, active: true },
  { code: "STYLE25",   type: "percentage", value: 25,  minOrder: 150, expires: "2025-06-30", uses: 38,  active: true },
  { code: "FREESHIP",  type: "shipping",   value: 100, minOrder: 100, expires: null,         uses: 215, active: true },
  { code: "THREAD20",  type: "fixed",      value: 20,  minOrder: 200, expires: "2025-05-31", uses: 17,  active: true }
];

module.exports = { products, carts, orders, customers, discounts };
