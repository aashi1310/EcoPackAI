"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gamepad2, Target, Brain, Recycle, Search, Puzzle, Calendar, Crown, Play } from "lucide-react"
import EcoQuiz from "./EcoQuiz"
import EcoSortGame from "./games/EcoSortGame"
import PackagingPuzzle from "./games/PackagingPuzzle"

// Update UserData interface to reflect the latest changes from use-user-data.ts
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

interface MiniGamesProps {
  userData: UserData | null
}

export default function MiniGames({ userData }: MiniGamesProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  if (!userData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-green-200 dark:border-green-700 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-green-100 dark:bg-green-800 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Update the `gameStats` definition in the component:
  const gameStats = userData.gameStats

  const games = [
    {
      id: "streak",
      title: "EcoScan Streak Challenge",
      emoji: "🔥",
      description: "Track daily scans & build your streak",
      icon: Calendar,
      color: "from-orange-100 to-red-100",
      borderColor: "border-orange-200",
      stat: userData.currentStreak,
      statLabel: "Day Streak",
      action: "Continue Streak",
      component: null,
    },
    {
      id: "leaderboard",
      title: "Eco Battle - Leaderboard",
      emoji: "👑",
      description: "Compete globally with your EcoScore",
      icon: Crown,
      color: "from-yellow-100 to-amber-100",
      borderColor: "border-yellow-200",
      stat: gameStats.leaderboardPosition,
      statLabel: "Global Rank",
      action: "View Rankings",
      component: null,
    },
    {
      id: "hunt",
      title: "Find the Greenest Product",
      emoji: "🌱",
      description: "Weekly challenge to find eco-friendly products",
      icon: Search,
      color: "from-green-100 to-emerald-100",
      borderColor: "border-green-200",
      stat: userData.weeklyChallenge.progress,
      statLabel: "Products Found",
      action: "Start Hunt",
      component: null,
    },
  ]

  const playableGames = [
    {
      id: "sort",
      title: "EcoSort Challenge",
      emoji: "♻️",
      description: "Drag & drop items into correct recycling bins",
      icon: Recycle,
      color: "from-blue-100 to-cyan-100",
      borderColor: "border-blue-200",
      stat: gameStats.sortingAccuracy,
      statLabel: "% Accuracy",
      action: "Play Game",
      component: EcoSortGame,
    },
    {
      id: "puzzle",
      title: "Packaging Puzzle",
      emoji: "🧩",
      description: "Guess packaging materials from images",
      icon: Puzzle,
      color: "from-pink-100 to-rose-100",
      borderColor: "border-pink-200",
      stat: gameStats.puzzlesSolved,
      statLabel: "Puzzles Solved",
      action: "Solve Puzzle",
      component: PackagingPuzzle,
    },
    {
      id: "quiz",
      title: "AI-Generated Quiz",
      emoji: "🧠",
      description: "Test your knowledge with AI-generated sustainability questions",
      icon: Brain,
      color: "from-purple-100 to-indigo-100",
      borderColor: "border-purple-200",
      stat: gameStats.quizScore,
      statLabel: "% Best Score",
      action: "Take Quiz",
      component: EcoQuiz,
    },
  ]

  const playGame = (gameId: string) => {
    const game = playableGames.find((g) => g.id === gameId)
    if (game && game.component) {
      setActiveGame(gameId)
    } else {
      // For non-playable games, show a message
      alert(`🎉 ${gameId} feature coming soon! Keep scanning to improve your stats!`)
    }
  }

  const backToMenu = () => {
    setActiveGame(null)
  }

  // If a game is active, show only that game
  if (activeGame) {
    const game = playableGames.find((g) => g.id === activeGame)
    if (game && game.component) {
      const GameComponent = game.component
      return (
        <div className="space-y-4">
          <Button
            onClick={backToMenu}
            variant="outline"
            className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900 bg-transparent"
          >
            ← Back to Games Menu
          </Button>
          <GameComponent />
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />🎮 Play & Learn - Mini Games
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <p className="text-green-700 dark:text-green-300">
            Learn sustainability through fun games! Earn badges, climb leaderboards, and become an eco-expert! 🌱
          </p>
        </CardContent>
      </Card>

      {/* Game Tabs */}
      <Tabs defaultValue="playable" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-green-100 dark:bg-green-800">
          <TabsTrigger
            value="playable"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
          >
            🎮 Playable Games
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
          >
            🎯 Challenges
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white dark:data-[state=active]:bg-green-500"
          >
            👑 Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playable" className="space-y-6">
          {/* Playable Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playableGames.map((game) => {
              const IconComponent = game.icon
              return (
                <Card key={game.id} className={`${game.borderColor} shadow-lg hover:shadow-xl transition-shadow`}>
                  <CardHeader className={`bg-gradient-to-r ${game.color} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{game.emoji}</span>
                        <div>
                          <CardTitle className="text-green-800 dark:text-green-200 text-sm">{game.title}</CardTitle>
                        </div>
                      </div>
                      <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-gray-800">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">{game.description}</p>

                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{game.stat}</div>
                        <div className="text-xs text-green-700 dark:text-green-300">{game.statLabel}</div>
                      </div>

                      <Button
                        onClick={() => playGame(game.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {game.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">🎯 How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">♻️</div>
                <div className="font-semibold text-green-800 dark:text-green-200">EcoSort</div>
                <div className="text-green-600 dark:text-green-400">
                  Drag items to correct recycling bins within 60 seconds
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">🧩</div>
                <div className="font-semibold text-green-800 dark:text-green-200">Puzzle</div>
                <div className="text-green-600 dark:text-green-400">Identify packaging materials from visual clues</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-semibold text-green-800 dark:text-green-200">Quiz</div>
                <div className="text-green-600 dark:text-green-400">Answer AI-generated sustainability questions</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          {/* Static Challenge Games */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const IconComponent = game.icon
              return (
                <Card key={game.id} className={`${game.borderColor} shadow-lg hover:shadow-xl transition-shadow`}>
                  <CardHeader className={`bg-gradient-to-r ${game.color} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{game.emoji}</span>
                        <div>
                          <CardTitle className="text-green-800 dark:text-green-200 text-sm">{game.title}</CardTitle>
                        </div>
                      </div>
                      <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-gray-800">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">{game.description}</p>

                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{game.stat}</div>
                        <div className="text-xs text-green-700 dark:text-green-300">{game.statLabel}</div>
                      </div>

                      <Button
                        onClick={() => playGame(game.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {game.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Weekly Challenges */}
          <Card className="border-green-200 dark:border-green-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                <Target className="w-5 h-5" />🎯 This Week's Special Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🌱 Green Product Hunt</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Find 5 products with EcoScore above 8
                  </p>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {gameStats.weeklyHuntProgress}/5
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">Products found</div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-700">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🧠 Knowledge Master</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">Score 95+ on sustainability quiz</p>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {gameStats.quizScore}/100
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300">Current score</div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">♻️ Sorting Master</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Achieve 90%+ accuracy in sorting game</p>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {gameStats.sortingAccuracy}%
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Current accuracy</div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🧩 Puzzle Champion</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">Solve 10 packaging puzzles</p>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {gameStats.puzzlesSolved}/10
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Puzzles solved</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
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
                    #{userData.gameStats.leaderboardPosition}
                  </div>
                  <div className="text-green-700 dark:text-green-300">Your Global Rank</div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Based on EcoPoints and overall sustainability impact!
                  </div>
                </div>

                {/* Filter for leaderboard (simulated) */}
                <Tabs defaultValue="all-time" className="w-full mb-6">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger
                      value="all-time"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      All-Time
                    </TabsTrigger>
                    <TabsTrigger
                      value="monthly"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger
                      value="weekly"
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      Weekly
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all-time" className="mt-4">
                    {/* Mock All-Time Leaderboard */}
                    <div className="space-y-3">
                      {[
                        {
                          rank: 1,
                          name: "EcoMaster2024",
                          avatar: "🏆",
                          score: 9850,
                          badges: ["green-guru", "plastic-free-pro"],
                        },
                        {
                          rank: 2,
                          name: "GreenGuru",
                          avatar: "🥈",
                          score: 9720,
                          badges: ["eco-explorer", "green-guru"],
                        },
                        {
                          rank: 3,
                          name: "SustainabilityPro",
                          avatar: "🥉",
                          score: 9650,
                          badges: ["plastic-free-pro", "green-product-hunter"],
                        },
                        { rank: 4, name: "RecycleChamp", avatar: "🌟", score: 9580, badges: [] },
                        { rank: 5, name: "EcoWarrior", avatar: "🌱", score: 9500, badges: [] },
                      ].map((player) => (
                        <div
                          key={player.rank}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{player.avatar}</div>
                            <div>
                              <div className="font-semibold text-green-800 dark:text-green-200">
                                #{player.rank} {player.name}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-400">{player.score} EcoPoints</div>
                              <div className="flex gap-1 mt-1">
                                {player.badges.map((badgeId) => {
                                  const badge = userData.badges.find((b) => b.id === badgeId) || { emoji: "🏅" }
                                  return (
                                    <span key={badgeId} title={badge.name}>
                                      {badge.emoji}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* User's position if not in top 5 */}
                      {userData.gameStats.leaderboardPosition > 5 && (
                        <>
                          <div className="text-center text-gray-500 dark:text-gray-400">...</div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">👤</div>
                              <div>
                                <div className="font-semibold text-blue-800 dark:text-blue-200">
                                  #{userData.gameStats.leaderboardPosition} You
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                  {userData.ecoPoints} EcoPoints
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {userData.badges.map((badge) => (
                                    <span key={badge.id} title={badge.name}>
                                      {badge.emoji}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="monthly" className="mt-4">
                    <div className="text-center text-green-700 dark:text-green-300 py-8">
                      Monthly Leaderboard coming soon! Keep scanning to climb! 📈
                    </div>
                  </TabsContent>
                  <TabsContent value="weekly" className="mt-4">
                    <div className="text-center text-green-700 dark:text-green-300 py-8">
                      Weekly Leaderboard coming soon! Your current weekly challenge progress is:{" "}
                      {userData.weeklyChallenge.progress}/{userData.weeklyChallenge.target} 🎯
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Gamified text based on user's rank (simulated) */}
                <div className="text-center mt-6 p-4 bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    You’re ranked #{userData.gameStats.leaderboardPosition}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Scan{" "}
                    {userData.gameStats.leaderboardPosition > 1
                      ? Math.floor(userData.gameStats.leaderboardPosition / 2) + 1
                      : 1}{" "}
                    more items and score high to climb higher! 🚀
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
