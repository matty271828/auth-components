# Session Management System

This authentication system implements a comprehensive session management solution that allows users to stay signed in while ensuring security through automatic token refresh and session expiration.

## Features

### 🔐 Persistent Sessions
- **"Stay signed in" checkbox** - Users can choose between persistent and temporary sessions
- **Automatic token refresh** - Tokens are refreshed before expiration to maintain seamless user experience
- **Cross-tab synchronization** - Login/logout in one tab affects all other tabs
- **Page visibility detection** - Sessions are refreshed when users return to the tab

### ⏰ Smart Expiration
- **Configurable refresh thresholds** - Refresh tokens 5-10 minutes before expiration
- **Automatic logout** - Users are logged out when sessions expire
- **Visual indicators** - Shows when sessions are about to expire
- **Graceful handling** - Failed refresh attempts are handled gracefully

### 🛡️ Security Features
- **CSRF protection** - All requests include CSRF tokens
- **Refresh token rotation** - New refresh tokens are issued with each refresh
- **Maximum retry limits** - Prevents infinite refresh loops
- **Secure storage** - Tokens stored in localStorage with proper cleanup

## How It Works

### Session Types

1. **Persistent Sessions** (Stay signed in = true)
   - Refresh threshold: 10 minutes
   - Check interval: 5 minutes
   - Max refresh attempts: 5
   - Ideal for personal devices

2. **Temporary Sessions** (Stay signed in = false)
   - Refresh threshold: 2 minutes
   - Check interval: 1 minute
   - Max refresh attempts: 2
   - Ideal for shared/public devices

### Session Lifecycle

1. **Login** - User logs in and chooses session type
2. **Monitoring** - System starts monitoring session status
3. **Refresh** - Tokens are automatically refreshed before expiration
4. **Expiration** - User is logged out when session expires
5. **Cleanup** - All session data is cleared on logout

### Automatic Refresh Process

1. System checks session status every minute (configurable)
2. If session expires within refresh threshold, initiate refresh
3. Send refresh token to server
4. Receive new access token and refresh token
5. Update stored session data
6. Continue monitoring

## Usage

### For Users

1. **Login** with email and password
2. **Check "Stay signed in"** for persistent sessions
3. **Uncheck** for temporary sessions (logs out when browser closes)
4. **Monitor session status** in the UI
5. **Manual logout** when done

### For Developers

```typescript
import { useAuth } from '@/lib/useAuth'

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    sessionExpiration, 
    isSessionExpiringSoon,
    login, 
    logout 
  } = useAuth()

  // Check if user is authenticated
  if (isAuthenticated) {
    console.log('User:', user)
    console.log('Session expires:', sessionExpiration)
    console.log('Expiring soon:', isSessionExpiringSoon)
  }
}
```

### Configuration

```typescript
import { auth } from '@/lib/auth'

// Update session configuration
auth.updateSessionConfig({
  refreshThreshold: 10, // minutes
  checkInterval: 5,     // minutes
  maxRefreshAttempts: 5
})

// Get current configuration
const config = auth.getSessionConfig()
```

## API Endpoints

The system expects these endpoints from your auth service:

- `POST /auth/login` - Login with email/password
- `POST /auth/signup` - Register new user
- `POST /auth/refresh` - Refresh session tokens
- `POST /auth/logout` - Logout user
- `GET /auth/session` - Validate current session
- `GET /auth/csrf-token` - Get CSRF token

## Mock Mode

In development, the system uses mock authentication when:
- No auth service URL is configured
- Running on localhost
- Development mode is enabled

Mock sessions last 24 hours and include refresh tokens for testing.

## Security Considerations

- **HTTPS only** - Always use HTTPS in production
- **Token storage** - Tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
- **Refresh token security** - Refresh tokens should be rotated and have shorter lifespans
- **CSRF protection** - All state-changing requests include CSRF tokens
- **Session invalidation** - Server should invalidate sessions on logout

## Browser Support

- Modern browsers with localStorage support
- Cross-tab communication via storage events
- Page visibility API for tab focus detection 