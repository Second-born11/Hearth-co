/* ──  Product catalog (clothing items) ───────────────────
   Each product has: id, handle, title, price, compareAt, category,
   tag, emoji, description, about, sizes, colors, stock, reviews   */
const PRODUCTS = [
  {
    id: "c1", handle: "oversized-linen-shirt",
    title: "Oversized Linen Shirt", price: 89.00, compareAt: 115.00,
    category: "Tops", tag: "Bestseller", emoji: "👕",
    description: "Relaxed-fit linen shirt with drop shoulders and a chest pocket. Perfect for warm days.",
    about: "Cut from 100% European flax linen, this shirt breathes beautifully and softens with every wash. The oversized silhouette pairs with tailored trousers or wide-leg jeans. Relaxed collar, single chest pocket, coconut shell buttons. Model is 6'1\" wearing size M.",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Sand","White","Olive","Navy"],
    stock: 34,
    rating: 4.7, reviewCount: 128,
    reviews: [
      { author: "Amara O.",   stars: 5, date: "Apr 12 2025", size: "M", color: "Sand",  verified: true,  text: "Absolutely love this shirt. The linen is so soft and the fit is exactly as described — relaxed without being sloppy." },
      { author: "James K.",   stars: 4, date: "Mar 28 2025", size: "L", color: "Olive", verified: true,  text: "Great quality. Runs slightly large so I'd size down. The olive colour is even nicer in person." },
      { author: "Priya M.",   stars: 5, date: "Mar 10 2025", size: "S", color: "White", verified: true,  text: "My third purchase from this brand. The linen quality keeps getting better. Perfect summer top." }
    ]
  },
  {
    id: "c2", handle: "wide-leg-trousers",
    title: "Wide Leg Trousers", price: 112.00, compareAt: null,
    category: "Bottoms", tag: "New", emoji: "👖",
    description: "High-rise wide leg trousers in a fluid crepe fabric. Elastic waist for all-day comfort.",
    about: "These trousers are cut from a lightweight crepe that drapes beautifully. High-rise waist with a hidden elastic panel at the back, two front slash pockets, and a clean hemline. Can be dressed up or down. Model is 5'8\" wearing size S.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Black","Camel","Slate","Ivory"],
    stock: 18,
    rating: 4.5, reviewCount: 64,
    reviews: [
      { author: "Sofia R.",   stars: 5, date: "May 01 2025", size: "S", color: "Black", verified: true,  text: "The most flattering trousers I own. The fabric is incredible — looks expensive and feels even better." },
      { author: "David L.",   stars: 4, date: "Apr 20 2025", size: "M", color: "Camel", verified: false, text: "Good fit, nice fabric. The camel colour is a perfect neutral. Would love more colour options." }
    ]
  },
  {
    id: "c3", handle: "ribbed-knit-cardigan",
    title: "Ribbed Knit Cardigan", price: 134.00, compareAt: 168.00,
    category: "Knitwear", tag: "Sale", emoji: "🧥",
    description: "Open-front ribbed cardigan in a merino-cotton blend. Longline silhouette, patch pockets.",
    about: "A modern take on the classic cardigan. Knitted from a 70% merino / 30% organic cotton blend for warmth without weight. Longline cut hits mid-thigh. Open front with a relaxed drape, two patch pockets, ribbed cuffs and hem. Machine washable on cold. Model is 5'9\" wearing size M.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Oatmeal","Charcoal","Rust","Forest"],
    stock: 22,
    rating: 4.8, reviewCount: 211,
    reviews: [
      { author: "Nina G.",    stars: 5, date: "Apr 05 2025", size: "M", color: "Oatmeal", verified: true,  text: "I wear this every single day. Warm but not heavy, and the length is perfect. Bought two colours already." },
      { author: "Tom B.",     stars: 5, date: "Mar 22 2025", size: "L", color: "Charcoal", verified: true, text: "Gifted this to my partner and she hasn't taken it off. The merino is so soft, not itchy at all." },
      { author: "Yuki T.",    stars: 4, date: "Feb 14 2025", size: "S", color: "Rust",   verified: true,  text: "Beautiful cardigan, lovely rust colour. Slightly longer than I expected but I actually like it." }
    ]
  },
  {
    id: "c4", handle: "slip-midi-dress",
    title: "Slip Midi Dress", price: 145.00, compareAt: null,
    category: "Dresses", tag: null, emoji: "👗",
    description: "Bias-cut satin slip dress with adjustable straps. Falls to midi length. Easy elegance.",
    about: "Cut on the bias from a soft satin-finish fabric that skims the body beautifully. Adjustable spaghetti straps, subtle cowl neckline, and a midi hem that falls just below the knee. Can be layered over a turtleneck or under a blazer. Fully lined. Model is 5'7\" wearing size S.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Champagne","Midnight","Blush","Sage"],
    stock: 11,
    rating: 4.6, reviewCount: 89,
    reviews: [
      { author: "Chloe W.",   stars: 5, date: "May 10 2025", size: "S", color: "Champagne", verified: true, text: "Wore this to a wedding. Got so many compliments. The fabric is luxurious and the fit is divine." },
      { author: "Beatriz S.", stars: 4, date: "Apr 18 2025", size: "M", color: "Midnight",  verified: true, text: "Stunning dress. Midnight is a really deep, rich navy. Only giving 4 stars because the straps slipped a little." }
    ]
  },
  {
    id: "c5", handle: "tailored-blazer",
    title: "Tailored Blazer", price: 198.00, compareAt: 248.00,
    category: "Outerwear", tag: "Bestseller", emoji: "🧣",
    description: "Single-breasted blazer with a slim lapel. Half-canvas construction. Timeless tailoring.",
    about: "Built on a half-canvas construction for a cleaner drape than fully fused blazers. Slim notch lapel, two-button front, welt pockets, and a single vent at the back. The fabric is a wool-poly blend that resists creasing. Fully lined. Works equally well over a dress or with tailored trousers. Model is 5'10\" wearing size M.",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Black","Camel","Chalk","Navy"],
    stock: 15,
    rating: 4.9, reviewCount: 176,
    reviews: [
      { author: "Marcus A.",  stars: 5, date: "May 05 2025", size: "M", color: "Black",  verified: true,  text: "Best blazer I have ever owned. The construction is incredible for the price. Fits perfectly off the rack." },
      { author: "Lena K.",    stars: 5, date: "Apr 30 2025", size: "S", color: "Camel",  verified: true,  text: "The camel blazer is stunning. I've received more compliments wearing this than anything else I own." },
      { author: "Chris P.",   stars: 4, date: "Apr 12 2025", size: "L", color: "Navy",   verified: false, text: "Very well made and looks great. The navy is a classic tone. Sleeves were slightly long but easy to alter." }
    ]
  },
  {
    id: "c6", handle: "cotton-turtleneck",
    title: "Cotton Turtleneck", price: 68.00, compareAt: null,
    category: "Tops", tag: "New", emoji: "🐢",
    description: "Fitted cotton-modal turtleneck. Smooth, breathable, and impossibly versatile.",
    about: "Made from a 60% Supima cotton / 40% modal blend that feels silky against the skin. Fitted but not tight, with a roll neck that sits comfortably without bulk. Flatlock seams for a clean finish. The perfect layer under a blazer or worn alone. Model is 5'9\" wearing size M.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Black","White","Camel","Slate","Forest"],
    stock: 50,
    rating: 4.4, reviewCount: 92,
    reviews: [
      { author: "Rachel T.",  stars: 5, date: "Mar 15 2025", size: "S", color: "Black",  verified: true,  text: "I bought every colour. The fabric is unbelievably soft and the fit is perfect." },
      { author: "Oliver N.",  stars: 4, date: "Feb 28 2025", size: "M", color: "White",  verified: true,  text: "Great quality turtleneck. The white is a nice warm white, not stark. Slightly sheer so wear a nude underneath." }
    ]
  },
  {
    id: "c7", handle: "pleated-midi-skirt",
    title: "Pleated Midi Skirt", price: 96.00, compareAt: 120.00,
    category: "Bottoms", tag: "Sale", emoji: "👘",
    description: "Knife-pleated midi skirt in a lightweight satin. Elastic waist, fully lined.",
    about: "Inspired by classic pleated skirts of the 1940s, updated with a modern midi length and a concealed elastic waist for comfort. Cut from a lightweight satin that catches the light beautifully when you move. Fully lined. Pairs with tucked-in tops and heels or chunky trainers. Model is 5'7\" wearing size S.",
    sizes: ["XS","S","M","L","XL"],
    colors: ["Champagne","Black","Sage","Burgundy"],
    stock: 28,
    rating: 4.5, reviewCount: 73,
    reviews: [
      { author: "Fatima A.",  stars: 5, date: "Apr 28 2025", size: "S", color: "Champagne", verified: true, text: "So elegant. I wore this to a dinner party and felt like a million dollars. The pleats are perfect." },
      { author: "Hannah B.",  stars: 4, date: "Apr 10 2025", size: "M", color: "Black",      verified: true, text: "Lovely skirt. Fabric is beautiful. Waist runs slightly small so size up if between sizes." }
    ]
  },
  {
    id: "c8", handle: "structured-trench-coat",
    title: "Structured Trench Coat", price: 285.00, compareAt: 340.00,
    category: "Outerwear", tag: "Bestseller", emoji: "🧥",
    description: "Classic double-breasted trench in a water-resistant cotton gabardine. Timeless.",
    about: "The definitive trench coat. Cut from a tightly woven cotton gabardine with a DWR finish for light water resistance. Double-breasted with storm flaps, epaulettes, a belted waist and a back vent. Fully lined in a silky cupro lining. This coat is made to last decades. Model is 6'0\" wearing size M.",
    sizes: ["XS","S","M","L","XL","XXL"],
    colors: ["Camel","Black","Stone"],
    stock: 9,
    rating: 4.9, reviewCount: 304,
    reviews: [
      { author: "Elena V.",   stars: 5, date: "May 08 2025", size: "S", color: "Camel",  verified: true,  text: "Worth every penny. The construction is flawless. This is the coat I will wear for the next 20 years." },
      { author: "Ben O.",     stars: 5, date: "Apr 25 2025", size: "M", color: "Stone",  verified: true,  text: "Impeccable quality. The gabardine is stiff but in the best way — it holds its shape perfectly." },
      { author: "Zara M.",    stars: 4, date: "Apr 02 2025", size: "XS", color: "Black", verified: false, text: "Beautiful coat. The black is a true deep black. Belt loops slightly stiff at first but soften quickly." }
    ]
  }
];

/* ──  Product categories for filter pills ──────────────── */
const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Knitwear", "Outerwear"];

/* ──  Tag colour map ────────────────────────────────────── */
const TAG_COLORS = {
  "Bestseller": "#1A1A2E",
  "New":        "#2D6A4F",
  "Sale":       "#C84A4A"
};

/* ──  Architecture nodes (keep if using architecture page) */
const ARCH_NODES = [
  { id: "browser",  label: "Browser / PWA",         x: 150, y: 24,  color: "#C8714A", desc: "React SPA served from CDN edge. Hydrates on client, renders on server (SSR/SSG via Next.js). PWA manifest enables offline support and home-screen install." },
  { id: "cdn",      label: "CDN (Vercel Edge)",      x: 150, y: 72,  color: "#6B7FD4", desc: "Global edge network caches static pages and API responses. Zero cold starts. Vercel's Edge Runtime executes middleware in 60+ regions." },
  { id: "react",    label: "React Frontend",         x: 70,  y: 134, color: "#61DAFB", desc: "Component-driven UI. useSWR for data fetching, React Context for cart state, Framer Motion for animations." },
  { id: "gql",      label: "GraphQL Client",         x: 230, y: 134, color: "#E10098", desc: "Apollo Client queries the Shopify Storefront API. Normalised cache prevents over-fetching." },
  { id: "api",      label: "Shopify Storefront API", x: 150, y: 202, color: "#4A7C59", desc: "Public GraphQL endpoint exposing products, collections, cart mutations, and customer account queries." },
  { id: "shopify",  label: "Shopify Admin",          x: 70,  y: 270, color: "#96BF48", desc: "Merchants manage inventory, orders, fulfilment, discounts and customer data via Shopify Admin." },
  { id: "checkout", label: "Shopify Checkout",       x: 230, y: 270, color: "#FFC107", desc: "Secure, PCI-compliant hosted checkout handling payments, shipping and order confirmation." }
];

const ARCH_EDGES = [
  ["browser","cdn"], ["cdn","react"], ["cdn","gql"],
  ["react","gql"], ["gql","api"], ["api","shopify"], ["api","checkout"]
];

/* ──  Features list ─────────────────────────────────────── */
const FEATURES = [
  { icon: "⚡", title: "Blazing Fast",          color: "#1A1A2E", body: "Static-first rendering with ISR. No Liquid template overhead — pages load in under 200ms globally thanks to edge CDN caching." },
  { icon: "🔌", title: "Headless Architecture", color: "#2D6A4F", body: "Shopify handles inventory, payments & fulfilment. React owns the entire presentation layer." },
  { icon: "🎨", title: "Total UI Freedom",      color: "#6B7FD4", body: "Design without theme constraints. Any animation, layout, or interaction pattern is possible." },
  { icon: "🔒", title: "Storefront API Security", color: "#E10098", body: "Public storefront tokens only. Cart & checkout via secure Shopify-hosted flows with PCI compliance." },
  { icon: "📦", title: "Real-time Inventory",   color: "#FFC107", body: "GraphQL queries keep stock levels and variant availability in sync across all sessions." },
  { icon: "🌍", title: "Multi-region Ready",    color: "#C84A4A", body: "Shopify Markets integration enables multi-currency, multi-language storefronts from a single codebase." }
];

/* ──  Comparison table rows ────────────────────────────── */
const COMPARISON_ROWS = [
  ["UI Framework",   "Liquid + JS",       "React / Vue / Any"],
  ["Performance",    "Good",              "Excellent (edge CDN)"],
  ["Design Freedom", "Theme-constrained", "Total freedom"],
  ["Dev Experience", "Shopify CLI",       "Standard web tooling"],
  ["Checkout",       "Shopify hosted",    "Shopify hosted (secure)"],
  ["SEO",            "Good",              "Excellent (Next.js SSG/SSR)"],
  ["Customisation",  "Limited",           "Unlimited"]
];

/* ──  GraphQL snippet shown on architecture page ─────────── */
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

/* ──  Mock orders data ──────────────────────────────────── */
const MOCK_ORDERS = [
  { id: "ord-1042", number: "#1042", customer: { name: "Amara O.",   email: "amara@example.com"   }, items: [{ productId: "c1", title: "Oversized Linen Shirt", variant: "Sand / M",  qty: 1, price: 89.00  }], subtotal: 89.00,  shipping: 4.99,  total: 93.99,  status: "Fulfilled",  createdAt: "May 10 2025" },
  { id: "ord-1041", number: "#1041", customer: { name: "Sofia R.",   email: "sofia@example.com"   }, items: [{ productId: "c2", title: "Wide Leg Trousers",     variant: "Black / S", qty: 1, price: 112.00 }], subtotal: 112.00, shipping: 0,     total: 112.00, status: "Shipped",    createdAt: "May 08 2025" },
  { id: "ord-1040", number: "#1040", customer: { name: "Marcus A.",  email: "marcus@example.com"  }, items: [{ productId: "c5", title: "Tailored Blazer",       variant: "Black / M", qty: 1, price: 198.00 }], subtotal: 198.00, shipping: 0,     total: 198.00, status: "Fulfilled",  createdAt: "May 05 2025" },
  { id: "ord-1039", number: "#1039", customer: { name: "Nina G.",    email: "nina@example.com"    }, items: [{ productId: "c3", title: "Ribbed Knit Cardigan",   variant: "Oatmeal / M", qty: 2, price: 134.00 }], subtotal: 268.00, shipping: 4.99, total: 272.99, status: "Processing", createdAt: "May 03 2025" },
  { id: "ord-1038", number: "#1038", customer: { name: "Chloe W.",   email: "chloe@example.com"   }, items: [{ productId: "c4", title: "Slip Midi Dress",        variant: "Champagne / S", qty: 1, price: 145.00 }], subtotal: 145.00, shipping: 4.99, total: 149.99, status: "Fulfilled",  createdAt: "Apr 28 2025" },
  { id: "ord-1037", number: "#1037", customer: { name: "Elena V.",   email: "elena@example.com"   }, items: [{ productId: "c8", title: "Structured Trench Coat", variant: "Camel / S", qty: 1, price: 285.00 }], subtotal: 285.00, shipping: 0,     total: 285.00, status: "Shipped",    createdAt: "Apr 25 2025" }
];

/* ──  Mock customers ────────────────────────────────────── */
const MOCK_CUSTOMERS = [
  { id: "cust-1", name: "Amara O.",   email: "amara@example.com",   orders: 3, totalSpent: "$312.97", joined: "Jan 2025", status: "Active" },
  { id: "cust-2", name: "Sofia R.",   email: "sofia@example.com",   orders: 5, totalSpent: "$689.50", joined: "Feb 2025", status: "VIP"    },
  { id: "cust-3", name: "Marcus A.",  email: "marcus@example.com",  orders: 2, totalSpent: "$396.00", joined: "Mar 2025", status: "Active" },
  { id: "cust-4", name: "Nina G.",    email: "nina@example.com",    orders: 8, totalSpent: "$1,124.00",joined: "Nov 2024", status: "VIP"   },
  { id: "cust-5", name: "Chloe W.",   email: "chloe@example.com",   orders: 1, totalSpent: "$149.99", joined: "Apr 2025", status: "Active" },
  { id: "cust-6", name: "Elena V.",   email: "elena@example.com",   orders: 4, totalSpent: "$892.00", joined: "Dec 2024", status: "VIP"    }
];

/* ──  Mock discount codes ───────────────────────────────── */
const MOCK_DISCOUNTS = [
  { code: "WELCOME10", type: "Percentage", value: "10% off", minOrder: "$0",   expires: "Never",       used: 142 },
  { code: "STYLE25",   type: "Percentage", value: "25% off", minOrder: "$150", expires: "Jun 30 2025", used: 38  },
  { code: "FREESHIP",  type: "Shipping",   value: "Free shipping", minOrder: "$100", expires: "Never", used: 215 },
  { code: "THREAD20",  type: "Fixed",      value: "$20 off", minOrder: "$200", expires: "May 31 2025", used: 17  }
];

/* ── Helpers (do not replace) ───────────────────────────────────── */
function fmt(n) { return "$" + Number(n).toFixed(2); }
function uid()  { return Math.random().toString(36).slice(2); }

/* ── Star rendering helper ──────────────────────────────────────── */
function renderStars(rating, small = false) {
  const size  = small ? "13px" : "16px";
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return `<span style="color:#C8A84B;font-size:${size}">
    ${"★".repeat(full)}${half ? "½" : ""}${"☆".repeat(empty)}
  </span>`;
}