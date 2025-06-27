"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface SubscriptionDetails {
  currentPlan: "free" | "premium"
  status: "active" | "cancelled" | "past_due" | "trialing"
  nextBillingDate?: string
  amount?: number
  currency?: string
  interval?: "month" | "year"
}

interface AccountSettingsProps {
  user: UserDetails
  subscription: SubscriptionDetails
  freePlanFeatures?: PlanFeature[]
  premiumPlanFeatures?: PlanFeature[]
  onUpgrade?: () => void
  onCancel?: () => void
  onManage?: () => void
  className?: string
}

export default function AccountSettings({
  user,
  subscription,
  freePlanFeatures = [
    { name: "Basic features" },
    { name: "Limited projects" },
    { name: "Community support" }
  ],
  premiumPlanFeatures = [
    { name: "Unlimited projects" },
    { name: "Advanced analytics" },
    { name: "Priority support" }
  ],
  onUpgrade,
  onCancel,
  onManage,
  className
}: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)

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
    switch (subscription.status) {
      case "active":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          text: "Active"
        }
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          text: "Cancelled"
        }
      case "past_due":
        return {
          icon: AlertCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          text: "Past Due"
        }
      case "trialing":
        return {
          icon: Crown,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          text: "Trial"
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

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      // Mock upgrade process
      await new Promise(resolve => setTimeout(resolve, 1000))
      onUpgrade?.()
    } catch (error) {
      console.error("Upgrade failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className || ""}`}>
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
              variant={subscription.status === "active" ? "default" : "secondary"}
              className={`${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.text}
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
              {onManage && (
                <Button 
                  variant="outline"
                  onClick={onManage}
                  className="flex-1 h-9 sm:h-10"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              )}
              
              {onCancel && (
                <Button 
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-9 sm:h-10"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </Button>
              )}
            </div>

            {subscription.status === "cancelled" && (
              <div className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800">
                  Your subscription has been cancelled. You'll lose access on {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : "your next billing date"}.
                </p>
              </div>
            )}

            {subscription.status === "past_due" && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Your payment is past due. Please update your payment method to continue using premium features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 