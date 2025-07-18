// EcoPackAI Content Script
;(() => {
  let widget = null
  let isMinimized = false

  // Initialize the extension
  function init() {
    // Only run on product pages
    if (isProductPage()) {
      createWidget()
      autoScanProduct()
    }
  }

  function isProductPage() {
    const hostname = window.location.hostname
    const path = window.location.pathname

    if (hostname.includes("amazon")) {
      return path.includes("/dp/") || path.includes("/gp/product/")
    } else if (hostname.includes("flipkart")) {
      return path.includes("/p/") || document.querySelector(".B_NuCI, .pdp-product-name")
    } else if (hostname.includes("myntra")) {
      return path.includes("/buy") || document.querySelector(".pdp-product-name")
    }

    return false
  }

  function createWidget() {
    if (widget) return

    widget = document.createElement("div")
    widget.className = "ecopack-widget"
    widget.innerHTML = `
      <div class="ecopack-header">
        <button class="ecopack-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
        <div>🌱 EcoPackAI</div>
        <div style="font-size: 12px; opacity: 0.9;">Sustainability Scanner</div>
      </div>
      <div class="ecopack-content">
        <div id="ecopack-loading" style="text-align: center; padding: 20px;">
          <div style="margin-bottom: 10px;">🔍 Analyzing packaging...</div>
        </div>
        <div id="ecopack-result" style="display: none;"></div>
      </div>
    `

    document.body.appendChild(widget)

    // Add minimize functionality
    setTimeout(() => {
      if (widget) {
        minimizeWidget()
      }
    }, 5000) // Auto-minimize after 5 seconds
  }

  function minimizeWidget() {
    if (!widget || isMinimized) return

    widget.style.display = "none"
    isMinimized = true

    const minimizeBtn = document.createElement("button")
    minimizeBtn.className = "ecopack-minimize"
    minimizeBtn.innerHTML = "🌱"
    minimizeBtn.title = "EcoPackAI Scanner"
    minimizeBtn.onclick = () => {
      widget.style.display = "block"
      minimizeBtn.remove()
      isMinimized = false
    }

    document.body.appendChild(minimizeBtn)
  }

  async function autoScanProduct() {
    try {
      const productInfo = extractProductInfo()
      if (!productInfo) return

      // Simulate analysis
      setTimeout(() => {
        const analysis = analyzeProduct(productInfo)
        displayResult(analysis)
      }, 2000)
    } catch (error) {
      console.error("Auto-scan error:", error)
    }
  }

  function analyzeProduct(productInfo) {
    const name = productInfo.name.toLowerCase()
    let ecoScore = 5
    let packaging = "Mixed Materials"
    let tips = "Check for recycling symbols"

    // Simple analysis based on product name
    if (name.includes("glass") || name.includes("jar")) {
      ecoScore = 9
      packaging = "Glass Container"
      tips = "Excellent choice! Glass is infinitely recyclable"
    } else if (name.includes("aluminum") || name.includes("can")) {
      ecoScore = 9
      packaging = "Aluminum Can"
      tips = "Great! Aluminum has high recycling value"
    } else if (name.includes("paper") || name.includes("cardboard")) {
      ecoScore = 8
      packaging = "Paper/Cardboard"
      tips = "Good choice! Paper is biodegradable and recyclable"
    } else if (name.includes("plastic") || name.includes("bottle")) {
      ecoScore = 4
      packaging = "Plastic Container"
      tips = "Look for recycling codes #1 or #2 for better recyclability"
    } else if (name.includes("bag") || name.includes("pouch")) {
      ecoScore = 2
      packaging = "Plastic Film"
      tips = "Consider bulk alternatives to reduce packaging waste"
    }

    return {
      productName: productInfo.name,
      ecoScore,
      packaging,
      tips,
      carbonFootprint: `${(ecoScore * 0.08).toFixed(2)} kg CO₂`,
      alternatives: getAlternatives(ecoScore),
    }
  }

  function getAlternatives(ecoScore) {
    if (ecoScore >= 8) return "Already eco-friendly! 🌟"
    if (ecoScore >= 5) return "Look for glass or aluminum alternatives"
    return "Consider bulk buying or reusable containers"
  }

  function displayResult(analysis) {
    const loadingEl = document.getElementById("ecopack-loading")
    const resultEl = document.getElementById("ecopack-result")

    if (!loadingEl || !resultEl) return

    const scoreClass = analysis.ecoScore >= 7 ? "green" : analysis.ecoScore >= 4 ? "yellow" : "red"
    const scoreEmoji = analysis.ecoScore >= 7 ? "🟢" : analysis.ecoScore >= 4 ? "🟡" : "🔴"

    resultEl.innerHTML = `
      <div class="ecopack-score ${scoreClass}">
        <div class="ecopack-score-value">${scoreEmoji} ${analysis.ecoScore}/10</div>
        <div style="font-size: 12px;">EcoScore</div>
      </div>
      <div class="ecopack-details">
        <div class="ecopack-detail"><strong>📦 Packaging:</strong> ${analysis.packaging}</div>
        <div class="ecopack-detail"><strong>🌍 Carbon:</strong> ${analysis.carbonFootprint}</div>
        <div class="ecopack-detail"><strong>💡 Tip:</strong> ${analysis.tips}</div>
        <div class="ecopack-detail"><strong>🌱 Alternative:</strong> ${analysis.alternatives}</div>
      </div>
    `

    loadingEl.style.display = "none"
    resultEl.style.display = "block"
  }

  function extractProductInfo() {
    // Placeholder for product info extraction logic
    return {
      name: document.querySelector(".product-title")
        ? document.querySelector(".product-title").innerText
        : "Unknown Product",
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
