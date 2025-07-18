"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Recycle, TrendingUp, Trophy, Target, Calendar, Crown } from "lucide-react"

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
    completed: boolean
  }
  gameStats: {
    streakCount: number
    leaderboardPosition: number
    weeklyHuntProgress: number
    quizScore: number
    sortingAccuracy: number
    puzzlesSolved: number
  }
  ecoPoints: number // Added
  lastWeeklyChallengeReset: string // Added
}

interface GamificationDashboardProps {
  userData: UserData | null
}

export default function GamificationDashboard({ userData }: GamificationDashboardProps) {
  if (!userData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-green-200 dark:border-green-700 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-green-100 dark:bg-green-800 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const wasteReduced = (userData.totalScans * 0.12).toFixed(1)
  const averageScore =
    userData.scans.length > 0
      ? Math.round(userData.scans.reduce((sum, scan) => sum + scan.ecoScore, 0) / userData.scans.length)
      : 0

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 dark:border-green-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg pb-3">
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4" />📦 Items Scanned
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{userData.totalScans}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Total scanned</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg pb-3">
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2 text-sm">
              <Recycle className="w-4 h-4" />
              ♻️ Waste Prevented
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{wasteReduced} kg</div>
            <p className="text-xs text-green-700 dark:text-green-300">CO₂ equivalent</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg pb-3">
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />🏅 EcoScore
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{averageScore}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Average score</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg pb-3">
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />🔥 Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{userData.currentStreak}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Days active</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Challenge */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Target className="w-5 h-5" />🎯 Find the Greenest Product Hunt
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-green-800 dark:text-green-200 font-medium">{userData.weeklyChallenge.description}</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {userData.weeklyChallenge.progress}/{userData.weeklyChallenge.target}
                </Badge>
              </div>
              <Progress
                value={(userData.weeklyChallenge.progress / userData.weeklyChallenge.target) * 100}
                className="h-3"
              />
            </div>
            {userData.weeklyChallenge.completed && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 text-center">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
                  🎉 Challenge Completed! You earned your "Green Product Hunter" badge! 🏹
                </p>
              </div>
            )}
            {!userData.weeklyChallenge.completed && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Reward:</strong> {userData.weeklyChallenge.reward}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Only {userData.weeklyChallenge.target - userData.weeklyChallenge.progress} more products left to
                  complete this week’s hunt!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Trophy className="w-5 h-5" />🏆 Your Badge Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  badge.earned
                    ? "bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 border-green-300 dark:border-green-600 shadow-md"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-60"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{badge.emoji}</div>
                  <h3
                    className={`font-semibold mb-1 ${badge.earned ? "text-green-800 dark:text-green-200" : "text-gray-600 dark:text-gray-400"}`}
                  >
                    {badge.name}
                  </h3>
                  <p
                    className={`text-xs mb-3 ${badge.earned ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-500"}`}
                  >
                    {badge.description}
                  </p>
                  {badge.earned && (
                    <div className="space-y-1">
                      <Badge className="bg-green-600 text-white">Earned! ✨</Badge>
                      {badge.earnedDate && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {new Date(badge.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Leaderboard & EcoPoints Summary */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Crown className="w-6 h-6" />👑 Global EcoPackAI Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                #{userData.gameStats?.leaderboardPosition || Math.max(1, 100 - userData.totalScans * 2)}
              </div>
              <div className="text-green-700 dark:text-green-300">Your Global Rank</div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                Based on EcoScore, scans, and game performance
              </div>
              <div className="text-center mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-xl font-bold text-green-800 dark:text-green-200">
                  {userData.ecoPoints} EcoPoints
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Total EcoPoints Earned</div>
              </div>
            </div>

            {/* Mock Leaderboard */}
            <div className="space-y-3">
              {[
                { rank: 1, name: "EcoMaster2024", score: 9850, badge: "🏆" },
                { rank: 2, name: "GreenGuru", score: 9720, badge: "🥈" },
                { rank: 3, name: "SustainabilityPro", score: 9650, badge: "🥉" },
                { rank: 4, name: "RecycleChamp", score: 9580, badge: "🌟" },
                { rank: 5, name: "EcoWarrior", score: 9500, badge: "🌱" },
              ].map((player) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{player.badge}</div>
                    <div>
                      <div className="font-semibold text-green-800 dark:text-green-200">
                        #{player.rank} {player.name}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">{player.score} EcoPoints</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* User's position if not in top 5 */}
              {(userData.gameStats?.leaderboardPosition || 15) > 5 && (
                <>
                  <div className="text-center text-gray-500 dark:text-gray-400">...</div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <div className="font-semibold text-blue-800 dark:text-blue-200">
                          #{userData.gameStats?.leaderboardPosition || 15} You
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">{userData.ecoPoints} EcoPoints</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="text-center mt-6 p-4 bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🚀 Climb Higher!</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Play games, scan products, and improve your EcoScore to climb the leaderboard!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Eco Challenges - New section for general challenges */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-800 dark:to-indigo-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Target className="w-5 h-5" />📅 Weekly Eco Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <p className="text-green-700 dark:text-green-300 mb-4">
            New missions unlock every Monday! Complete them to earn EcoPoints and badges.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "plastic-free-swap",
                title: "Plastic-Free Swap",
                description: "Replace 1 plastic bottle with a paper-pack item this week.",
                progress: 1, // Assume 1 completed for demo
                target: 1,
                rewardPoints: 20,
                earned: true,
                emoji: "♻️",
              },
              {
                id: "3-recyclables",
                title: "Scan 3 Recyclables",
                description: "Scan at least 3 recyclable products.",
                progress: userData.totalScans >= 3 ? 3 : userData.totalScans, // Dynamic based on totalScans
                target: 3,
                rewardPoints: 15,
                earned: userData.totalScans >= 3,
                emoji: "📦",
              },
              {
                id: "eco-quiz-master",
                title: "Eco-Quiz Master",
                description: "Score 80%+ on an EcoQuiz.",
                progress: userData.gameStats.quizScore >= 80 ? 1 : 0,
                target: 1,
                rewardPoints: 25,
                earned: userData.gameStats.quizScore >= 80,
                emoji: "🧠",
              },
            ].map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border ${
                  challenge.earned
                    ? "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-80"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{challenge.emoji}</div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200">{challenge.title}</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">{challenge.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 dark:text-green-400">Progress:</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {challenge.progress}/{challenge.target}
                  </Badge>
                </div>
                <Progress value={(challenge.progress / challenge.target) * 100} className="h-2 mt-2" />
                {challenge.earned ? (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    ✅ Completed! Earned {challenge.rewardPoints} EcoPoints!
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">In Progress...</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
