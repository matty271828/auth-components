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
      // Use current domain (auth service is already running at /auth)
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = '';
    }
    
    this.isDevelopment = import.meta.env.DEV;
    
    // Initialize session management asynchronously
    if (typeof window !== 'undefined') {
      // Use setTimeout to ensure this runs after the constructor completes
      setTimeout(() => {
        this.initializeSessionManagement().catch(error => {
          console.error('Failed to initialize session management:', error);
        });
      }, 0);
    }
  }

  /**
   * Initialize session management and start monitoring
   */
  private async initializeSessionManagement(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Validate session with server before starting monitoring
    if (this.isAuthenticated()) {
      try {
        const isValid = await this.validateSession();
        if (!isValid) {
          // Session is invalid, clear it and don't start monitoring
          console.log('Session validation failed on initialization, clearing session');
          this.logout();
          return;
        }
        console.log('Session validated successfully on initialization');
      } catch (error) {
        console.error('Session validation error on initialization:', error);
        // On error, clear the session to be safe
        this.logout();
        return;
      }
      
      // Only start monitoring if session is valid
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
    console.log('🔧 Storage event detected:', {
      key: event.key,
      oldValue: event.oldValue ? 'present' : 'null',
      newValue: event.newValue ? 'present' : 'null',
      url: event.url,
      timestamp: new Date().toISOString()
    });
    
    if (event.key === 'auth_token') {
      if (event.newValue) {
        // Token was added/updated in another tab
        console.log('🔧 Token added/updated in another tab');
        this.startSessionMonitoring();
      } else {
        // Token was removed in another tab
        console.log('🔧 Token removed in another tab - stopping monitoring');
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
    console.log('🔧 Starting session monitoring:', {
      timestamp: new Date().toISOString(),
      hadExistingInterval: !!this.sessionCheckInterval
    });
    
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(() => {
      this.checkAndRefreshSession();
    }, this.sessionConfig.checkInterval * 60 * 1000);

    // Add a delay before the first check to give the auth service time to process
    // This prevents immediate validation right after login
    setTimeout(() => {
      console.log('🔧 Delayed first session check (after 2 second delay)');
      this.checkAndRefreshSession();
    }, 2000); // 2 second delay
  }

  /**
   * Stop monitoring session status
   */
  private stopSessionMonitoring(): void {
    console.log('🔧 Stopping session monitoring:', {
      timestamp: new Date().toISOString(),
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
  private async checkAndRefreshSession(): Promise<void> {
    console.log('🔧 Session check started:', {
      timestamp: new Date().toISOString(),
      isAuthenticated: this.isAuthenticated()
    });
    
    if (!this.isAuthenticated()) {
      console.log('🔧 Session check: User not authenticated, stopping monitoring');
      this.stopSessionMonitoring();
      return;
    }

    const session = this.getCurrentSession();
    if (!session) {
      console.log('🔧 Session check: No session found, logging out');
      this.logout();
      return;
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const refreshThresholdMs = this.sessionConfig.refreshThreshold * 60 * 1000;

    console.log('🔧 Session check details:', {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      currentTime: new Date().toISOString(),
      timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60), // minutes
      refreshThreshold: this.sessionConfig.refreshThreshold, // minutes
      shouldRefresh: timeUntilExpiry <= refreshThresholdMs,
      isExpired: timeUntilExpiry <= 0
    });

    if (timeUntilExpiry <= 0) {
      // Session has expired
      console.log('🔧 Session check: Session has expired, logging out');
      this.logout();
      this.emitSessionExpired();
    } else if (timeUntilExpiry <= refreshThresholdMs) {
      // Session is about to expire, refresh it
      console.log(`🔧 Session check: Session expiring in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes, refreshing token`);
      const refreshSuccess = await this.refreshSession();
      if (!refreshSuccess) {
        console.log('🔧 Session check: Session refresh failed, logging out');
        this.logout();
        this.emitSessionExpired();
      }
    } else {
      // Session is still valid, but let's validate it with the server periodically
      // Only validate every 5 minutes to avoid too many requests
      const lastValidation = localStorage.getItem('auth_last_validation');
      const now = Date.now();
      const validationInterval = 5 * 60 * 1000; // 5 minutes
      
      if (!lastValidation || (now - parseInt(lastValidation)) > validationInterval) {
        console.log('🔧 Session check: Performing periodic session validation');
        const isValid = await this.validateSession();
        if (isValid) {
          localStorage.setItem('auth_last_validation', now.toString());
          console.log('🔧 Session check: Periodic validation successful');
        } else {
          console.log('🔧 Session check: Periodic validation failed');
          this.logout();
          this.emitSessionExpired();
        }
      } else {
        console.log('🔧 Session check: Skipping validation (too recent)');
      }
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
    // In development, use mock mode if we're on localhost
    return this.isDevelopment && (
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
    const token = localStorage.getItem('auth_token');
    console.log('🔧 isAuthenticated check:', {
      hasToken: !!token,
      tokenLength: token?.length,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1, 4).join(' | ') // Show call stack
    });
    return !!token;
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
      console.log('🔧 Making login request to:', `${this.baseUrl}/auth/login`);
      
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

      console.log('🔧 Login server response:', {
        success: data.success,
        hasSession: !!data.session,
        hasUser: !!data.user,
        sessionId: data.session?.id,
        sessionTokenLength: data.session?.token?.length,
        sessionExpiresAt: data.session?.expiresAt,
        error: data.error
      });

      if (data.success && data.session && data.user) {
        // Store session token in localStorage
        console.log('🔧 Login - storing token:', {
          tokenLength: data.session.token.length,
          sessionId: data.session.id,
          expiresAt: data.session.expiresAt,
          hasRefreshToken: !!data.session.refreshToken
        });
        
        localStorage.setItem('auth_token', data.session.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_session', JSON.stringify(data.session));
        localStorage.setItem('auth_stay_signed_in', staySignedIn.toString());
        
        // Verify storage immediately
        const storedToken = localStorage.getItem('auth_token');
        const storedSession = localStorage.getItem('auth_session');
        console.log('🔧 Login - storage verification:', {
          tokenMatches: storedToken === data.session.token,
          tokenLength: storedToken?.length,
          sessionStored: !!storedSession
        });
        
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
    console.log('🔧 Logout called:', {
      hadToken: !!token,
      tokenLength: token?.length,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1, 4).join(' | ') // Show call stack
    });
    
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
    localStorage.removeItem('auth_last_validation'); // Clear validation timestamp
    this.csrfToken = null; // Clear CSRF token on logout
    this.csrfTokenExpiresAt = null; // Clear CSRF token expiration on logout
    
    // Reset refresh attempts
    this.refreshAttempts = 0;
    
    console.log('🔧 Logout completed - all tokens cleared');
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
      // Get the full session data for comparison
      const session = this.getCurrentSession();
      console.log('🔧 Session validation - full debug info:', {
        tokenLength: token.length,
        sessionId: session?.id,
        sessionExpiresAt: session?.expiresAt,
        hasRefreshToken: !!session?.refreshToken,
        currentTime: new Date().toISOString(),
        isExpired: session ? new Date(session.expiresAt) < new Date() : null
      });
      
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔧 Session validation response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        // Try to get the full error response
        let errorDetails = '';
        try {
          errorDetails = await response.text();
          console.warn('🔧 Session validation error response:', errorDetails);
        } catch (e) {
          console.warn('🔧 Could not read error response body');
        }
        
        console.warn(`Session validation failed with status: ${response.status}`);
        
        // Clear invalid session
        this.logout();
        return false;
      }

      const data: AuthResponse = await response.json();

      if (!data.success) {
        console.warn('Session validation failed:', data.error || 'Unknown error');
        // Clear invalid session
        this.logout();
        return false;
      }

      console.log('🔧 Session validation successful');
      return true;
    } catch (error) {
      console.warn('Session validation failed:', error);
      // Don't clear session on network errors, only on validation errors
      // This prevents clearing session when the server is temporarily unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error during session validation, keeping session');
        return false; // Return false but don't logout
      }
      
      // For other errors, clear the session
      this.logout();
      return false;
    }
  }

  /**
   * Validate session on app startup - this should be called when the app first loads
   */
  async validateSessionOnStartup(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No auth token found on startup');
      return false;
    }

    console.log('Validating session on app startup...');
    console.log('Token exists:', !!token);
    
    try {
      const isValid = await this.validateSession();
      if (isValid) {
        console.log('Session is valid on startup, starting session monitoring');
        this.startSessionMonitoring();
      } else {
        console.log('Session is invalid on startup, user will need to log in again');
      }
      return isValid;
    } catch (error) {
      console.error('Session validation error on startup:', error);
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
   * Manually trigger session validation (for debugging)
   */
  async debugValidateSession(): Promise<{ isValid: boolean; error?: string; details?: any }> {
    if (typeof window === 'undefined') {
      return { isValid: false, error: 'Not in browser environment' };
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { isValid: false, error: 'No token found' };
    }

    if (this.shouldUseMock()) {
      return { isValid: true, details: { mode: 'mock' } };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();

      let data: AuthResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        return { 
          isValid: false, 
          error: 'Invalid JSON response', 
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
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      };
    }
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

  /**
   * Test auth service connectivity and get detailed error info
   */
  async testAuthServiceDetailed(): Promise<{ 
    reachable: boolean; 
    error?: string; 
    details?: any;
    sessionEndpoint?: any;
  }> {
    if (this.shouldUseMock()) {
      return { reachable: true, details: { mode: 'mock' } };
    }

    try {
      console.log('🔧 Testing auth service connectivity...');
      
      // Test health endpoint
      const healthResponse = await fetch(`${this.baseUrl}/auth/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔧 Health check response:', {
        status: healthResponse.status,
        ok: healthResponse.ok
      });

      let healthData = null;
      if (healthResponse.ok) {
        try {
          healthData = await healthResponse.json();
        } catch (e) {
          healthData = 'Non-JSON response';
        }
      }

      // Test session endpoint with a dummy token to see the error format
      const dummyToken = 'dummy-token-for-testing';
      const sessionResponse = await fetch(`${this.baseUrl}/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${dummyToken}`,
          'Content-Type': 'application/json',
        },
      });

      let sessionError = null;
      if (!sessionResponse.ok) {
        try {
          sessionError = await sessionResponse.text();
        } catch (e) {
          sessionError = 'Could not read error response';
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
      console.error('🔧 Auth service connectivity test failed:', error);
      return { 
        reachable: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      };
    }
  }
}

// Export a default instance
export const auth = new AuthClient(); 