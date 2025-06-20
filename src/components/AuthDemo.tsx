"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import LoginForm from "./LoginForm"
import RegistrationForm from "./RegistrationForm"
import { auth } from "@/lib/auth"
import type { User } from "@/lib/auth"

export default function AuthDemo() {
  const [isLogin, setIsLogin] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isMockMode, setIsMockMode] = useState(false)

  useEffect(() => {
    // Check if we're in mock mode
    setIsMockMode(auth.isMockMode())
  }, [])

  const handleSuccess = (user: User) => {
    setSuccessMessage(`Welcome, ${user.firstName}! You have been successfully ${isLogin ? 'logged in' : 'registered'}.`)
    setErrorMessage("")
  }

  const handleError = (error: string) => {
    setErrorMessage(error)
    setSuccessMessage("")
  }

  const handleFormSwitch = () => {
    setIsLogin(!isLogin)
    setSuccessMessage("")
    setErrorMessage("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        {/* Mock Mode Warning */}
        {isMockMode && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-yellow-700">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Development Mode</p>
                  <p className="text-xs text-yellow-600">
                    Using mock authentication. No real auth service is connected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {errorMessage && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auth Form */}
        {isLogin ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onError={handleError}
            onSwitchToRegister={handleFormSwitch}
          />
        ) : (
          <RegistrationForm 
            onSuccess={handleSuccess}
            onError={handleError}
            onSwitchToLogin={handleFormSwitch}
          />
        )}
      </div>
    </div>
  )
} 