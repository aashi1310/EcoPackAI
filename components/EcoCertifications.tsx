"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, CheckCircle, XCircle } from "lucide-react"

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
}

interface EcoCertificationsProps {
  userData: UserData | null
}

export default function EcoCertifications({ userData }: EcoCertificationsProps) {
  const [filter, setFilter] = useState<"all" | "green" | "low-impact" | "harmful">("all")

  if (!userData) {
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

  const getCertificationIcon = (cert: string) => {
    switch (cert) {
      case "green":
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      case "low-impact":
        return <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      case "harmful":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  const getCertificationColor = (cert: string) => {
    switch (cert) {
      case "green":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
      case "low-impact":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
      case "harmful":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900"
    }
  }

  const filteredProducts = filter === "all" ? userData.scans : userData.scans.filter((p) => p.certification === filter)

  const stats = {
    green: userData.scans.filter((p) => p.certification === "green").length,
    lowImpact: userData.scans.filter((p) => p.certification === "low-impact").length,
    harmful: userData.scans.filter((p) => p.certification === "harmful").length,
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Shield className="w-6 h-6" />🏅 Eco Certification System
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.green}</div>
              <div className="text-sm text-green-700 dark:text-green-300">✅ Certified Green</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.lowImpact}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">⚠️ Low Impact</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.harmful}</div>
              <div className="text-sm text-red-700 dark:text-red-300">❌ Harmful</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-green-100 dark:bg-green-800">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="green">✅ Green</TabsTrigger>
              <TabsTrigger value="low-impact">⚠️ Low Impact</TabsTrigger>
              <TabsTrigger value="harmful">❌ Harmful</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="border-green-200 dark:border-green-700 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800 dark:text-green-200">{product.description}</h4>
                          <p className="text-sm text-green-600 dark:text-green-400">Category: {product.category}</p>
                          <p className="text-xs text-green-500 dark:text-green-500 mt-1">
                            Scanned: {new Date(product.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-green-500 dark:text-green-500">Location: {product.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getCertificationColor(product.certification)}`}>
                            {getCertificationIcon(product.certification)}
                            <span className="ml-1 capitalize">{product.certification.replace("-", " ")}</span>
                          </Badge>
                          <Badge variant="outline">{product.ecoScore}/10</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-green-400 dark:text-green-600 mx-auto mb-4" />
                  <p className="text-green-600 dark:text-green-400">No products found in this category.</p>
                  <p className="text-sm text-green-500 dark:text-green-500">
                    Start scanning to build your certification library!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
