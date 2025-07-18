import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyAIcNNTE_7zylmH0jKDT0sapCaC1510Y7Q")

// Retry function with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      console.error(`Quiz API attempt ${i + 1} failed:`, error.message)

      if (i === maxRetries - 1) throw error

      if (
        error.message?.includes("overloaded") ||
        error.message?.includes("503") ||
        error.message?.includes("429") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.message?.includes("UNAVAILABLE")
      ) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
        console.log(`Retrying quiz generation after ${delay}ms delay...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      throw error
    }
  }
  throw new Error("Max retries exceeded")
}

export async function POST(request: NextRequest) {
  try {
    const { difficulty, category, questionCount: reqQuestionCount } = await request.json()
    const questionCount = reqQuestionCount || 3 // Default to 3 questions

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    const prompt = `Generate a sustainability and recycling quiz with ${questionCount || 5} questions.
Difficulty: ${difficulty || "medium"}
Category: ${category || "general"}

Create questions about:
- Recycling symbols and plastic codes
- Environmental impact of packaging
- Sustainable alternatives
- Waste reduction tips
- Eco-friendly practices

Return ONLY a valid JSON object with this exact structure:
{
  "quiz": {
    "title": "Sustainability Quiz",
    "difficulty": "${difficulty || "medium"}",
    "category": "${category || "general"}",
    "questions": [
      {
        "id": 1,
        "question": "What does the recycling symbol #1 PET mean?",
        "options": ["Polyethylene Terephthalate", "Plastic Eating Turtle", "Pretty Easy Trash", "Petroleum Extract Type"],
        "correctAnswer": 0,
        "explanation": "PET stands for Polyethylene Terephthalate, commonly used for water bottles and food containers.",
        "points": 10
      }
    ]
  }
}

Make questions educational, engaging, and factually accurate. Include diverse topics within sustainability.`

    let result
    let responseText = ""

    try {
      result = await retryWithBackoff(async () => {
        return await model.generateContent(prompt)
      })

      responseText = result.response.text()
      console.log("Quiz generation response:", responseText)
    } catch (apiError: any) {
      console.error("Gemini API failed for quiz:", apiError.message)
      responseText = ""
    }

    let quizData

    if (responseText) {
      try {
        // Clean and extract JSON from the response
        let jsonText = responseText.trim()

        // Remove markdown code blocks if present
        if (jsonText.includes("```json")) {
          jsonText = jsonText.replace(/```json\n?/, "").replace(/\n?```$/, "")
        } else if (jsonText.includes("```")) {
          jsonText = jsonText.replace(/```\n?/, "").replace(/\n?```$/, "")
        }

        // Try to find JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          quizData = JSON.parse(jsonMatch[0])

          // Validate required fields
          if (quizData.quiz && quizData.quiz.questions && Array.isArray(quizData.quiz.questions)) {
            return NextResponse.json(quizData)
          }
        }
      } catch (parseError) {
        console.error("Quiz JSON parsing failed:", parseError)
      }
    }

    // Fallback quiz data
    console.log("Using fallback quiz for:", { difficulty, category })

    const fallbackQuizzes = {
      easy: {
        title: "Eco Basics Quiz",
        difficulty: "easy",
        category: category || "general",
        questions: [
          {
            id: 1,
            question: "What does the ♻️ symbol mean?",
            options: ["Recyclable", "Reusable", "Renewable", "Returnable"],
            correctAnswer: 0,
            explanation:
              "The recycling symbol indicates that a material can be recycled and processed into new products.",
            points: 10,
          },
          {
            id: 2,
            question: "Which material takes the longest to decompose?",
            options: ["Paper", "Glass", "Plastic", "Aluminum"],
            correctAnswer: 2,
            explanation:
              "Plastic can take 400-1000 years to decompose, making it one of the most persistent pollutants.",
            points: 10,
          },
          {
            id: 3,
            question: "What does PET #1 plastic commonly contain?",
            options: ["Milk", "Water bottles", "Yogurt", "Detergent"],
            correctAnswer: 1,
            explanation: "PET #1 plastic is commonly used for water bottles and soft drink containers.",
            points: 10,
          },
          {
            id: 4,
            question: "Which is better for the environment?",
            options: ["Paper bags", "Plastic bags", "Reusable bags", "No bags"],
            correctAnswer: 2,
            explanation: "Reusable bags have the lowest environmental impact when used multiple times.",
            points: 10,
          },
          {
            id: 5,
            question: "What should you do before recycling containers?",
            options: ["Break them", "Clean them", "Label them", "Heat them"],
            correctAnswer: 1,
            explanation: "Cleaning containers removes food residue and contamination, making recycling more effective.",
            points: 10,
          },
        ],
      },
      medium: {
        title: "Sustainability Challenge",
        difficulty: "medium",
        category: category || "general",
        questions: [
          {
            id: 1,
            question: "What does HDPE #2 plastic stand for?",
            options: [
              "High Density Polyethylene",
              "Heavy Duty Plastic Element",
              "Hard Durable Polymer Exterior",
              "High Definition Plastic Envelope",
            ],
            correctAnswer: 0,
            explanation: "HDPE stands for High Density Polyethylene, used in milk jugs and detergent bottles.",
            points: 15,
          },
          {
            id: 2,
            question: "Which packaging has the lowest carbon footprint?",
            options: ["Aluminum cans", "Glass bottles", "Plastic bottles", "Tetra packs"],
            correctAnswer: 0,
            explanation: "Aluminum cans have a lower carbon footprint and are infinitely recyclable.",
            points: 15,
          },
          {
            id: 3,
            question: "What is 'greenwashing'?",
            options: [
              "Cleaning with eco products",
              "Misleading environmental claims",
              "Washing clothes efficiently",
              "Green building practices",
            ],
            correctAnswer: 1,
            explanation: "Greenwashing is when companies make misleading claims about their environmental practices.",
            points: 15,
          },
          {
            id: 4,
            question: "Which plastic code is NOT commonly recyclable?",
            options: ["#1 PET", "#2 HDPE", "#6 PS", "#5 PP"],
            correctAnswer: 2,
            explanation: "#6 PS (Polystyrene) is rarely accepted in curbside recycling programs.",
            points: 15,
          },
          {
            id: 5,
            question: "What is the circular economy?",
            options: [
              "Round packaging design",
              "Waste reduction system",
              "Circular supply chains",
              "Global trade patterns",
            ],
            correctAnswer: 1,
            explanation:
              "The circular economy focuses on eliminating waste through reuse, recycling, and regeneration.",
            points: 15,
          },
        ],
      },
      hard: {
        title: "Eco Expert Challenge",
        difficulty: "hard",
        category: category || "general",
        questions: [
          {
            id: 1,
            question: "What is the main component of biodegradable plastics?",
            options: ["Petroleum", "Corn starch", "Recycled plastic", "Natural gas"],
            correctAnswer: 1,
            explanation: "Many biodegradable plastics are made from corn starch and other plant-based materials.",
            points: 20,
          },
          {
            id: 2,
            question: "Which has the highest recycling rate globally?",
            options: ["Paper", "Glass", "Aluminum", "Plastic"],
            correctAnswer: 2,
            explanation:
              "Aluminum has the highest recycling rate at about 75% globally, and can be recycled infinitely.",
            points: 20,
          },
          {
            id: 3,
            question: "What is the Great Pacific Garbage Patch primarily composed of?",
            options: ["Large plastic debris", "Microplastics", "Glass bottles", "Metal cans"],
            correctAnswer: 1,
            explanation: "The Great Pacific Garbage Patch is mostly microplastics, not a solid island of trash.",
            points: 20,
          },
          {
            id: 4,
            question: "Which country has the highest plastic recycling rate?",
            options: ["Germany", "Japan", "South Korea", "Norway"],
            correctAnswer: 2,
            explanation: "South Korea has one of the highest plastic recycling rates at over 85%.",
            points: 20,
          },
          {
            id: 5,
            question: "What is chemical recycling?",
            options: [
              "Using chemicals to clean plastic",
              "Breaking plastic into molecular components",
              "Chemical sorting of materials",
              "Adding chemicals to improve recycling",
            ],
            correctAnswer: 1,
            explanation: "Chemical recycling breaks plastic down to its molecular components to create new materials.",
            points: 20,
          },
        ],
      },
    }

    // Ensure the number of questions in fallback matches requested count if possible
    const selectedQuiz = fallbackQuizzes[difficulty as keyof typeof fallbackQuizzes] || fallbackQuizzes.medium
    selectedQuiz.questions = selectedQuiz.questions.slice(0, questionCount) // Trim to requested count

    return NextResponse.json({ quiz: selectedQuiz })
  } catch (error: any) {
    console.error("Quiz generation error:", error)

    // Final fallback
    return NextResponse.json(
      {
        quiz: {
          title: "Basic Eco Quiz",
          difficulty: "easy",
          category: "general",
          questions: [
            {
              id: 1,
              question: "What does recycling help reduce?",
              options: ["Waste in landfills", "Air pollution", "Water usage", "All of the above"],
              correctAnswer: 3,
              explanation: "Recycling helps reduce waste, pollution, and resource consumption.",
              points: 10,
            },
          ],
        },
      },
      { status: 200 },
    )
  }
}
