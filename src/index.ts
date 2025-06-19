// Main library exports
export { default as LoginForm } from './components/LoginForm'
export { default as RegistrationForm } from './components/RegistrationForm'
export { default as AuthDemo } from './components/AuthDemo'

// Auth utilities and types
export { auth } from './lib/auth'
export type { 
  User, 
  Session, 
  AuthResponse, 
  LoginData, 
  SignupData 
} from './lib/auth'

// UI Components
export { Button } from './components/ui/button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
export { Checkbox } from './components/ui/checkbox'
export { Input } from './components/ui/input'
export { Label } from './components/ui/label' 