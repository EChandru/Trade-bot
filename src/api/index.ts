import axios from 'axios';
import { GoogleGenAI, Type } from '@google/genai';

const api = axios.create({
  baseURL: '/api',
});

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const fetchAssets = async () => {
  const response = await api.get('/assets');
  return response.data;
};

export const fetchChart = async (ticker: string, period: string = '1mo') => {
  const response = await api.get(`/chart?ticker=${ticker}&period=${period}`);
  return response.data;
};

export const fetchMarketNews = async () => {
  const response = await api.get('/market-news');
  return response.data;
};

const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const fetchNews = async (ticker: string) => {
  const cacheKey = `news_${ticker}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find the latest 5 financial news headlines for ${ticker}. For each headline, determine the sentiment (Positive, Negative, or Neutral) and a confidence score between 0 and 1. Also provide an overall sentiment label (Bullish, Bearish, or Neutral) and an overall sentiment score between -1 and 1.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headlines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                source: { type: Type.STRING },
                timeAgo: { type: Type.STRING },
                sentiment: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ['text', 'source', 'timeAgo', 'sentiment', 'confidence']
            }
          },
          overall_sentiment: { type: Type.STRING },
          score: { type: Type.NUMBER }
        },
        required: ['headlines', 'overall_sentiment', 'score']
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  cache[cacheKey] = { data, timestamp: Date.now() };
  return data;
};

export const predictPortfolio = async (amount: number, currency: string, risk_level: string) => {
  const cacheKey = `predict_${amount}_${currency}_${risk_level}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }

  // Fetch current asset data from backend
  const assets = await fetchAssets();
  
  // Filter assets based on risk level
  let allowedAssets = assets;
  if (risk_level === 'low') {
    allowedAssets = assets.filter((a: any) => a.type === 'ETF' || a.type === 'Commodity');
  } else if (risk_level === 'medium') {
    allowedAssets = assets.filter((a: any) => a.type !== 'Crypto');
  }

  // Select top 5 assets to analyze deeply to save time/tokens
  const topAssets = allowedAssets.slice(0, 5);
  const tickersToAnalyze = topAssets.map((a: any) => a.ticker).join(', ');

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Analyze the following assets: ${tickersToAnalyze}. 
    The user wants to invest ${amount} ${currency} with a ${risk_level} risk profile.
    For each asset, predict the short-term direction (BUY, HOLD, AVOID), provide a confidence score (0-100), a sentiment score (-1 to 1), a sentiment label (Bullish, Bearish, Neutral), a suggested allocation percentage (totaling 100%), the suggested amount in ${currency}, and a 1-2 line reasoning.
    Also provide an overall diversification score (0-100).`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                predicted_direction: { type: Type.STRING },
                confidence_score: { type: Type.NUMBER },
                sentiment_score: { type: Type.NUMBER },
                sentiment_label: { type: Type.STRING },
                suggested_allocation_percent: { type: Type.NUMBER },
                suggested_amount: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              },
              required: ['ticker', 'predicted_direction', 'confidence_score', 'sentiment_score', 'sentiment_label', 'suggested_allocation_percent', 'suggested_amount', 'reasoning']
            }
          },
          diversification_score: { type: Type.NUMBER },
          total_invested: { type: Type.NUMBER }
        },
        required: ['recommendations', 'diversification_score', 'total_invested']
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  
  // Merge with current prices
  if (data.recommendations) {
    data.recommendations = data.recommendations.map((rec: any) => {
      const assetInfo = assets.find((a: any) => a.ticker === rec.ticker) || {};
      return {
        ...rec,
        name: assetInfo.name || rec.ticker,
        type: assetInfo.type || 'Unknown',
        current_price: assetInfo.currentPrice || 0,
        change_today: assetInfo.changeToday || 0,
        risk_level: risk_level
      };
    });
  }

  cache[cacheKey] = { data, timestamp: Date.now() };
  return data;
};
