"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"

interface Alternative {
  name: string
  brand: string
  ecoScore: number
  reason: string
  image: string
}

interface EcoAlternativesProps {
  alternatives: Alternative[]
}

export default function EcoAlternatives({ alternatives }: EcoAlternativesProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
    if (score >= 5) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
    return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
  }

  return (
    <Card className="border-green-200 dark:border-green-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
          <Star className="w-5 h-5" />🌱 Eco-Friendly Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alternatives.map((alt, index) => (
            <div
              key={index}
              className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌿</span>
                </div>
                <Badge className={`${getScoreColor(alt.ecoScore)}`}>{alt.ecoScore}/10</Badge>
              </div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">{alt.name}</h4>
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">by {alt.brand}</p>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">{alt.reason}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 bg-transparent"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
