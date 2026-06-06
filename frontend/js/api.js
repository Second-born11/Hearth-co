/* ════════════════════════════════════════════════
   api.js — Backend Communication Layer Broker
   Exposes global window.API mapping to the Express 
   server instances running on port 3001.
   ════════════════════════════════════════════════ */
window.API = (() => {
  const BASE_URL = "https://hearth-co.onrender.com/api";
  let adminToken = localStorage.getItem("admin_token") || null;

  // 🌟 Auto-initialize a unique cart session token if one isn't saved yet
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = "session-" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("cart_session_id", sessionId);
  }

  // Helper method to make HTTP requests cleanly
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (adminToken) {
      headers["x-admin-token"] = adminToken;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Network request failed.");
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  return {
    _setAdminToken: (token) => {
      adminToken = token;
      if (token) {
        localStorage.setItem("admin_token", token);
      } else {
        localStorage.removeItem("admin_token");
      }
    },

    Auth: {
      signup: (name, email, password) => {
        return request("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ name, email, password })
        });
      },
      login: (email, password) => {
        return request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
      },
      logout: () => {
        return request("/auth/logout", { method: "POST" });
      },
      me: () => {
        return request("/auth/me", { method: "GET" });
      },
      forgotPassword: (email) => {
        return request("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email })
        });
      },
      resetPassword: (email, otp, newPassword) => {
        return request("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ email, otp, newPassword })
        });
      },
      createAdmin: (name, email, password) => {
        return request("/auth/create-admin", {
          method: "POST",
          body: JSON.stringify({ name, email, password })
        });
      }
    },

    /* ── 🌟 FIXED DYNAMIC CART API MAPS ── */
    Cart: {
      get: () => {
        return request(`/cart/${sessionId}`);
      },
      add: (productId, variantTitle, qty = 1) => {
        return request(`/cart/${sessionId}/add`, {
          method: "POST",
          body: JSON.stringify({ productId, variantTitle, qty })
        });
      },
      updateQty: (cartItemId, qty) => {
        return request(`/cart/${sessionId}/item/${cartItemId}`, {
          method: "PUT",
          body: JSON.stringify({ qty })
        });
      },
      removeItem: (cartItemId) => {
        return request(`/cart/${sessionId}/item/${cartItemId}`, {
          method: "DELETE"
        });
      },
      clear: () => {
        return request(`/cart/${sessionId}`, {
          method: "DELETE"
        });
      }
    }
  };
})();