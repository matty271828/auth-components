class AuthClient {
  constructor(baseUrl) {
    this.csrfToken = null;
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== "undefined") {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = "";
    }
    this.isDevelopment = false;
  }
  /**
   * Check if we're in development mode and should use mock responses
   */
  shouldUseMock() {
    return this.isDevelopment && true;
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
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
      // 24 hours
    };
  }
  /**
   * Get CSRF token for form protection
   */
  async getCSRFToken() {
    if (this.shouldUseMock()) {
      this.csrfToken = `mock-csrf-${Date.now()}`;
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
      return data.token;
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      if (this.isDevelopment) {
        console.warn("Using mock CSRF token for development");
        this.csrfToken = `mock-csrf-${Date.now()}`;
        return this.csrfToken;
      }
      throw error;
    }
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
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
   * Login user
   */
  async login(loginData) {
    console.log("🔧 Auth login called with:", {
      isDevelopment: this.isDevelopment,
      baseUrl: this.baseUrl,
      shouldUseMock: this.shouldUseMock()
    });
    if (this.shouldUseMock()) {
      console.log("🔧 Using mock login");
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!loginData.email || !loginData.password) {
        throw new Error("Email and password are required");
      }
      if (loginData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      const user = this.generateMockUser({ email: loginData.email });
      const session = this.generateMockSession();
      localStorage.setItem("auth_token", session.token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log("🔧 Mock login successful:", user);
      return user;
    }
    console.log("🔧 Using real auth service login");
    if (!this.csrfToken) {
      await this.getCSRFToken();
    }
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...loginData,
          csrfToken: this.csrfToken
        })
      });
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.session && data.user) {
        localStorage.setItem("auth_token", data.session.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
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
      if (signupData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      const user = this.generateMockUser(signupData);
      const session = this.generateMockSession();
      localStorage.setItem("auth_token", session.token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log("🔧 Mock registration successful:", user);
      return user;
    }
    console.log("🔧 Using real auth service signup");
    if (!this.csrfToken) {
      await this.getCSRFToken();
    }
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...signupData,
          csrfToken: this.csrfToken
        })
      });
      if (!response.ok) {
        throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.session && data.user) {
        localStorage.setItem("auth_token", data.session.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
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
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
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
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    this.csrfToken = null;
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
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!data.success) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Session validation failed:", error);
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
}
const auth = new AuthClient();
export {
  auth
};
//# sourceMappingURL=auth.mjs.map
