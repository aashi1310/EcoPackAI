"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, Target, Calendar, RefreshCw } from "lucide-react"

interface UserData {
  totalScans: number
  ecoProgressScore: number
  currentStreak: number
  badges: Array<{
    id: string
    name: string
    emoji: string
    description: string
    earned: boolean
    earnedDate?: string
  }>
  scans: Array<{
    id: string
    description: string
    ecoScore: number
    timestamp: string
    location: string
    category: string
    certification: "green" | "low-impact" | "harmful"
  }>
  weeklyChallenge: {
    description: string
    progress: number
    target: number
    reward: string
  }
  gameStats: {
    streakCount: number
    leaderboardPosition: number
    weeklyHuntProgress: number
    quizScore: number
    sortingAccuracy: number
    puzzlesSolved: number
  }
  coachRecommendations?: Array<{
    type: string
    title: string
    description: string
    impact: string
    difficulty: string
    icon: string
  }>
}

interface AIEcoCoachProps {
  userData: UserData | null
}

interface CoachRecommendation {
  type: "weekly" | "personalized" | "challenge"
  title: string
  description: string
  impact: string
  difficulty: "easy" | "medium" | "hard"
  icon: string
}

export default function AIEcoCoach({ userData }: AIEcoCoachProps) {
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [userData])

  const loadRecommendations = () => {
    setLoading(true)

    if (!userData) {
      setLoading(false)
      return
    }

    // Use existing recommendations or generate new ones
    const existingRecommendations = userData.coachRecommendations || []

    if (existingRecommendations.length > 0) {
      setRecommendations(existingRecommendations as CoachRecommendation[])
    } else {
      // Generate recommendations based on user data
      const newRecommendations: CoachRecommendation[] = [
        {
          type: "personalized",
          title: "Switch Your Packaging Choices",
          description: `You've scanned ${userData.totalScans} products. Try choosing items with more recyclable packaging to boost your eco-score.`,
          impact: "Reduce plastic waste by 40%",
          difficulty: "easy",
          icon: "🧴",
        },
        {
          type: "weekly",
          title: "Paper Over Plastic Challenge",
          description: "This week, try to choose paper packaging over plastic for at least 3 products.",
          impact: "Lower carbon footprint by 25%",
          difficulty: "easy",
          icon: "📦",
        },
        {
          type: "challenge",
          title: "Zero-Waste Shopping Trip",
          description: "Plan a grocery trip where you avoid all single-use packaging. Bring reusable containers.",
          impact: "Eliminate 2kg of packaging waste",
          difficulty: "hard",
          icon: "🛒",
        },
        {
          type: "personalized",
          title: "Improve Your EcoScore",
          description: `Your current average EcoScore is ${userData.scans.length > 0 ? Math.round(userData.scans.reduce((sum, scan) => sum + scan.ecoScore, 0) / userData.scans.length) : 0}. Look for products scoring 8+ to improve your impact.`,
          impact: "Increase sustainability by 30%",
          difficulty: "medium",
          icon: "📈",
        },
      ]
      setRecommendations(newRecommendations)
    }

    setLoading(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
      case "hard":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "weekly":
        return <Calendar className="w-4 h-4" />
      case "personalized":
        return <TrendingUp className="w-4 h-4" />
      case "challenge":
        return <Target className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 dark:border-green-700 shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-green-100 dark:bg-green-800 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <Lightbulb className="w-12 h-12 text-green-400 dark:text-green-600 mx-auto mb-4" />
        <p className="text-green-600 dark:text-green-400">No user data available for coaching recommendations.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />🤖 AI EcoCoach Recommendations
            </CardTitle>
            <Button
              onClick={loadRecommendations}
              variant="outline"
              size="sm"
              className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <p className="text-green-700 dark:text-green-300">
            Personalized sustainability recommendations based on your scanning history and eco-goals! 🌱
          </p>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <Card
            key={index}
            className="border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rec.icon}</span>
                  <div>
                    <CardTitle className="text-green-800 dark:text-green-200 text-lg">{rec.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeIcon(rec.type)}
                      <span className="text-xs text-green-600 dark:text-green-400 capitalize">{rec.type}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                  {rec.difficulty}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 dark:bg-gray-800">
              <p className="text-green-700 dark:text-green-300 mb-4">{rec.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{rec.impact}</span>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  Accept Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Progress */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Calendar className="w-5 h-5" />📊 This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userData.weeklyChallenge.progress}/{userData.weeklyChallenge.target}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Challenges Completed</div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {(userData.totalScans * 0.15).toFixed(1)}kg
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">CO₂ Saved</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userData.ecoProgressScore}%</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Eco Goal Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
