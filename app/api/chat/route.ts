import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyAIcNNTE_7zylmH0jKDT0sapCaC1510Y7Q")

// Retry function with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (i === maxRetries - 1) throw error

      if (error.message?.includes("overloaded") || error.message?.includes("503") || error.message?.includes("429")) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
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
    const { message } = await request.json()

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      },
    })

    const prompt = `You are EcoPal, a friendly sustainability chatbot assistant for EcoPackAI. You help users with questions about:
- Recycling and waste management
- Packaging materials and their environmental impact
- Sustainable alternatives and eco-friendly choices
- Local recycling guidelines
- Environmental tips and facts

Keep your responses:
- Friendly and encouraging with emojis
- Educational but easy to understand
- Practical and actionable
- Brief (2-3 sentences max)
- Focused on sustainability topics

User question: ${message}

Respond as EcoPal with helpful, emoji-rich advice:`

    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt)
    })

    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Chat error:", error)

    // Smart fallback responses based on keywords
    const message = (await request.json()).message?.toLowerCase() || ""

    let fallbackResponse =
      "🌱 Great question! I'm having trouble connecting right now, but here's a quick tip: Always check for recycling symbols on packaging!"

    if (message.includes("recycle") || message.includes("recycling")) {
      fallbackResponse =
        "♻️ Recycling tip: Clean containers before recycling and check your local guidelines - different areas accept different materials! 🌍"
    } else if (message.includes("plastic")) {
      fallbackResponse =
        "🔢 Plastic codes matter! Look for numbers 1-7 in triangles - #1 (PET) and #2 (HDPE) are most commonly recycled! ♻️"
    } else if (message.includes("sustainable") || message.includes("eco")) {
      fallbackResponse =
        "🌱 Sustainability starts small! Choose products with minimal packaging, reuse containers, and support brands with eco-friendly practices! 💚"
    } else if (message.includes("alternative")) {
      fallbackResponse =
        "🔄 Great alternatives: Glass over plastic, paper over foil, refillable over single-use! Every swap counts! 🌟"
    } else if (message.includes("compost")) {
      fallbackResponse =
        "🌿 Composting rocks! Paper, cardboard (uncoated), and food scraps can often be composted - but avoid glossy or plastic-coated materials! 🍃"
    }

    return NextResponse.json({ response: fallbackResponse })
  }
}
