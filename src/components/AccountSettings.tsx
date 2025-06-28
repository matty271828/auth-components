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
    <div className="bg-stone-50 pt-8 pb-8">
      <div className={`w-full max-w-5xl mx-auto ${className || ""}`}> 
        {/* Account Details Card */}
        <Card className="mt-0">
          <CardHeader className="pt-0">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Details
            </CardTitle>
            <CardDescription>
              Your account information and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex items-center gap-2">
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
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Subscribe
              </CardTitle>
              <CardDescription>
                Compare plans and upgrade when you're ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plans Comparison */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Current Plan */}
                <Card className="border-2 border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Current Plan
                        </CardTitle>
                        <CardDescription>Free</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {freePlanFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {/* Membership Plan */}
                <Card className="border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Recommended
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          Membership
                        </CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold">
                            {formatPrice(12.99, "GBP")}
                          </span>
                          <span className="text-sm text-muted-foreground">/month</span>
                        </CardDescription>
                      </div>
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
              </div>
              {/* Upgrade Button */}
              <div className="text-center">
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading || !priceId}
                  className="w-full max-w-md h-11 text-base"
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
                      Upgrade to Membership
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {!priceId ? "Stripe integration is not configured. Please contact support." : "You'll be redirected to Stripe to complete your payment"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 