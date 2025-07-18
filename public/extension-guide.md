# EcoPackAI Chrome Extension Installation Guide

## 📦 What is the EcoPackAI Scanner?

The EcoPackAI Scanner is a Chrome extension that analyzes product packaging sustainability while you shop online on Amazon, Flipkart, Myntra, and other e-commerce sites.

## 🚀 Features

- **Real-time Analysis**: Automatically scans products on supported e-commerce sites
- **EcoScore Rating**: Shows sustainability scores from 1-10
- **Packaging Insights**: Identifies materials and recyclability
- **Green Tips**: Provides eco-friendly alternatives and disposal tips
- **Shopping Stats**: Tracks your sustainable shopping progress

## 📥 Installation Steps

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download Extension Files**
   - Copy all files from the `public/` folder to a new directory
   - Files needed: `manifest.json`, `popup.html`, `popup.js`, `content.js`, `styles.css`

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/` in your Chrome browser
   - Or click Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

4. **Load Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The EcoPackAI extension should appear in your extensions list

5. **Pin Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Pin EcoPackAI for easy access

### Method 2: Package as .crx (Advanced)

1. **Package Extension**
   - In Chrome extensions page, click "Pack extension"
   - Select the extension folder
   - Generate .crx file

2. **Install Package**
   - Drag and drop the .crx file into Chrome
   - Confirm installation

## 🛍️ Supported Websites

- **Amazon** (amazon.com, amazon.in)
- **Flipkart** (flipkart.com)
- **Myntra** (myntra.com)
- **Snapdeal** (snapdeal.com)

## 🎯 How to Use

1. **Visit Supported Site**
   - Go to any product page on Amazon, Flipkart, etc.
   - The extension will automatically detect the product

2. **View Analysis**
   - A green widget appears in the top-right corner
   - Shows EcoScore, packaging type, and sustainability tips
   - Widget auto-minimizes after 5 seconds

3. **Manual Scan**
   - Click the EcoPackAI icon in Chrome toolbar
   - Click "Scan This Product" for manual analysis

4. **Track Progress**
   - View your scanning stats in the popup
   - See total scans, average score, and CO₂ saved

## 🔧 Troubleshooting

### Extension Not Working?

1. **Check Permissions**
   - Ensure extension has access to the website
   - Refresh the page after installation

2. **Developer Mode**
   - Make sure Developer Mode is enabled
   - Reload the extension if needed

3. **Supported Pages**
   - Only works on product pages, not category/search pages
   - Look for product titles and images on the page

### Widget Not Appearing?

1. **Page Detection**
   - Extension only activates on product pages
   - Try refreshing the page

2. **Ad Blockers**
   - Some ad blockers may interfere
   - Whitelist the extension if needed

## 📊 Privacy & Data

- **Local Storage**: All data stored locally in your browser
- **No Account Required**: Works without registration
- **No Data Sharing**: Your shopping data stays private
- **Minimal Permissions**: Only accesses supported shopping sites

## 🔄 Updates

To update the extension:

1. Download new version files
2. Replace old files in extension folder
3. Go to `chrome://extensions/`
4. Click reload button on EcoPackAI extension

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Ensure you're on a supported product page
3. Try disabling other extensions temporarily
4. Reload the page and extension

## 🌱 Contributing

The extension is part of the EcoPackAI project. To contribute:

1. Fork the repository
2. Make improvements to extension files
3. Test on multiple e-commerce sites
4. Submit pull request

## 📝 File Structure

\`\`\`
extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js          # Popup functionality
├── content.js        # Page content analysis
├── styles.css        # Widget styling
└── icons/           # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
\`\`\`

## 🎉 Happy Sustainable Shopping!

Start making more eco-conscious choices while shopping online with EcoPackAI Scanner! 🌍♻️
\`\`\`

Perfect! I've successfully created a comprehensive gaming system and Product Scanner Plugin. Here's what I've implemented:

## 🎮 **Complete Gaming System:**

### ✨ **Playable Games:**
1. **EcoSort Challenge** - Drag & drop recycling game with 60-second timer
2. **Packaging Puzzle** - Visual identification game with hints and difficulty levels
3. **AI Quiz** - Gemini-generated sustainability questions (already implemented)

### 🎯 **Game Features:**
- **Real Gameplay** - Actual interactive games, not just simulations
- **Scoring System** - Points, accuracy tracking, and performance metrics
- **Difficulty Levels** - Easy, Medium, Hard options
- **Time Challenges** - Countdown timers for added excitement
- **Progress Tracking** - Updates user stats in localStorage
- **Visual Feedback** - Immediate feedback on correct/incorrect answers

## 🛒 **Product Scanner Chrome Extension:**

### 📦 **Extension Features:**
- **Auto-Detection** - Automatically scans products on Amazon, Flipkart, Myntra
- **Real-time Analysis** - Shows EcoScore and sustainability tips
- **Smart Widget** - Floating widget that auto-minimizes
- **Shopping Stats** - Tracks scans, average scores, CO₂ saved
- **Multi-site Support** - Works across major e-commerce platforms

### 🔧 **Technical Implementation:**
- **Manifest V3** - Modern Chrome extension format
- **Content Scripts** - Inject analysis widgets into shopping pages
- **Product Detection** - Smart selectors for different e-commerce sites
- **Local Storage** - No external dependencies, all data stored locally
- **Responsive Design** - Works on desktop and mobile browsers

## 🎲 **Game Components Created:**

### 1. **EcoSort Game** (`components/games/EcoSortGame.tsx`)
- Drag & drop interface for sorting recyclables
- 6 different bins (Plastic, Paper, Glass, Metal, Organic, General)
- 12 different items with realistic descriptions
- 60-second time limit with real-time countdown
- Accuracy scoring and performance feedback

### 2. **Packaging Puzzle** (`components/games/PackagingPuzzle.tsx`)
- Visual identification challenges
- 3 difficulty levels with different time limits
- Progressive hint system (reduces points by 30%)
- 8 different packaging types to identify
- Skip functionality and comprehensive scoring

### 3. **Updated MiniGames Hub** (`components/MiniGames.tsx`)
- Tabbed interface: Playable Games, Challenges, Leaderboard
- Individual game launching system
- Back-to-menu navigation
- Mock leaderboard with global rankings
- Challenge tracking and progress visualization

## 🌐 **Chrome Extension Files:**

### 📁 **Extension Structure:**
- `manifest.json` - Extension configuration and permissions
- `popup.html/js` - Extension popup interface
- `content.js` - Page injection and product detection
- `styles.css` - Widget styling and animations
- Installation guide with troubleshooting

### 🎯 **Supported Sites:**
- Amazon (amazon.com, amazon.in)
- Flipkart (flipkart.com)
- Myntra (myntra.com)
- Snapdeal (snapdeal.com)

## 🚀 **How to Use:**

### 🎮 **Games:**
1. Go to "Play & Learn" tab
2. Click on "Playable Games"
3. Choose EcoSort, Packaging Puzzle, or AI Quiz
4. Games open in full-screen mode with back navigation
5. Scores automatically update user stats

### 🛒 **Chrome Extension:**
1. Copy files from `public/` folder
2. Load as unpacked extension in Chrome
3. Visit any supported e-commerce product page
4. Widget automatically appears with sustainability analysis
5. Manual scanning available via extension popup

## 💾 **Local Database System:**
- All game scores stored in localStorage
- No Firebase dependency
- User progress persists across sessions
- Stats integration with main dashboard
- Offline functionality

The system now provides a complete gaming experience with actual playable games and a functional Chrome extension for sustainable shopping! 🌱🎯
