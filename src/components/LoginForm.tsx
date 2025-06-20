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
}

export default function LoginForm({ onSuccess, onError, redirectUrl }: LoginFormProps) {
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto">
        <CardHeader className="space-y-2 sm:space-y-1 px-4 sm:px-6 pt-6 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 sm:space-y-4 px-4 sm:px-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
                className="h-11 sm:h-10 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
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
                  className="h-11 sm:h-10 text-base pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent min-h-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 px-4 sm:px-6 pb-6 sm:pb-6">
            <Button type="submit" className="w-full h-11 sm:h-10 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Create account
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 