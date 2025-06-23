import { useState, useEffect, useCallback } from 'react';
import { auth, type User, type Session } from './auth';

export interface UseAuthReturn {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  
  // Session management
  sessionExpiration: Date | null;
  isSessionExpiringSoon: boolean;
  refreshSession: () => Promise<boolean>;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<User>;
  logout: () => Promise<void>;
  
  // Session configuration
  updateSessionConfig: (config: Partial<{
    refreshThreshold: number;
    checkInterval: number;
    maxRefreshAttempts: number;
  }>) => void;
  getSessionConfig: () => {
    refreshThreshold: number;
    checkInterval: number;
    maxRefreshAttempts: number;
  };
  
  // Debug methods
  debugValidateSession: () => Promise<{ isValid: boolean; error?: string; details?: any }>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());
  const [session, setSession] = useState<Session | null>(auth.getCurrentSession());
  const [sessionExpiration, setSessionExpiration] = useState<Date | null>(auth.getSessionExpiration());
  const [isSessionExpiringSoon, setIsSessionExpiringSoon] = useState(auth.isSessionExpiringSoon());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update authentication state
  const updateAuthState = useCallback(() => {
    setIsAuthenticated(auth.isAuthenticated());
    setUser(auth.getCurrentUser());
    setSession(auth.getCurrentSession());
    setSessionExpiration(auth.getSessionExpiration());
    setIsSessionExpiringSoon(auth.isSessionExpiringSoon());
  }, []);

  // Handle session expired event
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('Session expired event received');
      updateAuthState();
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [updateAuthState]);

  // Handle storage changes (other tabs logging in/out)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token' || event.key === 'auth_user' || event.key === 'auth_session') {
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateAuthState]);

  // Initial state update
  useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  // Validate session on app startup
  useEffect(() => {
    const validateOnStartup = async () => {
      if (auth.isAuthenticated()) {
        setIsLoading(true);
        try {
          await auth.validateSessionOnStartup();
          updateAuthState();
        } catch (error) {
          console.error('Startup session validation failed:', error);
          setError('Session validation failed. Please log in again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    validateOnStartup();
  }, [updateAuthState]);

  // Login method
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await auth.login({ email, password });
      updateAuthState();
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  // Signup method
  const signup = useCallback(async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await auth.signup({ email, password, firstName, lastName });
      updateAuthState();
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.logout();
      updateAuthState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  // Refresh session method
  const refreshSession = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Trigger a session validation which will handle refresh if needed
      const isValid = await auth.validateSession();
      updateAuthState();
      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Session refresh failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  // Update session configuration
  const updateSessionConfig = useCallback((config: Partial<{
    refreshThreshold: number;
    checkInterval: number;
    maxRefreshAttempts: number;
  }>) => {
    auth.updateSessionConfig(config);
  }, []);

  // Get session configuration
  const getSessionConfig = useCallback(() => {
    return auth.getSessionConfig();
  }, []);

  // Debug method
  const debugValidateSession = useCallback(async (): Promise<{ isValid: boolean; error?: string; details?: any }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await auth.debugValidateSession();
      updateAuthState();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Session debug validation failed';
      setError(errorMessage);
      return { isValid: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  return {
    isAuthenticated,
    user,
    session,
    sessionExpiration,
    isSessionExpiringSoon,
    refreshSession,
    login,
    signup,
    logout,
    updateSessionConfig,
    getSessionConfig,
    debugValidateSession,
    isLoading,
    error,
  };
} 