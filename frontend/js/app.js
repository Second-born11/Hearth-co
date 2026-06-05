/* ════════════════════════════════════════════════
   app.js — Router, toast, nav, global bootstrap
   ════════════════════════════════════════════════ */

function showToast(msg, variant = "") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = "toast show" + (variant ? " " + variant : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = "toast hidden"; }, 2600);
}

const App = (() => {
  let current = "store";

  const PAGE_IDS = {
    store:        "page-store",
    architecture: "page-architecture",
    features:     "page-features",
    wishlist:     "page-wishlist",
    admin:        "page-admin"
  };

  function navigate(page) {
    if (!PAGE_IDS[page]) return;

    // Hide all pages
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    // Show target page
    const el = document.getElementById(PAGE_IDS[page]);
    el && el.classList.add("active");

    // Update navigation active states
    document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.page === page);
    });

    document.getElementById("mobile-menu")?.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    current = page;

    // Page-specific actions
    if (page === "wishlist")     Wishlist.renderPage();
    if (page === "architecture") Architecture.init();
    if (page === "admin")        Auth.guardAdmin();   // ← Normal 'Auth' used here
  }

  function getCurrent() { return current; }

  function _bindNavButtons() {
    document.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        const page = btn.dataset.page;
        if (page) navigate(page);
      });
    });
  }

  function _bindHamburger() {
    const ham  = document.getElementById("hamburger");
    const menu = document.getElementById("mobile-menu");
    ham?.addEventListener("click", () => menu?.classList.toggle("hidden"));
  }

  function _bindScroll() {
    const nav = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
      nav?.classList.toggle("scrolled", window.scrollY > 10);
    }, { passive: true });
  }

  function init() {
    Auth.init(); // ← Normal 'Auth' used here
    
    // 🌟 Fixed Cart reference to CartModule to resolve runtime crash
    CartModule.init();
    
    Wishlist.init();
    Store.init();
    Features.init();
    Checkout.init();
    EditProduct.init();
    ProductDetail.init();

    _bindNavButtons();
    _bindHamburger();
    _bindScroll();

    navigate("store");
  }

  return { init, navigate, getCurrent };
})();

document.addEventListener("DOMContentLoaded", App.init);