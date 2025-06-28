# Stripe Payment Integration

This document explains how the Stripe payment integration works in the AccountSettings component.

## Overview

The AccountSettings component now integrates with Stripe payment endpoints to handle subscription management. It uses three main endpoints:

1. **Create Checkout Session** - For new subscriptions
2. **Create Customer Portal Session** - For managing existing subscriptions  
3. **Get Subscription Status** - For fetching current subscription details

## API Endpoints

### 1. Create Checkout Session
- **Endpoint**: `POST /auth/create-checkout-session`
- **Purpose**: Creates a Stripe Checkout session for new subscriptions
- **Usage**: When users want to upgrade from free to premium
- **Redirects**:
  - `successUrl` - Where users are redirected after successful payment
  - `cancelUrl` - Where users are redirected if they cancel the payment

### 2. Create Customer Portal Session
- **Endpoint**: `POST /auth/create-portal-session`
- **Purpose**: Creates a Stripe Customer Portal session for existing customers
- **Usage**: When users want to manage their subscription (upgrade, downgrade, cancel)
- **Redirects**:
  - `returnUrl` - Where users are redirected after completing portal actions

### 3. Get Subscription Status
- **Endpoint**: `GET /auth/subscription`
- **Purpose**: Retrieves the current subscription status for a user
- **Usage**: To check if user has free, premium, cancelled, or past_due status

## Implementation Details

### Authentication
All endpoints require a valid session token in the Authorization header:
```
Authorization: Bearer <session-token>
```

### Redirect URL Patterns

#### Success Redirect (successUrl)
- Used in checkout sessions
- Redirects users after successful payment completion
- Typically points to a "thank you" or "subscription activated" page
- Example: `https://yourapp.com/account?status=success`

#### Cancel Redirect (cancelUrl)
- Used in checkout sessions
- Redirects users if they cancel the payment process
- Typically points back to the pricing page or subscription management area
- Example: `https://yourapp.com/account?status=cancelled`

#### Return Redirect (returnUrl)
- Used in customer portal sessions
- Redirects users after they complete actions in the Stripe Customer Portal
- Actions include: upgrading, downgrading, cancelling subscriptions, updating payment methods
- Example: `https://yourapp.com/account`

### Component Features

The AccountSettings component now includes:

1. **Automatic subscription status fetching** on component mount
2. **Real-time error handling** for API failures
3. **Loading states** during API calls
4. **Success/cancel message handling** from redirect URLs
5. **Proper URL parameter cleanup** after showing messages

### Error Handling

The component handles various error scenarios:
- Network failures
- Authentication errors
- API errors
- Payment cancellations

### Security Considerations

- CSRF Protection: Optional CSRF token validation for additional security
- Rate Limiting: All endpoints have rate limiting to prevent abuse
- Database Integration: Subscription data is stored in the database with Stripe customer IDs
- Multi-domain Support: Each subdomain has isolated subscription data

## Usage Example

```tsx
import AccountSettings from "@/components/AccountSettings"

function MyAccountPage() {
  return (
    <AccountSettings
      user={{
        email: "user@example.com",
        firstName: "John",
        lastName: "Doe", 
        memberSince: "2024-01-15"
      }}
    />
  )
}
```

## Configuration

### API Base URL
The API base URL is configured in `src/lib/api.ts`:
- Development: `http://localhost:8787`
- Production: `https://auth-service.yourdomain.com`

### Plan Configuration
The plan ID for checkout sessions can be configured in the `handleUpgrade` function:
```tsx
const response = await api.createCheckoutSession({
  successUrl: `${window.location.origin}${window.location.pathname}?status=success`,
  cancelUrl: `${window.location.origin}${window.location.pathname}?status=cancelled`,
  priceId: "premium_monthly" // Configure this based on your Stripe product setup
})
```

## Testing

To test the integration:

1. **Development Mode**: Use the mock auth implementation in `src/lib/api.ts`
2. **Production Mode**: Ensure your auth service is properly configured
3. **Stripe Test Mode**: Use Stripe test keys for development
4. **Webhook Testing**: Use Stripe CLI for local webhook testing

## Notes

- The system is designed to handle the complete subscription lifecycle without needing webhooks in phase 1
- It relies on the redirect URLs to handle post-payment flows
- All subscription data is fetched from the auth service, not directly from Stripe
- The component gracefully falls back to free plan if subscription status cannot be fetched 