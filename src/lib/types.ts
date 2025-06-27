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
