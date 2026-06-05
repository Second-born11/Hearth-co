/* Interface Layer Controller with Dynamic OTP Modals and Hide/Show Toggles */
const Auth = (() => {
  const TOKEN_KEY = "hearth_admin_token";
  const USER_KEY = "hearth_admin_user";

  let currentUser = null;

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser() { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  function isLoggedIn() { return !!getToken(); }

  function _saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    currentUser = user;
    API._setAdminToken(token);
  }

  function _clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    API._setAdminToken(null);
  }

  function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    toggle?.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "";
      } else {
        input.type = "password";
        toggle.textContent = "️";
      }
    });
  }

  async function signup(name, email, password) {
    const data = await API.Auth.signup(name, email, password);
    _saveSession(data.token, data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await API.Auth.login(email, password);
    _saveSession(data.token, data.user);
    return data.user;
  }

  async function logout() {
    try { await API.Auth.logout(); } catch { }
    _clearSession();
    showAdminAuth();
    App.navigate("store");
  }

  async function verify() {
    const token = getToken();
    if (!token) return false;
    try {
      API._setAdminToken(token);
      const user = await API.Auth.me();
      currentUser = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return true;
    } catch {
      _clearSession();
      return false;
    }
  }

  function showAdminAuth(mode = "login", savedEmailForOtp = "") {
    const section = document.getElementById("page-admin");
    if (!section) return;

    section.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-card">
          <div class="auth-logo"></div>
          <h2 class="auth-title">Hearth & Co.</h2>
          <p class="auth-sub">Identity Management Node</p>

          <div class="auth-tabs" ${(mode === "forgot" || mode === "otpVerify") ? "style='display:none'" : ""}>
            <button class="auth-tab${mode === "login" ? " active" : ""}" id="tab-login">Log In</button>
            <button class="auth-tab${mode === "signup" ? " active" : ""}" id="tab-signup">Sign Up</button>
          </div>

          <div id="auth-login-form" ${mode === "login" ? "" : "style='display:none'"}>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="login-email" type="email" placeholder="you@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div style="position: relative;">
                <input class="form-input" id="login-password" type="password" placeholder="••••••••" style="padding-right: 40px;" />
                <button type="button" id="toggle-login-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px;">️</button>
              </div>
            </div>
            <div id="login-error" class="auth-error hidden"></div>
            <button class="btn-primary full-width" id="login-btn" style="margin-top:8px">Log In →</button>
            <div style="margin-top: 15px; text-align: center;">
              <button type="button" class="form-link" id="goto-forgot-btn" style="background: none; border: none; color: #C8714A; cursor: pointer; font-size: 13px;">Forgot Password?</button>
            </div>
          </div>

          <div id="auth-signup-form" ${mode === "signup" ? "" : "style='display:none'"}>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input class="form-input" id="signup-name" type="text" placeholder="Jane Smith" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="signup-email" type="email" placeholder="you@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div style="position: relative;">
                <input class="form-input" id="signup-password" type="password" placeholder="Min. 6 characters" style="padding-right: 40px;" />
                <button type="button" id="toggle-signup-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px;">️</button>
              </div>
            </div>
            <div id="signup-error" class="auth-error hidden"></div>
            <button class="btn-primary full-width" id="signup-btn" style="margin-top:8px">Create Account →</button>
          </div>

          <div id="auth-forgot-form" ${mode === "forgot" ? "" : "style='display:none'"}>
            <p class="auth-sub" style="margin-bottom: 15px; font-size: 13px;">Enter your registered email below to receive a 6-digit verification code directly inside your inbox.</p>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input class="form-input" id="forgot-email" type="email" placeholder="you@example.com" />
            </div>
            <div id="forgot-error" class="auth-error hidden"></div>
            <button class="btn-primary full-width" id="forgot-submit-btn" style="margin-top: 10px;">Send Verification OTP</button>
            <div style="margin-top: 15px; text-align: center;">
              <button type="button" class="form-link" id="forgot-back-btn" style="background: none; border: none; color: #7A6F65; cursor: pointer; font-size: 13px;">← Back to Login</button>
            </div>
          </div>

          <div id="auth-otp-form" ${mode === "otpVerify" ? "" : "style='display:none'"}>
            <p class="auth-sub" style="margin-bottom: 15px; font-size: 13px; color: #137333;">✔ Security code sent! Check your inbox for the authorization digits.</p>
            <div class="form-group">
              <label class="form-label">6-Digit Verification Code</label>
              <input class="form-input" id="otp-code" type="text" placeholder="e.g. 123456" maxlength="6" style="text-align: center; font-size: 20px; letter-spacing: 4px;" />
            </div>
            <div class="form-group">
              <label class="form-label">Create New Password</label>
              <div style="position: relative;">
                <input class="form-input" id="otp-new-password" type="password" placeholder="Min. 6 characters" style="padding-right: 40px;" />
                <button type="button" id="toggle-otp-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px;">️</button>
              </div>
            </div>
            <div id="otp-error" class="auth-error hidden"></div>
            <button class="btn-primary full-width" id="otp-submit-btn" style="margin-top: 10px;">Authorize Password Rewrite →</button>
            <div style="margin-top: 15px; text-align: center;">
              <button type="button" class="form-link" id="otp-cancel-btn" style="background: none; border: none; color: #7A6F65; cursor: pointer; font-size: 13px;">Cancel Verification</button>
            </div>
          </div>
        </div>
      </div>
    `;

    setupPasswordToggle("login-password", "toggle-login-pass");
    setupPasswordToggle("signup-password", "toggle-signup-pass");
    setupPasswordToggle("otp-new-password", "toggle-otp-pass");

    document.getElementById("tab-login")?.addEventListener("click", () => showAdminAuth("login"));
    document.getElementById("tab-signup")?.addEventListener("click", () => showAdminAuth("signup"));
    document.getElementById("goto-forgot-btn")?.addEventListener("click", () => showAdminAuth("forgot"));
    document.getElementById("forgot-back-btn")?.addEventListener("click", () => showAdminAuth("login"));
    document.getElementById("otp-cancel-btn")?.addEventListener("click", () => showAdminAuth("login"));

    document.getElementById("forgot-submit-btn")?.addEventListener("click", async () => {
      const email = document.getElementById("forgot-email")?.value.trim();
      const errEl = document.getElementById("forgot-error");
      const btn = document.getElementById("forgot-submit-btn");
      if (!errEl) return;

      errEl.classList.add("hidden");
      if (!email) {
        errEl.textContent = "Please enter your email account!";
        errEl.classList.remove("hidden"); return;
      }

      btn.textContent = "Sending security code…"; btn.disabled = true;
      try {
        await API.Auth.forgotPassword(email);
        showAdminAuth("otpVerify", email);
      } catch (err) {
        btn.textContent = "Send Verification OTP"; btn.disabled = false;
        errEl.textContent = err.message || "This email address is not registered on our system.";
        errEl.classList.remove("hidden");
      }
    });

    document.getElementById("otp-submit-btn")?.addEventListener("click", async () => {
      const code = document.getElementById("otp-code")?.value.trim();
      const newPass = document.getElementById("otp-new-password")?.value;
      const errEl = document.getElementById("otp-error");
      const btn = document.getElementById("otp-submit-btn");
      if (!errEl) return;

      errEl.classList.add("hidden");
      if (!code || !newPass) {
        errEl.textContent = "Please fill in both the code and your new password.";
        errEl.classList.remove("hidden"); return;
      }

      btn.textContent = "Authorizing credentials change…"; btn.disabled = true;
      try {
        await API.Auth.resetPassword(savedEmailForOtp, code, newPass);
        showToast("Password updated successfully!");
        showAdminAuth("login");
      } catch (err) {
        btn.textContent = "Authorize Password Rewrite →"; btn.disabled = false;
        errEl.textContent = err.message || "Invalid or expired authorization parameters code.";
        errEl.classList.remove("hidden");
      }
    });

    document.getElementById("login-btn")?.addEventListener("click", async () => {
      const email = document.getElementById("login-email")?.value.trim();
      const password = document.getElementById("login-password")?.value;
      const errEl = document.getElementById("login-error");
      const btn = document.getElementById("login-btn");
      if (!errEl) return;

      errEl.classList.add("hidden");
      btn.textContent = "Logging in…"; btn.disabled = true;

      try {
        const loggedInUser = await login(email, password);
        if (loggedInUser && (loggedInUser.role === "admin" || loggedInUser.role === "superadmin")) {
          showAdminDashboard();
        } else {
          showToast(`Welcome back, ${loggedInUser.name || "Customer"}!`);
          showUserProfile();
        }
      } catch (err) {
        errEl.textContent = err.message || "Invalid email or password parameters.";
        errEl.classList.remove("hidden");
        btn.textContent = "Log In →"; btn.disabled = false;
      }
    });

    document.getElementById("signup-btn")?.addEventListener("click", async () => {
      const name = document.getElementById("signup-name")?.value.trim();
      const email = document.getElementById("signup-email")?.value.trim();
      const password = document.getElementById("signup-password")?.value;
      const errEl = document.getElementById("signup-error");
      const btn = document.getElementById("signup-btn");
      if (!errEl) return;

      errEl.classList.add("hidden");
      btn.textContent = "Creating account…"; btn.disabled = true;
      try {
        const newUser = await signup(name, email, password);
        showToast(`Welcome to Hearth & Co, ${newUser.name}!`);
        showUserProfile();
      } catch (err) {
        errEl.textContent = err.message || "Sign up sequence processing failure.";
        errEl.classList.remove("hidden");
        btn.textContent = "Create Account →"; btn.disabled = false;
      }
    });
  }

  function showAdminDashboard() {
    const user = getUser();
    const section = document.getElementById("page-admin");
    if (!section) return;

    section.innerHTML = `
      <div class="admin-user-bar">
        <span> Welcome, <strong>${user?.name || "Admin"}</strong> <span class="role-badge">${user?.role || "admin"}</span></span>
        <button class="logout-btn" id="logout-btn">Log Out</button>
      </div>
      <div class="inner-wrap">
        <div class="page-header">
          <h2 class="section-title">Admin Dashboard</h2>
          <p class="section-sub">Shopify Management Console · System Control Active</p>
        </div>
        <div class="admin-stats" id="admin-stats"></div>
        <div class="admin-tabs">
          <button class="tab-btn active" data-tab="products">Products</button>
          <button class="tab-btn" data-tab="orders">Orders</button>
          <button class="tab-btn" data-tab="analytics">Analytics</button>
          <button class="tab-btn" data-tab="discounts">Discounts</button>
          <button class="tab-btn" data-tab="customers">Customers</button>
          <button class="tab-btn" data-tab="staff" id="tab-btn-staff">🛡️ Add Admin</button>
        </div>
        <div id="tab-products" class="tab-panel active"></div>
        <div id="tab-orders"   class="tab-panel hidden"></div>
        <div id="tab-analytics"class="tab-panel hidden"></div>
        <div id="tab-discounts"class="tab-panel hidden"></div>
        <div id="tab-customers"class="tab-panel hidden"></div>
        
        <div id="tab-staff" class="tab-panel hidden">
          <div class="card" style="max-width: 500px; margin: 20px 0; padding: 25px;">
            <h3>Provision New Admin Account</h3>
            <div class="form-group">
              <label class="form-label">Staff Full Name</label>
              <input class="form-input" id="staff-name" type="text" placeholder="e.g. David Alao" />
            </div>
            <div class="form-group">
              <label class="form-label">Secure Admin Email</label>
              <input class="form-input" id="staff-email" type="email" placeholder="staff@hearthco.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Initial Password</label>
              <div style="position: relative;">
                <input class="form-input" id="staff-password" type="password" placeholder="••••••••" style="padding-right: 40px;" />
                <button type="button" id="toggle-staff-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px;">️</button>
              </div>
            </div>
            <div id="staff-error" class="auth-error hidden"></div>
            <div id="staff-success" class="auth-error hidden" style="background-color: #E6F4EA; color: #137333;"></div>
            <button class="btn-primary" id="create-staff-btn" style="width: 100%;">Authorize Staff Account →</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", logout);
    setupPasswordToggle("staff-password", "toggle-staff-pass");

    const tabButtons = section.querySelectorAll(".admin-tabs .tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        section.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
        section.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const targetPanel = document.getElementById("tab-" + btn.dataset.tab);
        if (targetPanel) {
          targetPanel.classList.remove("hidden");
          targetPanel.classList.add("active");
        }
      });
    });

    document.getElementById("create-staff-btn").addEventListener("click", async () => {
      const name = document.getElementById("staff-name").value.trim();
      const email = document.getElementById("staff-email").value.trim();
      const password = document.getElementById("staff-password").value;
      const errEl = document.getElementById("staff-error");
      const succEl = document.getElementById("staff-success");

      errEl.classList.add("hidden");
      succEl.classList.add("hidden");

      if (!name || !email || !password) {
        errEl.textContent = "Please fill out all parameters.";
        errEl.classList.remove("hidden"); return;
      }

      try {
        await API.Auth.createAdmin(name, email, password);
        succEl.textContent = `Success! Account authorized for ${name}.`;
        succEl.classList.remove("hidden");
        document.getElementById("staff-name").value = "";
        document.getElementById("staff-email").value = "";
        document.getElementById("staff-password").value = "";
      } catch (err) {
        errEl.textContent = err.message || "Failed to create administrator account.";
        errEl.classList.remove("hidden");
      }
    });

    if (typeof Admin !== 'undefined') {
      Admin.init();
    }
  }

  function showUserProfile() {
    const user = getUser();
    const section = document.getElementById("page-admin");
    if (!section) return;

    section.innerHTML = `
      <div class="admin-user-bar" style="background-color: #333;">
        <span>Welcome back, <strong>${user?.name || "Customer"}</strong></span>
        <button class="logout-btn" id="customer-logout-btn">Log Out</button>
      </div>
      <div class="inner-wrap" style="max-width: 800px; margin: 40px auto; padding: 0 20px;">
        <div class="page-header" style="border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 class="section-title" style="font-size: 28px; color: #222;">My Profile Account</h2>
          <p class="section-sub" style="color: #666;">Manage your settings, transactions, and preferences securely.</p>
        </div>
        
        <div class="profile-dashboard-grid" style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px;">
          <div class="card" style="padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; height: fit-content;">
            <h3 style="margin-top: 0; color: #C8714A;">Account Details</h3>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Name:</strong> ${user?.name || "Customer"}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Email:</strong> ${user?.email || "Not Provided"}</p>
          </div>
          
          <div class="card" style="padding: 25px; border: 1px solid #eee; border-radius: 8px;">
            <h3 style="margin-top: 0; margin-bottom: 10px;">Account Settings</h3>
            <p style="color: #777; font-size: 14px; margin-bottom: 20px;">We are currently polishing additional settings controls for your customer layout window.</p>
            
            <div style="opacity: 0.5; pointer-events: none;">
              <div class="form-group" style="margin-bottom: 15px;">
                <label class="form-label" style="display:block; margin-bottom:5px; font-weight:bold; font-size:13px;">Update Shipping Location</label>
                <input class="form-input" type="text" placeholder="123 Main Street" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" />
              </div>
              <button class="btn-primary" style="padding: 8px 16px;">Save Workspace Settings</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("customer-logout-btn")?.addEventListener("click", logout);
  }

  async function guardAdmin() {
    if (!isLoggedIn()) { showAdminAuth(); return; }
    const valid = await verify();
    if (!valid) { showAdminAuth(); return; }

    const user = getUser();
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      showAdminDashboard();
    } else {
      showUserProfile();
    }
  }

  function init() {
    const token = getToken();
    if (token) API._setAdminToken(token);
  }

  return { init, guardAdmin, isLoggedIn, logout, getUser, showUserProfile };
})();