import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardFooter, B as Button, e as CardContent, L as Label, I as Input } from "./label-DZxY6bki.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, Loader2, EyeOff, Eye } from "lucide-react";
import { c as cn, a as auth } from "./auth-GZFwuRYN.js";
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        CheckboxPrimitive.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "flex items-center justify-center text-current transition-none",
          children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}
function LoginForm({ onSuccess, onError, redirectUrl, onSwitchToRegister }) {
  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (staySignedIn) {
        auth.updateSessionConfig({
          refreshThreshold: 10,
          // Refresh 10 minutes before expiration
          checkInterval: 5,
          // Check every 5 minutes
          maxRefreshAttempts: 5
        });
      } else {
        auth.updateSessionConfig({
          refreshThreshold: 2,
          // Refresh 2 minutes before expiration
          checkInterval: 1,
          // Check every minute
          maxRefreshAttempts: 2
        });
      }
      const user = await auth.login({ email, password }, staySignedIn);
      console.log("Login successful:", user);
      onSuccess == null ? void 0 : onSuccess(user);
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1e3);
      }
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Login failed";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setIsLoading(true);
    setError("");
    setResetSuccess(false);
    try {
      const response = await auth.requestPasswordReset(email);
      console.log("Password reset requested:", response);
      setResetSuccess(true);
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Failed to send reset link";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleBackToLogin = () => {
    setView("login");
    setError("");
    setResetSuccess(false);
  };
  if (view === "passwordReset") {
    if (resetSuccess) {
      return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Check your inbox" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "A password reset link has been sent to your email address." })
        ] }),
        /* @__PURE__ */ jsx(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: /* @__PURE__ */ jsx(Button, { onClick: handleBackToLogin, className: "w-full h-9 sm:h-11 text-sm sm:text-base", children: "Back to Login" }) })
      ] });
    }
    return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Reset your password" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Enter your email to receive a password reset link" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePasswordReset, children: [
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 sm:space-y-4 px-2 sm:px-6", children: [
          error && /* @__PURE__ */ jsx("div", { className: "p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 mb-4", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "resetEmail", className: "text-xs sm:text-sm lg:text-base", children: "Email" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "resetEmail",
                name: "email",
                type: "email",
                placeholder: "john.doe@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                disabled: isLoading,
                className: "h-9 sm:h-11 text-base sm:text-base"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: [
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-9 sm:h-11 text-sm sm:text-base", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" }),
            "Sending..."
          ] }) : "Send Reset Link" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-center text-muted-foreground", children: [
            "Remember your password?",
            " ",
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleBackToLogin,
                className: "text-primary hover:underline font-medium",
                children: "Back to Login"
              }
            )
          ] })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Welcome Back" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Enter your credentials to access your account" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 sm:space-y-4 px-2 sm:px-6", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "text-xs sm:text-sm lg:text-base", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              name: "email",
              type: "email",
              placeholder: "john.doe@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              disabled: isLoading,
              className: "h-9 sm:h-11 text-base sm:text-base"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 mb-2 sm:mb-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", className: "text-xs sm:text-sm lg:text-base", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "password",
                name: "password",
                type: showPassword ? "text" : "password",
                placeholder: "Enter your password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
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
                onClick: () => setShowPassword(!showPassword),
                disabled: isLoading,
                children: [
                  showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3 sm:h-4 sm:w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: showPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "staySignedIn",
              checked: staySignedIn,
              onCheckedChange: (checked) => setStaySignedIn(checked),
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ jsx(
            Label,
            {
              htmlFor: "staySignedIn",
              className: "text-xs sm:text-sm text-muted-foreground cursor-pointer",
              children: "Stay signed in"
            }
          )
        ] }),
        staySignedIn && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "You'll remain signed in until you manually sign out or your session expires." })
      ] }),
      /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-9 sm:h-11 text-sm sm:text-base", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" }),
          "Signing in..."
        ] }) : "Sign In" }),
        /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-between items-center text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
            "Don't have an account?",
            " ",
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onSwitchToRegister,
                className: "text-primary hover:underline font-medium",
                children: "Create account"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setView("passwordReset"),
              className: "text-primary hover:underline font-medium",
              children: "Forgot password?"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  Checkbox as C,
  LoginForm as L
};
//# sourceMappingURL=LoginForm-dFCmyZ8X.js.map
