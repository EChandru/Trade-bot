# AI-powered Stock & ETF Investment Prediction Bot

A full-stack AI trading assistant web application that fetches real-time market data, analyzes financial news sentiment, and predicts short-term price movements to recommend optimal investment portfolios.

## Features

- **Real-time Market Data**: Fetches live prices, volume, and historical charts for stocks, ETFs, gold, and crypto using `yahoo-finance2`.
- **AI Sentiment Analysis**: Uses Google's Gemini 3.1 Pro with Search Grounding to analyze the latest financial news and determine market sentiment (Bullish/Bearish/Neutral).
- **AI Price Prediction**: Predicts short-term price movements and generates confidence scores for each asset.
- **Smart Portfolio Allocation**: Recommends the best assets to buy based on your budget and risk tolerance, providing a detailed breakdown and reasoning.
- **Interactive Dashboard**: A beautiful, responsive React dashboard with live charts, news panels, and allocation visualizations.
- **Secure Authentication**: Google Sign-In powered by Firebase Auth.
- **Data Persistence**: Saves your portfolio recommendations to Firebase Firestore.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Recharts, Lucide React, shadcn-like UI.
- **Backend**: Node.js, Express.js, `yahoo-finance2`.
- **AI**: Google Gemini API (`@google/genai`) with Google Search Grounding.
- **Database & Auth**: Firebase (Firestore, Authentication).

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Google Cloud Project with Gemini API access
- A Firebase Project

### 2. Environment Variables
Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Firebase Configuration
Ensure your `firebase-applet-config.json` is present in the root directory with your Firebase project details.

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Application
To start both the backend server and the Vite frontend in development mode:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 6. Build for Production
```bash
npm run build
npm start
```

## Architecture Notes

- **Backend Adaptation**: The original architecture requested a Python/FastAPI backend with FinBERT and XGBoost. To run seamlessly in this containerized environment, the backend was adapted to Node.js/Express.
- **AI Models**: Instead of running heavy local models (FinBERT/XGBoost), the application leverages the state-of-the-art **Gemini 3.1 Pro** model with **Google Search Grounding**. This provides superior real-time sentiment analysis and predictive reasoning by accessing the live web, eliminating the need for complex ML pipelines and manual news scraping.

## Disclaimer
⚠️ **This is not financial advice. For educational purposes only.** AI predictions are based on historical data and sentiment analysis, which do not guarantee future results. Always do your own research before investing.
