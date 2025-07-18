import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyAIcNNTE_7zylmH0jKDT0sapCaC1510Y7Q")

// Retry function with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, error.message)

      if (i === maxRetries - 1) throw error

      // Check if it's a retryable error
      if (
        error.message?.includes("overloaded") ||
        error.message?.includes("503") ||
        error.message?.includes("429") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.message?.includes("UNAVAILABLE")
      ) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
        console.log(`Retrying after ${delay}ms delay...`)
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
    const formData = await request.formData()
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const userId = formData.get("userId") as string
    const image = formData.get("image") as File

    if (!description && !image) {
      return NextResponse.json({ error: "Please provide a description or image" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    // Simplified prompt for better reliability
    const prompt = `Analyze this product packaging for environmental impact. Product: ${description}${location ? ` Location: ${location}` : ""}

Return ONLY a valid JSON object with this exact structure:
{
  "components": [{"name": "bottle", "material": "PET #1 plastic", "recyclable": true, "plasticCode": "#1 PET", "disposalTip": "rinse and recycle"}],
  "ecoScore": 6,
  "carbonFootprint": "0.5kg CO2 - like charging phone for 2 days",
  "greenTip": "♻️ Always rinse containers before recycling",
  "alternative": "Choose glass bottles or aluminum cans instead",
  "alternatives": [{"name": "Glass Bottle", "brand": "EcoChoice", "ecoScore": 9, "reason": "Infinitely recyclable", "image": "/placeholder.svg?height=100&width=100"}],
  "diyTips": [{"title": "Plant Pot", "description": "Cut and use as seedling starter", "difficulty": "easy", "icon": "🌱"}],
  "storyboard": [
    {"frame": 1, "title": "Production", "description": "Made from petroleum", "image": "/placeholder.svg?height=200&width=300"},
    {"frame": 2, "title": "Usage", "description": "Used once then discarded", "image": "/placeholder.svg?height=200&width=300"},
    {"frame": 3, "title": "Recycling", "description": "Can be recycled into new bottles", "image": "/placeholder.svg?height=200&width=300"},
    {"frame": 4, "title": "Impact", "description": "Reduces landfill waste", "image": "/placeholder.svg?height=200&width=300"}
  ],
  "summary": {"material": "PET Plastic", "recyclable": "Yes", "plasticCode": "#1 PET", "disposalTip": "Rinse and recycle", "ecoRating": 6, "greenTip": "Choose reusable alternatives"},
  "gamification": {"badgeProgress": "🌱 Keep scanning!", "progressScore": 65, "motivationalMessage": "Great job analyzing packaging!", "weeklyChallenge": "Find 3 recyclable items this week"}
}`

    let result
    let responseText = ""

    try {
      // Use retry logic for API calls
      if (image) {
        const bytes = await image.arrayBuffer()
        const base64 = Buffer.from(bytes).toString("base64")

        result = await retryWithBackoff(async () => {
          return await model.generateContent([
            prompt + "\n\nAnalyze the packaging shown in this image:",
            {
              inlineData: {
                data: base64,
                mimeType: image.type,
              },
            },
          ])
        })
      } else {
        result = await retryWithBackoff(async () => {
          return await model.generateContent(prompt)
        })
      }

      responseText = result.response.text()
      console.log("Gemini response:", responseText)
    } catch (apiError: any) {
      console.error("Gemini API failed:", apiError.message)
      // Fall through to fallback response
      responseText = ""
    }

    let analysisData

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
          analysisData = JSON.parse(jsonMatch[0])

          // Validate required fields
          if (analysisData.components && analysisData.ecoScore && analysisData.summary) {
            return NextResponse.json(analysisData)
          }
        }
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError)
      }
    }

    // Enhanced fallback response based on description
    console.log("Using fallback response for:", description)

    // Simple analysis based on keywords
    let ecoScore = 5
    let material = "Mixed materials"
    let recyclable = false
    let plasticCode = "N/A"
    let category = "General"

    const desc = description.toLowerCase()

    if (desc.includes("plastic bottle") || desc.includes("water bottle") || desc.includes("soda bottle")) {
      material = "PET #1 Plastic"
      recyclable = true
      ecoScore = 6
      plasticCode = "#1 PET"
      category = "Beverages"
    } else if (desc.includes("glass bottle") || desc.includes("glass jar")) {
      material = "Glass"
      recyclable = true
      ecoScore = 9
      category = "Beverages"
    } else if (desc.includes("aluminum") || desc.includes("can") || desc.includes("soda can")) {
      material = "Aluminum"
      recyclable = true
      ecoScore = 9
      category = "Beverages"
    } else if (desc.includes("paper") || desc.includes("cardboard") || desc.includes("box")) {
      material = "Paper/Cardboard"
      recyclable = true
      ecoScore = 8
      category = "Packaging"
    } else if (desc.includes("plastic bag") || desc.includes("chip bag") || desc.includes("wrapper")) {
      material = "Plastic Film"
      recyclable = false
      ecoScore = 2
      category = "Snacks"
    } else if (desc.includes("yogurt") || desc.includes("container")) {
      material = "HDPE #2 Plastic"
      recyclable = true
      ecoScore = 6
      plasticCode = "#2 HDPE"
      category = "Food"
    }

    const fallbackResponse = {
      components: [
        {
          name: "Primary packaging",
          material: material,
          recyclable: recyclable,
          plasticCode: plasticCode,
          disposalTip: recyclable
            ? `Clean and place in recycling bin${location ? ` (${location} guidelines apply)` : ""}`
            : "Check local waste management guidelines for proper disposal",
        },
      ],
      ecoScore: ecoScore,
      carbonFootprint: `Estimated ${(ecoScore * 0.08).toFixed(2)} kg CO₂ - equivalent to ${ecoScore < 6 ? "driving 3km in a car" : "charging your phone for 5 days"}`,
      greenTip: recyclable
        ? "♻️ Always rinse containers before recycling!"
        : "🌱 Look for eco-friendly alternatives with less packaging",
      alternative:
        ecoScore < 7
          ? "Consider products with minimal, recyclable packaging or refillable options"
          : "Great choice! This packaging is relatively eco-friendly",
      alternatives: [
        {
          name: ecoScore < 7 ? "Eco-Friendly Alternative" : "Even Better Option",
          brand: "GreenChoice",
          ecoScore: Math.min(10, ecoScore + 2),
          reason: ecoScore < 7 ? "Uses sustainable materials and minimal packaging" : "Zero-waste packaging option",
          image: "/placeholder.svg?height=100&width=100",
        },
        {
          name: "Bulk Option",
          brand: "BulkStore",
          ecoScore: Math.min(10, ecoScore + 3),
          reason: "Bring your own container, eliminate packaging waste",
          image: "/placeholder.svg?height=100&width=100",
        },
      ],
      diyTips: [
        {
          title: material.includes("Glass")
            ? "Storage Container"
            : material.includes("Plastic")
              ? "Plant Pot"
              : "Organizer",
          description: material.includes("Glass")
            ? "Perfect for storing bulk foods, spices, or craft supplies"
            : material.includes("Plastic")
              ? "Cut drainage holes and use for starting seedlings"
              : "Use for organizing small items around the house",
          difficulty: "easy",
          icon: material.includes("Glass") ? "🫙" : material.includes("Plastic") ? "🌱" : "📦",
        },
        {
          title: "Art Project",
          description: `Transform this ${material.toLowerCase()} into a creative art piece or decoration`,
          difficulty: "medium",
          icon: "🎨",
        },
      ],
      storyboard: [
        {
          frame: 1,
          title: "Production",
          description: `${material} is manufactured using ${material.includes("Glass") ? "sand and high heat" : material.includes("Aluminum") ? "bauxite ore" : "petroleum-based materials"}`,
          image: "/placeholder.svg?height=200&width=300",
        },
        {
          frame: 2,
          title: "Usage",
          description: `Product is packaged and used by consumers for ${category.toLowerCase()}`,
          image: "/placeholder.svg?height=200&width=300",
        },
        {
          frame: 3,
          title: recyclable ? "Recycling Path" : "Disposal",
          description: recyclable
            ? `Can be recycled into new ${material.toLowerCase()} products`
            : "Requires special disposal or ends up in landfill",
          image: "/placeholder.svg?height=200&width=300",
        },
        {
          frame: 4,
          title: "Environmental Impact",
          description: recyclable
            ? "Becomes part of circular economy, reducing need for virgin materials"
            : "May persist in environment for decades if not properly managed",
          image: "/placeholder.svg?height=200&width=300",
        },
      ],
      summary: {
        material: material,
        recyclable: recyclable ? "Yes" : "No",
        plasticCode: plasticCode,
        disposalTip: recyclable ? "Clean and recycle" : "Check local guidelines",
        ecoRating: ecoScore,
        greenTip: recyclable ? "Rinse before recycling" : "Choose better alternatives",
      },
      gamification: {
        badgeProgress:
          ecoScore >= 8
            ? "🌟 Excellent choice! You're becoming an eco-expert!"
            : ecoScore >= 6
              ? "🌱 Good analysis! Keep learning about sustainable options"
              : "📚 Every scan teaches you more about environmental impact!",
        progressScore: Math.min(95, 45 + ecoScore * 6),
        motivationalMessage:
          ecoScore >= 7
            ? "Fantastic! You're making sustainable decisions! 🌟"
            : "Great job analyzing! Every choice matters for our planet! 🌍",
        weeklyChallenge: recyclable
          ? "♻️ Challenge: Find 2 more recyclable products this week!"
          : "🌱 Challenge: Look for 3 plastic-free alternatives this week!",
      },
    }

    return NextResponse.json(fallbackResponse)
  } catch (error: any) {
    console.error("Analysis error:", error)

    // Final fallback for any unexpected errors
    return NextResponse.json(
      {
        components: [
          {
            name: "Product packaging",
            material: "Unknown material",
            recyclable: false,
            plasticCode: "N/A",
            disposalTip: "Check local waste management guidelines",
          },
        ],
        ecoScore: 5,
        carbonFootprint: "Unable to calculate - try describing the packaging materials",
        greenTip: "🌱 Look for clear recycling symbols and material codes on packaging",
        alternative: "Choose products with clearly labeled, recyclable packaging",
        alternatives: [
          {
            name: "Eco-Friendly Option",
            brand: "GreenChoice",
            ecoScore: 8,
            reason: "Clear sustainability labeling and recyclable materials",
            image: "/placeholder.svg?height=100&width=100",
          },
        ],
        diyTips: [
          {
            title: "Research Project",
            description: "Look up the packaging materials online to learn about their environmental impact",
            difficulty: "easy",
            icon: "🔍",
          },
        ],
        storyboard: [
          {
            frame: 1,
            title: "Unknown Origin",
            description: "Without clear material identification, environmental impact is unclear",
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            frame: 2,
            title: "Consumer Use",
            description: "Product serves its intended purpose",
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            frame: 3,
            title: "Uncertain Fate",
            description: "Without proper labeling, disposal method is unclear",
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            frame: 4,
            title: "Learning Opportunity",
            description: "This highlights the importance of clear environmental labeling",
            image: "/placeholder.svg?height=200&width=300",
          },
        ],
        summary: {
          material: "Unknown",
          recyclable: "Unclear",
          plasticCode: "N/A",
          disposalTip: "Research materials online",
          ecoRating: 5,
          greenTip: "Look for clear labeling",
        },
        gamification: {
          badgeProgress: "🔍 Detective work! Learning to identify packaging materials",
          progressScore: 50,
          motivationalMessage: "Every analysis helps you become more environmentally aware! 🌍",
          weeklyChallenge: "🎯 Challenge: Find 3 products with clear recycling labels!",
        },
      },
      { status: 200 },
    )
  }
}
