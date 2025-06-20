"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { auth } from "@/lib/auth"
import type { User } from "@/lib/auth"

interface LoginFormProps {
  onSuccess?: (user: User) => void
  onError?: (error: string) => void
  redirectUrl?: string
  onSwitchToRegister?: () => void
}

export default function LoginForm({ onSuccess, onError, redirectUrl, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const user = await auth.login({ email, password })
      console.log("Login successful:", user)
      onSuccess?.(user)
      
      // Redirect after a short delay
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-1 sm:p-6 bg-gray-50 py-2 sm:py-8">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto">
        <CardHeader className="space-y-1 px-2 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm lg:text-base">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-2 sm:space-y-4 px-2 sm:px-6">
            {error && (
              <div className="p-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
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
                className="h-9 sm:h-11 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1 mb-2 sm:mb-4">
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
                  disabled={isLoading}
                  className="h-9 sm:h-11 text-sm sm:text-base pr-10 sm:pr-12"
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
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6">
            <Button type="submit" className="w-full h-9 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                Create account
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 