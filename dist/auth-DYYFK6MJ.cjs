"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const clsx = require("clsx");
const tailwindMerge = require("tailwind-merge");
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
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
class AuthClient {
  constructor(baseUrl) {
    __publicField(this, "baseUrl");
    __publicField(this, "csrfToken", null);
    __publicField(this, "csrfTokenExpiresAt", null);
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
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== "undefined") {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = "";
    }
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
        console.log("🔧 Session check: Skipping validation (too recent)");
      }
    }
  }
  /**
   * Refresh the current session
   */
  async refreshSession() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }
    if (this.refreshAttempts >= this.sessionConfig.maxRefreshAttempts) {
      console.log("Max refresh attempts reached, logging out");
      this.logout();
      this.emitSessionExpired();
      return false;
    }
    this.isRefreshing = true;
    this.refreshAttempts++;
    this.refreshPromise = this.performRefresh();
    try {
      const success = await this.refreshPromise;
      if (success) {
        this.refreshAttempts = 0;
      }
      return success;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
  /**
   * Perform the actual refresh operation
   */
  async performRefresh() {
    const session = this.getCurrentSession();
    if (!(session == null ? void 0 : session.refreshToken)) {
      console.log("No refresh token available");
      return false;
    }
    if (this.shouldUseMock()) {
      const newSession = this.generateMockSession();
      localStorage.setItem("auth_token", newSession.token);
      localStorage.setItem("auth_session", JSON.stringify(newSession));
      console.log("Mock session refreshed");
      return true;
    }
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken
        })
      });
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.session) {
        localStorage.setItem("auth_token", data.session.token);
        localStorage.setItem("auth_session", JSON.stringify(data.session));
        if (data.user) {
          localStorage.setItem("auth_user", JSON.stringify(data.user));
        }
        console.log("Session refreshed successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Session refresh failed:", error);
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
      window.dispatchEvent(new CustomEvent("sessionExpired"));
    }
  }
  /**
   * Check if we're in development mode and should use mock responses
   */
  shouldUseMock() {
    return this.isDevelopment && (this.baseUrl.includes("localhost") || this.baseUrl.includes("127.0.0.1"));
  }
  /**
   * Check if current CSRF token is valid and not expired
   */
  isCSRFTokenValid() {
    if (!this.csrfToken || !this.csrfTokenExpiresAt) {
      return false;
    }
    const bufferTime = 5 * 60 * 1e3;
    return Date.now() < this.csrfTokenExpiresAt - bufferTime;
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
   * Get CSRF token for form protection
   */
  async getCSRFToken() {
    if (this.shouldUseMock()) {
      this.csrfToken = `mock-csrf-${Date.now()}`;
      this.csrfTokenExpiresAt = Date.now() + 60 * 60 * 1e3;
      return this.csrfToken;
    }
    try {
      const response = await fetch(`${this.baseUrl}/auth/csrf-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      this.csrfToken = data.token;
      this.csrfTokenExpiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + 60 * 60 * 1e3;
      return data.token;
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      if (this.isDevelopment) {
        console.warn("Using mock CSRF token for development");
        this.csrfToken = `mock-csrf-${Date.now()}`;
        this.csrfTokenExpiresAt = Date.now() + 60 * 60 * 1e3;
        return this.csrfToken;
      }
      throw error;
    }
  }
  /**
   * Ensure we have a valid CSRF token, refreshing if necessary
   */
  async ensureValidCSRFToken() {
    if (!this.isCSRFTokenValid()) {
      console.log("CSRF token expired or invalid, refreshing...");
      await this.getCSRFToken();
    }
    return this.csrfToken;
  }
  /**
   * Make an authenticated request with CSRF token refresh retry logic
   */
  async makeAuthenticatedRequest(url, options, retryCount = 0) {
    const maxRetries = 1;
    try {
      const csrfToken = await this.ensureValidCSRFToken();
      if (options.body && typeof options.body === "string") {
        const bodyData = JSON.parse(options.body);
        bodyData.csrfToken = csrfToken;
        options.body = JSON.stringify(bodyData);
      }
      const response = await fetch(url, options);
      if ((response.status === 401 || response.status === 403) && retryCount < maxRetries) {
        console.log(`Request failed with ${response.status}, refreshing CSRF token and retrying...`);
        this.csrfToken = null;
        this.csrfTokenExpiresAt = null;
        return this.makeAuthenticatedRequest(url, options, retryCount + 1);
      }
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (retryCount < maxRetries) {
        console.log("Request failed, refreshing CSRF token and retrying...");
        this.csrfToken = null;
        this.csrfTokenExpiresAt = null;
        return this.makeAuthenticatedRequest(url, options, retryCount + 1);
      }
      throw error;
    }
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
   * Login user
   */
  async login(loginData, staySignedIn = true) {
    var _a, _b, _c, _d;
    console.log("🔧 Auth login called with:", {
      isDevelopment: this.isDevelopment,
      baseUrl: this.baseUrl,
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
      console.log("🔧 Making login request to:", `${this.baseUrl}/auth/login`);
      const data = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(loginData)
        }
      );
      console.log("🔧 Login server response:", {
        success: data.success,
        hasSession: !!data.session,
        hasUser: !!data.user,
        sessionId: (_a = data.session) == null ? void 0 : _a.id,
        sessionTokenLength: (_c = (_b = data.session) == null ? void 0 : _b.token) == null ? void 0 : _c.length,
        sessionExpiresAt: (_d = data.session) == null ? void 0 : _d.expiresAt,
        error: data.error
      });
      if (data.success && data.session && data.user) {
        console.log("🔧 Login - storing token:", {
          tokenLength: data.session.token.length,
          sessionId: data.session.id,
          expiresAt: data.session.expiresAt,
          hasRefreshToken: !!data.session.refreshToken
        });
        localStorage.setItem("auth_token", data.session.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        localStorage.setItem("auth_session", JSON.stringify(data.session));
        localStorage.setItem("auth_stay_signed_in", staySignedIn.toString());
        const storedToken = localStorage.getItem("auth_token");
        const storedSession = localStorage.getItem("auth_session");
        console.log("🔧 Login - storage verification:", {
          tokenMatches: storedToken === data.session.token,
          tokenLength: storedToken == null ? void 0 : storedToken.length,
          sessionStored: !!storedSession
        });
        this.startSessionMonitoring();
        return data.user;
      }
      throw new Error(data.error || "Login failed");
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
      baseUrl: this.baseUrl,
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
      const data = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/auth/signup`,
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
        this.startSessionMonitoring();
        return data.user;
      }
      throw new Error(data.error || "Signup failed");
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
    } else if (token) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
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
    this.stopSessionMonitoring();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_session");
    localStorage.removeItem("auth_stay_signed_in");
    localStorage.removeItem("auth_last_validation");
    this.csrfToken = null;
    this.csrfTokenExpiresAt = null;
    this.refreshAttempts = 0;
    console.log("🔧 Logout completed - all tokens cleared");
  }
  /**
   * Validate current session
   */
  async validateSession() {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("auth_token");
    if (!token) return false;
    if (this.shouldUseMock()) {
      return true;
    }
    try {
      const session = this.getCurrentSession();
      console.log("🔧 Session validation - full debug info:", {
        tokenLength: token.length,
        sessionId: session == null ? void 0 : session.id,
        sessionExpiresAt: session == null ? void 0 : session.expiresAt,
        hasRefreshToken: !!(session == null ? void 0 : session.refreshToken),
        currentTime: (/* @__PURE__ */ new Date()).toISOString(),
        isExpired: session ? new Date(session.expiresAt) < /* @__PURE__ */ new Date() : null
      });
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log("🔧 Session validation response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      if (!response.ok) {
        let errorDetails = "";
        try {
          errorDetails = await response.text();
          console.warn("🔧 Session validation error response:", errorDetails);
        } catch (e) {
          console.warn("🔧 Could not read error response body");
        }
        console.warn(`Session validation failed with status: ${response.status}`);
        this.logout();
        return false;
      }
      const data = await response.json();
      if (!data.success) {
        console.warn("Session validation failed:", data.error || "Unknown error");
        this.logout();
        return false;
      }
      console.log("🔧 Session validation successful");
      return true;
    } catch (error) {
      console.warn("Session validation failed:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.log("Network error during session validation, keeping session");
        return false;
      }
      this.logout();
      return false;
    }
  }
  /**
   * Validate session on app startup - this should be called when the app first loads
   */
  async validateSessionOnStartup() {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.log("No auth token found on startup");
      return false;
    }
    console.log("Validating session on app startup...");
    console.log("Token exists:", !!token);
    try {
      const isValid = await this.validateSession();
      if (isValid) {
        console.log("Session is valid on startup, starting session monitoring");
        this.startSessionMonitoring();
      } else {
        console.log("Session is invalid on startup, user will need to log in again");
      }
      return isValid;
    } catch (error) {
      console.error("Session validation error on startup:", error);
      this.logout();
      return false;
    }
  }
  /**
   * Health check for auth service
   */
  async healthCheck() {
    if (this.shouldUseMock()) {
      return {
        status: 200,
        domain: "localhost",
        subdomain: "mock",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        mock: true
      };
    }
    try {
      const response = await fetch(`${this.baseUrl}/auth/health`, {
        method: "GET"
      });
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
  /**
   * Get the current base URL (useful for debugging)
   */
  getBaseUrl() {
    return this.baseUrl;
  }
  /**
   * Check if we're using mock mode
   */
  isMockMode() {
    return this.shouldUseMock();
  }
  /**
   * Manually refresh CSRF token
   */
  async refreshCSRFToken() {
    this.csrfToken = null;
    this.csrfTokenExpiresAt = null;
    return await this.getCSRFToken();
  }
  /**
   * Check if current CSRF token is valid (public method)
   */
  isCSRFTokenValidPublic() {
    return this.isCSRFTokenValid();
  }
  /**
   * Get CSRF token expiration time (for debugging)
   */
  getCSRFTokenExpiration() {
    return this.csrfTokenExpiresAt ? new Date(this.csrfTokenExpiresAt) : null;
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
   * Manually trigger session validation (for debugging)
   */
  async debugValidateSession() {
    if (typeof window === "undefined") {
      return { isValid: false, error: "Not in browser environment" };
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return { isValid: false, error: "No token found" };
    }
    if (this.shouldUseMock()) {
      return { isValid: true, details: { mode: "mock" } };
    }
    try {
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        return {
          isValid: false,
          error: "Invalid JSON response",
          details: { responseText, parseError }
        };
      }
      return {
        isValid: data.success,
        error: data.error,
        details: { data, status: response.status }
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      };
    }
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
  /**
   * Test auth service connectivity and get detailed error info
   */
  async testAuthServiceDetailed() {
    if (this.shouldUseMock()) {
      return { reachable: true, details: { mode: "mock" } };
    }
    try {
      console.log("🔧 Testing auth service connectivity...");
      const healthResponse = await fetch(`${this.baseUrl}/auth/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("🔧 Health check response:", {
        status: healthResponse.status,
        ok: healthResponse.ok
      });
      let healthData = null;
      if (healthResponse.ok) {
        try {
          healthData = await healthResponse.json();
        } catch (e) {
          healthData = "Non-JSON response";
        }
      }
      const dummyToken = "dummy-token-for-testing";
      const sessionResponse = await fetch(`${this.baseUrl}/auth/session`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${dummyToken}`,
          "Content-Type": "application/json"
        }
      });
      let sessionError = null;
      if (!sessionResponse.ok) {
        try {
          sessionError = await sessionResponse.text();
        } catch (e) {
          sessionError = "Could not read error response";
        }
      }
      return {
        reachable: healthResponse.ok,
        details: {
          health: healthData,
          healthStatus: healthResponse.status
        },
        sessionEndpoint: {
          status: sessionResponse.status,
          error: sessionError
        }
      };
    } catch (error) {
      console.error("🔧 Auth service connectivity test failed:", error);
      return {
        reachable: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      };
    }
  }
}
const auth = new AuthClient();
exports.auth = auth;
exports.cn = cn;
exports.isPasswordValid = isPasswordValid;
exports.validatePassword = validatePassword;
//# sourceMappingURL=auth-DYYFK6MJ.cjs.map
