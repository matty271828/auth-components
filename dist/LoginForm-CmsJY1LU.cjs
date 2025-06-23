"use strict";
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const label = require("./label-PtsbujSm.cjs");
const CheckboxPrimitive = require("@radix-ui/react-checkbox");
const lucideReact = require("lucide-react");
const auth = require("./auth-DYYFK6MJ.cjs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const CheckboxPrimitive__namespace = /* @__PURE__ */ _interopNamespaceDefault(CheckboxPrimitive);
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    CheckboxPrimitive__namespace.Root,
    {
      "data-slot": "checkbox",
      className: auth.cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        CheckboxPrimitive__namespace.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "flex items-center justify-center text-current transition-none",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}
function LoginForm({ onSuccess, onError, redirectUrl, onSwitchToRegister }) {
  const [showPassword, setShowPassword] = react.useState(false);
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState("");
  const [email, setEmail] = react.useState("");
  const [password, setPassword] = react.useState("");
  const [staySignedIn, setStaySignedIn] = react.useState(true);
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
        auth.auth.updateSessionConfig({
          refreshThreshold: 10,
          // Refresh 10 minutes before expiration
          checkInterval: 5,
          // Check every 5 minutes
          maxRefreshAttempts: 5
        });
      } else {
        auth.auth.updateSessionConfig({
          refreshThreshold: 2,
          // Refresh 2 minutes before expiration
          checkInterval: 1,
          // Check every minute
          maxRefreshAttempts: 2
        });
      }
      const user = await auth.auth.login({ email, password }, staySignedIn);
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
  return /* @__PURE__ */ jsxRuntime.jsxs(label.Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(label.CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
      /* @__PURE__ */ jsxRuntime.jsx(label.CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Welcome Back" }),
      /* @__PURE__ */ jsxRuntime.jsx(label.CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Enter your credentials to access your account" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(label.CardContent, { className: "space-y-2 sm:space-y-4 px-2 sm:px-6", children: [
        error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(label.Label, { htmlFor: "email", className: "text-xs sm:text-sm lg:text-base", children: "Email" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            label.Input,
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
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-1 mb-2 sm:mb-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(label.Label, { htmlFor: "password", className: "text-xs sm:text-sm lg:text-base", children: "Password" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              label.Input,
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
            /* @__PURE__ */ jsxRuntime.jsxs(
              label.Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-0 top-0 h-full px-2 py-1 sm:px-3 sm:py-2 hover:bg-transparent min-h-0",
                onClick: () => setShowPassword(!showPassword),
                disabled: isLoading,
                children: [
                  showPassword ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { className: "h-3 w-3 sm:h-4 sm:w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: showPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Checkbox,
            {
              id: "staySignedIn",
              checked: staySignedIn,
              onCheckedChange: (checked) => setStaySignedIn(checked),
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            label.Label,
            {
              htmlFor: "staySignedIn",
              className: "text-xs sm:text-sm text-muted-foreground cursor-pointer",
              children: "Stay signed in"
            }
          )
        ] }),
        staySignedIn && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: "You'll remain signed in until you manually sign out or your session expires." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(label.CardFooter, { className: "flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6", children: [
        /* @__PURE__ */ jsxRuntime.jsx(label.Button, { type: "submit", className: "w-full h-9 sm:h-11 text-sm sm:text-base", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" }),
          "Signing in..."
        ] }) : "Sign In" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs sm:text-sm text-center text-muted-foreground", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: onSwitchToRegister,
              className: "text-primary hover:underline font-medium",
              children: "Create account"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
exports.Checkbox = Checkbox;
exports.LoginForm = LoginForm;
//# sourceMappingURL=LoginForm-CmsJY1LU.cjs.map
