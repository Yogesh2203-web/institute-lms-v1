(() => {
  "use strict";
  const ROLE_DASHBOARDS = {
    businesshead: "../dashboard/business-head.html",
    manager: "../dashboard/manager.html",
    trainer: "../dashboard/trainer.html",
    student: "../dashboard/student.html"
  };
  const normalizeRole = value => String(value || "").toLowerCase().replace(/[^a-z]/g, "");
  const initialize = () => {
    const form = document.getElementById("loginForm");
    if (!form || form.dataset.authBound === "true") return;
    form.dataset.authBound = "true";
    const byId = id => document.getElementById(id);
    const button = byId("loginButton");
    const message = byId("loginMessage");
    const show = (text, type = "error") => {
      if (message) { message.textContent = text; message.className = `login-message ${type}`; }
      else window.alert(text);
    };
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const email = byId("email")?.value.trim();
      const password = byId("password")?.value;
      const selectedRole = byId("selectedRole")?.value;
      const apiBase = String(window.LMS_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");
      if (!apiBase || apiBase.includes("YOUR-API-SERVICE")) {
        show("API is not configured. Set API_BASE_URL in /lms-config.js to your deployed backend URL.");
        return;
      }
      if (!email || !password) { show("Please enter your email and password."); return; }
      if (button) { button.disabled = true; button.textContent = "Signing in..."; }
      try {
        const response = await fetch(`${apiBase}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 401) throw new Error("Invalid email or password, or your account is inactive.");
          throw new Error(data.message || data.error || `Sign-in failed (${response.status}).`);
        }
        if (!data.token || !data.user) throw new Error("The server returned an incomplete login response.");
        const roleKey = normalizeRole(data.user.role);
        if (selectedRole && normalizeRole(selectedRole) !== roleKey) {
          throw new Error("The selected account type does not match this account.");
        }
        const target = ROLE_DASHBOARDS[roleKey];
        if (!target) throw new Error("This account has no supported dashboard role.");
        sessionStorage.setItem("lms_token", data.token);
        sessionStorage.setItem("lms_user", JSON.stringify(data.user));
        window.location.assign(data.mustChangePassword ? "./change-password.html" : target);
      } catch (error) {
        show(error?.message || "Unable to connect to the login service.");
      } finally {
        if (button) { button.disabled = false; button.textContent = "Sign In →"; }
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
