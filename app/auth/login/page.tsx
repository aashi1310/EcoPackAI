"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Mail, Lock, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
      router.push("/")
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError("")

    try {
      await signIn("demo@ecopackai.com", "password123")
      router.push("/")
    } catch (error: any) {
      setError("Demo login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">Welcome Back!</CardTitle>
          </div>
          <CardDescription className="text-green-700 dark:text-green-300">
            Sign in to continue your sustainability journey 🌱
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-800 dark:text-green-200 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-green-600 dark:text-green-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-green-200 dark:border-green-600 focus:border-green-400 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-800 dark:text-green-200 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-green-600 dark:text-green-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-green-200 dark:border-green-600 focus:border-green-400 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-green-200 dark:border-green-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-green-600 dark:text-green-400">Or</span>
              </div>
            </div>

            <Button
              onClick={handleDemoLogin}
              disabled={loading}
              variant="outline"
              className="w-full border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900 bg-transparent"
            >
              <User className="w-4 h-4 mr-2" />
              Try Demo Account
            </Button>

            <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Demo Account:</strong> Experience EcoPackAI with pre-loaded data including 15 scans, 3 earned
                badges, and 78% progress score!
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Email: demo@ecopackai.com | Password: password123
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-green-700 dark:text-green-300">
                Don't have an account?{" "}
                <a href="/auth/signup" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
