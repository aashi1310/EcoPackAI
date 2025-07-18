"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Clock, Wrench } from "lucide-react"

interface DIYTip {
  title: string
  description: string
  difficulty: string
  icon: string
}

interface TrashToTreasureProps {
  diyTips: DIYTip[]
}

export default function TrashToTreasure({ diyTips }: TrashToTreasureProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  return (
    <Card className="border-green-200 dark:border-green-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />🔄 Trash-to-Treasure DIY Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diyTips.map((tip, index) => (
            <div
              key={index}
              className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{tip.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">{tip.title}</h4>
                    <Badge className={`text-xs ${getDifficultyColor(tip.difficulty)}`}>{tip.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">{tip.description}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {tip.difficulty === "easy" ? "15 mins" : tip.difficulty === "medium" ? "30 mins" : "1 hour"}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 bg-transparent"
              >
                <Wrench className="w-3 h-3 mr-1" />
                Try This DIY
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
