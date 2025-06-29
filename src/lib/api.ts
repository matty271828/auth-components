import type { 
    CreateCheckoutSessionRequest, 
    CreatePortalSessionRequest, 
    SubscriptionStatus,
    LoginData,
    SignupData,
    AuthResponse,
    User,
    CreatePortalSessionResponse
} from "./types";
import { getApiUrl } from "./utils";

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

// Helper function to get CSRF token (simplified version)
const getCSRFToken = async (): Promise<string> => {
    try {
        const response = await fetch(`${getApiUrl()}/auth/csrf-token`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get CSRF token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.token) {
            return data.token;
        } else {
            throw new Error(`Invalid CSRF token response: ${data.message || 'No token in response'}`);
        }
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        throw error;
    }
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async <T>(
    url: string, 
    options: RequestInit
): Promise<T> => {
    const csrfToken = await getCSRFToken();
    
    // Add CSRF token to request body if it's a POST/PUT/PATCH request
    if (options.body && typeof options.body === 'string') {
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
    async login(loginData: LoginData, staySignedIn: boolean = true): Promise<User> {
        const data: AuthResponse = await makeAuthenticatedRequest<AuthResponse>(
            `${getApiUrl()}/auth/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            }
        );

        if (data.success && data.session && data.user) {
            // Store session data
            localStorage.setItem('auth_token', data.session.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            localStorage.setItem('auth_session', JSON.stringify(data.session));
            localStorage.setItem('auth_stay_signed_in', staySignedIn.toString());
            
            return data.user;
        }

        throw new Error(data.error || 'Login failed');
    },

    async signup(signupData: SignupData): Promise<User> {
        const data: AuthResponse = await makeAuthenticatedRequest<AuthResponse>(
            `${getApiUrl()}/auth/signup`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            }
        );

        if (data.success && data.session && data.user) {
            // Store session data
            localStorage.setItem('auth_token', data.session.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            localStorage.setItem('auth_session', JSON.stringify(data.session));
            
            return data.user;
        }

        throw new Error(data.error || 'Signup failed');
    },

    async logout(): Promise<void> {
        const token = getAuthToken();
        if (token) {
            try {
                await fetch(`${getApiUrl()}/auth/logout`, {
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

        // Clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_session');
        localStorage.removeItem('auth_stay_signed_in');
    },

    async requestPasswordReset(email: string): Promise<AuthResponse> {
        const data: AuthResponse = await makeAuthenticatedRequest<AuthResponse>(
            `${getApiUrl()}/auth/password-reset`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            }
        );

        if (!data.success) {
            throw new Error(data.error || 'Failed to request password reset');
        }
        return data;
    },

    async changePassword(token: string, newPassword: string): Promise<AuthResponse> {
        const data: AuthResponse = await makeAuthenticatedRequest<AuthResponse>(
            `${getApiUrl()}/auth/change-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            }
        );

        if (!data.success) {
            throw new Error(data.error || 'Failed to change password');
        }
        return data;
    },

    async verifyEmail(token: string): Promise<AuthResponse> {
        const data: AuthResponse = await makeAuthenticatedRequest<AuthResponse>(
            `${getApiUrl()}/auth/verify-email`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            }
        );

        if (!data.success) {
            throw new Error(data.error || 'Failed to verify email');
        }
        return data;
    },

    async validateSession(): Promise<boolean> {
        const token = getAuthToken();
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${getApiUrl()}/auth/session`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return false;
            }

            const data: AuthResponse = await response.json();
            return data.success;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    },

    async getCSRFToken(): Promise<string> {
        try {
            const response = await fetch(`${getApiUrl()}/auth/csrf-token`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get CSRF token: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Handle the response format with success, message, and token fields
            if (data.success && data.token) {
                console.log('🔧 CSRF token received:', {
                    success: data.success,
                    message: data.message,
                    tokenLength: data.token.length
                });
                return data.token;
            } else {
                throw new Error(`Invalid CSRF token response: ${data.message || 'No token in response'}`);
            }
        } catch (error) {
            console.error('Error getting CSRF token:', error);
            throw error;
        }
    },

    async refreshSession(): Promise<boolean> {
        const token = getAuthToken();
        if (!token) {
            return false;
        }

        try {
            const response = await fetch(`${getApiUrl()}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return false;
            }

            const data: AuthResponse = await response.json();
            if (data.success && data.session) {
                // Update stored session
                localStorage.setItem('auth_token', data.session.token);
                localStorage.setItem('auth_session', JSON.stringify(data.session));
                return true;
            }

            return false;
        } catch (error) {
            console.error('Session refresh failed:', error);
            return false;
        }
    },

    // Stripe API calls
    async createCheckoutSession(
        request: CreateCheckoutSessionRequest
    ): Promise<{ url: string; checkoutUrl?: string }> {
        const token = getAuthToken();
        if (!token) {
            throw new Error("User not authenticated");
        }

        console.log('🔧 API: Creating checkout session with request:', request);
        console.log('🔧 API: Authentication token present:', !!token);

        const res = await fetch(`${getApiUrl()}/auth/create-checkout-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });

        console.log('🔧 API: Response status:', res.status);
        console.log('🔧 API: Response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const errorText = await res.text();
            console.error('🔧 API: Error response body:', errorText);
            throw new Error(`Failed to create checkout session: ${res.status} ${res.statusText}`);
        }

        const responseData = await res.json();
        console.log('🔧 API: Response data:', responseData);
        
        return responseData;
    },

    async createPortalSession(
        request: CreatePortalSessionRequest
    ): Promise<{ url: string }> {
        const token = getAuthToken();
        if (!token) {
            throw new Error("User not authenticated");
        }

        console.log('🔧 API: Creating portal session with request:', request);
        console.log('🔧 API: Authentication token present:', !!token);
        console.log('🔧 API: Making request to:', `${getApiUrl()}/auth/create-portal-session`);

        const res = await fetch(`${getApiUrl()}/auth/create-portal-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });

        console.log('🔧 API: Portal response status:', res.status);
        console.log('🔧 API: Portal response status text:', res.statusText);
        console.log('🔧 API: Portal response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const errorText = await res.text();
            console.error('🔧 API: Portal error response body:', errorText);
            throw new Error(`Failed to create portal session: ${res.status} ${res.statusText}`);
        }

        // Try to get response text first to debug
        const responseText = await res.text();
        console.log('🔧 API: Portal raw response text:', responseText);
        
        let responseData: CreatePortalSessionResponse;
        try {
            responseData = JSON.parse(responseText);
            console.log('🔧 API: Portal parsed response data:', responseData);
        } catch (parseError) {
            console.error('🔧 API: Failed to parse portal response as JSON:', parseError);
            throw new Error('Invalid JSON response from portal session API');
        }
        
        // Map the backend response format to the expected frontend format
        return { url: responseData.portalUrl };
    },

    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        const token = getAuthToken();
        if (!token) {
            throw new Error("User not authenticated");
        }

        console.log('🔧 API: Getting subscription status');
        console.log('🔧 API: Authentication token present:', !!token);
        console.log('🔧 API: Making request to:', `${getApiUrl()}/auth/subscription`);

        const res = await fetch(`${getApiUrl()}/auth/subscription`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('🔧 API: Subscription response status:', res.status);
        console.log('🔧 API: Subscription response status text:', res.statusText);
        console.log('🔧 API: Subscription response headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) {
            const errorText = await res.text();
            console.error('🔧 API: Subscription error response body:', errorText);
            throw new Error(`Failed to get subscription status: ${res.status} ${res.statusText}`);
        }

        // Try to get response text first to debug
        const responseText = await res.text();
        console.log('🔧 API: Subscription raw response text:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('🔧 API: Subscription parsed response data:', data);
        } catch (parseError) {
            console.error('🔧 API: Failed to parse subscription response as JSON:', parseError);
            throw new Error('Invalid JSON response from subscription API');
        }
        
        console.log('🔧 Raw subscription API response:', data);
        
        // Map the API response to the expected SubscriptionStatus format
        if (data.success && data.subscription) {
            const subscription = data.subscription;
            
            // Map "active" status to "standard" for frontend compatibility
            const status: "free" | "standard" | "cancelled" = 
                subscription.status === "active" ? "standard" : 
                subscription.status === "cancelled" ? "cancelled" : "free";
            
            // Determine current plan based on status
            const currentPlan: "free" | "standard" = status === "free" ? "free" : "standard";
            
            const result: SubscriptionStatus = {
                currentPlan,
                status,
                nextBillingDate: subscription.currentPeriodEnd,
                // Note: amount, currency, interval are not provided by the current API
                // These would need to be added to the backend response if needed
            };
            
            console.log('🔧 Mapped subscription status:', result);
            return result;
        }
        
        // Fallback for unexpected response format
        console.log('🔧 No subscription found, returning free plan');
        return {
            currentPlan: "free",
            status: "free"
        };
    },
};

export default api;
