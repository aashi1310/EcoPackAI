"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Trophy, Clock, CheckCircle, XCircle, RotateCcw, Play } from "lucide-react"
import { useUserData } from "@/hooks/use-user-data"
import { useAuth } from "@/hooks/use-auth" // Also need useAuth to get user ID

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  points: number
}

interface Quiz {
  title: string
  difficulty: string
  category: string
  questions: Question[]
}

interface QuizResult {
  score: number
  totalPoints: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
}

export default function EcoQuiz() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [startTime, setStartTime] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const { user } = useAuth()
  const { updateUserData } = useUserData(user?.uid || null)

  const generateQuiz = async (selectedDifficulty: "easy" | "medium" | "hard" = difficulty) => {
    setLoading(true)
    setQuiz(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setUserAnswers([])
    setShowExplanation(false)
    setQuizCompleted(false)
    setQuizResult(null)

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty: selectedDifficulty,
          category: "sustainability",
          questionCount: 3, // Defaulting to 3 questions as per request
        }),
      })

      if (!response.ok) {
        throw new Error(`Quiz generation failed: ${response.status}`)
      }

      const data = await response.json()
      setQuiz(data.quiz)
      setStartTime(Date.now())
      setDifficulty(selectedDifficulty)
    } catch (error) {
      console.error("Quiz generation error:", error)
      // You could add error state handling here
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !quiz) return

    const newAnswers = [...userAnswers, selectedAnswer]
    setUserAnswers(newAnswers)
    setShowExplanation(true)

    // Auto-advance after showing explanation
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        // Quiz completed
        const endTime = Date.now()
        const timeSpent = Math.round((endTime - startTime) / 1000)

        const correctAnswers = newAnswers.reduce((count, answer, index) => {
          return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
        }, 0)

        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)
        const score = newAnswers.reduce((sum, answer, index) => {
          return sum + (answer === quiz.questions[index].correctAnswer ? quiz.questions[index].points : 0)
        }, 0)

        const result: QuizResult = {
          score,
          totalPoints,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          timeSpent,
        }

        setQuizResult(result)
        setQuizCompleted(true)

        // Update user stats in localStorage
        const percentage = Math.round((score / totalPoints) * 100)

        // Award Eco Genius badge for high scores
        if (percentage >= 90 && user && updateUserData) {
          const userDataKey = `ecopack-user-data-${user.uid}`
          const currentData = JSON.parse(localStorage.getItem(userDataKey) || "{}")
          const hasBadge = currentData.badges?.some((b: any) => b.id === "eco-genius")

          if (!hasBadge) {
            const newBadge = {
              id: "eco-genius",
              name: "Eco Genius",
              emoji: "🧠",
              description: "Achieve 90%+ on an AI Quiz",
              earned: true,
              earnedDate: new Date().toISOString(),
            }
            currentData.badges = [...(currentData.badges || []), newBadge]
            currentData.gameStats.quizScore = Math.max(currentData.gameStats.quizScore || 0, percentage)
            currentData.ecoPoints = (currentData.ecoPoints || 0) + 50 // Award 50 EcoPoints

            localStorage.setItem(userDataKey, JSON.stringify(currentData))
            alert(`🎉 New Badge Earned: ${newBadge.emoji} ${newBadge.name}!\n${newBadge.description}\n+50 EcoPoints!`)
            updateUserData(currentData) // Force re-render of dashboard
          }
        }
      }
    }, 3000)
  }

  const resetQuiz = () => {
    setQuiz(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setUserAnswers([])
    setShowExplanation(false)
    setQuizCompleted(false)
    setQuizResult(null)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
    return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
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

  if (loading) {
    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-green-600 dark:text-green-400 animate-pulse mx-auto mb-4" />
          <p className="text-green-700 dark:text-green-300">Generating your personalized eco quiz...</p>
        </CardContent>
      </Card>
    )
  }

  if (!quiz) {
    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Brain className="w-6 h-6" />🧠 EcoQuiz Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="text-center space-y-6">
            <p className="text-green-700 dark:text-green-300">
              Test your sustainability knowledge with AI-generated questions! 🌱
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Choose Difficulty:</p>
                <div className="flex gap-3 justify-center">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <Button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      variant={difficulty === level ? "default" : "outline"}
                      className={
                        difficulty === level
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900"
                      }
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="font-semibold text-green-800 dark:text-green-200">Easy</div>
                  <div className="text-green-600 dark:text-green-400">Basic recycling & sustainability</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="font-semibold text-yellow-800 dark:text-yellow-200">Medium</div>
                  <div className="text-yellow-600 dark:text-yellow-400">Environmental impact & practices</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                  <div className="font-semibold text-red-800 dark:text-red-200">Hard</div>
                  <div className="text-red-600 dark:text-red-400">Advanced eco-science & policy</div>
                </div>
              </div>

              <Button
                onClick={() => generateQuiz(difficulty)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (quizCompleted && quizResult) {
    const percentage = Math.round((quizResult.score / quizResult.totalPoints) * 100)

    return (
      <Card className="border-green-200 dark:border-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Trophy className="w-6 h-6" />🎉 Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 dark:bg-gray-800">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <Badge className={`text-2xl px-4 py-2 ${getScoreColor(percentage)}`}>{percentage}% Score</Badge>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{quizResult.score}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Points Earned</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quizResult.correctAnswers}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Correct Answers</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{quizResult.timeSpent}s</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Time Taken</div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded-lg">
                  <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                  <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">Difficulty</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-900 dark:to-amber-900 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  {percentage >= 80 ? "🌟 Eco Expert!" : percentage >= 60 ? "🌱 Eco Enthusiast!" : "🌿 Eco Learner!"}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {percentage >= 80
                    ? "Outstanding! You're a sustainability champion!"
                    : percentage >= 60
                      ? "Great job! You're on the right track to becoming eco-conscious!"
                      : "Keep learning! Every step towards sustainability matters!"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => generateQuiz(difficulty)} className="bg-green-600 hover:bg-green-700 text-white">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900 bg-transparent"
              >
                New Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <Card className="border-green-200 dark:border-green-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-100 to-amber-100 dark:from-green-800 dark:to-amber-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            {quiz.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
            <Badge variant="outline">
              {currentQuestion + 1}/{quiz.questions.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="p-6 dark:bg-gray-800">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">{currentQ.question}</h3>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all "

                if (showExplanation) {
                  if (index === currentQ.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200"
                  } else if (index === selectedAnswer && index !== currentQ.correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200"
                  } else {
                    buttonClass += "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  }
                } else {
                  if (index === selectedAnswer) {
                    buttonClass += "border-green-500 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200"
                  } else {
                    buttonClass +=
                      "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 text-green-800 dark:text-green-200"
                  }
                }

                return (
                  <button key={index} onClick={() => handleAnswerSelect(index)} className={buttonClass}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {showExplanation && index === currentQ.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />
                      )}
                      {showExplanation && index === selectedAnswer && index !== currentQ.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {showExplanation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Explanation</h4>
              <p className="text-blue-700 dark:text-blue-300">{currentQ.explanation}</p>
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Points: {selectedAnswer === currentQ.correctAnswer ? currentQ.points : 0}/{currentQ.points}
              </div>
            </div>
          )}

          {!showExplanation && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              Submit Answer
            </Button>
          )}

          {showExplanation && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {currentQuestion < quiz.questions.length - 1
                    ? "Next question in 3 seconds..."
                    : "Calculating results..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
