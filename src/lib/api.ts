import type { CreateCheckoutSessionRequest, CreatePortalSessionRequest, SubscriptionStatus } from "./types";

// Mock auth instance for now - replace with actual auth library
const getAuthSession = () => {
    // This should be replaced with your actual auth implementation
    return { token: localStorage.getItem('authToken') };
};

const getApiUrl = () => {
    if (window.location.hostname.includes("localhost")) {
        return "http://localhost:8787";
    }
    // Add other environments as needed
    return "https://auth-service.yourdomain.com";
}

const api = {
    async createCheckoutSession(
        request: CreateCheckoutSessionRequest
    ): Promise<{ url: string }> {
        const session = getAuthSession();
        if (!session?.token) {
            throw new Error("User not authenticated");
        }

        const res = await fetch(`${getApiUrl()}/create-checkout-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify(request),
        });

        if (!res.ok) {
            throw new Error("Failed to create checkout session");
        }

        return res.json();
    },

    async createPortalSession(
        request: CreatePortalSessionRequest
    ): Promise<{ url: string }> {
        const session = getAuthSession();
        if (!session?.token) {
            throw new Error("User not authenticated");
        }

        const res = await fetch(`${getApiUrl()}/create-portal-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify(request),
        });

        if (!res.ok) {
            throw new Error("Failed to create portal session");
        }

        return res.json();
    },

    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        const session = getAuthSession();
        if (!session?.token) {
            throw new Error("User not authenticated");
        }

        const res = await fetch(`${getApiUrl()}/subscription`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to get subscription status");
        }

        return res.json();
    },
};

export default api;
