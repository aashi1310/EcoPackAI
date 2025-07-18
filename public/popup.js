document.addEventListener("DOMContentLoaded", () => {
  const scanButton = document.getElementById("scanButton")
  const loading = document.getElementById("loading")
  const result = document.getElementById("result")

  // Load stats
  loadStats()

  scanButton.addEventListener("click", () => {
    scanCurrentProduct()
  })

  async function scanCurrentProduct() {
    scanButton.disabled = true
    loading.style.display = "block"
    result.style.display = "none"

    try {
      // Get current tab
      const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })

      // Execute content script to extract product info
      const results = await window.chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractProductInfo,
      })

      const productInfo = results[0].result

      if (!productInfo) {
        showError("No product found on this page")
        return
      }

      // Analyze with EcoPackAI API
      const analysis = await analyzeProduct(productInfo)
      showResult(analysis)

      // Save to stats
      saveToStats(analysis)
    } catch (error) {
      console.error("Scan error:", error)
      showError("Failed to scan product. Please try again.")
    } finally {
      scanButton.disabled = false
      loading.style.display = "none"
    }
  }

  async function analyzeProduct(productInfo) {
    // For demo, we'll use local analysis
    // In production, this would call your EcoPackAI API

    const mockAnalysis = {
      productName: productInfo.name,
      ecoScore: Math.floor(Math.random() * 10) + 1,
      packaging: getPackagingType(productInfo.name),
      tips: getEcoTips(productInfo.name),
      alternatives: getAlternatives(productInfo.name),
    }

    return mockAnalysis
  }

  function getPackagingType(productName) {
    const name = productName.toLowerCase()
    if (name.includes("bottle") || name.includes("water")) return "Plastic Bottle"
    if (name.includes("box") || name.includes("cereal")) return "Cardboard Box"
    if (name.includes("can") || name.includes("soda")) return "Aluminum Can"
    if (name.includes("bag") || name.includes("chips")) return "Plastic Bag"
    return "Mixed Materials"
  }

  function getEcoTips(productName) {
    const name = productName.toLowerCase()
    if (name.includes("bottle")) return "Look for glass alternatives or refillable options"
    if (name.includes("box")) return "Great choice! Cardboard is highly recyclable"
    if (name.includes("can")) return "Excellent! Aluminum is infinitely recyclable"
    if (name.includes("bag")) return "Consider bulk buying to reduce packaging waste"
    return "Check for recycling symbols and choose minimal packaging"
  }

  function getAlternatives(productName) {
    const name = productName.toLowerCase()
    if (name.includes("bottle")) return "Glass bottles, Aluminum cans"
    if (name.includes("bag")) return "Bulk bins, Reusable containers"
    if (name.includes("plastic")) return "Paper alternatives, Glass containers"
    return "Minimal packaging options, Bulk alternatives"
  }

  function showResult(analysis) {
    const scoreClass = analysis.ecoScore >= 7 ? "green" : analysis.ecoScore >= 4 ? "yellow" : "red"
    const scoreEmoji = analysis.ecoScore >= 7 ? "🟢" : analysis.ecoScore >= 4 ? "🟡" : "🔴"

    result.innerHTML = `
      <div class="result ${scoreClass}">
        <div class="score">${scoreEmoji} EcoScore: ${analysis.ecoScore}/10</div>
        <div><strong>Packaging:</strong> ${analysis.packaging}</div>
        <div class="tips"><strong>💡 Tip:</strong> ${analysis.tips}</div>
        <div class="tips"><strong>🌱 Alternatives:</strong> ${analysis.alternatives}</div>
      </div>
    `
    result.style.display = "block"
  }

  function showError(message) {
    result.innerHTML = `
      <div class="result red">
        <div class="score">❌ Error</div>
        <div>${message}</div>
      </div>
    `
    result.style.display = "block"
  }

  function saveToStats(analysis) {
    window.chrome.storage.local.get(["totalScans", "totalScore", "co2Saved"], (data) => {
      const newTotalScans = (data.totalScans || 0) + 1
      const newTotalScore = (data.totalScore || 0) + analysis.ecoScore
      const newCo2Saved = (data.co2Saved || 0) + analysis.ecoScore * 0.1

      window.chrome.storage.local.set({
        totalScans: newTotalScans,
        totalScore: newTotalScore,
        co2Saved: newCo2Saved,
      })

      loadStats()
    })
  }

  function loadStats() {
    window.chrome.storage.local.get(["totalScans", "totalScore", "co2Saved"], (data) => {
      const totalScans = data.totalScans || 0
      const totalScore = data.totalScore || 0
      const co2Saved = data.co2Saved || 0
      const avgScore = totalScans > 0 ? Math.round(totalScore / totalScans) : 0

      document.getElementById("totalScans").textContent = totalScans
      document.getElementById("avgScore").textContent = avgScore
      document.getElementById("co2Saved").textContent = co2Saved.toFixed(1) + "kg"
    })
  }
})

// Function to be injected into the page
function extractProductInfo() {
  const hostname = window.location.hostname
  let productInfo = null

  if (hostname.includes("amazon")) {
    productInfo = extractAmazonProduct()
  } else if (hostname.includes("flipkart")) {
    productInfo = extractFlipkartProduct()
  } else if (hostname.includes("myntra")) {
    productInfo = extractMyntraProduct()
  }

  return productInfo
}

function extractAmazonProduct() {
  const titleElement = document.querySelector('#productTitle, [data-cy="product-title"]')
  const imageElement = document.querySelector("#landingImage, .a-dynamic-image")
  const priceElement = document.querySelector(".a-price-whole, .a-offscreen")

  if (titleElement) {
    return {
      name: titleElement.textContent.trim(),
      image: imageElement ? imageElement.src : null,
      price: priceElement ? priceElement.textContent.trim() : null,
      url: window.location.href,
      site: "Amazon",
    }
  }
  return null
}

function extractFlipkartProduct() {
  const titleElement = document.querySelector("span.B_NuCI, .pdp-product-name")
  const imageElement = document.querySelector("img[data-tkid], .CXW8mj img")
  const priceElement = document.querySelector("._30jeq3, .pdp-price")

  if (titleElement) {
    return {
      name: titleElement.textContent.trim(),
      image: imageElement ? imageElement.src : null,
      price: priceElement ? priceElement.textContent.trim() : null,
      url: window.location.href,
      site: "Flipkart",
    }
  }
  return null
}

function extractMyntraProduct() {
  const titleElement = document.querySelector(".pdp-product-name, h1.pdp-name")
  const imageElement = document.querySelector(".image-grid-image, .pdp-img")
  const priceElement = document.querySelector(".pdp-price, .product-discountedPrice")

  if (titleElement) {
    return {
      name: titleElement.textContent.trim(),
      image: imageElement ? imageElement.src : null,
      price: priceElement ? priceElement.textContent.trim() : null,
      url: window.location.href,
      site: "Myntra",
    }
  }
  return null
}
