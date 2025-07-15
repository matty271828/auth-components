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
  standardPlanFeatures?: PlanFeature[]
  freePlanFeatures?: PlanFeature[]
  className?: string
  successRedirectUrl?: string
  cancelRedirectUrl?: string
  returnRedirectUrl?: string
  priceId?: string
}

export default function AccountSettings({
  user,
  standardPlanFeatures: standardPlanFeatures = [
    { name: "Track Unlimited Problems (vs 5 on free)" },
    { name: "Build a Complete Study Portfolio" },
    { name: "Focus on Learning, Not Management" },
    { name: "Master All Problem Patterns" },
    { name: "Advanced SM-2 Spaced Repetition" }
  ],
  freePlanFeatures = [
    { name: "Track up to 5 problems" },
    { name: "Basic spaced repetition algorithm" },
    { name: "Standard support" }
  ],
  className,
  successRedirectUrl,
  cancelRedirectUrl,
  returnRedirectUrl,
  priceId
}: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Validate priceId on component mount
  useEffect(() => {
    if (!priceId) {
      console.warn("Stripe price ID is not configured. Stripe integration will be disabled.");
      // Don't set error in mock mode, just log a warning
    }
  }, [priceId])

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
      case "standard":
        return {
          icon: Crown,
          color: "text-yellow-500",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          text: "Membership: Active"
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
        // Fallback: check currentPlan if status is not recognized
        if (subscription.currentPlan === "standard") {
          return {
            icon: Crown,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            text: "Standard"
          }
        }
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
    // Validate priceId before proceeding
    if (!priceId) {
      setError("Stripe integration is not available in demo mode.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Create checkout session with proper redirect URLs
      const response = await api.createCheckoutSession({
        successUrl: successRedirectUrl || window.location.href,
        cancelUrl: cancelRedirectUrl || window.location.href,
        priceId: priceId
      })
      
      // Check if response has a valid URL (handle both 'url' and 'checkoutUrl' properties)
      const checkoutUrl = response.url || response.checkoutUrl
      if (!response || !checkoutUrl) {
        throw new Error(`Invalid response from server: ${JSON.stringify(response)}`)
      }
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
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
      // Validate returnRedirectUrl and provide fallback
      const returnUrl = returnRedirectUrl || window.location.href
      
      // Create portal session with return URL
      const response = await api.createPortalSession({
        returnUrl: returnUrl
      })
      
      if (!response.url) {
        throw new Error('No URL received in portal session response')
      }
      
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
    <div className="bg-stone-50">
      <div className={`w-full max-w-4xl mx-auto ${className || ""}`}> 
        {/* Account Details Card */}
        <Card className="m-1 sm:m-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Email</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Member Since</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(user.memberSince)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe Section */}
        {subscription?.currentPlan === "free" && (
          <Card className="m-1 sm:m-2">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                Become a Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Price Display */}
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatPrice(3.99, "USD")}
                  <span className="text-sm sm:text-base font-normal text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Features List - Compact Grid */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">What you'll get:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {standardPlanFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-1 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade Button */}
              <div className="space-y-1">
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading || !priceId}
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Processing...
                    </>
                  ) : !priceId ? (
                    <>
                      <AlertCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Stripe Not Configured
                    </>
                  ) : (
                    <>
                      <Crown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Upgrade Now
                      <ArrowUpRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {!priceId ? "Stripe integration is not configured." : "Secure payment via Stripe"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Management Section */}
        {subscription?.currentPlan === "standard" && (
          <Card className="m-1 sm:m-2">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                Subscription Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Current Plan Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">Current Plan:</span>
                  <Badge variant="secondary" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">
                    <Crown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    Standard
                  </Badge>
                </div>
                
                {subscription.nextBillingDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium">Next Billing Date:</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(subscription.nextBillingDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Manage Subscription Button */}
              <div className="space-y-1">
                <Button 
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Manage Subscription
                      <ArrowUpRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 