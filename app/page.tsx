"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Leaf,
  Recycle,
  Award,
  Upload,
  MessageCircle,
  MapPin,
  AlertCircle,
  Moon,
  Sun,
  User,
  Lightbulb,
  Shield,
  Play,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useUserData } from "@/hooks/use-user-data"
import { useLocation } from "@/hooks/use-location"
import { useTheme } from "@/hooks/use-theme"
import EcoPalChatbot from "@/components/EcoPalChatbot"
import LocationTips from "@/components/LocationTips"
import GamificationDashboard from "@/components/GamificationDashboard"
import MiniGames from "@/components/MiniGames"
import EcoAlternatives from "@/components/EcoAlternatives"
import AIEcoCoach from "@/components/AIEcoCoach"
import TrashToTreasure from "@/components/TrashToTreasure"
import EcoCertifications from "@/components/EcoCertifications"
import PackagingStoryboard from "@/components/PackagingStoryboard"

interface AnalysisResult {
  components: Array<{
    name: string
    material: string
    recyclable: boolean
    plasticCode?: string
    disposalTip: string
  }>
  ecoScore: number
  carbonFootprint: string
  greenTip: string
  alternative: string
  alternatives: Array<{
    name: string
    brand: string
    ecoScore: number
    reason: string
    image: string
  }>
  diyTips: Array<{
    title: string
    description: string
    difficulty: string
    icon: string
  }>
  storyboard: Array<{
    frame: number
    title: string
    description: string
    image: string
  }>
  summary: {
    material: string
    recyclable: string
    plasticCode: string
    disposalTip: string
    ecoRating: number
    greenTip: string
  }
  gamification: {
    badgeProgress: string
    progressScore: number
    motivationalMessage: string
    weeklyChallenge: string
  }
}

export default function EcoPackAI() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { userData, addScan } = useUserData(user?.uid || null)
  const { location, loading: locationLoading, error: locationError, requestLocation } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [productDescription, setProductDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !location) {
      requestLocation()
    }
  }, [user, location, requestLocation])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const analyzePackaging = async () => {
    if (!productDescription.trim() && !image) return

    setLoading(true)
    setAnalysisError(null)

    try {
      const formData = new FormData()
      formData.append("description", productDescription)
      formData.append("location", location?.city || "")
      formData.append("userId", user?.uid || "")
      if (image) {
        formData.append("image", image)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const result = await response.json()
      setAnalysis(result)

      // Add scan to user data
      if (user && addScan) {
        const newBadges = addScan({
          description: productDescription,
          ecoScore: result.ecoScore,
          location: location?.city || "Unknown",
          category: "General",
        })

        if (newBadges && newBadges.newBadges.length > 0) {
          // Show badge notification
          newBadges.newBadges.forEach((badge) => {
            setTimeout(() => {
              alert(`🎉 New Badge Earned: ${badge.emoji} ${badge.name}!\n${badge.description}`)
            }, 1000)
          })
        }
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      setAnalysisError(error.message || "Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
    if (score >= 5) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
    return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 8) return "🟢"
    if (score >= 5) return "🟡"
    return "🔴"
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-green-700 dark:text-green-300">Loading EcoPackAI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-green-200 dark:border-green-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">EcoPackAI</CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Please sign in to start your sustainability journey! 🌱
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center dark:bg-gray-800">
            <Button
              onClick={() => (window.location.href = "/auth/login")}
              className="w-full bg-green-600 hover:bg-green-700 text-white mb-3"
            >
              Sign In
            </Button>
            <Button
              onClick={() => (window.location.href = "/auth/signup")}
              variant="outline"
              className="w-full border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900"
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-200">EcoPackAI</h1>
            <Button onClick={toggleTheme} variant="ghost" size="sm" className="ml-4 text-green-600 dark:text-green-400">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-lg text-green-700 dark:text-green-300 max-w-2xl mx-auto">
            Welcome back, {user.displayName || user.email}! Your intelligent sustainability assistant. 🌱
          </p>
          {userData && (
            <div className="flex items-center justify-center gap-4 mt-2 text-sm">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                📦 {userData.totalScans} Scans
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                🏅 {userData.ecoProgressScore}% Progress
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                🔥 {userData.currentStreak} Day Streak
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                ✨ {userData.ecoPoints} EcoPoints
              </Badge>
            </div>
          )}
          {location && (
            <div className="flex items-center justify-center gap-1 mt-2 text-green-600 dark:text-green-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {location.city}, {location.country}
              </span>
            </div>
          )}
          {locationError && (
            <div className="flex items-center justify-center gap-1 mt-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{locationError}</span>
            </div>
          )}
        </div>

        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-green-100 dark:bg-green-800">
            <TabsTrigger
              value="analyze"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
            >
              <Camera className="w-4 h-4 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
            >
              <Award className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="coach"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger
              value="certifications"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
            >
              <Shield className="w-4 h-4 mr-2" />
              Certified
            </TabsTrigger>
            <TabsTrigger
              value="games"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
            >
              <Play className="w-4 h-4 mr-2" />
              Play & Earn
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {/* Input Form */}
            <Card className="border-green-200 dark:border-green-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Recycle className="w-5 h-5" />
                  Analyze Your Product Packaging
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Describe your product or upload an image to get detailed sustainability insights
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-green-800 dark:text-green-200 font-medium">
                      Product Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="e.g., Coca-Cola plastic bottle with label, or describe the packaging materials..."
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      className="border-green-200 dark:border-green-600 focus:border-green-400 min-h-[100px] dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-green-800 dark:text-green-200 font-medium">
                        Upload Image (Optional)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="border-green-200 dark:border-green-600 focus:border-green-400 dark:bg-gray-700 dark:text-white"
                        />
                        <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {analysisError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-300 text-sm">{analysisError}</span>
                  </div>
                )}

                <Button
                  onClick={analyzePackaging}
                  disabled={loading || (!productDescription.trim() && !image)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                >
                  {loading ? "Analyzing..." : "🔍 Analyze Packaging"}
                </Button>
              </CardContent>
            </Card>

            {/* Location-Aware Tips */}
            {location && <LocationTips location={location} />}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6">
                {/* Eco Score Card */}
                <Card className="border-green-200 dark:border-green-700 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                    <CardTitle className="text-green-800 dark:text-green-200 flex items-center justify-between">
                      <span>Eco-Impact Analysis</span>
                      <Badge className={`text-lg px-3 py-1 ${getScoreColor(analysis.ecoScore)}`}>
                        {getScoreEmoji(analysis.ecoScore)} {analysis.ecoScore}/10
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                          📦 Packaging Components
                        </h3>
                        <div className="space-y-3">
                          {analysis.components.map((component, index) => (
                            <div
                              key={index}
                              className="p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-green-800 dark:text-green-200">{component.name}</span>
                                <Badge variant={component.recyclable ? "default" : "destructive"}>
                                  {component.recyclable ? "♻️ Recyclable" : "🚫 Not Recyclable"}
                                </Badge>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                <strong>Material:</strong> {component.material}
                                {component.plasticCode && ` (${component.plasticCode})`}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                <strong>Disposal:</strong> {component.disposalTip}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-700">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🌍 Carbon Footprint</h4>
                          <p className="text-amber-700 dark:text-amber-300">{analysis.carbonFootprint}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">♻️ Green Tip</h4>
                          <p className="text-green-700 dark:text-green-300">{analysis.greenTip}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            🌱 Eco-Friendly Alternative
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300">{analysis.alternative}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eco Alternatives */}
                {analysis.alternatives && <EcoAlternatives alternatives={analysis.alternatives} />}

                {/* Trash to Treasure DIY Tips */}
                {analysis.diyTips && <TrashToTreasure diyTips={analysis.diyTips} />}

                {/* Packaging Storyboard */}
                {analysis.storyboard && <PackagingStoryboard storyboard={analysis.storyboard} />}

                {/* Summary Card */}
                <Card className="border-green-200 dark:border-green-700 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                    <CardTitle className="text-green-800 dark:text-green-200">📋 Quick Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-gray-800">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">Material</div>
                        <div className="text-green-800 dark:text-green-200 font-semibold">
                          {analysis.summary.material}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">Recyclable</div>
                        <div className="text-green-800 dark:text-green-200 font-semibold">
                          {analysis.summary.recyclable}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">Plastic Code</div>
                        <div className="text-green-800 dark:text-green-200 font-semibold">
                          {analysis.summary.plasticCode}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">Eco Rating</div>
                        <div className="text-green-800 dark:text-green-200 font-semibold">
                          {getScoreEmoji(analysis.summary.ecoRating)} {analysis.summary.ecoRating}/10
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg md:col-span-2">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">Disposal Tip</div>
                        <div className="text-green-800 dark:text-green-200 font-semibold text-sm">
                          {analysis.summary.disposalTip}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <GamificationDashboard userData={userData} />
          </TabsContent>

          <TabsContent value="coach">
            <AIEcoCoach userData={userData} />
          </TabsContent>

          <TabsContent value="certifications">
            <EcoCertifications userData={userData} />
          </TabsContent>

          <TabsContent value="games">
            <MiniGames userData={userData} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Info Card */}
              <Card className="border-green-200 dark:border-green-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                  <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                    <User className="w-5 h-5" />👤 Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 dark:bg-gray-800">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-amber-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                          {user.displayName || "EcoPackAI User"}
                        </h3>
                        <p className="text-green-600 dark:text-green-400">{user.email}</p>
                        <p className="text-sm text-green-500 dark:text-green-500">
                          Member since {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-green-200 dark:border-green-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-green-800 dark:text-green-200 font-medium">Account Type</Label>
                          <p className="text-green-700 dark:text-green-300">
                            {user.email === "demo@ecopackai.com" ? "🎭 Demo Account" : "👤 Standard User"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-green-800 dark:text-green-200 font-medium">Location</Label>
                          <p className="text-green-700 dark:text-green-300">
                            {location ? `📍 ${location.city}, ${location.country}` : "🌍 Location not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              {userData && (
                <Card className="border-green-200 dark:border-green-700 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                    <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                      <Award className="w-5 h-5" />📊 Your Impact Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {userData.totalScans}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">📦 Products Analyzed</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-900 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {userData.badges.filter((b) => b.earned).length}
                        </div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">🏆 Badges Earned</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {userData.ecoProgressScore}%
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">🌱 Eco Progress</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {userData.ecoPoints}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">✨ EcoPoints</div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🌍 Environmental Impact</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 dark:text-green-400">CO₂ Saved:</span>
                          <span className="font-semibold text-green-800 dark:text-green-200 ml-2">
                            {(userData.totalScans * 0.15).toFixed(1)} kg
                          </span>
                        </div>
                        <div>
                          <span className="text-green-600 dark:text-green-400">Waste Reduced:</span>
                          <span className="font-semibold text-green-800 dark:text-green-200 ml-2">
                            {(userData.totalScans * 0.08).toFixed(1)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            {userData && userData.scans.length > 0 && (
              <Card className="border-green-200 dark:border-green-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                  <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Camera className="w-5 h-5" />📈 Recent Scan Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 dark:bg-gray-800">
                  <div className="space-y-3">
                    {userData.scans
                      .slice(-5)
                      .reverse()
                      .map((scan, index) => (
                        <div
                          key={scan.id}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-green-800 dark:text-green-200">{scan.description}</h4>
                            <div className="flex items-center gap-4 text-sm text-green-600 dark:text-green-400 mt-1">
                              <span>📍 {scan.location}</span>
                              <span>📅 {new Date(scan.timestamp).toLocaleDateString()}</span>
                              <span>🏷️ {scan.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${
                                scan.certification === "green"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : scan.certification === "low-impact"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {scan.certification === "green" ? "✅" : scan.certification === "low-impact" ? "⚠️" : "❌"}
                              {scan.ecoScore}/10
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badge Collection & EcoMilestones */}
            <Card className="border-green-200 dark:border-green-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Award className="w-5 h-5" />🏅 Your Badge Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <p className="text-green-700 dark:text-green-300 mb-6">
                  Collect badges by completing challenges and making sustainable choices!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: "plastic-free-pro",
                      name: "Plastic-Free Pro",
                      emoji: "🧼",
                      description: "Scan 5 recyclable products.",
                    },
                    {
                      id: "eco-explorer",
                      name: "Eco Explorer",
                      emoji: "🌍",
                      description: "Scan products from 3 different locations.",
                    },
                    {
                      id: "green-guru",
                      name: "Green Guru",
                      emoji: "🌱",
                      description: "Achieve an average EcoScore of 8+.",
                    },
                    {
                      id: "green-product-hunter",
                      name: "Green Product Hunter",
                      emoji: "🏹",
                      description: "Complete the weekly EcoHunt challenge.",
                    },
                    {
                      id: "eco-genius",
                      name: "Eco Genius",
                      emoji: "🧠",
                      description: "Achieve 90%+ on an AI Quiz.",
                    },
                    {
                      id: "sorting-master",
                      name: "Sorting Master",
                      emoji: "♻️",
                      description: "Achieve 90%+ accuracy in the EcoSort game.",
                    },
                    {
                      id: "puzzle-champion",
                      name: "Puzzle Champion",
                      emoji: "🧩",
                      description: "Solve 10 packaging puzzles.",
                    },
                    {
                      id: "zero-waste-hero",
                      name: "Zero-Waste Hero",
                      emoji: "🗑️",
                      description: "Reach 50 total scans with an average EcoScore >8.",
                    },
                  ].map((badge) => {
                    const hasBadge = userData?.badges.some((b) => b.id === badge.id)
                    const earnedBadge = userData?.badges.find((b) => b.id === badge.id)
                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          hasBadge
                            ? "bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 border-green-300 dark:border-green-600 shadow-md"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-60"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{badge.emoji}</div>
                          <h3
                            className={`font-semibold mb-1 ${
                              hasBadge ? "text-green-800 dark:text-green-200" : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {badge.name}
                          </h3>
                          <p
                            className={`text-xs mb-3 ${
                              hasBadge ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-500"
                            }`}
                          >
                            {badge.description}
                          </p>
                          {hasBadge ? (
                            <div className="space-y-1">
                              <Badge className="bg-green-600 text-white">Earned! ✨</Badge>
                              {earnedBadge?.earnedDate && (
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {new Date(earnedBadge.earnedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge className="bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              Locked 🔒
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Settings & Actions */}
            <Card className="border-green-200 dark:border-green-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
                <CardTitle className="text-green-800 dark:text-green-200">⚙️ Settings & Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-green-800 dark:text-green-200 font-medium">🌍 Location Services</Label>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        Get location-specific recycling tips and guidelines
                      </p>
                      <Button
                        onClick={requestLocation}
                        disabled={locationLoading}
                        variant="outline"
                        className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900 bg-transparent"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {locationLoading ? "Getting Location..." : "Update Location"}
                      </Button>
                    </div>

                    <div>
                      <Label className="text-green-800 dark:text-green-200 font-medium">🎨 Theme Preference</Label>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        Switch between light and dark modes
                      </p>
                      <Button
                        onClick={toggleTheme}
                        variant="outline"
                        className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900 bg-transparent"
                      >
                        {theme === "light" ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                        {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-green-800 dark:text-green-200 font-medium">📊 Data Management</Label>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        Export your scan history and progress data
                      </p>
                      <Button
                        onClick={() => {
                          if (userData) {
                            const dataStr = JSON.stringify(userData, null, 2)
                            const dataBlob = new Blob([dataStr], { type: "application/json" })
                            const url = URL.createObjectURL(dataBlob)
                            const link = document.createElement("a")
                            link.href = url
                            link.download = `ecopack-data-${new Date().toISOString().split("T")[0]}.json`
                            link.click()
                            URL.revokeObjectURL(url)
                          }
                        }}
                        variant="outline"
                        className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 bg-transparent"
                      >
                        📥 Export Data
                      </Button>
                    </div>

                    <div>
                      <Label className="text-green-800 dark:text-green-200 font-medium">🚪 Account Actions</Label>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        Sign out of your EcoPackAI account
                      </p>
                      <Button
                        onClick={() => {
                          if (confirm("Are you sure you want to sign out?")) {
                            signOut()
                            window.location.href = "/auth/login"
                          }
                        }}
                        variant="outline"
                        className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        🚪 Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Chatbot Button */}
      <Button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* EcoPal Chatbot */}
      <EcoPalChatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  )
}
