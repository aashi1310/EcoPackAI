"use client"

import { useState, useEffect } from "react"

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
    completed: boolean // Added for tracking completion status
  }
  gameStats: {
    streakCount: number
    leaderboardPosition: number
    weeklyHuntProgress: number
    quizScore: number
    sortingAccuracy: number
    puzzlesSolved: number
  }
  coachRecommendations: Array<{
    type: string
    title: string
    description: string
    impact: string
    difficulty: string
    icon: string
  }>
  ecoPoints: number // New field
  lastWeeklyChallengeReset: string // New field for weekly challenge reset
}

export function useUserData(userId: string | null) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const data = localStorage.getItem(`ecopack-user-data-${userId}`)
    let loadedData: UserData | null = data ? JSON.parse(data) : null

    // Initialize if no data or reset weekly challenge
    if (!loadedData) {
      loadedData = initializeUserData(userId, false) // Initialize without saving immediately
    } else {
      // Check for weekly challenge reset
      const lastResetDate = new Date(loadedData.lastWeeklyChallengeReset)
      const now = new Date()
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000

      // Reset if a new week has started since last reset (e.g., last Monday)
      // Or if it's been more than a week since last reset
      if (
        now.getDay() === 1 && // Check if today is Monday
        now.getTime() - lastResetDate.getTime() > oneWeekMs // And it's been at least a week
      ) {
        loadedData.weeklyChallenge.progress = 0
        loadedData.weeklyChallenge.completed = false
        loadedData.lastWeeklyChallengeReset = now.toISOString()
        console.log("Weekly challenge reset!")
      } else if (
        now.getDay() !== lastResetDate.getDay() && // If day changed
        now.getTime() - lastResetDate.getTime() > oneWeekMs // And it's been over a week
      ) {
        // Fallback for non-Monday logins
        loadedData.weeklyChallenge.progress = 0
        loadedData.weeklyChallenge.completed = false
        loadedData.lastWeeklyChallengeReset = now.toISOString()
        console.log("Weekly challenge reset due to time elapsed!")
      }
    }

    setUserData(loadedData)
    if (loadedData) {
      // Save updated data if it was modified
      localStorage.setItem(`ecopack-user-data-${userId}`, JSON.stringify(loadedData))
    }
    setLoading(false)
  }, [userId])

  const updateUserData = (updates: Partial<UserData>) => {
    if (!userId || !userData) return

    const newData = { ...userData, ...updates }
    setUserData(newData)
    localStorage.setItem(`ecopack-user-data-${userId}`, JSON.stringify(newData))
  }

  const awardBadge = (badgeId: string, badgeName: string, emoji: string, description: string, ecoPointsReward = 0) => {
    if (!userId || !userData) return

    const hasBadge = userData.badges.some((b) => b.id === badgeId)

    if (!hasBadge) {
      const newBadge = {
        id: badgeId,
        name: badgeName,
        emoji: emoji,
        description: description,
        earned: true,
        earnedDate: new Date().toISOString(),
      }

      const newBadges = [...userData.badges, newBadge]
      const newEcoPoints = userData.ecoPoints + ecoPointsReward

      updateUserData({
        badges: newBadges,
        ecoPoints: newEcoPoints,
      })

      alert(
        `🎉 New Badge Earned: ${newBadge.emoji} ${newBadge.name}!\n${newBadge.description}\n+${ecoPointsReward} EcoPoints!`,
      )
      return true // Badge was awarded
    }
    return false // Badge already earned
  }

  const addScan = (scan: {
    description: string
    ecoScore: number
    location: string
    category?: string
  }) => {
    if (!userId || !userData) return

    const newScan = {
      id: `scan-${Date.now()}`,
      description: scan.description,
      ecoScore: scan.ecoScore,
      timestamp: new Date().toISOString(),
      location: scan.location,
      category: scan.category || "Other",
      certification:
        scan.ecoScore >= 8 ? ("green" as const) : scan.ecoScore >= 5 ? ("low-impact" as const) : ("harmful" as const),
    }

    const newScans = [...userData.scans, newScan]
    const newTotalScans = newScans.length

    // Calculate new progress score
    const averageScore = newScans.reduce((sum, s) => sum + s.ecoScore, 0) / newScans.length
    const newProgressScore = Math.min(100, Math.round(averageScore * 10))

    // Update weekly challenge progress
    const weeklyChallenge = { ...userData.weeklyChallenge }
    if (scan.ecoScore >= 8 && !weeklyChallenge.completed) {
      weeklyChallenge.progress = Math.min(weeklyChallenge.target, weeklyChallenge.progress + 1)
      if (weeklyChallenge.progress === weeklyChallenge.target) {
        weeklyChallenge.completed = true
        // Award "Green Product Hunter" badge and EcoPoints upon completion
        awardBadge(
          "green-product-hunter",
          "Green Product Hunter",
          "🏹",
          "Successfully completed the weekly EcoHunt!",
          30,
        )
      }
    }

    // Check for other badges (existing logic)
    const newBadges = [...userData.badges] // Start with current badges
    const badgeIds = newBadges.map((b) => b.id)

    // Plastic-Free Pro badge (5 scans)
    if (newTotalScans >= 5 && !badgeIds.includes("plastic-free-pro")) {
      awardBadge("plastic-free-pro", "Plastic-Free Pro", "🧼", "Scan 5 recyclable products in a week", 20)
    }

    // Eco Explorer badge (3 different locations)
    const locations = new Set(newScans.map((s) => s.location))
    if (locations.size >= 3 && !badgeIds.includes("eco-explorer")) {
      awardBadge("eco-explorer", "Eco Explorer", "🌍", "Scan products from 3 different locations", 25)
    }

    // Green Guru badge (average score 8+)
    if (averageScore >= 8 && !badgeIds.includes("green-guru")) {
      awardBadge("green-guru", "Green Guru", "🌱", "Achieve average EcoScore of 8+", 40)
    }

    updateUserData({
      totalScans: newTotalScans,
      ecoProgressScore: newProgressScore,
      scans: newScans,
      weeklyChallenge,
    })
  }

  // Define initial user data
  const initializeUserData = (userId: string, save = true) => {
    const defaultData = {
      totalScans: 0,
      ecoProgressScore: 0,
      currentStreak: 0,
      badges: [],
      scans: [],
      weeklyChallenge: {
        description: "Scan 5 products with EcoScore above 8 this week",
        progress: 0,
        target: 5,
        reward: "🏆 Sustainability Champion Badge",
        completed: false,
      },
      gameStats: {
        streakCount: 0,
        leaderboardPosition: 100,
        weeklyHuntProgress: 0, // This will be managed by weeklyChallenge.progress directly
        quizScore: 0,
        sortingAccuracy: 0,
        puzzlesSolved: 0,
      },
      coachRecommendations: [],
      ecoPoints: 0,
      lastWeeklyChallengeReset: new Date().toISOString(),
    }
    if (save) {
      localStorage.setItem(`ecopack-user-data-${userId}`, JSON.stringify(defaultData))
    }
    return defaultData
  }

  return { userData, loading, updateUserData, addScan, awardBadge }
}
