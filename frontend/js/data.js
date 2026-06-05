/* ════════════════════════════════════════════════
   data.js — Shared catalog & config data
   ════════════════════════════════════════════════ */

const PRODUCTS = [
  {
    id: "p1", title: "Artisan Ceramic Mug", price: 34.99, compare: 44.99,
    category: "Kitchen", tag: "Bestseller", emoji: "☕",
    description: "Hand-thrown stoneware with a warm speckled glaze. Holds 12oz. Dishwasher safe, microwave friendly.",
    variants: ["Oat", "Slate", "Terracotta"], stock: 12,
    reviews: [
      { author: "Sarah M.", stars: 5, text: "Absolutely love this mug. The glaze is beautiful and it keeps my coffee warm for ages." },
      { author: "James K.", stars: 4, text: "Really sturdy and beautiful. Slightly smaller than expected but perfect for an espresso." }
    ]
  },
  {
    id: "p2", title: "Linen Throw Pillow", price: 58.00, compare: null,
    category: "Home", tag: "New", emoji: "🛋️",
    description: "Belgian linen, feather insert. 18×18 in. Machine washable cover.",
    variants: ["Natural", "Sage", "Blush"], stock: 8,
    reviews: [
      { author: "Lena W.", stars: 5, text: "So soft and luxurious. Goes perfectly with my neutral living room palette." }
    ]
  },
  {
    id: "p3", title: "Beeswax Candle Set", price: 42.50, compare: 55.00,
    category: "Lifestyle", tag: "Sale", emoji: "️",
    description: "Set of 3 hand-poured beeswax pillars. 40hr burn each. Natural honey scent.",
    variants: ["Unscented", "Cedar", "Honey"], stock: 20,
    reviews: [
      { author: "Emily R.", stars: 5, text: "The cedar scent fills the room without being overpowering. Perfect evening ambiance." },
      { author: "Tom B.", stars: 5, text: "Beautifully made. I've bought these twice already as gifts." }
    ]
  },
  {
    id: "p4", title: "Rattan Market Basket", price: 75.00, compare: null,
    category: "Home", tag: null, emoji: "🧺",
    description: "Handwoven rattan with leather handles. 14\" diameter. Great for farmers markets or storage.",
    variants: ["Natural", "Bleached"], stock: 5,
    reviews: [
      { author: "Mia C.", stars: 4, text: "Gorgeous basket. Very well made. I use it every weekend at the market." }
    ]
  },
  {
    id: "p5", title: "Wool Felt Coasters", price: 22.00, compare: 28.00,
    category: "Kitchen", tag: "Sale", emoji: "🟤",
    description: "Set of 6 — 100% merino wool, naturally stain-resistant. 4\" diameter.",
    variants: ["Oat", "Rust", "Forest"], stock: 30,
    reviews: [
      { author: "Nina G.", stars: 5, text: "Thick, substantial, and they look great. Way nicer than the cork ones I had before." }
    ]
  },
  {
    id: "p6", title: "Clay Planter Pot", price: 48.00, compare: null,
    category: "Garden", tag: "New", emoji: "🪴",
    description: "Terracotta with drainage hole and matching saucer. 6\" pot. Perfect for succulents and herbs.",
    variants: ["Raw", "Whitewash", "Ebony"], stock: 14,
    reviews: [
      { author: "Carlos P.", stars: 5, text: "Beautiful pots. The whitewash finish looks stunning in a sunny window." }
    ]
  },
  {
    id: "p7", title: "Linen Tea Towels", price: 29.00, compare: null,
    category: "Kitchen", tag: null, emoji: "🧣",
    description: "Set of 2 — stonewashed linen, hemstitched edges. Gets softer with every wash.",
    variants: ["Oatmeal", "Striped", "Check"], stock: 25,
    reviews: [
      { author: "Rachel T.", stars: 4, text: "Lovely quality. They dry beautifully and look great hung on the oven." }
    ]
  },
  {
    id: "p8", title: "Hammered Brass Tray", price: 88.00, compare: 110.00,
    category: "Home", tag: "Bestseller", emoji: "✨",
    description: "Artisan-hammered solid brass. 12\" oval serving tray. Develops a beautiful patina over time.",
    variants: ["Antique", "Polished"], stock: 7,
    reviews: [
      { author: "Olivia H.", stars: 5, text: "Absolutely stunning. I use it as a centrepiece and everyone asks where I got it." },
      { author: "David L.", stars: 5, text: "Perfect gift. The hammered texture catches the light beautifully." }
    ]
  }
];

const CATEGORIES = ["All", "Kitchen", "Home", "Lifestyle", "Garden"];

const TAG_COLORS = {
  "Bestseller": "#C8714A",
  "New":        "#4A7C59",
  "Sale":       "#C84A4A"
};

const TECH_STACK = [
  { name: "React",                  role: "Frontend Framework", color: "#61DAFB", icon: "⚛️" },
  { name: "Shopify Storefront API", role: "Commerce Backend",   color: "#96BF48", icon: "🛍️" },
  { name: "GraphQL",                role: "Data Fetching",      color: "#E10098", icon: "◈"  },
  { name: "TailwindCSS",            role: "Styling",            color: "#38BDF8", icon: "" },
  { name: "Vite",                   role: "Build Tool",         color: "#646CFF", icon: "⚡" },
  { name: "Vercel",                 role: "Deployment",         color: "#CDD6F4", icon: "▲" }
];

const ARCH_NODES = [
  { id: "browser",  label: "Browser / PWA",         x: 150, y: 24,  color: "#C8714A", desc: "React SPA served from CDN edge. Hydrates on client, renders on server (SSR/SSG via Next.js). PWA manifest enables offline support and home-screen install." },
  { id: "cdn",      label: "CDN (Vercel Edge)",      x: 150, y: 72,  color: "#6B7FD4", desc: "Global edge network caches static pages and API responses. Zero cold starts. Vercel's Edge Runtime executes middleware in 60+ regions." },
  { id: "react",    label: "React Frontend",         x: 70,  y: 134, color: "#61DAFB", desc: "Component-driven UI. useSWR for data fetching, React Context for cart state, Framer Motion for animations. Fully decoupled from Shopify's Liquid engine." },
  { id: "gql",      label: "GraphQL Client",         x: 230, y: 134, color: "#E10098", desc: "Apollo Client or urql queries the Shopify Storefront API. Normalised cache prevents over-fetching. Persisted queries reduce request payload." },
  { id: "api",      label: "Shopify Storefront API", x: 150, y: 202, color: "#4A7C59", desc: "Public GraphQL endpoint — no secret keys required. Exposes products, collections, cart mutations, and customer account queries with fine-grained permission scopes." },
  { id: "shopify",  label: "Shopify Admin",          x: 70,  y: 270, color: "#96BF48", desc: "Merchants manage inventory, orders, fulfilment, discounts and customer data via Shopify Admin. Webhooks push real-time updates to your frontend cache." },
  { id: "checkout", label: "Shopify Checkout",       x: 230, y: 270, color: "#FFC107", desc: "Secure, PCI-compliant hosted checkout. Handles payments, shipping rate calculation, tax and order confirmation. Supports Shop Pay, Apple Pay, and 100+ payment gateways." }
];

const ARCH_EDGES = [
  ["browser","cdn"], ["cdn","react"], ["cdn","gql"],
  ["react","gql"], ["gql","api"], ["api","shopify"], ["api","checkout"]
];

const FEATURES = [
  { icon: "⚡", title: "Blazing Fast",         color: "#C8714A", body: "Static-first rendering with ISR. No Liquid template overhead — pages load in under 200ms globally thanks to edge CDN caching." },
  { icon: "", title: "Headless Architecture", color: "#4A7C59", body: "Shopify handles inventory, payments & fulfilment. React owns the entire presentation layer. Change your UI without touching the backend." },
  { icon: "", title: "Total UI Freedom",      color: "#6B7FD4", body: "Design without theme constraints. Any animation, layout, or interaction pattern is possible. Your brand, fully expressed." },
  { icon: "", title: "Storefront API Security", color: "#E10098", body: "Public storefront tokens only — no secret keys exposed. Cart & checkout handled via secure Shopify-hosted flows with PCI compliance." },
  { icon: "", title: "Real-time Inventory",   color: "#FFC107", body: "GraphQL queries keep stock levels and variant availability in sync. Webhook-driven cache invalidation means your UI reflects reality instantly." },
  { icon: "", title: "Multi-region Ready",    color: "#2B2B2B", body: "Shopify Markets integration enables multi-currency, multi-language storefronts from a single codebase. Serve customers everywhere." }
];

const COMPARISON_ROWS = [
  ["UI Framework",     "Liquid + JS",          "React / Vue / Any"],
  ["Performance",      "Good",                 "Excellent (edge CDN)"],
  ["Design Freedom",   "Theme-constrained",    "Total freedom"],
  ["Dev Experience",   "Shopify CLI",          "Standard web tooling"],
  ["Checkout",         "Shopify hosted",       "Shopify hosted (secure)"],
  ["Time to Market",   "Fast",                 "Slightly longer setup"],
  ["SEO",              "Good (Liquid SSR)",    "Excellent (Next.js SSG/SSR)"],
  ["Customisation",    "Limited by theme API", "Unlimited"]
];

const GQL_SNIPPET = `query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
            }
          }
        }
        featuredImage {
          url
          altText
        }
      }
    }
  }
}`;

const MOCK_ORDERS = [
  { id: "#1042", customer: "Sarah M.",  items: "Artisan Mug × 2",             total: 69.98,  status: "Fulfilled",  date: "Apr 20" },
  { id: "#1041", customer: "James R.",  items: "Brass Tray × 1",              total: 88.00,  status: "Processing", date: "Apr 20" },
  { id: "#1040", customer: "Lena K.",   items: "Candle Set × 2, Coasters × 1",total: 107.00, status: "Fulfilled",  date: "Apr 19" },
  { id: "#1039", customer: "Tom W.",    items: "Planter Pot × 1",             total: 48.00,  status: "Shipped",    date: "Apr 18" },
  { id: "#1038", customer: "Mia C.",    items: "Market Basket × 1",           total: 75.00,  status: "Fulfilled",  date: "Apr 17" },
  { id: "#1037", customer: "Olivia H.", items: "Brass Tray × 1, Pillow × 1",  total: 146.00, status: "Shipped",    date: "Apr 16" }
];

const MOCK_DISCOUNTS = [
  { code: "WELCOME10", type: "Percentage", value: "10% off", minOrder: "$0",    expires: "Never",       used: 142 },
  { code: "SUMMER25",  type: "Percentage", value: "25% off", minOrder: "$75",   expires: "Jun 30 2025", used: 38  },
  { code: "FREESHIP",  type: "Shipping",   value: "Free shipping", minOrder: "$50", expires: "Never",   used: 215 },
  { code: "HEARTH20",  type: "Fixed",      value: "$20 off", minOrder: "$100",  expires: "May 31 2025", used: 17  }
];

const MOCK_CUSTOMERS = [
  { name: "Sarah Miller",  email: "sarah@example.com",  orders: 4,  spent: "$289.96", joined: "Jan 2025" },
  { name: "James Roberts", email: "james@example.com",  orders: 2,  spent: "$158.00", joined: "Feb 2025" },
  { name: "Lena König",    email: "lena@example.com",   orders: 6,  spent: "$412.50", joined: "Nov 2024" },
  { name: "Tom Walsh",     email: "tom@example.com",    orders: 1,  spent: "$48.00",  joined: "Apr 2025" },
  { name: "Mia Chen",      email: "mia@example.com",    orders: 3,  spent: "$225.00", joined: "Mar 2025" },
  { name: "Olivia Hayes",  email: "olivia@example.com", orders: 5,  spent: "$568.00", joined: "Dec 2024" }
];

// ── Helpers ──────────────────────────────────────
function fmt(n) { return "$" + Number(n).toFixed(2); }
function uid()  { return Math.random().toString(36).slice(2); }
