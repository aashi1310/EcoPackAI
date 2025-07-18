"use client"

import { useEffect, useState } from "react"

interface User {
  uid: string
  email: string
  displayName?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem("ecopack-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signIn = (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      // Demo account
      if (email === "demo@ecopackai.com" && password === "password123") {
        const demoUser: User = {
          uid: "demo-user-123",
          email: "demo@ecopackai.com",
          displayName: "Demo User",
        }

        setUser(demoUser)
        localStorage.setItem("ecopack-user", JSON.stringify(demoUser))

        // Initialize demo data
        initializeDemoData()
        resolve()
      } else {
        // Check for custom accounts
        const users = JSON.parse(localStorage.getItem("ecopack-users") || "{}")
        const userKey = `${email}:${password}`

        if (users[userKey]) {
          const userData = users[userKey]
          setUser(userData)
          localStorage.setItem("ecopack-user", JSON.stringify(userData))
          resolve()
        } else {
          reject(new Error("Invalid credentials"))
        }
      }
    })
  }

  const signUp = (email: string, password: string, displayName?: string) => {
    return new Promise<void>((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem("ecopack-users") || "{}")
      const userKey = `${email}:${password}`

      if (users[userKey]) {
        reject(new Error("User already exists"))
        return
      }

      const newUser: User = {
        uid: `user-${Date.now()}`,
        email,
        displayName: displayName || null,
      }

      users[userKey] = newUser
      localStorage.setItem("ecopack-users", JSON.stringify(users))

      setUser(newUser)
      localStorage.setItem("ecopack-user", JSON.stringify(newUser))

      // Initialize new user data
      initializeUserData(newUser.uid)
      resolve()
    })
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("ecopack-user")
  }

  const initializeDemoData = () => {
    const demoData = {
      totalScans: 15,
      ecoProgressScore: 78,
      currentStreak: 6,
      ecoPoints: 250, // Added demo eco points
      lastWeeklyChallengeReset: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), // Last reset 5 days ago
      badges: [
        {
          id: "plastic-free-pro",
          name: "Plastic-Free Pro",
          emoji: "🧼",
          description: "Scan 5 recyclable products in a week",
          earned: true,
          earnedDate: "2024-01-10T10:00:00Z",
        },
        {
          id: "eco-explorer",
          name: "Eco Explorer",
          emoji: "🌍",
          description: "Scan products from 3 different locations",
          earned: true,
          earnedDate: "2024-01-12T15:30:00Z",
        },
        {
          id: "green-guru",
          name: "Green Guru",
          emoji: "🌱",
          description: "Achieve average EcoScore of 8+",
          earned: true,
          earnedDate: "2024-01-15T09:15:00Z",
        },
        {
          // Add Green Product Hunter badge for demo
          id: "green-product-hunter",
          name: "Green Product Hunter",
          emoji: "🏹",
          description: "Successfully completed the weekly EcoHunt!",
          earned: true,
          earnedDate: "2024-07-10T10:00:00Z",
        },
      ],
      scans: [
        {
          id: "scan-1",
          description: "Glass milk bottle",
          ecoScore: 9,
          timestamp: "2024-01-15T08:00:00Z",
          location: "San Francisco",
          category: "Beverages",
          certification: "green",
        },
        {
          id: "scan-2",
          description: "Aluminum soda can",
          ecoScore: 8,
          timestamp: "2024-01-14T14:30:00Z",
          location: "San Francisco",
          category: "Beverages",
          certification: "green",
        },
        {
          id: "scan-3",
          description: "Paper coffee cup",
          ecoScore: 6,
          timestamp: "2024-01-14T09:15:00Z",
          location: "Oakland",
          category: "Beverages",
          certification: "low-impact",
        },
        {
          id: "scan-4",
          description: "Plastic water bottle",
          ecoScore: 4,
          timestamp: "2024-01-13T16:45:00Z",
          location: "Berkeley",
          category: "Beverages",
          certification: "harmful",
        },
        {
          id: "scan-5",
          description: "Cardboard cereal box",
          ecoScore: 8,
          timestamp: "2024-01-13T07:20:00Z",
          location: "San Francisco",
          category: "Food",
          certification: "green",
        },
        {
          id: "scan-6",
          description: "Glass pasta sauce jar",
          ecoScore: 9,
          timestamp: "2024-01-12T18:00:00Z",
          location: "San Francisco",
          category: "Food",
          certification: "green",
        },
        {
          id: "scan-7",
          description: "Plastic yogurt container",
          ecoScore: 5,
          timestamp: "2024-01-12T12:30:00Z",
          location: "Oakland",
          category: "Food",
          certification: "low-impact",
        },
        {
          id: "scan-8",
          description: "Aluminum foil wrap",
          ecoScore: 7,
          timestamp: "2024-01-11T19:15:00Z",
          location: "Berkeley",
          category: "Food",
          certification: "low-impact",
        },
        {
          id: "scan-9",
          description: "Paper shopping bag",
          ecoScore: 8,
          timestamp: "2024-01-11T11:00:00Z",
          location: "San Francisco",
          category: "Packaging",
          certification: "green",
        },
        {
          id: "scan-10",
          description: "Plastic chip bag",
          ecoScore: 2,
          timestamp: "2024-01-10T20:30:00Z",
          location: "Oakland",
          category: "Snacks",
          certification: "harmful",
        },
        // Add one more high ecoScore scan to make the demo data more robust for challenges
        {
          id: "scan-11",
          description: "Compostable dish sponges",
          ecoScore: 9,
          timestamp: new Date().toISOString(), // Recent scan
          location: "San Francisco",
          category: "Home",
          certification: "green",
        },
      ],
      weeklyChallenge: {
        description: "Scan 5 products with EcoScore above 8 this week",
        progress: 4, // Demo progress
        target: 5,
        reward: "🏆 Sustainability Champion Badge",
        completed: false, // Not yet completed
      },
      gameStats: {
        streakCount: 6,
        leaderboardPosition: 15,
        weeklyHuntProgress: 4, // This should reflect weeklyChallenge.progress
        quizScore: 92,
        sortingAccuracy: 88,
        puzzlesSolved: 8,
      },
      coachRecommendations: [
        {
          type: "personalized",
          title: "Switch to Glass Containers",
          description:
            "You've scanned 3 plastic containers this week. Try switching to glass alternatives for better sustainability.",
          impact: "Reduce plastic waste by 60%",
          difficulty: "easy",
          icon: "🫙",
        },
        {
          type: "weekly",
          title: "Paper Over Plastic Week",
          description: "This week, choose paper packaging over plastic for at least 3 products.",
          impact: "Lower carbon footprint by 25%",
          difficulty: "medium",
          icon: "📦",
        },
      ],
    }

    localStorage.setItem("ecopack-user-data-demo-user-123", JSON.stringify(demoData))
  }

  const initializeUserData = (userId: string) => {
    const userData = {
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
        weeklyHuntProgress: 0,
        quizScore: 0,
        sortingAccuracy: 0,
        puzzlesSolved: 0,
      },
      coachRecommendations: [],
      ecoPoints: 0, // Initial EcoPoints
      lastWeeklyChallengeReset: new Date().toISOString(), // Set initial reset date
    }

    localStorage.setItem(`ecopack-user-data-${userId}`, JSON.stringify(userData))
  }

  return { user, loading, signIn, signUp, signOut }
}
