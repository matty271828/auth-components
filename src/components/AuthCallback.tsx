"use client"

import { useEffect } from 'react';
import { auth } from '@/lib/auth';
import type { User } from '@/lib/types';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const email = params.get('email');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const createdAt = params.get('createdAt');
    const staySignedIn = params.get('staySignedIn') === 'true';

    if (token && userId && email && firstName && lastName && createdAt) {
      const user: User = {
        id: userId,
        email,
        firstName,
        lastName,
        createdAt,
      };

      // Manually set the session and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_stay_signed_in', staySignedIn.toString());

      // Create a mock session object for consistency
      const session = {
        id: `session-${Date.now()}`,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
      localStorage.setItem('auth_session', JSON.stringify(session));

      // Start session monitoring
      auth.startSessionMonitoring();

      // Clear the URL parameters and redirect to the base path
      window.history.replaceState({}, document.title, window.location.pathname);
      onSuccess();
    } else {
      // Handle error case
      const error = params.get('error') || 'OAuth callback is missing required parameters';
      console.error(error);
      window.history.replaceState({}, document.title, window.location.pathname);
      onError(error);
    }
  }, [onSuccess, onError]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Authenticating...</p>
    </div>
  );
}