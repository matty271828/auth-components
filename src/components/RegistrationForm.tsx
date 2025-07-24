"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { auth } from "@/lib/auth"
import type { User } from "@/lib/types"
import { validatePassword } from "@/lib/utils"
import { PasswordStrengthIndicator } from "./ui/password-strength-indicator"
import OAuthButtons from "./OAuthButtons"

interface RegistrationFormProps {
  onSuccess?: (user: User) => void
  onError?: (error: string) => void
  redirectUrl?: string
  onSwitchToLogin?: () => void
}

export default function RegistrationForm({ onSuccess, onError, redirectUrl, onSwitchToLogin }: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [staySignedIn, setStaySignedIn] = useState(true) // Default to true for better UX

  // Calculate password strength whenever password changes
  const passwordStrength = useMemo(() => {
    return validatePassword(password)
  }, [password])

  // Check if form is ready for submission
  const isFormValid = useMemo(() => {
    return password && confirmPassword && password === confirmPassword
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }



    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const user = await auth.signup({ firstName, lastName, email, password })
      console.log("Registration successful:", user)
      onSuccess?.(user)
      
      // Redirect after a short delay
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md mx-auto border-none shadow-none">
      <CardHeader className="space-y-1 px-2 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center text-xs sm:text-sm lg:text-base">Enter your details to create your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-2 sm:space-y-4 px-2 sm:px-6">
          {error && (
            <div className="p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {/* SSO Buttons - Moved above form for better visibility */}
          <div className="space-y-3">
            <OAuthButtons type="signup" onError={setError} onSuccess={onSuccess} staySignedIn={staySignedIn} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>
          
          {/* Single column on mobile, two columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs sm:text-sm lg:text-base">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                type="text" 
                placeholder="John" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
                disabled={isLoading}
                className="h-9 sm:h-11 text-base sm:text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs sm:text-sm lg:text-base">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                type="text" 
                placeholder="Doe" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
                disabled={isLoading}
                className="h-9 sm:h-11 text-base sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs sm:text-sm lg:text-base">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="john.doe@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={isLoading}
              className="h-9 sm:h-11 text-base sm:text-base"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs sm:text-sm lg:text-base">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="h-9 sm:h-11 text-base sm:text-base pr-10 sm:pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 py-1 sm:px-3 sm:py-2 hover:bg-transparent min-h-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
            
            {/* Ultra-compact password strength indicator on mobile */}
            {password && (
              <div className="mt-1 sm:mt-3 p-1.5 sm:p-3 bg-gray-50 rounded-md border">
                <PasswordStrengthIndicator strength={passwordStrength} compact={true} showRequirements={false} />
              </div>
            )}
          </div>

          <div className="space-y-1 mb-2 sm:mb-4">
            <Label htmlFor="confirmPassword" className="text-xs sm:text-sm lg:text-base">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-9 sm:h-11 text-base sm:text-base pr-10 sm:pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 py-1 sm:px-3 sm:py-2 hover:bg-transparent min-h-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>

          {/* Stay signed in checkbox */}
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="staySignedIn"
              checked={staySignedIn}
              onCheckedChange={(checked) => setStaySignedIn(checked as boolean)}
              disabled={isLoading}
            />
            <Label 
              htmlFor="staySignedIn" 
              className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
            >
              Stay signed in
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6">
          <Button 
            type="submit" 
            className="w-full h-9 sm:h-11 text-sm sm:text-base" 
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-xs sm:text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
} 