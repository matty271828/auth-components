import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, e as CardContent, L as Label, I as Input, B as Button, d as CardFooter } from "./label-DZxY6bki.js";
import { ChevronUp, ChevronDown, Check, X, EyeOff, Eye, Loader2 } from "lucide-react";
import { v as validatePassword, i as isPasswordValid, a as auth } from "./auth-GZFwuRYN.js";
function PasswordStrengthIndicator({
  strength,
  showRequirements = true,
  compact = true
}) {
  const [showFullRequirements, setShowFullRequirements] = useState(false);
  if (!showRequirements) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm font-medium", children: "Password Strength" }),
        /* @__PURE__ */ jsx("span", { className: `text-xs sm:text-sm font-semibold ${strength.color}`, children: strength.label })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `h-2 rounded-full transition-all duration-300 ${strength.score <= 1 ? "bg-red-500" : strength.score === 2 ? "bg-orange-500" : strength.score === 3 ? "bg-yellow-500" : strength.score === 4 ? "bg-blue-500" : "bg-green-500"}`,
          style: { width: `${strength.score / 5 * 100}%` }
        }
      ) })
    ] });
  }
  if (compact) {
    const metCount = strength.requirements.filter((req) => req.met).length;
    const totalCount = strength.requirements.length;
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm font-medium", children: "Password Strength" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("span", { className: `text-xs sm:text-sm font-semibold ${strength.color}`, children: strength.label }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
            "(",
            metCount,
            "/",
            totalCount,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `h-2 rounded-full transition-all duration-300 ${strength.score <= 1 ? "bg-red-500" : strength.score === 2 ? "bg-orange-500" : strength.score === 3 ? "bg-yellow-500" : strength.score === 4 ? "bg-blue-500" : "bg-green-500"}`,
          style: { width: `${strength.score / 5 * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowFullRequirements(!showFullRequirements),
            className: "flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800 transition-colors",
            children: [
              /* @__PURE__ */ jsx("span", { children: "Requirements" }),
              showFullRequirements ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: `overflow-hidden transition-all duration-300 ${showFullRequirements ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`, children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-1.5 sm:gap-2 pl-2 pb-2", children: strength.requirements.map((requirement) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-start space-x-2 text-xs sm:text-sm transition-colors duration-200 ${requirement.met ? "text-green-600" : "text-gray-500"}`,
            children: [
              requirement.met ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(X, { className: "h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx("span", { className: `leading-tight ${requirement.met ? "font-medium" : ""}`, children: requirement.label })
            ]
          },
          requirement.id
        )) }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs sm:text-sm font-medium", children: "Password Strength" }),
        /* @__PURE__ */ jsx("span", { className: `text-xs sm:text-sm font-semibold ${strength.color}`, children: strength.label })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `h-2 rounded-full transition-all duration-300 ${strength.score <= 1 ? "bg-red-500" : strength.score === 2 ? "bg-orange-500" : strength.score === 3 ? "bg-yellow-500" : strength.score === 4 ? "bg-blue-500" : "bg-green-500"}`,
          style: { width: `${strength.score / 5 * 100}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-700", children: "Requirements:" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-1.5 sm:gap-2", children: strength.requirements.map((requirement) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-start space-x-2 text-xs sm:text-sm transition-colors duration-200 ${requirement.met ? "text-green-600" : "text-gray-500"}`,
          children: [
            requirement.met ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(X, { className: "h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsx("span", { className: `leading-tight ${requirement.met ? "font-medium" : ""}`, children: requirement.label })
          ]
        },
        requirement.id
      )) })
    ] })
  ] });
}
function RegistrationForm({ onSuccess, onError, redirectUrl, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordStrength = useMemo(() => {
    return validatePassword(password);
  }, [password]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("Password does not meet all requirements");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const user = await auth.signup({ firstName, lastName, email, password });
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
  return /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 px-2 sm:px-6 pt-3 sm:pt-6", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-base sm:text-xl lg:text-2xl font-bold text-center", children: "Create Account" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-center text-xs sm:text-sm lg:text-base", children: "Enter your details to create your account" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2 sm:space-y-4 px-2 sm:px-6", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "firstName", className: "text-xs sm:text-sm lg:text-base", children: "First Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "firstName",
                name: "firstName",
                type: "text",
                placeholder: "John",
                value: firstName,
                onChange: (e) => setFirstName(e.target.value),
                required: true,
                disabled: isLoading,
                className: "h-9 sm:h-11 text-base sm:text-base"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "lastName", className: "text-xs sm:text-sm lg:text-base", children: "Last Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "lastName",
                name: "lastName",
                type: "text",
                placeholder: "Doe",
                value: lastName,
                onChange: (e) => setLastName(e.target.value),
                required: true,
                disabled: isLoading,
                className: "h-9 sm:h-11 text-base sm:text-base"
              }
            )
          ] })
        ] }),
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
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
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
                minLength: 12,
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
          ] }),
          password && /* @__PURE__ */ jsx("div", { className: "mt-1 sm:mt-3 p-1.5 sm:p-3 bg-gray-50 rounded-md border", children: /* @__PURE__ */ jsx(PasswordStrengthIndicator, { strength: passwordStrength, compact: true }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 mb-2 sm:mb-4", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", className: "text-xs sm:text-sm lg:text-base", children: "Confirm Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "confirmPassword",
                name: "confirmPassword",
                type: showConfirmPassword ? "text" : "password",
                placeholder: "Confirm your password",
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
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full h-9 sm:h-11 text-sm sm:text-base",
            disabled: isLoading || !isPasswordValid(password),
            children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" }),
              "Creating account..."
            ] }) : "Create Account"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-center text-muted-foreground", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onSwitchToLogin,
              className: "text-primary hover:underline font-medium",
              children: "Sign in"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  PasswordStrengthIndicator as P,
  RegistrationForm as R
};
//# sourceMappingURL=RegistrationForm-hUZQ_Z4k.js.map
