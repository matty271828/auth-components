// Main library exports
export { default as LoginForm } from './components/LoginForm'
export { default as RegistrationForm } from './components/RegistrationForm'
export { default as ChangePasswordForm } from './components/ChangePasswordForm'
export { default as EmailVerificationForm } from './components/EmailVerificationForm'
export { default as AccountSettings } from './components/AccountSettings'

// Auth utilities and types
export { auth } from './lib/auth'
export type { 
  User, 
  Session, 
  AuthResponse, 
  LoginData, 
  SignupData 
} from './lib/auth'

// Utility functions and types
export { validatePassword, isPasswordValid, cn } from './lib/utils'
export type { PasswordStrength, PasswordRequirement } from './lib/utils'

// UI Components
export { Button } from './components/ui/button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
export { Checkbox } from './components/ui/checkbox'
export { Input } from './components/ui/input'
export { Label } from './components/ui/label'
export { PasswordStrengthIndicator } from './components/ui/password-strength-indicator' 