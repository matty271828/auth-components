// Auth-related types
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
  refreshToken?: string;
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

// Stripe-related types
export interface CreateCheckoutSessionRequest {
    planId?: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CreatePortalSessionRequest {
    returnUrl: string;
}

export interface SubscriptionStatus {
    currentPlan: "free" | "premium";
    status: "active" | "cancelled" | "past_due" | "trialing";
    nextBillingDate?: string;
    amount?: number;
    currency?: string;
    interval?: "month" | "year";
}
