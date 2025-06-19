"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const login = require("./login.cjs");
const register = require("./register.cjs");
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const checkbox = require("./checkbox-BFi72Qgb.cjs");
const lucideReact = require("lucide-react");
const auth = require("./auth.cjs");
function AuthDemo() {
  const [isLogin, setIsLogin] = react.useState(true);
  const [successMessage, setSuccessMessage] = react.useState("");
  const [errorMessage, setErrorMessage] = react.useState("");
  const [isMockMode, setIsMockMode] = react.useState(false);
  react.useEffect(() => {
    setIsMockMode(auth.auth.isMockMode());
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
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gray-50", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full max-w-md space-y-4", children: [
    isMockMode && /* @__PURE__ */ jsxRuntime.jsx(checkbox.Card, { className: "border-yellow-200 bg-yellow-50", children: /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2 text-yellow-700", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertTriangle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm font-medium", children: "Development Mode" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-yellow-600", children: "Using mock authentication. No real auth service is connected." })
      ] })
    ] }) }) }),
    successMessage && /* @__PURE__ */ jsxRuntime.jsx(checkbox.Card, { className: "border-green-200 bg-green-50", children: /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2 text-green-700", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckCircle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm font-medium", children: successMessage })
    ] }) }) }),
    errorMessage && /* @__PURE__ */ jsxRuntime.jsx(checkbox.Card, { className: "border-red-200 bg-red-50", children: /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2 text-red-700", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.XCircle, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm font-medium", children: errorMessage })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntime.jsxs(checkbox.Card, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardHeader, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardTitle, { className: "text-center", children: "Authentication Demo" }),
        /* @__PURE__ */ jsxRuntime.jsx(checkbox.CardDescription, { className: "text-center", children: isMockMode ? "Testing the authentication components with mock data" : "Test the authentication components with the auth service" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(checkbox.CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            checkbox.Button,
            {
              variant: isLogin ? "default" : "outline",
              onClick: () => setIsLogin(true),
              className: "flex-1",
              children: "Login"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            checkbox.Button,
            {
              variant: !isLogin ? "default" : "outline",
              onClick: () => setIsLogin(false),
              className: "flex-1",
              children: "Register"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntime.jsx(checkbox.Button, { variant: "link", onClick: handleFormSwitch, className: "text-sm", children: isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in" }) })
      ] })
    ] }),
    isLogin ? /* @__PURE__ */ jsxRuntime.jsx(
      login,
      {
        onSuccess: handleSuccess,
        onError: handleError
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx(
      register,
      {
        onSuccess: handleSuccess,
        onError: handleError
      }
    )
  ] }) });
}
exports.LoginForm = login;
exports.RegistrationForm = register;
exports.Button = checkbox.Button;
exports.Card = checkbox.Card;
exports.CardContent = checkbox.CardContent;
exports.CardDescription = checkbox.CardDescription;
exports.CardFooter = checkbox.CardFooter;
exports.CardHeader = checkbox.CardHeader;
exports.CardTitle = checkbox.CardTitle;
exports.Checkbox = checkbox.Checkbox;
exports.Input = checkbox.Input;
exports.Label = checkbox.Label;
exports.auth = auth.auth;
exports.AuthDemo = AuthDemo;
//# sourceMappingURL=index.cjs.map
