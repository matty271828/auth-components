import LoginForm from "./login.mjs";
import RegistrationForm from "./register.mjs";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription, B as Button } from "./checkbox-ks-cRpi5.js";
import { e, f, I, L } from "./checkbox-ks-cRpi5.js";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { auth } from "./auth.mjs";
function AuthDemo() {
  const [isLogin, setIsLogin] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMockMode, setIsMockMode] = useState(false);
  useEffect(() => {
    setIsMockMode(auth.isMockMode());
  }, []);
  const handleSuccess = (user) => {
    setSuccessMessage(`Welcome, ${user.firstName}! You have been successfully ${isLogin ? "logged in" : "registered"}.`);
    setErrorMessage("");
  };
  const handleError = (error) => {
    setErrorMessage(error);
    setSuccessMessage("");
  };
  const handleFormSwitch = () => {
    setIsLogin(!isLogin);
    setSuccessMessage("");
    setErrorMessage("");
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-4", children: [
    isMockMode && /* @__PURE__ */ jsx(Card, { className: "border-yellow-200 bg-yellow-50", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-yellow-700", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Development Mode" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-600", children: "Using mock authentication. No real auth service is connected." })
      ] })
    ] }) }) }),
    successMessage && /* @__PURE__ */ jsx(Card, { className: "border-green-200 bg-green-50", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-green-700", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: successMessage })
    ] }) }) }),
    errorMessage && /* @__PURE__ */ jsx(Card, { className: "border-red-200 bg-red-50", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-red-700", children: [
      /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: errorMessage })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-center", children: "Authentication Demo" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-center", children: isMockMode ? "Testing the authentication components with mock data" : "Test the authentication components with the auth service" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: isLogin ? "default" : "outline",
              onClick: () => setIsLogin(true),
              className: "flex-1",
              children: "Login"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: !isLogin ? "default" : "outline",
              onClick: () => setIsLogin(false),
              className: "flex-1",
              children: "Register"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(Button, { variant: "link", onClick: handleFormSwitch, className: "text-sm", children: isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in" }) })
      ] })
    ] }),
    isLogin ? /* @__PURE__ */ jsx(
      LoginForm,
      {
        onSuccess: handleSuccess,
        onError: handleError
      }
    ) : /* @__PURE__ */ jsx(
      RegistrationForm,
      {
        onSuccess: handleSuccess,
        onError: handleError
      }
    )
  ] }) });
}
export {
  AuthDemo,
  Button,
  Card,
  CardContent,
  CardDescription,
  e as CardFooter,
  CardHeader,
  CardTitle,
  f as Checkbox,
  I as Input,
  L as Label,
  LoginForm,
  RegistrationForm,
  auth
};
//# sourceMappingURL=index.mjs.map
