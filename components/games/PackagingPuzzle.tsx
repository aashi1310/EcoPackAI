"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Puzzle, Trophy, RotateCcw, Clock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useUserData } from "@/hooks/use-user-data"

interface PuzzleItem {
  id: string
  image: string
  answer: string
  hints: string[]
  difficulty: "easy" | "medium" | "hard"
  points: number
}

export default function PackagingPuzzle() {
  const { user } = useAuth()
  const { awardBadge } = useUserData(user?.uid || null)
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleItem | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [puzzlesSolved, setPuzzlesSolved] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const puzzles: PuzzleItem[] = [
    {
      id: "1",
      image: "/placeholder.svg?height=200&width=200&text=🧴",
      answer: "plastic bottle",
      hints: ["It holds liquids", "Made from PET plastic", "Has a screw-on cap"],
      difficulty: "easy",
      points: 10,
    },
    {
      id: "2",
      image: "/placeholder.svg?height=200&width=200&text=📦",
      answer: "cardboard box",
      hints: ["Made from recycled paper", "Used for shipping", "Can be folded flat"],
      difficulty: "easy",
      points: 10,
    },
    {
      id: "3",
      image: "/placeholder.svg?height=200&width=200&text=🥫",
      answer: "aluminum can",
      hints: ["Made of metal", "Infinitely recyclable", "Often contains beverages"],
      difficulty: "medium",
      points: 15,
    },
    {
      id: "4",
      image: "/placeholder.svg?height=200&width=200&text=🫙",
      answer: "glass jar",
      hints: ["Transparent container", "Can be reused many times", "Made from sand"],
      difficulty: "medium",
      points: 15,
    },
    {
      id: "5",
      image: "/placeholder.svg?height=200&width=200&text=🛍️",
      answer: "plastic bag",
      hints: ["Single-use item", "Not recyclable in regular bins", "Made from polyethylene"],
      difficulty: "medium",
      points: 15,
    },
    {
      id: "6",
      image: "/placeholder.svg?height=200&width=200&text=🥛",
      answer: "tetra pack",
      hints: ["Multi-layer packaging", "Contains paper and plastic", "Used for milk and juice"],
      difficulty: "hard",
      points: 20,
    },
    {
      id: "7",
      image: "/placeholder.svg?height=200&width=200&text=🍟",
      answer: "chip bag",
      hints: ["Metallized plastic film", "Not recyclable", "Keeps food fresh"],
      difficulty: "hard",
      points: 20,
    },
    {
      id: "8",
      image: "/placeholder.svg?height=200&width=200&text=🧼",
      answer: "soap dispenser",
      hints: ["HDPE plastic", "Has a pump mechanism", "Recyclable after cleaning"],
      difficulty: "hard",
      points: 20,
    },
  ]

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      skipPuzzle()
    }
  }, [timeLeft, gameStarted, gameEnded])

  const startGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty)
    const filteredPuzzles = puzzles.filter((p) => p.difficulty === selectedDifficulty)
    const randomPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)]

    setCurrentPuzzle(randomPuzzle)
    setScore(0)
    setPuzzlesSolved(0)
    setUserAnswer("")
    setShowHint(false)
    setHintIndex(0)
    setGameStarted(true)
    setGameEnded(false)
    setFeedback("")
    setTimeLeft(selectedDifficulty === "easy" ? 45 : selectedDifficulty === "medium" ? 30 : 20)
  }

  const submitAnswer = () => {
    if (!currentPuzzle || !userAnswer.trim()) return

    const isCorrect = userAnswer.toLowerCase().trim() === currentPuzzle.answer.toLowerCase()

    if (isCorrect) {
      const points = showHint ? Math.floor(currentPuzzle.points * 0.7) : currentPuzzle.points
      setScore(score + points)
      setPuzzlesSolved(puzzlesSolved + 1)
      setFeedback(`🎉 Correct! +${points} points`)

      // Update user stats
      updateUserStats()

      setTimeout(() => {
        if (puzzlesSolved + 1 >= 5) {
          endGame()
        } else {
          nextPuzzle()
        }
      }, 2000)
    } else {
      setFeedback(`❌ Not quite right. Try again!`)
      setTimeout(() => setFeedback(""), 2000)
    }
  }

  const nextPuzzle = () => {
    const filteredPuzzles = puzzles.filter((p) => p.difficulty === difficulty && p.id !== currentPuzzle?.id)
    const randomPuzzle = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)]

    setCurrentPuzzle(randomPuzzle)
    setUserAnswer("")
    setShowHint(false)
    setHintIndex(0)
    setFeedback("")
    setTimeLeft(difficulty === "easy" ? 45 : difficulty === "medium" ? 30 : 20)
  }

  const skipPuzzle = () => {
    setFeedback(`⏰ Time's up! The answer was: ${currentPuzzle?.answer}`)
    setTimeout(() => {
      if (puzzlesSolved >= 4) {
        endGame()
      } else {
        nextPuzzle()
      }
    }, 3000)
  }

  const showNextHint = () => {
    if (!currentPuzzle) return

    if (!showHint) {
      setShowHint(true)
      setHintIndex(0)
    } else if (hintIndex < currentPuzzle.hints.length - 1) {
      setHintIndex(hintIndex + 1)
    }
  }

  const endGame = () => {
    setGameEnded(true)
    setGameStarted(false)
    updateUserStats()
  }

  const updateUserStats = () => {
    const userId = JSON.parse(localStorage.getItem("ecopack-user") || "{}")?.uid
    if (userId) {
      const userDataKey = `ecopack-user-data-${userId}`
      const userData = JSON.parse(localStorage.getItem(userDataKey) || "{}")

      if (userData.gameStats) {
        userData.gameStats.puzzlesSolved = (userData.gameStats.puzzlesSolved || 0) + 1
        if ((userData.gameStats.puzzlesSolved || 0) >= 10) {
          // Award after 10 puzzles solved
          awardBadge("puzzle-champion", "Puzzle Champion", "🧩", "Solved 10 packaging puzzles!", 60)
        }
        localStorage.setItem(userDataKey, JSON.stringify(userData))
      }
    }
  }

  const resetGame = () => {
    setCurrentPuzzle(null)
    setScore(0)
    setPuzzlesSolved(0)
    setUserAnswer("")
    setShowHint(false)
    setHintIndex(0)
    setGameStarted(false)
    setGameEnded(false)
    setFeedback("")
    setTimeLeft(30)
  }

  if (!gameStarted && !gameEnded) {
    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Puzzle className="w-6 h-6" />🧩 Packaging Puzzle Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800 text-center">
          <div className="space-y-6">
            <div className="text-6xl">🧩</div>
            <div>
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Guess the Packaging Material!
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Look at the image and identify the packaging type. Use hints if you need help!
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Choose Difficulty:</p>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={() => startGame("easy")} className="bg-green-500 hover:bg-green-600 text-white">
                  🟢 Easy
                  <br />
                  <span className="text-xs">45s per puzzle</span>
                </Button>
                <Button onClick={() => startGame("medium")} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  🟡 Medium
                  <br />
                  <span className="text-xs">30s per puzzle</span>
                </Button>
                <Button onClick={() => startGame("hard")} className="bg-red-500 hover:bg-red-600 text-white">
                  🔴 Hard
                  <br />
                  <span className="text-xs">20s per puzzle</span>
                </Button>
              </div>
            </div>

            <div className="text-sm text-green-600 dark:text-green-400">
              💡 Solve 5 puzzles to complete the challenge!
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameEnded) {
    const maxScore = 5 * (difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20)
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Trophy className="w-6 h-6" />🎉 Puzzle Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800 text-center">
          <div className="space-y-6">
            <div className="text-6xl">{percentage >= 80 ? "🏆" : percentage >= 60 ? "🥈" : "🥉"}</div>

            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{score} Points</div>
              <div className="text-lg text-green-700 dark:text-green-300">
                {percentage >= 80
                  ? "Puzzle Master! 🧩"
                  : percentage >= 60
                    ? "Great Detective! 🔍"
                    : "Keep Exploring! 🌟"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{puzzlesSolved}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Puzzles Solved</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Points</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{percentage}%</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Accuracy</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => startGame(difficulty)} className="bg-green-600 hover:bg-green-700 text-white">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-transparent"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentPuzzle) return null

  return (
    <Card className="border-green-200 dark:border-green-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Puzzle className="w-6 h-6" />🧩 Packaging Puzzle
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeLeft}s
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {puzzlesSolved + 1}/5
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Score: {score}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 dark:bg-gray-800">
        <div className="space-y-6">
          {feedback && (
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-blue-800 dark:text-blue-200 font-medium">{feedback}</div>
            </div>
          )}

          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-6xl">
              {currentPuzzle.image.includes("🧴")
                ? "🧴"
                : currentPuzzle.image.includes("📦")
                  ? "📦"
                  : currentPuzzle.image.includes("🥫")
                    ? "🥫"
                    : currentPuzzle.image.includes("🫙")
                      ? "🫙"
                      : currentPuzzle.image.includes("🛍️")
                        ? "🛍️"
                        : currentPuzzle.image.includes("🥛")
                          ? "🥛"
                          : currentPuzzle.image.includes("🍟")
                            ? "🍟"
                            : currentPuzzle.image.includes("🧼")
                              ? "🧼"
                              : "📦"}
            </div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              What type of packaging is this?
            </h3>
          </div>

          {showHint && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Hint {hintIndex + 1}:</span>
              </div>
              <p className="text-amber-700 dark:text-amber-300">{currentPuzzle.hints[hintIndex]}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 border-green-200 dark:border-green-600 focus:border-green-400"
                onKeyPress={(e) => e.key === "Enter" && submitAnswer()}
              />
              <Button onClick={submitAnswer} className="bg-green-600 hover:bg-green-700 text-white">
                Submit
              </Button>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={showNextHint}
                variant="outline"
                className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900 bg-transparent"
                disabled={showHint && hintIndex >= currentPuzzle.hints.length - 1}
              >
                {!showHint ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {!showHint ? "Show Hint" : hintIndex < currentPuzzle.hints.length - 1 ? "Next Hint" : "No More Hints"}
              </Button>
              <Button
                onClick={skipPuzzle}
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 bg-transparent"
              >
                Skip Puzzle
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-green-600 dark:text-green-400">
            💡 Using hints reduces your points by 30%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
