/**
 * Authentication utilities for connecting React components to the auth service
 */

import { isPasswordValid } from './utils';
import api from './api';
import type { User, Session, AuthResponse, LoginData, SignupData } from './types';

// Session management configuration
interface SessionConfig {
  refreshThreshold: number; // Minutes before expiration to refresh token
  checkInterval: number; // How often to check session status (minutes)
  maxRefreshAttempts: number; // Maximum refresh attempts before logout
}

class AuthClient {
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

  constructor() {
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
        console.log('🔧 Session check: Session still valid, skipping validation');
      }
    }
  }

  /**
   * Refresh the current session
   */
  private async refreshSession(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔧 Session refresh already in progress, waiting...');
      return await this.refreshPromise;
    }

    if (this.refreshAttempts >= this.sessionConfig.maxRefreshAttempts) {
      console.log('🔧 Max refresh attempts reached, giving up');
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
  private async performRefresh(): Promise<boolean> {
    console.log('🔧 Performing session refresh, attempt:', this.refreshAttempts);
    
    try {
      const success = await api.refreshSession();
      
      if (success) {
        console.log('🔧 Session refresh successful');
        this.refreshAttempts = 0; // Reset attempts on success
        return true;
      } else {
        console.log('🔧 Session refresh failed');
        return false;
      }
    } catch (error) {
      console.error('🔧 Session refresh error:', error);
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
    // Dispatch custom event for other parts of the app to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
  }

  /**
   * Check if we should use mock mode
   */
  private shouldUseMock(): boolean {
    // In development, use mock mode if we're on localhost
    return this.isDevelopment && (
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1')
    );
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
   * Login user
   */
  async login(loginData: LoginData, staySignedIn: boolean = true): Promise<User> {
    console.log('🔧 Auth login called with:', { 
      isDevelopment: this.isDevelopment, 
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
      const user = await api.login(loginData, staySignedIn);
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      console.log('🔧 Login successful:', user);
      return user;
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
      const user = await api.signup(signupData);
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      console.log('🔧 Signup successful:', user);
      return user;
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
    } else {
      await api.logout();
    }

    // Stop session monitoring
    this.stopSessionMonitoring();
  }

  /**
   * Validate current session with server
   */
  async validateSession(): Promise<boolean> {
    if (this.shouldUseMock()) {
      return this.isAuthenticated();
    }

    return await api.validateSession();
  }

  /**
   * Request a password reset link
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    console.log('🔧 Auth requestPasswordReset called with:', {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      email
    });

    if (this.shouldUseMock()) {
      console.log('🔧 Using mock requestPasswordReset');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!email) {
        throw new Error('Email is required');
      }
      return { success: true, message: 'Password reset link sent (mock)' };
    }

    return await api.requestPasswordReset(email);
  }

  /**
   * Change user's password using a reset token
   */
  async changePassword(token: string, newPassword: string): Promise<AuthResponse> {
    console.log('🔧 Auth changePassword called with:', {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      token: token ? 'present' : 'missing',
      newPassword: newPassword ? 'present' : 'missing'
    });

    if (this.shouldUseMock()) {
      console.log('🔧 Using mock changePassword');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }
      return { success: true, message: 'Password changed successfully (mock)' };
    }

    return await api.changePassword(token, newPassword);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    console.log('🔧 Auth verifyEmail called with:', {
      isDevelopment: this.isDevelopment,
      shouldUseMock: this.shouldUseMock(),
      token: token ? 'present' : 'missing'
    });

    if (this.shouldUseMock()) {
      console.log('🔧 Using mock verifyEmail');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!token) {
        throw new Error('Token is required');
      }
      return { success: true, message: 'Email verified successfully (mock)' };
    }

    return await api.verifyEmail(token);
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
   * Check if we're using mock mode
   */
  isMockMode(): boolean {
    return this.shouldUseMock();
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

// Create and export the auth instance
export const auth = new AuthClient();

// Re-export types for convenience
export type { User, Session, AuthResponse, LoginData, SignupData }; 