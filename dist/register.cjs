"use strict";
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const checkbox = require("./checkbox-BFi72Qgb.cjs");
const lucideReact = require("lucide-react");
const auth = require("./auth.cjs");
function RegistrationForm({ onSuccess, onError, redirectUrl }) {
  const [showPassword, setShowPassword] = react.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = react.useState(false);
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState("");
  const [firstName, setFirstName] = react.useState("");
  const [lastName, setLastName] = react.useState("");
  const [email, setEmail] = react.useState("");
  const [password, setPassword] = react.useState("");
  const [confirmPassword, setConfirmPassword] = react.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const user = await auth.auth.signup({ firstName, lastName, email, password });
      console.log("Registration successful:", user);
      onSuccess == null ? void 0 : onSuccess(user);
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1e3);
      }
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Registration failed";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gray-50", children: /* @__PURE__ */ jsxRuntime.jsxs(checkbox.Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardTitle, { className: "text-2xl font-bold text-center", children: "Create Account" }),
      /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardDescription, { className: "text-center", children: "Enter your details to create your account" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardContent, { className: "space-y-4", children: [
        error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(checkbox.Label, { htmlFor: "firstName", children: "First Name" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              checkbox.Input,
              {
                id: "firstName",
                name: "firstName",
                type: "text",
                placeholder: "John",
                value: firstName,
                onChange: (e) => setFirstName(e.target.value),
                required: true,
                disabled: isLoading
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(checkbox.Label, { htmlFor: "lastName", children: "Last Name" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              checkbox.Input,
              {
                id: "lastName",
                name: "lastName",
                type: "text",
                placeholder: "Doe",
                value: lastName,
                onChange: (e) => setLastName(e.target.value),
                required: true,
                disabled: isLoading
              }
            )
          ] })
        ] }),
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
                minLength: 8,
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
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: "Password must be at least 8 characters long" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(checkbox.Label, { htmlFor: "confirmPassword", children: "Confirm Password" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              checkbox.Input,
              {
                id: "confirmPassword",
                name: "confirmPassword",
                type: showConfirmPassword ? "text" : "password",
                placeholder: "Confirm your password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
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
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                disabled: isLoading,
                children: [
                  showConfirmPassword ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: showConfirmPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(checkbox.Checkbox, { id: "terms", required: true, disabled: isLoading }),
          /* @__PURE__ */ jsxRuntime.jsxs(checkbox.Label, { htmlFor: "terms", className: "text-sm font-normal", children: [
            "I agree to the",
            " ",
            /* @__PURE__ */ jsxRuntime.jsx("a", { href: "#", className: "text-primary hover:underline", children: "Terms of Service" }),
            " ",
            "and",
            " ",
            /* @__PURE__ */ jsxRuntime.jsx("a", { href: "#", className: "text-primary hover:underline", children: "Privacy Policy" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardFooter, { className: "flex flex-col space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(checkbox.Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
          "Creating account..."
        ] }) : "Create Account" }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-center text-muted-foreground", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("a", { href: "#", className: "text-primary hover:underline font-medium", children: "Sign in" })
        ] })
      ] })
    ] })
  ] }) });
}
module.exports = RegistrationForm;
//# sourceMappingURL=register.cjs.map
