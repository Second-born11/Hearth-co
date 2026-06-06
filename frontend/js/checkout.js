/* ════════════════════════════════════════════════
   checkout.js — Multi-step checkout (API-connected)
   ════════════════════════════════════════════════ */

const Checkout = (() => {
  let step       = 1;
  let orderItems = [];
  let orderTotal = 0;
  let formData   = {};
  let discount   = null;

  const STEPS = ["Address", "Shipping", "Payment", "Confirm"];

  function open(items, total) {
    orderItems = items;
    orderTotal = total;
    step       = 1;
    formData   = {};
    discount   = null;
    _render();
    document.getElementById("checkout-modal")  ?.classList.remove("hidden");
    document.getElementById("checkout-modal")  ?.classList.add("open");
    document.getElementById("checkout-overlay")?.classList.remove("hidden");
  }

  function close() {
    document.getElementById("checkout-modal")  ?.classList.remove("open");
    document.getElementById("checkout-overlay")?.classList.add("hidden");
    setTimeout(() => document.getElementById("checkout-modal")?.classList.add("hidden"), 300);
  }

  function _stepHeader() {
    return `
      <div class="checkout-steps">
        ${STEPS.map((s, i) => {
          const n   = i + 1;
          const cls = n < step ? "step done" : n === step ? "step active" : "step";
          return `
            <div class="${cls}">
              <div class="step-num">${n < step ? "✓" : n}</div>
              ${s}
              ${i < STEPS.length - 1 ? `<div class="step-connector"></div>` : ""}
            </div>`;
        }).join("")}
      </div>`;
  }

  function _orderSummaryHTML() {
    const shippingCost = { standard: 4.99, express: 12.99, free: 0 }[formData.shipping || "standard"];
    const discountAmt  = discount ? discount.savings : 0;
    const grandTotal   = orderTotal + shippingCost - discountAmt;
    return `
      <div class="checkout-order-summary">
        <div class="order-summary-title">Order Summary</div>
        ${orderItems.map(i => `
          <div class="order-summary-item">
            <span>${i.emoji||"📦"} ${i.title} (${i.variantTitle||i.selectedVariant}) × ${i.qty}</span>
            <span>${fmt(i.price * i.qty)}</span>
          </div>
        `).join("")}
        <div class="order-summary-item"><span>Shipping</span><span>${shippingCost === 0 ? "Free" : fmt(shippingCost)}</span></div>
        ${discountAmt > 0 ? `<div class="order-summary-item" style="color:var(--green)"><span>Discount (${discount.discount.code})</span><span>−${fmt(discountAmt)}</span></div>` : ""}
        <div class="order-summary-total">
          <span>Total</span>
          <span>${fmt(Math.max(0, grandTotal))}</span>
        </div>
      </div>`;
  }

  function _render() {
    const content = document.getElementById("checkout-content");
    if (!content) return;
    if (step === 5) { _renderSuccess(); return; }
    let body = "";
    if (step === 1) body = _step1();
    if (step === 2) body = _step2();
    if (step === 3) body = _step3();
    if (step === 4) body = _step4();
    content.innerHTML = `
      <div class="checkout-wrap">
        <div class="checkout-title">Checkout</div>
        <div class="checkout-sub">Powered by Shopify Storefront API</div>
        ${_stepHeader()}
        ${_orderSummaryHTML()}
        ${body}
      </div>`;
    _bindStep();
  }

  function _step1() {
    return `
      <div class="form-group"><label class="form-label">Full Name</label>
        <input class="form-input" id="f-name" placeholder="Jane Smith" value="${formData.name||""}" /></div>
      <div class="form-group"><label class="form-label">Email</label>
        <input class="form-input" id="f-email" type="email" placeholder="jane@example.com" value="${formData.email||""}" /></div>
      <div class="form-group"><label class="form-label">Address Line 1</label>
        <input class="form-input" id="f-addr1" placeholder="123 Maple Street" value="${formData.addr1||""}" /></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">City</label>
          <input class="form-input" id="f-city" placeholder="London" value="${formData.city||""}" /></div>
        <div class="form-group"><label class="form-label">Postcode</label>
          <input class="form-input" id="f-zip" placeholder="SW1A 1AA" value="${formData.zip||""}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Country</label>
        <select class="form-input" id="f-country">
          <option>United Kingdom</option><option>United States</option>
          <option>Germany</option><option>France</option>
          <option>Australia</option><option>Canada</option>
        </select></div>
      <div class="checkout-nav">
        <button class="btn-primary" id="next-btn" style="flex:1">Continue to Shipping →</button>
      </div>`;
  }

  function _step2() {
    const opts = [
      { id: "standard", label: "Standard Delivery", desc: "3–5 business days", price: 4.99 },
      { id: "express",  label: "Express Delivery",  desc: "1–2 business days", price: 12.99 },
      { id: "free",     label: "Free Shipping",     desc: "5–8 business days", price: 0 },
    ];
    return `
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
        ${opts.map(o => `
          <label style="display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:var(--radius-md);border:1.5px solid ${formData.shipping===o.id?"var(--terra)":"var(--sand)"};cursor:pointer">
            <input type="radio" name="shipping" value="${o.id}" ${(formData.shipping||"standard")===o.id?"checked":""} style="accent-color:var(--terra)" />
            <div style="flex:1"><div style="font-weight:700;font-size:14px">${o.label}</div>
            <div style="font-size:12px;color:var(--mid)">${o.desc}</div></div>
            <div style="font-family:var(--font-display);font-weight:700">${o.price===0?"Free":fmt(o.price)}</div>
          </label>`).join("")}
      </div>
      <div class="form-group">
        <label class="form-label">Discount Code (optional)</label>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="f-discount" placeholder="e.g. WELCOME10" value="${formData.discountCode||""}" style="flex:1" />
          <button class="btn-outline" id="apply-discount-btn" style="padding:10px 16px;white-space:nowrap">Apply</button>
        </div>
        <div id="discount-msg" style="font-size:12px;margin-top:6px"></div>
      </div>
      <div class="checkout-nav">
        <button class="btn-outline" id="back-btn" style="flex:1">← Back</button>
        <button class="btn-primary" id="next-btn" style="flex:1">Continue to Payment →</button>
      </div>`;
  }

  function _step3() {
    return `
      <div class="form-group"><label class="form-label">Cardholder Name</label>
        <input class="form-input" id="f-cardname" placeholder="Jane Smith" value="${formData.cardname||""}" /></div>
      <div class="form-group"><label class="form-label">Card Number</label>
        <input class="form-input" id="f-cardnum" placeholder="•••• •••• •••• ••••" maxlength="19" value="${formData.cardnum||""}" /></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Expiry</label>
          <input class="form-input" id="f-expiry" placeholder="MM / YY" maxlength="7" value="${formData.expiry||""}" /></div>
        <div class="form-group"><label class="form-label">CVV</label>
          <input class="form-input" id="f-cvv" placeholder="•••" maxlength="4" type="password" /></div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius-md);padding:12px 14px;font-size:12px;color:var(--mid);margin-bottom:8px">
        🔒 Demo only — no real payment is processed.
      </div>
      <div class="checkout-nav">
        <button class="btn-outline" id="back-btn" style="flex:1">← Back</button>
        <button class="btn-primary" id="next-btn" style="flex:1">Review Order →</button>
      </div>`;
  }

  function _step4() {
    const shippingCost = { standard: 4.99, express: 12.99, free: 0 }[formData.shipping || "standard"];
    return `
      <div style="font-size:13px;color:var(--mid);line-height:1.9;margin-bottom:16px;background:var(--cream);padding:16px;border-radius:var(--radius-md)">
        <strong style="color:var(--charcoal)">Ship to:</strong> ${formData.name||"—"}, ${formData.addr1||"—"}, ${formData.city||"—"} ${formData.zip||""}<br>
        <strong style="color:var(--charcoal)">Method:</strong> ${formData.shipping==="express"?"Express":"formData.shipping"==="free"?"Free":"Standard"}<br>
        <strong style="color:var(--charcoal)">Payment:</strong> Card ending ${(formData.cardnum||"").slice(-4)||"••••"}
      </div>
      <div class="checkout-nav">
        <button class="btn-outline" id="back-btn" style="flex:1">← Back</button>
        <button class="btn-primary" id="place-order-btn" style="flex:1">🎉 Place Order</button>
      </div>`;
  }

  async function _placeOrder() {
    const shippingCost = { standard: 4.99, express: 12.99, free: 0 }[formData.shipping || "standard"];
    const discountAmt  = discount ? discount.savings : 0;
    try {
      const order = await API.Orders.place({
        customer: { name: formData.name, email: formData.email },
        items: orderItems.map(i => ({
          productId: i.id || i.productId,
          title:     i.title,
          variant:   i.variantTitle || i.selectedVariant,
          qty:       i.qty,
          price:     i.price
        })),
        subtotal:       orderTotal,
        shipping:       shippingCost,
        shippingMethod: formData.shipping || "standard",
        discountCode:   formData.discountCode || null,
        address: {
          line1:   formData.addr1,
          city:    formData.city,
          zip:     formData.zip,
          country: formData.country || "United Kingdom"
        }
      });
      return order;
    } catch (err) {
      showToast("Could not place order — " + err.message);
      return null;
    }
  }

  function _renderSuccess(orderNum) {
    const content = document.getElementById("checkout-content");
    if (!content) return;
    content.innerHTML = `
      <div class="success-wrap">
        <span class="success-icon">🎉</span>
        <div class="success-title">Order Confirmed!</div>
        <div class="success-msg">
          Thank you, <strong>${formData.name||"valued customer"}</strong>!<br>
          Your order <strong>${orderNum||"#"+Math.floor(1000+Math.random()*9000)}</strong> has been placed.<br>
          A confirmation was sent to <strong>${formData.email||"your email"}</strong>.
        </div>
        <button class="nav-btn" data-page="store" id="close-success-modal-btn">Continue Shopping</button>
      </div>`;
    Cart.clear();
    document.getElementById("continue-shopping-btn")?.addEventListener("click", () => {
      close();
      App.navigate("store");
    });
  }

  function _bindStep() {
    // Next button
    document.getElementById("next-btn")?.addEventListener("click", async () => {
      if (step === 1) {
        formData.name    = document.getElementById("f-name") ?.value;
        formData.email   = document.getElementById("f-email")?.value;
        formData.addr1   = document.getElementById("f-addr1")?.value;
        formData.city    = document.getElementById("f-city") ?.value;
        formData.zip     = document.getElementById("f-zip")  ?.value;
        formData.country = document.getElementById("f-country")?.value;
        if (!formData.name || !formData.email) { showToast("Please fill in name and email"); return; }
      }
      if (step === 2) {
        formData.shipping     = document.querySelector('input[name="shipping"]:checked')?.value || "standard";
        formData.discountCode = document.getElementById("f-discount")?.value || null;
      }
      if (step === 3) {
        formData.cardname = document.getElementById("f-cardname")?.value;
        formData.cardnum  = document.getElementById("f-cardnum") ?.value;
        formData.expiry   = document.getElementById("f-expiry")  ?.value;
      }
      step++;
      _render();
    });

    // Back button
    document.getElementById("back-btn")?.addEventListener("click", () => { step--; _render(); });

    // Place order
    document.getElementById("place-order-btn")?.addEventListener("click", async () => {
      const btn = document.getElementById("place-order-btn");
      btn.textContent = "Placing order…";
      btn.disabled = true;
      const order = await _placeOrder();
      step = 5;
      _renderSuccess(order?.number);
    });

    // Apply discount
    document.getElementById("apply-discount-btn")?.addEventListener("click", async () => {
      const code = document.getElementById("f-discount")?.value;
      const msg  = document.getElementById("discount-msg");
      if (!code) return;
      try {
        const result = await API.Discounts.validate(code, orderTotal);
        discount = result;
        formData.discountCode = code;
        if (msg) { msg.style.color = "var(--green)"; msg.textContent = `✓ ${result.discount.code} applied — you save ${fmt(result.savings)}`; }
        _render();
      } catch (err) {
        discount = null;
        if (msg) { msg.style.color = "var(--red)"; msg.textContent = err.message; }
      }
    });

    // Card number formatting
    document.getElementById("f-cardnum")?.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g,"").substring(0,16);
      e.target.value = v.replace(/(.{4})/g,"$1 ").trim();
    });
  }

  function init() {
    document.getElementById("checkout-close")  ?.addEventListener("click", close);
    document.getElementById("checkout-overlay")?.addEventListener("click", close);
  }

  return { init, open, close };
})();
