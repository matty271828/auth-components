/**
 * Authentication utilities for connecting React components to the auth service
 */

import { isPasswordValid } from './utils';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Session {
  id: string;
  token: string;
  expiresAt: string;
  refreshToken?: string; // Add refresh token support
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  session?: Session;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Session management configuration
interface SessionConfig {
  refreshThreshold: number; // Minutes before expiration to refresh token
  checkInterval: number; // How often to check session status (minutes)
  maxRefreshAttempts: number; // Maximum refresh attempts before logout
}

class AuthClient {
  private baseUrl: string;
  private csrfToken: string | null = null;
  private csrfTokenExpiresAt: number | null = null;
  private isDevelopment: boolean;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private refreshAttempts: number = 0;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  
  // Session management configuration
  private sessionConfig: SessionConfig = {
    refreshThreshold: 5, // Refresh 5 minutes before expiration
    checkInterval: 1, // Check every minute
    maxRefreshAttempts: 3
  };

  constructor(baseUrl?: string) {
    // In development, allow overriding the auth service URL
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== 'undefined') {
      // Check for environment variable or use current domain
      const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL;
      this.baseUrl = authServiceUrl || window.location.origin;
    } else {
      this.baseUrl = '';
    }
    
    this.isDevelopment = import.meta.env.DEV;
    
    // Initialize session management
    this.initializeSessionManagement();
  }

  /**
   * Initialize session management and start monitoring
   */
  private initializeSessionManagement(): void {
    if (typeof window === 'undefined') return;

    // Start session monitoring if user is authenticated
    if (this.isAuthenticated()) {
      this.startSessionMonitoring();
    }

    // Listen for storage changes (other tabs logging in/out)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Listen for page visibility changes to refresh session when tab becomes active
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'auth_token') {
      if (event.newValue) {
        // Token was added/updated in another tab
        this.startSessionMonitoring();
      } else {
        // Token was removed in another tab
        this.stopSessionMonitoring();
      }
    }
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (!document.hidden && this.isAuthenticated()) {
      // Page became visible, check if session needs refresh
      this.checkAndRefreshSession();
    }
  }

  /**
   * Start monitoring session status
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(() => {
      this.checkAndRefreshSession();
    }, this.sessionConfig.checkInterval * 60 * 1000);

    // Also check immediately
    this.checkAndRefreshSession();
  }

  /**
   * Stop monitoring session status
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Check if session needs refresh and handle accordingly
   */
  private async checkAndRefreshSession(): Promise<void> {
    if (!this.isAuthenticated()) {
      this.stopSessionMonitoring();
      return;
    }

    const session = this.getCurrentSession();
    if (!session) {
      this.logout();
      return;
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const refreshThresholdMs = this.sessionConfig.refreshThreshold * 60 * 1000;

    if (timeUntilExpiry <= 0) {
      // Session has expired
      console.log('Session has expired, logging out');
      this.logout();
      this.emitSessionExpired();
    } else if (timeUntilExpiry <= refreshThresholdMs) {
      // Session is about to expire, refresh it
      console.log('Session expiring soon, refreshing token');
      await this.refreshSession();
    }
  }

  /**
   * Refresh the current session
   */
  private async refreshSession(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }

    if (this.refreshAttempts >= this.sessionConfig.maxRefreshAttempts) {
      console.log('Max refresh attempts reached, logging out');
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
        this.refreshAttempts = 0; // Reset attempts on successful refresh
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
  private async performRefresh(): Promise<boolean> {
    const session = this.getCurrentSession();
    if (!session?.refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    if (this.shouldUseMock()) {
      // Mock refresh - generate new session
      const newSession = this.generateMockSession();
      localStorage.setItem('auth_token', newSession.token);
      localStorage.setItem('auth_session', JSON.stringify(newSession));
      console.log('Mock session refreshed');
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      
      if (data.success && data.session) {
        // Update stored session
        localStorage.setItem('auth_token', data.session.token);
        localStorage.setItem('auth_session', JSON.stringify(data.session));
        
        // Update user if provided
        if (data.user) {
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        console.log('Session refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }

  /**
   * Get current session from localStorage
   */
  getCurrentSession(): Session | null {
    if (typeof window === 'undefined') return null;
    
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) return null;
    
    try {
      return JSON.parse(sessionStr) as Session;
    } catch {
      return null;
    }
  }

  /**
   * Emit session expired event
   */
  private emitSessionExpired(): void {
    // Dispatch custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sessionExpired'));
    }
  }

  /**
   * Check if we're in development mode and should use mock responses
   */
  private shouldUseMock(): boolean {
    // In development, use mock mode if:
    // 1. We're in development mode AND
    // 2. Either no auth service URL is configured OR we're on localhost
    return this.isDevelopment && (
      !import.meta.env.VITE_AUTH_SERVICE_URL || 
      this.baseUrl.includes('localhost') ||
      this.baseUrl.includes('127.0.0.1')
    );
  }

  /**
   * Check if current CSRF token is valid and not expired
   */
  private isCSRFTokenValid(): boolean {
    if (!this.csrfToken || !this.csrfTokenExpiresAt) {
      return false;
    }
    
    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() < (this.csrfTokenExpiresAt - bufferTime);
  }

  /**
   * Generate mock user data
   */
  private generateMockUser(data: { email: string; firstName?: string; lastName?: string }): User {
    return {
      id: `mock-${Date.now()}`,
      email: data.email,
      firstName: data.firstName || 'Mock',
      lastName: data.lastName || 'User',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate mock session data
   */
  private generateMockSession(): Session {
    return {
      id: `session-${Date.now()}`,
      token: `mock-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  }

  /**
   * Get CSRF token for form protection
   */
  async getCSRFToken(): Promise<string> {
    if (this.shouldUseMock()) {
      this.csrfToken = `mock-csrf-${Date.now()}`;
      this.csrfTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour for mock tokens
      return this.csrfToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/csrf-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.csrfToken = data.token;
      
      // Set expiration time (default to 1 hour if not provided)
      this.csrfTokenExpiresAt = data.expiresAt 
        ? new Date(data.expiresAt).getTime()
        : Date.now() + 60 * 60 * 1000; // 1 hour default
      
      return data.token;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      if (this.isDevelopment) {
        console.warn('Using mock CSRF token for development');
        this.csrfToken = `mock-csrf-${Date.now()}`;
        this.csrfTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour for mock tokens
        return this.csrfToken;
      }
      throw error;
    }
  }

  /**
   * Ensure we have a valid CSRF token, refreshing if necessary
   */
  private async ensureValidCSRFToken(): Promise<string> {
    if (!this.isCSRFTokenValid()) {
      console.log('CSRF token expired or invalid, refreshing...');
      await this.getCSRFToken();
    }
    return this.csrfToken!;
  }

  /**
   * Make an authenticated request with CSRF token refresh retry logic
   */
  private async makeAuthenticatedRequest<T>(
    url: string, 
    options: RequestInit, 
    retryCount: number = 0
  ): Promise<T> {
    const maxRetries = 1; // Only retry once to avoid infinite loops
    
    try {
      // Ensure we have a valid CSRF token
      const csrfToken = await this.ensureValidCSRFToken();
      
      // Add CSRF token to request body if it's a POST/PUT/PATCH request
      if (options.body && typeof options.body === 'string') {
        const bodyData = JSON.parse(options.body);
        bodyData.csrfToken = csrfToken;
        options.body = JSON.stringify(bodyData);
      }

      const response = await fetch(url, options);
      
      // If we get a 401/403, it might be due to expired CSRF token
      if ((response.status === 401 || response.status === 403) && retryCount < maxRetries) {
        console.log(`Request failed with ${response.status}, refreshing CSRF token and retrying...`);
        
        // Clear current token and get a fresh one
        this.csrfToken = null;
        this.csrfTokenExpiresAt = null;
        
        // Retry the request
        return this.makeAuthenticatedRequest(url, options, retryCount + 1);
      }
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (retryCount < maxRetries) {
        console.log('Request failed, refreshing CSRF token and retrying...');
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
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Get session expiration time
   */
  getSessionExpiration(): Date | null {
    const session = this.getCurrentSession();
    return session ? new Date(session.expiresAt) : null;
  }

  /**
   * Check if session is about to expire
   */
  isSessionExpiringSoon(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const refreshThresholdMs = this.sessionConfig.refreshThreshold * 60 * 1000;

    return (expiresAt - now) <= refreshThresholdMs;
  }

  /**
   * Check if user opted to stay signed in
   */
  isStaySignedInEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('auth_stay_signed_in') === 'true';
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiration(): number {
    const session = this.getCurrentSession();
    if (!session) return 0;

    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, expiresAt - now);
  }

  /**
   * Get formatted time until expiration
   */
  getFormattedTimeUntilExpiration(): string {
    const timeMs = this.getTimeUntilExpiration();
    if (timeMs === 0) return 'Expired';

    const hours = Math.floor(timeMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Less than 1m';
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginData, staySignedIn: boolean = true): Promise<User> {
    console.log('🔧 Auth login called with:', { 
      isDevelopment: this.isDevelopment, 
      baseUrl: this.baseUrl, 
      shouldUseMock: this.shouldUseMock(),
      staySignedIn
    });

    if (this.shouldUseMock()) {
      console.log('🔧 Using mock login');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!loginData.email || !loginData.password) {
        throw new Error('Email and password are required');
      }

      const user = this.generateMockUser({ email: loginData.email });
      const session = this.generateMockSession();
      
      // Store in localStorage
      localStorage.setItem('auth_token', session.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_session', JSON.stringify(session));
      localStorage.setItem('auth_stay_signed_in', staySignedIn.toString());
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      console.log('🔧 Mock login successful:', user);
      return user;
    }

    console.log('🔧 Using real auth service login');

    try {
      const data: AuthResponse = await this.makeAuthenticatedRequest<AuthResponse>(
        `${this.baseUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        }
      );

      if (data.success && data.session && data.user) {
        // Store session token in localStorage
        localStorage.setItem('auth_token', data.session.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_session', JSON.stringify(data.session));
        localStorage.setItem('auth_stay_signed_in', staySignedIn.toString());
        
        // Start session monitoring
        this.startSessionMonitoring();
        
        return data.user;
      }

      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async signup(signupData: SignupData): Promise<User> {
    console.log('🔧 Auth signup called with:', { 
      isDevelopment: this.isDevelopment, 
      baseUrl: this.baseUrl, 
      shouldUseMock: this.shouldUseMock() 
    });

    if (this.shouldUseMock()) {
      console.log('🔧 Using mock signup');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName) {
        throw new Error('All fields are required');
      }
      
      if (!isPasswordValid(signupData.password)) {
        throw new Error('Password does not meet all requirements');
      }

      const user = this.generateMockUser(signupData);
      const session = this.generateMockSession();
      
      // Store in localStorage
      localStorage.setItem('auth_token', session.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_session', JSON.stringify(session));
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      console.log('🔧 Mock registration successful:', user);
      return user;
    }

    console.log('🔧 Using real auth service signup');

    try {
      const data: AuthResponse = await this.makeAuthenticatedRequest<AuthResponse>(
        `${this.baseUrl}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData),
        }
      );

      if (data.success && data.session && data.user) {
        // Store session token in localStorage
        localStorage.setItem('auth_token', data.session.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_session', JSON.stringify(data.session));
        
        // Start session monitoring
        this.startSessionMonitoring();
        
        return data.user;
      }

      throw new Error(data.error || 'Signup failed');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    
    if (this.shouldUseMock()) {
      console.log('🔧 Mock logout successful');
    } else if (token) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }

    // Stop session monitoring
    this.stopSessionMonitoring();
    
    // Clear local storage regardless of API call success
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_stay_signed_in');
    this.csrfToken = null; // Clear CSRF token on logout
    this.csrfTokenExpiresAt = null; // Clear CSRF token expiration on logout
    
    // Reset refresh attempts
    this.refreshAttempts = 0;
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    if (this.shouldUseMock()) {
      // Mock session validation - always return true if token exists
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: AuthResponse = await response.json();

      if (!data.success) {
        // Clear invalid session
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Session validation failed:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Health check for auth service
   */
  async healthCheck(): Promise<any> {
    if (this.shouldUseMock()) {
      return {
        status: 200,
        domain: 'localhost',
        subdomain: 'mock',
        timestamp: new Date().toISOString(),
        mock: true
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/health`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get the current base URL (useful for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if we're using mock mode
   */
  isMockMode(): boolean {
    return this.shouldUseMock();
  }

  /**
   * Manually refresh CSRF token
   */
  async refreshCSRFToken(): Promise<string> {
    this.csrfToken = null;
    this.csrfTokenExpiresAt = null;
    return await this.getCSRFToken();
  }

  /**
   * Check if current CSRF token is valid (public method)
   */
  isCSRFTokenValidPublic(): boolean {
    return this.isCSRFTokenValid();
  }

  /**
   * Get CSRF token expiration time (for debugging)
   */
  getCSRFTokenExpiration(): Date | null {
    return this.csrfTokenExpiresAt ? new Date(this.csrfTokenExpiresAt) : null;
  }

  /**
   * Update session configuration
   */
  updateSessionConfig(config: Partial<SessionConfig>): void {
    this.sessionConfig = { ...this.sessionConfig, ...config };
    
    // Restart monitoring with new config if currently monitoring
    if (this.sessionCheckInterval) {
      this.startSessionMonitoring();
    }
  }

  /**
   * Get current session configuration
   */
  getSessionConfig(): SessionConfig {
    return { ...this.sessionConfig };
  }

  /**
   * Cleanup method to be called when the app unmounts
   */
  cleanup(): void {
    this.stopSessionMonitoring();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }
}

// Export a default instance
export const auth = new AuthClient(); 