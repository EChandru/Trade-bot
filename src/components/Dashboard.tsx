import React, { useState, useEffect } from 'react';
import { fetchAssets, predictPortfolio } from '../api';
import BudgetInput from './BudgetInput';
import StockCard from './StockCard';
import NewsPanel from './NewsPanel';
import MarketNewsPanel from './MarketNewsPanel';
import AllocationPie from './AllocationPie';
import { Loader2, TrendingUp, ShieldAlert, LogOut } from 'lucide-react';
import { auth, logOut } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard({ user }: { user: any }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const data = await fetchAssets();
        setAssets(data);
      } catch (error) {
        console.error('Failed to load assets', error);
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, []);

  const handleAnalyze = async (amount: number, currency: string, riskLevel: string) => {
    setAnalyzing(true);
    setPredictions(null);
    try {
      const result = await predictPortfolio(amount, currency, riskLevel);
      setPredictions(result);
      if (result.recommendations && result.recommendations.length > 0) {
        setSelectedTicker(result.recommendations[0].ticker);
      }

      // Save to Firebase
      if (user) {
        await addDoc(collection(db, 'portfolios'), {
          userId: user.uid,
          amount,
          currency,
          riskLevel,
          recommendations: JSON.stringify(result.recommendations),
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="ml-3 text-lg">Initializing AI Trading Assistant...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-white" />
            <span className="font-semibold text-lg tracking-tight">AI Trading Bot</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">
              {user.displayName || user.email}
            </div>
            <button 
              onClick={logOut}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-8 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-400">
            <strong className="text-zinc-300">Disclaimer:</strong> This is not financial advice. For educational purposes only. AI predictions are based on historical data and sentiment analysis, which do not guarantee future results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input & Allocation */}
          <div className="lg:col-span-4 space-y-8">
            <BudgetInput onAnalyze={handleAnalyze} analyzing={analyzing} />
            
            {predictions && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-medium mb-4">Suggested Allocation</h3>
                <AllocationPie data={predictions.recommendations} />
                
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-400">Total Invested</span>
                    <span className="font-mono font-medium">${predictions.total_invested?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Diversification Score</span>
                    <span className="font-mono text-white">{predictions.diversification_score}/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Column: Recommendations */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Top AI Picks</h2>
            
            {!predictions && !analyzing && (
              <div className="h-64 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500">
                <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                <p>Enter your budget to get AI recommendations</p>
              </div>
            )}

            {analyzing && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {predictions?.recommendations?.map((rec: any) => (
              <StockCard 
                key={rec.ticker} 
                data={rec} 
                isSelected={selectedTicker === rec.ticker}
                onClick={() => setSelectedTicker(rec.ticker)}
              />
            ))}
          </div>

          {/* Right Column: News & Chart */}
          <div className="lg:col-span-3 space-y-8">
            {selectedTicker ? (
              <NewsPanel ticker={selectedTicker} />
            ) : (
              <div className="h-48 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 p-6 text-center">
                Select an asset to view live news and sentiment
              </div>
            )}
            <div className="h-[500px]">
              <MarketNewsPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
