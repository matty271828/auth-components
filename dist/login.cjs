"use strict";
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const checkbox = require("./checkbox-BFi72Qgb.cjs");
const lucideReact = require("lucide-react");
const auth = require("./auth.cjs");
function LoginForm({ onSuccess, onError, redirectUrl }) {
  const [showPassword, setShowPassword] = react.useState(false);
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState("");
  const [email, setEmail] = react.useState("");
  const [password, setPassword] = react.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const user = await auth.auth.login({ email, password });
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
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gray-50", children: /* @__PURE__ */ jsxRuntime.jsxs(checkbox.Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardTitle, { className: "text-2xl font-bold text-center", children: "Welcome Back" }),
      /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardDescription, { className: "text-center", children: "Enter your credentials to access your account" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardContent, { className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(checkbox.Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            checkbox.Input,
            {
              id: "email",
              name: "email",
              type: "email",
              placeholder: "john.doe@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              disabled: isLoading
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(checkbox.Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              checkbox.Input,
              {
                id: "password",
                name: "password",
                type: showPassword ? "text" : "password",
                placeholder: "Enter your password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                disabled: isLoading
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(
              checkbox.Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
                onClick: () => setShowPassword(!showPassword),
                disabled: isLoading,
                children: [
                  showPassword ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: showPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(checkbox.Checkbox, { id: "remember", disabled: isLoading }),
            /* @__PURE__ */ jsxRuntime.jsx(checkbox.Label, { htmlFor: "remember", className: "text-sm font-normal", children: "Remember me" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("a", { href: "#", className: "text-sm text-primary hover:underline", children: "Forgot password?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardFooter, { className: "flex flex-col space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(checkbox.Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Signing in..."
        ] }) : "Sign In" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-center text-muted-foreground", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("a", { href: "#", className: "text-primary hover:underline font-medium", children: "Create account" })
        ] })
      ] })
    ] })
  ] }) });
}
module.exports = LoginForm;
//# sourceMappingURL=login.cjs.map
