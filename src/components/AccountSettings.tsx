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
  memberSince: string
}

interface AccountSettingsProps {
  user: UserDetails
  premiumPlanFeatures?: PlanFeature[]
  freePlanFeatures?: PlanFeature[]
  className?: string
  successRedirectUrl: string
  cancelRedirectUrl: string
  returnRedirectUrl: string
  priceId: string
}

export default function AccountSettings({
  user,
  premiumPlanFeatures = [
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
      setError("Stripe integration is not properly configured. Please contact support.");
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
    // Validate priceId before proceeding
    if (!priceId) {
      setError("Stripe integration is not properly configured. Please contact support.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Debug logging
      console.log('🔧 Creating checkout session with:', {
        priceId,
        successRedirectUrl,
        cancelRedirectUrl,
        priceIdType: typeof priceId,
        successUrlType: typeof successRedirectUrl,
        cancelUrlType: typeof cancelRedirectUrl
      })

      // Create checkout session with proper redirect URLs
      const response = await api.createCheckoutSession({
        successUrl: successRedirectUrl!,
        cancelUrl: cancelRedirectUrl!,
        priceId: priceId
      })
      
      console.log('🔧 Checkout session response:', response)
      
      // Check if response has a valid URL (handle both 'url' and 'checkoutUrl' properties)
      const checkoutUrl = response.url || response.checkoutUrl
      if (!response || !checkoutUrl) {
        throw new Error(`Invalid response from server: ${JSON.stringify(response)}`)
      }
      
      console.log('🔧 Redirecting to Stripe URL:', checkoutUrl)
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
    } catch (err) {
      console.error("🔧 Failed to create checkout session:", err)
      console.error("🔧 Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      })
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
        returnUrl: returnRedirectUrl!
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
    <div className="bg-stone-50 min-h-screen">
      <div className={`w-full max-w-5xl mx-auto ${className || ""}`}> 
        {/* Account Details Card */}
        <Card className="m-4 sm:m-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>
              Your account information and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.memberSince)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Status:</span>
              <Badge 
                variant={subscription?.status === "free" ? "default" : "secondary"}
                className={`${statusConfig?.bgColor} ${statusConfig?.borderColor} ${statusConfig?.color}`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig?.text}
              </Badge>
              {subscription?.currentPlan === "premium" && (
                <Badge variant="outline" className="ml-2">
                  <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                  Premium
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscribe Section */}
        {subscription?.currentPlan === "free" && (
          <Card className="m-4 sm:m-6">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Upgrade to Premium
              </CardTitle>
              <CardDescription>
                Get unlimited problem tracking and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Display */}
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">
                  {formatPrice(12.99, "GBP")}
                  <span className="text-lg sm:text-xl font-normal text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">What you'll get:</h4>
                <ul className="space-y-2">
                  {premiumPlanFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Button */}
              <div className="space-y-2">
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading || !priceId}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : !priceId ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Stripe Not Configured
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade Now
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {!priceId ? "Stripe integration is not configured. Please contact support." : "Secure payment via Stripe"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 