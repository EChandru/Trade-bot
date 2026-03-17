import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const app = express();
const PORT = 3000;

app.use(express.json());

// Assets to track
const TRACKED_ASSETS = {
  stocks: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'META', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS'],
  etfs: ['SPY', 'QQQ', 'VTI', 'GLD', 'SLV', 'VNQ', 'ARKK'],
  gold: ['GC=F'],
  crypto: ['BTC-USD', 'ETH-USD']
};

const ALL_TICKERS = [...TRACKED_ASSETS.stocks, ...TRACKED_ASSETS.etfs, ...TRACKED_ASSETS.gold, ...TRACKED_ASSETS.crypto];

// Simple in-memory cache
const cache = {
  assets: null as any,
  lastUpdated: 0,
  news: {} as Record<string, { data: any, timestamp: number }>,
  predictions: {} as Record<string, { data: any, timestamp: number }>
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchAssetData() {
  if (cache.assets && Date.now() - cache.lastUpdated < CACHE_TTL) {
    return cache.assets;
  }

  const results = [];
  for (const ticker of ALL_TICKERS) {
    try {
      const quote: any = await yahooFinance.quote(ticker);
      
      let type = 'Stock';
      if (TRACKED_ASSETS.etfs.includes(ticker)) type = 'ETF';
      if (TRACKED_ASSETS.gold.includes(ticker)) type = 'Commodity';
      if (TRACKED_ASSETS.crypto.includes(ticker)) type = 'Crypto';

      results.push({
        ticker,
        name: quote.shortName || quote.longName || ticker,
        type,
        currentPrice: quote.regularMarketPrice,
        changeToday: quote.regularMarketChangePercent,
        high52Week: quote.fiftyTwoWeekHigh,
        low52Week: quote.fiftyTwoWeekLow,
        volume: quote.regularMarketVolume,
        currency: quote.currency
      });
    } catch (error) {
      console.error(`Failed to fetch data for ${ticker}:`, error);
    }
  }

  cache.assets = results;
  cache.lastUpdated = Date.now();
  return results;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    last_updated: cache.lastUpdated,
    geminiKeyExists: !!process.env.GEMINI_API_KEY,
    apiKeyExists: !!process.env.API_KEY
  });
});

app.get('/api/assets', async (req, res) => {
  try {
    const assets = await fetchAssetData();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.get('/api/chart', async (req, res) => {
  const { ticker, period = '1mo' } = req.query;
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  try {
    const periodMap: Record<string, string> = {
      '1mo': '1mo',
      '3mo': '3mo',
      '6mo': '6mo',
      '1y': '1y'
    };
    
    const queryOptions = { period1: periodMap[period as string] || '1mo' };
    // yahoo-finance2 historical requires a start date, let's calculate it
    const now = new Date();
    let startDate = new Date();
    if (period === '1mo') startDate.setMonth(now.getMonth() - 1);
    else if (period === '3mo') startDate.setMonth(now.getMonth() - 3);
    else if (period === '6mo') startDate.setMonth(now.getMonth() - 6);
    else if (period === '1y') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setMonth(now.getMonth() - 1);

    const result: any[] = await yahooFinance.historical(ticker, { period1: startDate, period2: now });
    
    const dates = result.map(r => r.date.toISOString().split('T')[0]);
    const prices = result.map(r => r.close);
    const volume = result.map(r => r.volume);

    res.json({ dates, prices, volume });
  } catch (error) {
    console.error(`Error fetching chart for ${ticker}:`, error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/market-news', async (req, res) => {
  try {
    if (cache.news['market'] && Date.now() - cache.news['market'].timestamp < CACHE_TTL) {
      return res.json(cache.news['market'].data);
    }

    const url = 'https://yahoo-finance166.p.rapidapi.com/api/news/list?snippetCount=500&region=US';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '2092e08226msh8d36c788a2fa981p1cc6c8jsn0d52578e5f28',
        'x-rapidapi-host': 'yahoo-finance166.p.rapidapi.com'
      }
    };

    const fetchResponse = await fetch(url, options);
    const json = await fetchResponse.json();
    
    // Extract relevant news items
    const stream = (json.data?.main?.stream || []).concat(json.data?.ntk?.stream || []);
    const newsItems = stream
      .filter((s: any) => s.content?.title || s.editorialContent?.title)
      .map((s: any) => {
        const content = s.content || s.editorialContent;
        const innerContent = content.content || content;
        return {
          title: content.title,
          source: innerContent.provider?.displayName || 'Yahoo Finance',
          url: innerContent.canonicalUrl?.url || innerContent.providerContentUrl || '#',
          pubDate: content.pubDate || content.publishTime,
          summary: innerContent.summary || ''
        };
      })
      .slice(0, 10); // Return top 10 general news

    cache.news['market'] = { data: newsItems, timestamp: Date.now() };
    res.json(newsItems);
  } catch (error) {
    console.error('Error fetching market news:', error);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

// Removed Gemini API endpoints

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
