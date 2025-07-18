"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Recycle, RotateCcw, Trophy, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useUserData } from "@/hooks/use-user-data"

interface Item {
  id: string
  name: string
  emoji: string
  correctBin: string
  description: string
}

interface Bin {
  id: string
  name: string
  emoji: string
  color: string
  items: string[]
}

export default function EcoSortGame() {
  const { user } = useAuth()
  const { awardBadge } = useUserData(user?.uid || null)
  const [items, setItems] = useState<Item[]>([])
  const [bins, setBins] = useState<Bin[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [feedback, setFeedback] = useState<string>("")

  const gameItems: Item[] = [
    { id: "1", name: "Plastic Bottle", emoji: "🧴", correctBin: "plastic", description: "PET #1 plastic bottle" },
    { id: "2", name: "Newspaper", emoji: "📰", correctBin: "paper", description: "Recyclable paper" },
    { id: "3", name: "Banana Peel", emoji: "🍌", correctBin: "organic", description: "Compostable organic waste" },
    { id: "4", name: "Glass Jar", emoji: "🫙", correctBin: "glass", description: "Reusable glass container" },
    { id: "5", name: "Aluminum Can", emoji: "🥤", correctBin: "metal", description: "Recyclable aluminum" },
    { id: "6", name: "Pizza Box", emoji: "📦", correctBin: "paper", description: "Cardboard packaging" },
    { id: "7", name: "Chip Bag", emoji: "🍟", correctBin: "general", description: "Non-recyclable plastic film" },
    { id: "8", name: "Apple Core", emoji: "🍎", correctBin: "organic", description: "Biodegradable food waste" },
    { id: "9", name: "Milk Carton", emoji: "🥛", correctBin: "paper", description: "Tetra pack container" },
    { id: "10", name: "Tin Can", emoji: "🥫", correctBin: "metal", description: "Steel food can" },
    { id: "11", name: "Plastic Bag", emoji: "🛍️", correctBin: "general", description: "Single-use plastic" },
    { id: "12", name: "Wine Bottle", emoji: "🍷", correctBin: "glass", description: "Glass beverage bottle" },
  ]

  const gameBins: Bin[] = [
    { id: "plastic", name: "Plastic", emoji: "♻️", color: "bg-blue-100 border-blue-300", items: [] },
    { id: "paper", name: "Paper", emoji: "📄", color: "bg-green-100 border-green-300", items: [] },
    { id: "glass", name: "Glass", emoji: "🫙", color: "bg-purple-100 border-purple-300", items: [] },
    { id: "metal", name: "Metal", emoji: "🔩", color: "bg-yellow-100 border-yellow-300", items: [] },
    { id: "organic", name: "Organic", emoji: "🌱", color: "bg-amber-100 border-amber-300", items: [] },
    { id: "general", name: "General Waste", emoji: "🗑️", color: "bg-gray-100 border-gray-300", items: [] },
  ]

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      endGame()
    }
  }, [timeLeft, gameStarted, gameEnded])

  const startGame = () => {
    const shuffledItems = [...gameItems].sort(() => Math.random() - 0.5).slice(0, 8)
    setItems(shuffledItems)
    setBins(gameBins.map((bin) => ({ ...bin, items: [] })))
    setScore(0)
    setTimeLeft(60)
    setGameStarted(true)
    setGameEnded(false)
    setFeedback("")
  }

  const endGame = () => {
    setGameEnded(true)
    setGameStarted(false)

    // Calculate final score
    let correctItems = 0
    bins.forEach((bin) => {
      bin.items.forEach((itemId) => {
        const item = gameItems.find((i) => i.id === itemId)
        if (item && item.correctBin === bin.id) {
          correctItems++
        }
      })
    })

    const accuracy = Math.round((correctItems / items.length) * 100)
    setScore(accuracy)

    // Update user stats
    updateUserStats(accuracy)
  }

  const updateUserStats = (accuracy: number) => {
    const userId = JSON.parse(localStorage.getItem("ecopack-user") || "{}")?.uid
    if (userId) {
      const userDataKey = `ecopack-user-data-${userId}`
      const userData = JSON.parse(localStorage.getItem(userDataKey) || "{}")

      if (userData.gameStats) {
        userData.gameStats.sortingAccuracy = Math.max(userData.gameStats.sortingAccuracy || 0, accuracy)
        if (accuracy >= 90) {
          awardBadge("sorting-master", "Sorting Master", "♻️", "Achieved 90%+ accuracy in the EcoSort game!", 50)
        }
        localStorage.setItem(userDataKey, JSON.stringify(userData))
      }
    }
  }

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, binId: string) => {
    e.preventDefault()
    if (!draggedItem) return

    const item = items.find((i) => i.id === draggedItem)
    if (!item) return

    // Remove item from items list
    setItems(items.filter((i) => i.id !== draggedItem))

    // Add item to bin
    setBins(bins.map((bin) => (bin.id === binId ? { ...bin, items: [...bin.items, draggedItem] } : bin)))

    // Show feedback
    const isCorrect = item.correctBin === binId
    setFeedback(
      isCorrect ? `✅ Correct! ${item.name} goes in ${binId}` : `❌ Oops! ${item.name} should go in ${item.correctBin}`,
    )

    setTimeout(() => setFeedback(""), 2000)
    setDraggedItem(null)

    // Check if game is complete
    if (items.length === 1) {
      setTimeout(endGame, 1000)
    }
  }

  const resetGame = () => {
    setItems([])
    setBins([])
    setScore(0)
    setTimeLeft(60)
    setGameStarted(false)
    setGameEnded(false)
    setFeedback("")
  }

  if (!gameStarted && !gameEnded) {
    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-800 dark:to-green-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Recycle className="w-6 h-6" />
            ♻️ EcoSort Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800 text-center">
          <div className="space-y-6">
            <div className="text-6xl">♻️</div>
            <div>
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Sort Items into Correct Bins!
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Drag and drop items into the right recycling bins. You have 60 seconds!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl mb-1">♻️</div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">Plastic</div>
                <div className="text-blue-600 dark:text-blue-400">Bottles, containers</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-2xl mb-1">📄</div>
                <div className="font-semibold text-green-800 dark:text-green-200">Paper</div>
                <div className="text-green-600 dark:text-green-400">Cardboard, newspapers</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="text-2xl mb-1">🫙</div>
                <div className="font-semibold text-purple-800 dark:text-purple-200">Glass</div>
                <div className="text-purple-600 dark:text-purple-400">Bottles, jars</div>
              </div>
            </div>

            <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              🎮 Start Sorting Game
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameEnded) {
    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Trophy className="w-6 h-6" />🎉 Game Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800 text-center">
          <div className="space-y-6">
            <div className="text-6xl">{score >= 80 ? "🏆" : score >= 60 ? "🥈" : "🥉"}</div>

            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{score}% Accuracy</div>
              <div className="text-lg text-green-700 dark:text-green-300">
                {score >= 80 ? "Sorting Master! 🌟" : score >= 60 ? "Great Job! 👏" : "Keep Learning! 📚"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}%</div>
                <div className="text-sm text-green-700 dark:text-green-300">Accuracy Score</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{items.length}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Items Sorted</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white">
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

  return (
    <Card className="border-green-200 dark:border-green-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-800 dark:to-green-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Recycle className="w-6 h-6" />
            ♻️ EcoSort Challenge
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeLeft}s
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Items Left: {items.length}
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

          {/* Items to Sort */}
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
              🎯 Drag these items to the correct bins:
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  className="p-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:shadow-md transition-shadow text-center"
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recycling Bins */}
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">🗂️ Recycling Bins:</h3>
            <div className="grid grid-cols-3 gap-4">
              {bins.map((bin) => (
                <div
                  key={bin.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, bin.id)}
                  className={`p-4 ${bin.color} border-2 border-dashed rounded-lg min-h-[120px] transition-colors hover:opacity-80`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{bin.emoji}</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{bin.name}</div>
                    <div className="space-y-1">
                      {bin.items.map((itemId) => {
                        const item = gameItems.find((i) => i.id === itemId)
                        return item ? (
                          <div key={itemId} className="text-xs bg-white dark:bg-gray-700 rounded px-2 py-1">
                            {item.emoji} {item.name}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
