"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const clsx = require("clsx");
const tailwindMerge = require("tailwind-merge");
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
function getApiUrl() {
  return window.location.origin;
}
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "sunshine",
  "princess",
  "qwerty123",
  "football",
  "baseball",
  "superman",
  "batman",
  "trustno1",
  "hello123",
  "freedom",
  "whatever",
  "qazwsx",
  "password1",
  "12345678",
  "1234567",
  "123123",
  "111111",
  "000000",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1q2w3e4r",
  "1qaz2wsx",
  "q1w2e3r4",
  "abcd1234"
];
function hasSequentialPatterns(password) {
  const sequences = [
    "123456",
    "234567",
    "345678",
    "456789",
    "567890",
    "abcdef",
    "bcdefg",
    "cdefgh",
    "defghi",
    "efghij",
    "ghijkl",
    "hijklm",
    "ijklmn",
    "jklmno",
    "klmnop",
    "lmnopq",
    "mnopqr",
    "nopqrs",
    "opqrst",
    "pqrstu",
    "qrstuv",
    "rstuvw",
    "stuvwx",
    "tuvwxy",
    "uvwxyz",
    "qwerty",
    "wertyu",
    "ertyui",
    "rtyuio",
    "tyuiop",
    "asdfgh",
    "sdfghj",
    "dfghjk",
    "fghjkl",
    "ghjklz"
  ];
  return sequences.some((seq) => password.toLowerCase().includes(seq));
}
function hasRepeatedCharacters(password) {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}
function validatePassword(password) {
  const requirements = [
    {
      id: "length",
      label: "At least 12 characters",
      test: (pwd) => pwd.length >= 12,
      met: false
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A-Z)",
      test: (pwd) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a-z)",
      test: (pwd) => /[a-z]/.test(pwd),
      met: false
    },
    {
      id: "numbers",
      label: "At least one number (0-9)",
      test: (pwd) => /\d/.test(pwd),
      met: false
    },
    {
      id: "special",
      label: "At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)",
      test: (pwd) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
      met: false
    },
    {
      id: "common",
      label: "Not a common password",
      test: (pwd) => !COMMON_PASSWORDS.includes(pwd.toLowerCase()),
      met: false
    },
    {
      id: "sequential",
      label: "No sequential patterns",
      test: (pwd) => !hasSequentialPatterns(pwd),
      met: false
    },
    {
      id: "repeated",
      label: "No more than 2 consecutive identical characters",
      test: (pwd) => !hasRepeatedCharacters(pwd),
      met: false
    }
  ];
  requirements.forEach((req) => {
    req.met = req.test(password);
  });
  const metRequirements = requirements.filter((req) => req.met).length;
  const totalRequirements = requirements.length;
  const score = Math.floor(metRequirements / totalRequirements * 5);
  let label;
  let color;
  if (score === 0) {
    label = "Very Weak";
    color = "text-red-500";
  } else if (score === 1) {
    label = "Weak";
    color = "text-orange-500";
  } else if (score === 2) {
    label = "Fair";
    color = "text-yellow-500";
  } else if (score === 3) {
    label = "Good";
    color = "text-blue-500";
  } else if (score === 4) {
    label = "Strong";
    color = "text-green-500";
  } else {
    label = "Very Strong";
    color = "text-emerald-500";
  }
  return {
    score,
    label,
    color,
    requirements
  };
}
function isPasswordValid(password) {
  const strength = validatePassword(password);
  return strength.requirements.every((req) => req.met);
}
const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};
const getCSRFToken = async () => {
  return `csrf-${Date.now()}`;
};
const makeAuthenticatedRequest = async (url, options) => {
  const csrfToken = await getCSRFToken();
  if (options.body && typeof options.body === "string") {
    const bodyData = JSON.parse(options.body);
    bodyData.csrfToken = csrfToken;
    options.body = JSON.stringify(bodyData);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};
const api = {
  // Auth API calls
  async login(loginData, staySignedIn = true) {
    const data = await makeAuthenticatedRequest(
      `${getApiUrl()}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      }
    );
    if (data.success && data.session && data.user) {
      localStorage.setItem("auth_token", data.session.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("auth_session", JSON.stringify(data.session));
      localStorage.setItem("auth_stay_signed_in", staySignedIn.toString());
      return data.user;
    }
    throw new Error(data.error || "Login failed");
  },
  async signup(signupData) {
    const data = await makeAuthenticatedRequest(
      `${getApiUrl()}/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(signupData)
      }
    );
    if (data.success && data.session && data.user) {
      localStorage.setItem("auth_token", data.session.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("auth_session", JSON.stringify(data.session));
      return data.user;
    }
    throw new Error(data.error || "Signup failed");
  },
  async logout() {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`${getApiUrl()}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.warn("Logout request failed:", error);
      }
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_session");
    localStorage.removeItem("auth_stay_signed_in");
  },
  async requestPasswordReset(email) {
    const data = await makeAuthenticatedRequest(
      `${getApiUrl()}/auth/password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }
    );
    if (!data.success) {
      throw new Error(data.error || "Failed to request password reset");
    }
    return data;
  },
  async changePassword(token, newPassword) {
    const data = await makeAuthenticatedRequest(
      `${getApiUrl()}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword })
      }
    );
    if (!data.success) {
      throw new Error(data.error || "Failed to change password");
    }
    return data;
  },
  async verifyEmail(token) {
    const data = await makeAuthenticatedRequest(
      `${getApiUrl()}/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      }
    );
    if (!data.success) {
      throw new Error(data.error || "Failed to verify email");
    }
    return data;
  },
  async validateSession() {
    const token = getAuthToken();
    if (!token) {
      return false;
    }
    try {
      const response = await fetch(`${getApiUrl()}/auth/session`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  },
  async refreshSession() {
    const token = getAuthToken();
    if (!token) {
      return false;
    }
    try {
      const response = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      if (data.success && data.session) {
        localStorage.setItem("auth_token", data.session.token);
        localStorage.setItem("auth_session", JSON.stringify(data.session));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Session refresh failed:", error);
      return false;
    }
  },
  // Stripe API calls
  async createCheckoutSession(request) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    const res = await fetch(`${getApiUrl()}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      throw new Error("Failed to create checkout session");
    }
    return res.json();
  },
  async createPortalSession(request) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    const res = await fetch(`${getApiUrl()}/create-portal-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      throw new Error("Failed to create portal session");
    }
    return res.json();
  },
  async getSubscriptionStatus() {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    const res = await fetch(`${getApiUrl()}/subscription`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error("Failed to get subscription status");
    }
    return res.json();
  }
};
class AuthClient {
  constructor() {
    __publicField(this, "isDevelopment");
    __publicField(this, "sessionCheckInterval", null);
    __publicField(this, "refreshAttempts", 0);
    __publicField(this, "isRefreshing", false);
    __publicField(this, "refreshPromise", null);
    // Session management configuration
    __publicField(this, "sessionConfig", {
      refreshThreshold: 5,
      // Refresh 5 minutes before expiration
      checkInterval: 1,
      // Check every minute
      maxRefreshAttempts: 3
    });
    this.isDevelopment = false;
    if (typeof window !== "undefined") {
      setTimeout(() => {
        this.initializeSessionManagement().catch((error) => {
          console.error("Failed to initialize session management:", error);
        });
      }, 0);
    }
  }
  /**
   * Initialize session management and start monitoring
   */
  async initializeSessionManagement() {
    if (typeof window === "undefined") return;
    if (this.isAuthenticated()) {
      try {
        const isValid = await this.validateSession();
        if (!isValid) {
          console.log("Session validation failed on initialization, clearing session");
          this.logout();
          return;
        }
        console.log("Session validated successfully on initialization");
      } catch (error) {
        console.error("Session validation error on initialization:", error);
        this.logout();
        return;
      }
      this.startSessionMonitoring();
    }
    window.addEventListener("storage", this.handleStorageChange.bind(this));
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
  }
  /**
   * Handle storage changes from other tabs
   */
  handleStorageChange(event) {
    console.log("🔧 Storage event detected:", {
      key: event.key,
      oldValue: event.oldValue ? "present" : "null",
      newValue: event.newValue ? "present" : "null",
      url: event.url,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (event.key === "auth_token") {
      if (event.newValue) {
        console.log("🔧 Token added/updated in another tab");
        this.startSessionMonitoring();
      } else {
        console.log("🔧 Token removed in another tab - stopping monitoring");
        this.stopSessionMonitoring();
      }
    }
  }
  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (!document.hidden && this.isAuthenticated()) {
      this.checkAndRefreshSession();
    }
  }
  /**
   * Start monitoring session status
   */
  startSessionMonitoring() {
    console.log("🔧 Starting session monitoring:", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      hadExistingInterval: !!this.sessionCheckInterval
    });
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    this.sessionCheckInterval = setInterval(() => {
      this.checkAndRefreshSession();
    }, this.sessionConfig.checkInterval * 60 * 1e3);
    setTimeout(() => {
      console.log("🔧 Delayed first session check (after 2 second delay)");
      this.checkAndRefreshSession();
    }, 2e3);
  }
  /**
   * Stop monitoring session status
   */
  stopSessionMonitoring() {
    console.log("🔧 Stopping session monitoring:", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      hadInterval: !!this.sessionCheckInterval
    });
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
  /**
   * Check if session needs refresh and handle accordingly
   */
  async checkAndRefreshSession() {
    console.log("🔧 Session check started:", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      isAuthenticated: this.isAuthenticated()
    });
    if (!this.isAuthenticated()) {
      console.log("🔧 Session check: User not authenticated, stopping monitoring");
      this.stopSessionMonitoring();
      return;
    }
    const session = this.getCurrentSession();
    if (!session) {
      console.log("🔧 Session check: No session found, logging out");
      this.logout();
      return;
    }
    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const refreshThresholdMs = this.sessionConfig.refreshThreshold * 60 * 1e3;
    console.log("🔧 Session check details:", {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      currentTime: (/* @__PURE__ */ new Date()).toISOString(),
      timeUntilExpiry: Math.round(timeUntilExpiry / 1e3 / 60),
      // minutes
      refreshThreshold: this.sessionConfig.refreshThreshold,
      // minutes
      shouldRefresh: timeUntilExpiry <= refreshThresholdMs,
      isExpired: timeUntilExpiry <= 0
    });
    if (timeUntilExpiry <= 0) {
      console.log("🔧 Session check: Session has expired, logging out");
      this.logout();
      this.emitSessionExpired();
    } else if (timeUntilExpiry <= refreshThresholdMs) {
      console.log(`🔧 Session check: Session expiring in ${Math.round(timeUntilExpiry / 1e3 / 60)} minutes, refreshing token`);
      const refreshSuccess = await this.refreshSession();
      if (!refreshSuccess) {
        console.log("🔧 Session check: Session refresh failed, logging out");
        this.logout();
        this.emitSessionExpired();
      }
    } else {
      const lastValidation = localStorage.getItem("auth_last_validation");
      const now2 = Date.now();
      const validationInterval = 5 * 60 * 1e3;
      if (!lastValidation || now2 - parseInt(lastValidation) > validationInterval) {
        console.log("🔧 Session check: Performing periodic session validation");
        const isValid = await this.validateSession();
        if (isValid) {
          localStorage.setItem("auth_last_validation", now2.toString());
          console.log("🔧 Session check: Periodic validation successful");
        } else {
          console.log("🔧 Session check: Periodic validation failed");
          this.logout();
          this.emitSessionExpired();
        }
      } else {
        console.log("🔧 Session check: Session still valid, skipping validation");
      }
    }
  }
  /**
   * Refresh the current session
   */
  async refreshSession() {
    if (this.isRefreshing && this.refreshPromise) {
      console.log("🔧 Session refresh already in progress, waiting...");
      return await this.refreshPromise;
    }
    if (this.refreshAttempts >= this.sessionConfig.maxRefreshAttempts) {
      console.log("🔧 Max refresh attempts reached, giving up");
      return false;
    }
    this.isRefreshing = true;
    this.refreshAttempts++;
    this.refreshPromise = this.performRefresh();
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
  /**
   * Perform the actual session refresh
   */
  async performRefresh() {
    console.log("🔧 Performing session refresh, attempt:", this.refreshAttempts);
    try {
      const success = await api.refreshSession();
      if (success) {
        console.log("🔧 Session refresh successful");
        this.refreshAttempts = 0;
        return true;
      } else {
        console.log("🔧 Session refresh failed");
        return false;
      }
    } catch (error) {
      console.error("🔧 Session refresh error:", error);
      return false;
    }
  }
  /**
   * Get current session from localStorage
   */
  getCurrentSession() {
    if (typeof window === "undefined") return null;
    const sessionStr = localStorage.getItem("auth_session");
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }
  /**
   * Emit session expired event
   */
  emitSessionExpired() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
  }
  /**
   * Check if we should use mock mode
   */
  shouldUseMock() {
    return this.isDevelopment && (window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1"));
  }
  /**
   * Generate mock user data
   */
  generateMockUser(data) {
    return {
      id: `mock-${Date.now()}`,
      email: data.email,
      firstName: data.firstName || "Mock",
      lastName: data.lastName || "User",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Generate mock session data
   */
  generateMockSession() {
    return {
      id: `session-${Date.now()}`,
      token: `mock-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
      // 24 hours
      refreshToken: `mock-refresh-${Date.now()}`
    };
  }
  /**
   * Login user
   */
  async login(loginData, staySignedIn = true) {
    console.log("🔧 Auth login called with:", {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      staySignedIn
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Using mock login");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!loginData.email || !loginData.password) {
        throw new Error("Email and password are required");
      }
      const user = this.generateMockUser({ email: loginData.email });
      const session = this.generateMockSession();
      localStorage.setItem("auth_token", session.token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_session", JSON.stringify(session));
      localStorage.setItem("auth_stay_signed_in", staySignedIn.toString());
      this.startSessionMonitoring();
      console.log("🔧 Mock login successful:", user);
      return user;
    }
    console.log("🔧 Using real auth service login");
    try {
      const user = await api.login(loginData, staySignedIn);
      this.startSessionMonitoring();
      console.log("🔧 Login successful:", user);
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }
  /**
   * Register new user
   */
  async signup(signupData) {
    console.log("🔧 Auth signup called with:", {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock()
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Using mock signup");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName) {
        throw new Error("All fields are required");
      }
      if (!isPasswordValid(signupData.password)) {
        throw new Error("Password does not meet all requirements");
      }
      const user = this.generateMockUser(signupData);
      const session = this.generateMockSession();
      localStorage.setItem("auth_token", session.token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_session", JSON.stringify(session));
      this.startSessionMonitoring();
      console.log("🔧 Mock registration successful:", user);
      return user;
    }
    console.log("🔧 Using real auth service signup");
    try {
      const user = await api.signup(signupData);
      this.startSessionMonitoring();
      console.log("🔧 Signup successful:", user);
      return user;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }
  /**
   * Logout user
   */
  async logout() {
    var _a;
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    console.log("🔧 Logout called:", {
      hadToken: !!token,
      tokenLength: token == null ? void 0 : token.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stack: (_a = new Error().stack) == null ? void 0 : _a.split("\n").slice(1, 4).join(" | ")
      // Show call stack
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Mock logout successful");
    } else {
      await api.logout();
    }
    this.stopSessionMonitoring();
  }
  /**
   * Validate current session with server
   */
  async validateSession() {
    if (this.shouldUseMock()) {
      return this.isAuthenticated();
    }
    return await api.validateSession();
  }
  /**
   * Request a password reset link
   */
  async requestPasswordReset(email) {
    console.log("🔧 Auth requestPasswordReset called with:", {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      email
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Using mock requestPasswordReset");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!email) {
        throw new Error("Email is required");
      }
      return { success: true, message: "Password reset link sent (mock)" };
    }
    return await api.requestPasswordReset(email);
  }
  /**
   * Change user's password using a reset token
   */
  async changePassword(token, newPassword) {
    console.log("🔧 Auth changePassword called with:", {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      token: token ? "present" : "missing",
      newPassword: newPassword ? "present" : "missing"
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Using mock changePassword");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!token || !newPassword) {
        throw new Error("Token and new password are required");
      }
      return { success: true, message: "Password changed successfully (mock)" };
    }
    return await api.changePassword(token, newPassword);
  }
  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    console.log("🔧 Auth verifyEmail called with:", {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      token: token ? "present" : "missing"
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Using mock verifyEmail");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!token) {
        throw new Error("Token is required");
      }
      return { success: true, message: "Email verified successfully (mock)" };
    }
    return await api.verifyEmail(token);
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    var _a;
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("auth_token");
    console.log("🔧 isAuthenticated check:", {
      hasToken: !!token,
      tokenLength: token == null ? void 0 : token.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stack: (_a = new Error().stack) == null ? void 0 : _a.split("\n").slice(1, 4).join(" | ")
      // Show call stack
    });
    return !!token;
  }
  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  /**
   * Get session expiration time
   */
  getSessionExpiration() {
    const session = this.getCurrentSession();
    return session ? new Date(session.expiresAt) : null;
  }
  /**
   * Check if session is about to expire
   */
  isSessionExpiringSoon() {
    const session = this.getCurrentSession();
    if (!session) return false;
    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const refreshThresholdMs = this.sessionConfig.refreshThreshold * 60 * 1e3;
    return expiresAt - now <= refreshThresholdMs;
  }
  /**
   * Check if user opted to stay signed in
   */
  isStaySignedInEnabled() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("auth_stay_signed_in") === "true";
  }
  /**
   * Get time until session expires
   */
  getTimeUntilExpiration() {
    const session = this.getCurrentSession();
    if (!session) return 0;
    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, expiresAt - now);
  }
  /**
   * Get formatted time until expiration
   */
  getFormattedTimeUntilExpiration() {
    const timeMs = this.getTimeUntilExpiration();
    if (timeMs === 0) return "Expired";
    const hours = Math.floor(timeMs / (1e3 * 60 * 60));
    const minutes = Math.floor(timeMs % (1e3 * 60 * 60) / (1e3 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "Less than 1m";
    }
  }
  /**
   * Update session configuration
   */
  updateSessionConfig(config) {
    this.sessionConfig = { ...this.sessionConfig, ...config };
    if (this.sessionCheckInterval) {
      this.startSessionMonitoring();
    }
  }
  /**
   * Get current session configuration
   */
  getSessionConfig() {
    return { ...this.sessionConfig };
  }
  /**
   * Check if we're using mock mode
   */
  isMockMode() {
    return this.shouldUseMock();
  }
  /**
   * Cleanup method to be called when the app unmounts
   */
  cleanup() {
    this.stopSessionMonitoring();
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageChange.bind(this));
      document.removeEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
    }
  }
}
const auth = new AuthClient();
exports.api = api;
exports.auth = auth;
exports.cn = cn;
exports.isPasswordValid = isPasswordValid;
exports.validatePassword = validatePassword;
//# sourceMappingURL=auth-BnxMxmAu.cjs.map
