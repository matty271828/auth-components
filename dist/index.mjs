import { C, L } from "./LoginForm-dFCmyZ8X.js";
import { P as PasswordStrengthIndicator } from "./RegistrationForm-hUZQ_Z4k.js";
import { R } from "./RegistrationForm-hUZQ_Z4k.js";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { v as validatePassword, i as isPasswordValid, a as auth, c as cn, b as api } from "./auth-GZFwuRYN.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardFooter, B as Button, e as CardContent, L as Label, I as Input } from "./label-DZxY6bki.js";
import { EyeOff, Eye, Loader2, MailCheck, AlertCircle, CheckCircle, User, Mail, Calendar, Crown, ArrowUpRight, Settings, XCircle } from "lucide-react";
import { cva } from "class-variance-authority";
function ChangePasswordForm({ onSuccess, onError, onSwitchToLogin, token }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordStrength = useMemo(() => {
    return validatePassword(newPassword);
  }, [newPassword]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setError("Password does not meet all requirements");
      return;
    }
    if (!token) {
      setError("Reset token is required");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess(false);
    try {
      const response = await auth.changePassword(token, newPassword);
      console.log("Password change response:", response);
      setSuccess(true);
      onSuccess == null ? void 0 : onSuccess();
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Failed to change password";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Password Changed" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Your password has been successfully updated." })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: /* @__PURE__ */ jsx(Button, { onClick: onSwitchToLogin, className: "w-full h-9 sm:h-11 text-sm sm:text-base", children: "Back to Login" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Set New Password" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Enter your new password below" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 sm:space-y-4 px-2 sm:px-6", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "newPassword", className: "text-xs sm:text-sm lg:text-base", children: "New Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "newPassword",
                name: "newPassword",
                type: showNewPassword ? "text" : "password",
                placeholder: "Enter new password",
                value: newPassword,
                onChange: (e) => setNewPassword(e.target.value),
                required: true,
                disabled: isLoading,
                className: "h-9 sm:h-11 text-base sm:text-base pr-10 sm:pr-12"
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-0 top-0 h-full px-2 py-1 sm:px-3 sm:py-2 hover:bg-transparent min-h-0",
                onClick: () => setShowNewPassword(!showNewPassword),
                disabled: isLoading,
                children: [
                  showNewPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3 sm:h-4 sm:w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: showNewPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] }),
          newPassword && /* @__PURE__ */ jsx("div", { className: "mt-1 sm:mt-3 p-1.5 sm:p-3 bg-gray-50 rounded-md border", children: /* @__PURE__ */ jsx(PasswordStrengthIndicator, { strength: passwordStrength, compact: true }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 mb-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", className: "text-xs sm:text-sm lg:text-base", children: "Confirm New Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "confirmPassword",
                name: "confirmPassword",
                type: showConfirmPassword ? "text" : "password",
                placeholder: "Confirm new password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                disabled: isLoading,
                className: "h-9 sm:h-11 text-base sm:text-base pr-10 sm:pr-12"
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-0 top-0 h-full px-2 py-1 sm:px-3 sm:py-2 hover:bg-transparent min-h-0",
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                disabled: isLoading,
                children: [
                  showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3 sm:h-4 sm:w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: showConfirmPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-9 sm:h-11 text-sm sm:text-base", disabled: isLoading || !isPasswordValid(newPassword), children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" }),
          "Changing Password..."
        ] }) : "Change Password" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-center text-muted-foreground", children: [
          "Remember your password?",
          " ",
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onSwitchToLogin,
              className: "text-primary hover:underline font-medium",
              children: "Back to Login"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function EmailVerificationForm({ onSuccess, onError, onSwitchToLogin, token }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Verification token is missing.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess(false);
    try {
      const response = await auth.verifyEmail(token);
      console.log("Email verification response:", response);
      setSuccess(true);
      onSuccess == null ? void 0 : onSuccess();
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Email verification failed";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Email Verified!" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Your email address has been successfully verified." })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: /* @__PURE__ */ jsx(Button, { onClick: onSwitchToLogin, className: "w-full h-9 sm:h-11 text-sm sm:text-base", children: "Back to Login" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Email Verification" }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx(MailCheck, { className: "h-12 w-12 text-green-500" }) }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Confirm your email address to continue." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleVerify, children: [
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-2 sm:space-y-4 px-2 sm:px-6", children: error && /* @__PURE__ */ jsx("div", { className: "p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }) }),
      /* @__PURE__ */ jsx(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-9 sm:h-11 text-sm sm:text-base", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" }),
        "Verifying..."
      ] }) : "Verify Email" }) })
    ] })
  ] });
}
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
function AccountSettings({
  user,
  premiumPlanFeatures = [
    { name: "Unlimited projects" },
    { name: "Advanced analytics" },
    { name: "Priority support" }
  ],
  className
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    if (status === "success") {
      setSuccessMessage("Payment completed successfully! Your subscription has been activated.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "cancelled") {
      setError("Payment was cancelled. You can try again anytime.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);
  const fetchSubscriptionStatus = async () => {
    try {
      const status = await api.getSubscriptionStatus();
      setSubscription(status);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch subscription status:", err);
      setError("Failed to load subscription status");
      setSubscription({
        currentPlan: "free",
        status: "active"
      });
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency
    }).format(price);
  };
  const getStatusConfig = () => {
    if (!subscription) return null;
    switch (subscription.status) {
      case "active":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          text: "Active"
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          text: "Cancelled"
        };
      case "past_due":
        return {
          icon: AlertCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          text: "Past Due"
        };
      case "trialing":
        return {
          icon: Crown,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          text: "Trial"
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          text: "Unknown"
        };
    }
  };
  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await api.createCheckoutSession({
        successUrl: `${window.location.origin}${window.location.pathname}?status=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?status=cancelled`,
        planId: "premium_monthly"
        // You can make this configurable
      });
      window.location.href = response.url;
    } catch (err) {
      console.error("Failed to create checkout session:", err);
      setError("Failed to start upgrade process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await api.createPortalSession({
        returnUrl: `${window.location.origin}${window.location.pathname}`
      });
      window.location.href = response.url;
    } catch (err) {
      console.error("Failed to create portal session:", err);
      setError("Failed to open subscription management. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  if (!subscription) {
    return /* @__PURE__ */ jsx("div", { className: `w-full max-w-4xl mx-auto space-y-6 ${className || ""}`, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center justify-center py-12", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "ml-2", children: "Loading subscription details..." })
    ] }) }) });
  }
  const statusConfig = getStatusConfig();
  const StatusIcon = (statusConfig == null ? void 0 : statusConfig.icon) || AlertCircle;
  return /* @__PURE__ */ jsxs("div", { className: `w-full max-w-md mx-auto space-y-6 ${className || ""}`, children: [
    successMessage && /* @__PURE__ */ jsx(Card, { className: "border-green-200 bg-green-50", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-green-800", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: successMessage })
    ] }) }) }),
    error && /* @__PURE__ */ jsx(Card, { className: "border-red-200 bg-red-50", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: error })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }),
          "Account Details"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Your account information and subscription status" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Email" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: user.email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Member Since" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: formatDate(user.memberSince) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Status:" }),
          /* @__PURE__ */ jsxs(
            Badge,
            {
              variant: subscription.status === "active" ? "default" : "secondary",
              className: `${statusConfig == null ? void 0 : statusConfig.bgColor} ${statusConfig == null ? void 0 : statusConfig.borderColor} ${statusConfig == null ? void 0 : statusConfig.color}`,
              children: [
                /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3 mr-1" }),
                statusConfig == null ? void 0 : statusConfig.text
              ]
            }
          ),
          subscription.currentPlan === "premium" && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "ml-2", children: [
            /* @__PURE__ */ jsx(Crown, { className: "h-3 w-3 mr-1 text-yellow-500" }),
            "Premium"
          ] })
        ] })
      ] })
    ] }),
    subscription.currentPlan === "free" ? /* @__PURE__ */ jsxs(Card, { className: "max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-yellow-500" }),
        "Subscribe Now"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs(Card, { className: "border-primary", children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: formatPrice(12.99, "GBP") }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "/month" })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: premiumPlanFeatures.map((feature, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-500 flex-shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: feature.name })
          ] }, index)) }) })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleUpgrade,
            disabled: isLoading,
            className: "w-full h-9 sm:h-11 text-sm sm:text-base",
            children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Processing..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Crown, { className: "mr-2 h-4 w-4" }),
              "Upgrade Now",
              /* @__PURE__ */ jsx(ArrowUpRight, { className: "ml-2 h-4 w-4" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center mt-1", children: "You'll be redirected to Stripe to complete your payment" })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-yellow-500" }),
        "Subscription Management"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          subscription.amount && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Billing amount:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              formatPrice(subscription.amount, subscription.currency || "GBP"),
              "/",
              subscription.interval
            ] })
          ] }),
          subscription.nextBillingDate && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Next billing:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
              formatDate(subscription.nextBillingDate)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/50 rounded-md", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm mb-2", children: "Plan Features:" }),
          /* @__PURE__ */ jsx("ul", { className: "text-sm text-muted-foreground space-y-1", children: premiumPlanFeatures.map((feature, index) => /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            feature.name
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-2", children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            onClick: handleManageSubscription,
            disabled: isLoading,
            className: "flex-1 h-9 sm:h-10",
            children: [
              isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
              "Manage Subscription"
            ]
          }
        ) }),
        subscription.status === "cancelled" && /* @__PURE__ */ jsx("div", { className: "w-full p-3 bg-orange-50 border border-orange-200 rounded-md", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-orange-800", children: [
          "Your subscription has been cancelled. You'll lose access on ",
          subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : "your next billing date",
          "."
        ] }) }),
        subscription.status === "past_due" && /* @__PURE__ */ jsx("div", { className: "w-full p-3 bg-red-50 border border-red-200 rounded-md", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-800", children: "Your payment is past due. Please update your payment method to continue using premium features." }) })
      ] })
    ] })
  ] });
}
export {
  AccountSettings,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChangePasswordForm,
  C as Checkbox,
  EmailVerificationForm,
  Input,
  Label,
  L as LoginForm,
  PasswordStrengthIndicator,
  R as RegistrationForm,
  auth,
  cn,
  isPasswordValid,
  validatePassword
};
//# sourceMappingURL=index.mjs.map
