"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { useState } from "react"

interface StoryFrame {
  frame: number
  title: string
  description: string
  image: string
}

interface PackagingStoryboardProps {
  storyboard: StoryFrame[]
}

export default function PackagingStoryboard({ storyboard }: PackagingStoryboardProps) {
  const [currentFrame, setCurrentFrame] = useState(0)

  const nextFrame = () => {
    setCurrentFrame((prev) => (prev + 1) % storyboard.length)
  }

  const prevFrame = () => {
    setCurrentFrame((prev) => (prev - 1 + storyboard.length) % storyboard.length)
  }

  return (
    <Card className="border-green-200 dark:border-green-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />📖 Packaging Life Story
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 dark:bg-gray-800">
        <div className="space-y-4">
          {/* Current Frame */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Frame {currentFrame + 1}: {storyboard[currentFrame].title}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={prevFrame}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={nextFrame}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">
                  {currentFrame === 0 ? "🏭" : currentFrame === 1 ? "🛒" : currentFrame === 2 ? "♻️" : "🏞️"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-blue-700 dark:text-blue-300">{storyboard[currentFrame].description}</p>
              </div>
            </div>
          </div>

          {/* Frame Navigation */}
          <div className="flex justify-center gap-2">
            {storyboard.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFrame(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentFrame
                    ? "bg-blue-600 dark:bg-blue-400"
                    : "bg-blue-200 dark:bg-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600"
                }`}
              />
            ))}
          </div>

          {/* All Frames Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {storyboard.map((frame, index) => (
              <button
                key={index}
                onClick={() => setCurrentFrame(index)}
                className={`p-3 rounded-lg border transition-all ${
                  index === currentFrame
                    ? "border-blue-400 dark:border-blue-500 bg-blue-100 dark:bg-blue-800"
                    : "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {index === 0 ? "🏭" : index === 1 ? "🛒" : index === 2 ? "♻️" : "🏞️"}
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">{frame.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
