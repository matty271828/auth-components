"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { 
  User, 
  Mail, 
  Calendar, 
  Crown,
  Settings,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import api from "@/lib/api"
import type { SubscriptionStatus } from "@/lib/types"

interface PlanFeature {
  name: string
  description?: string
}

interface UserDetails {
  email: string
  firstName: string
  lastName: string
  memberSince: string
}

interface AccountSettingsProps {
  user: UserDetails
  premiumPlanFeatures?: PlanFeature[]
  className?: string
}

export default function AccountSettings({
  user,
  premiumPlanFeatures = [
    { name: "Unlimited projects" },
    { name: "Advanced analytics" },
    { name: "Priority support" }
  ],
  className
}: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check for redirect status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const status = urlParams.get('status')
    
    if (status === 'success') {
      setSuccessMessage("Payment completed successfully! Your subscription has been activated.")
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (status === 'cancelled') {
      setError("Payment was cancelled. You can try again anytime.")
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Fetch subscription status on component mount
  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await api.getSubscriptionStatus()
      setSubscription(status)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch subscription status:", err)
      setError("Failed to load subscription status")
      // Fallback to free plan if we can't fetch status
      setSubscription({
        currentPlan: "free",
        status: "free"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  const getStatusConfig = () => {
    if (!subscription) return null
    
    switch (subscription.status) {
      case "free":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          text: "Free Plan"
        }
      case "premium":
        return {
          icon: Crown,
          color: "text-yellow-500",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          text: "Premium"
        }
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          text: "Cancelled"
        }
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          text: "Unknown"
        }
    }
  }

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Create checkout session with proper redirect URLs
      const response = await api.createCheckoutSession({
        successUrl: `${window.location.origin}${window.location.pathname}?status=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?status=cancelled`,
        planId: "premium_monthly" // You can make this configurable
      })
      
      // Redirect to Stripe Checkout
      window.location.href = response.url
    } catch (err) {
      console.error("Failed to create checkout session:", err)
      setError("Failed to start upgrade process. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Create portal session with return URL
      const response = await api.createPortalSession({
        returnUrl: `${window.location.origin}${window.location.pathname}`
      })
      
      // Redirect to Stripe Customer Portal
      window.location.href = response.url
    } catch (err) {
      console.error("Failed to create portal session:", err)
      setError("Failed to open subscription management. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while fetching subscription
  if (!subscription) {
    return (
      <div className={`w-full max-w-4xl mx-auto space-y-6 ${className || ""}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading subscription details...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig?.icon || AlertCircle

  return (
    <div className={`w-full max-w-md mx-auto space-y-6 ${className || ""}`}>
      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{successMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription>
            Your account information and subscription status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.memberSince)}</p>
              </div>
            </div>
          </div>

          {/* Subscription Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge 
              variant={subscription.status === "free" ? "default" : "secondary"}
              className={`${statusConfig?.bgColor} ${statusConfig?.borderColor} ${statusConfig?.color}`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig?.text}
            </Badge>
            {subscription.currentPlan === "premium" && (
              <Badge variant="outline" className="ml-2">
                <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                Premium
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {subscription.currentPlan === "free" ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Subscribe Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Premium Plan Card */}
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatPrice(12.99, "GBP")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {premiumPlanFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-9 sm:h-11 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-1">
              You'll be redirected to Stripe to complete your payment
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Subscription Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan Details */}
            <div className="space-y-3">
              {subscription.amount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Billing amount:</span>
                  <span className="font-medium">
                    {formatPrice(subscription.amount, subscription.currency || "GBP")}/{subscription.interval}
                  </span>
                </div>
              )}
              
              {subscription.nextBillingDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(subscription.nextBillingDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Plan Features Summary */}
            <div className="p-3 bg-muted/50 rounded-md">
              <h4 className="font-medium text-sm mb-2">Plan Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {premiumPlanFeatures.map((feature, index) => (
                  <li key={index}>• {feature.name}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="flex-1 h-9 sm:h-10"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="mr-2 h-4 w-4" />
                )}
                Manage Subscription
              </Button>
            </div>

            {subscription.status === "cancelled" && (
              <div className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  Your subscription has been cancelled. You'll lose access on {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : "your next billing date"}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 