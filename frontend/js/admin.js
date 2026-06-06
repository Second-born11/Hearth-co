/* ════════════════════════════════════════════════
   admin.js — Dashboard tabs (API-connected)
   ════════════════════════════════════════════════ */

const Admin = (() => {

  /* ── Stats ──────────────────────────────────── */
  async function _renderStats() {
    const container = document.getElementById("admin-stats");
    if (!container) return;
    try {
      const data = await API.Analytics.summary();
      const stats = [
        { icon: "💰", label: "Total Revenue",    value: fmt(data.totalRevenue),  color: "#C8714A" },
        { icon: "📦", label: "Total Stock",      value: data.totalStock,         color: "#4A7C59" },
        { icon: "🛍️", label: "Active Products",  value: data.totalProducts,      color: "#6B7FD4" },
        { icon: "🧑", label: "Total Customers",  value: data.totalCustomers,     color: "#E10098" },
      ];
      container.innerHTML = stats.map(s => `
        <div class="admin-stat-card" style="border-left-color:${s.color}">
          <div class="admin-stat-icon">${s.icon}</div>
          <div class="admin-stat-value">${s.value}</div>
          <div class="admin-stat-label">${s.label}</div>
        </div>
      `).join("");
    } catch {
      container.innerHTML = `<p style="color:var(--mid);font-size:13px">Could not load stats — is the backend running?</p>`;
    }
  }

  /* ── Products tab ───────────────────────────── */
  async function _renderProducts() {
    const panel = document.getElementById("tab-products");
    if (!panel) return;
    panel.innerHTML = `<p style="color:var(--mid);padding:20px">Loading products…</p>`;
    try {
      const { products } = await API.Products.list();
      panel.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td style="font-size:22px">${p.emoji||"📦"}</td>
                  <td style="font-weight:700;color:var(--charcoal)">${p.title}</td>
                  <td style="color:var(--mid)">${p.category}</td>
                  <td style="font-family:var(--font-display);font-weight:700">${fmt(p.price)}</td>
                  <td style="color:${p.stock < 8 ? "var(--red)" : "var(--green)"};font-weight:700">${p.stock}</td>
                  <td><span class="status-badge" style="${_tagStyle(p.tag)}">${p.tag||"Active"}</span></td>
                  <td><button class="edit-btn" data-id="${p.id}">Edit</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
      panel.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const product = products.find(p => p.id === btn.dataset.id);
          if (product) EditProduct.open(product, async (updated) => {
            try {
              await API.Products.update(updated.id, updated);
              showToast("✓ Product updated", "green");
              _renderProducts();
              _renderStats();
            } catch { showToast("Update failed", ""); }
          });
        });
      });
    } catch {
      panel.innerHTML = `<p style="color:var(--red);padding:20px">Failed to load products. Make sure backend is running.</p>`;
    }
  }

  function _tagStyle(tag) {
    const map = { "Bestseller": "background:#FFF3E0;color:#C8714A", "New": "background:#E8F5E9;color:#4A7C59", "Sale": "background:#FDECEA;color:#C84A4A" };
    return map[tag] || "background:#F0EAE0;color:#B5ADA5";
  }

  /* ── Orders tab ─────────────────────────────── */
  async function _renderOrders() {
    const panel = document.getElementById("tab-orders");
    if (!panel) return;
    panel.innerHTML = `<p style="color:var(--mid);padding:20px">Loading orders…</p>`;
    try {
      const { orders } = await API.Orders.list();
      const statusStyle = {
        Fulfilled:  "background:#E8F5E9;color:#4A7C59",
        Processing: "background:#FFF3E0;color:#C8714A",
        Shipped:    "background:#E3F2FD;color:#1565C0",
        Pending:    "background:#F3E5F5;color:#6A1B9A",
        Cancelled:  "background:#FDECEA;color:#C84A4A",
      };
      panel.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td style="font-family:var(--font-display);font-weight:700;color:var(--terra)">${o.number}</td>
                  <td style="font-weight:600">${o.customer.name}</td>
                  <td style="color:var(--mid)">${o.items.map(i => `${i.title} ×${i.qty}`).join(", ")}</td>
                  <td style="font-family:var(--font-display);font-weight:700">${fmt(o.total)}</td>
                  <td style="color:var(--light)">${o.createdAt}</td>
                  <td><span class="status-badge" style="${statusStyle[o.status]||""}">${o.status}</span></td>
                  <td>
                    <select class="sort-select" style="padding:5px 10px;font-size:11px" data-id="${o.id}">
                      ${["Processing","Shipped","Fulfilled","Cancelled"].map(s =>
                        `<option${o.status===s?" selected":""}>${s}</option>`).join("")}
                    </select>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
      panel.querySelectorAll("select[data-id]").forEach(sel => {
        sel.addEventListener("change", async () => {
          try {
            await API.Orders.updateStatus(sel.dataset.id, sel.value);
            showToast("✓ Order status updated", "green");
          } catch { showToast("Update failed", ""); }
        });
      });
    } catch {
      panel.innerHTML = `<p style="color:var(--red);padding:20px">Failed to load orders.</p>`;
    }
  }

  /* ── Analytics tab ──────────────────────────── */
  async function _renderAnalytics() {
    const panel = document.getElementById("tab-analytics");
    if (!panel) return;
    panel.innerHTML = `<p style="color:var(--mid);padding:20px">Loading analytics…</p>`;
    try {
      const [catData, weekData, topData] = await Promise.all([
        API.Analytics.salesByCategory(),
        API.Analytics.weeklyRevenue(),
        API.Analytics.topProducts(),
      ]);

      const maxWeekly = Math.max(...weekData.weeklyRevenue.map(d => d.revenue));
      panel.innerHTML = `
        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="analytics-title">Sales by Category</div>
            ${catData.salesByCategory.map(c => {
              const maxRev = Math.max(...catData.salesByCategory.map(x => x.revenue));
              const pct    = Math.round((c.revenue / maxRev) * 100);
              return `
                <div class="bar-row">
                  <div class="bar-labels"><span>${c.category}</span><span style="font-weight:700;color:var(--charcoal)">${fmt(c.revenue)}</span></div>
                  <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                </div>`;
            }).join("")}
          </div>
          <div class="analytics-card">
            <div class="analytics-title">Weekly Revenue</div>
            <div class="bar-chart">
              ${weekData.weeklyRevenue.map(d => `
                <div class="bar-col">
                  <div class="bar-col-fill" style="height:${Math.round((d.revenue/maxWeekly)*100)}%"></div>
                  <span class="bar-col-label">${d.day.slice(0,1)}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="analytics-card" style="grid-column:1/-1">
            <div class="analytics-title">Top Products by Revenue</div>
            <div class="admin-table-wrap" style="border-radius:10px">
              <table class="admin-table">
                <thead><tr><th></th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  ${topData.topProducts.map(p => `
                    <tr>
                      <td style="font-size:20px">${p.emoji||"📦"}</td>
                      <td style="font-weight:700">${p.title}</td>
                      <td style="color:var(--mid)">${p.units}</td>
                      <td style="font-family:var(--font-display);font-weight:700;color:var(--terra)">${fmt(p.revenue)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch {
      panel.innerHTML = `<p style="color:var(--red);padding:20px">Failed to load analytics.</p>`;
    }
  }

  /* ── Discounts tab ──────────────────────────── */
  async function _renderDiscounts() {
    const panel = document.getElementById("tab-discounts");
    if (!panel) return;
    panel.innerHTML = `<p style="color:var(--mid);padding:20px">Loading discounts…</p>`;
    try {
      const { discounts } = await API.Discounts.list();
      panel.innerHTML = `
        <div class="discount-grid">
          ${discounts.map(d => `
            <div class="discount-card">
              <div class="discount-code">${d.code}</div>
              <div class="discount-detail">💰 ${d.type === "percentage" ? d.value + "% off" : d.type === "fixed" ? "$"+d.value+" off" : "Free shipping"}</div>
              <div class="discount-detail">🛒 Min order: $${d.minOrder}</div>
              <div class="discount-detail">📅 Expires: ${d.expires || "Never"}</div>
              <div class="discount-used">Used ${d.uses} times</div>
            </div>
           `).join("")}
          <div class="discount-card" style="display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--cream)" id="add-discount-btn">
            <div style="text-align:center;color:var(--mid)">
              <div style="font-size:28px;margin-bottom:6px">＋</div>
              <div style="font-size:13px;font-weight:600">Add Discount Code</div>
            </div>
          </div>
        </div>
      `;
      document.getElementById("add-discount-btn")?.addEventListener("click", () => showToast("✓ Discount manager coming soon!", "terra"));
    } catch {
      panel.innerHTML = `<p style="color:var(--red);padding:20px">Failed to load discounts.</p>`;
    }
  }

  /* ── Customers tab ──────────────────────────── */
  async function _renderCustomers() {
    const panel = document.getElementById("tab-customers");
    if (!panel) return;
    panel.innerHTML = `<p style="color:var(--mid);padding:20px">Loading customers…</p>`;
    try {
      const { customers } = await API.Customers.list();
      panel.innerHTML = `
        <div class="customers-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              ${customers.map(c => `
                <tr>
                  <td style="font-weight:700">${c.name}</td>
                  <td style="color:var(--mid)">${c.email}</td>
                  <td style="font-weight:600">${c.orders}</td>
                  <td style="font-family:var(--font-display);font-weight:700;color:var(--terra)">${fmt(c.totalSpent)}</td>
                  <td style="color:var(--light)">${c.joined}</td>
                  <td><span class="status-badge" style="${c.status==="VIP"?"background:#FFF3E0;color:#C8714A":"background:#E8F5E9;color:#4A7C59"}">${c.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } catch {
      panel.innerHTML = `<p style="color:var(--red);padding:20px">Failed to load customers.</p>`;
    }
  }

  /* ── Tab switching ──────────────────────────── */
  function _bindTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => { p.classList.remove("active"); p.classList.add("hidden"); });
        btn.classList.add("active");
        const panel = document.getElementById(`tab-${btn.dataset.tab}`);
        panel?.classList.remove("hidden");
        panel?.classList.add("active");
      });
    });
  }

  async function init() {
    // 🌟 FIX: Handshake token configuration with API wrapper layer before requests fire
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken && window.API && typeof window.API._setAdminToken === "function") {
      window.API._setAdminToken(savedToken);
    }

    await _renderStats();
    _renderProducts();
    _renderOrders();
    _renderAnalytics();
    _renderDiscounts();
    _renderCustomers();
    _bindTabs();
  }

  return { init };
})();

/* ════════════════════════════════════════════════
   EditProduct — edit modal
   ════════════════════════════════════════════════ */
const EditProduct = (() => {
  let _cb = null;

  function open(product, onSave) {
    _cb = onSave;
    const content = document.getElementById("edit-content");
    const modal   = document.getElementById("edit-modal");
    const overlay = document.getElementById("edit-overlay");
    if (!content || !modal) return;

    content.innerHTML = `
      <div class="edit-wrap">
        <div class="edit-title">Edit ${product.emoji||""} ${product.title}</div>
        <div class="form-group">
          <label class="form-label">Price ($)</label>
          <input class="form-input" id="ep-price" type="number" step="0.01" value="${product.price}" />
        </div>
        <div class="form-group">
          <label class="form-label">Compare-at Price ($)</label>
          <input class="form-input" id="ep-compare" type="number" step="0.01" value="${product.compareAt||product.compare||""}" placeholder="Leave blank to remove" />
        </div>
        <div class="form-group">
          <label class="form-label">Stock Units</label>
          <input class="form-input" id="ep-stock" type="number" value="${product.stock}" />
        </div>
        <div class="form-group">
          <label class="form-label">Tag</label>
          <select class="form-input" id="ep-tag">
            <option value="">— None —</option>
            <option value="Bestseller"${product.tag==="Bestseller"?" selected":""}>Bestseller</option>
            <option value="New"${product.tag==="New"?" selected":""}>New</option>
            <option value="Sale"${product.tag==="Sale"?" selected":""}>Sale</option>
          </select>
        </div>
        <div class="checkout-nav">
          <button class="btn-primary" id="ep-save" style="flex:1">Save Changes</button>
          <button class="btn-outline" id="ep-cancel" style="flex:1">Cancel</button>
        </div>
      </div>
    `;

    overlay?.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.classList.add("open");

    document.getElementById("ep-save").addEventListener("click", () => {
      const updated = {
        id:        product.id,
        price:     parseFloat(document.getElementById("ep-price").value),
        compareAt: parseFloat(document.getElementById("ep-compare").value) || null,
        stock:     parseInt(document.getElementById("ep-stock").value),
        tag:       document.getElementById("ep-tag").value || null,
      };
      if (_cb) _cb(updated);
      close();
    });
    document.getElementById("ep-cancel").addEventListener("click", close);
  }

  function close() {
    document.getElementById("edit-modal")  ?.classList.remove("open");
    document.getElementById("edit-overlay")?.classList.add("hidden");
  }

  function init() {
    document.getElementById("edit-close")  ?.addEventListener("click", close);
    document.getElementById("edit-overlay")?.addEventListener("click", close);
  }

  return { init, open, close };
})();