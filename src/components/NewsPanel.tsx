import React, { useState, useEffect } from 'react';
import { fetchNews } from '../api';
import { Newspaper, Loader2, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';
import PriceChart from './PriceChart';

export default function NewsPanel({ ticker }: { ticker: string }) {
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const data = await fetchNews(ticker);
        setNews(data);
      } catch (error) {
        console.error('Failed to load news', error);
      } finally {
        setLoading(false);
      }
    };
    if (ticker) loadNews();
  }, [ticker]);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/80">
        <h3 className="font-semibold flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-white" />
          {ticker} Analysis
        </h3>
        {news && (
          <div className={clsx(
            "text-xs font-medium px-3 py-1 rounded-full border flex items-center gap-1.5",
            news.overall_sentiment === 'Bullish' ? "bg-white/10 text-white border-white/20" :
            news.overall_sentiment === 'Bearish' ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
            "bg-zinc-800 text-zinc-300 border-zinc-700"
          )}>
            {news.overall_sentiment === 'Bullish' ? <TrendingUp className="w-3 h-3" /> : 
             news.overall_sentiment === 'Bearish' ? <TrendingDown className="w-3 h-3" /> : 
             <Minus className="w-3 h-3" />}
            {news.overall_sentiment} ({(news.score * 100).toFixed(0)}%)
          </div>
        )}
      </div>

      <div className="p-5 border-b border-zinc-800/50">
        <PriceChart ticker={ticker} />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-sm">Analyzing latest news...</span>
          </div>
        ) : news?.headlines?.length > 0 ? (
          news.headlines.map((headline: any, idx: number) => (
            <div key={idx} className="group p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors">
                  {headline.text}
                </h4>
                <div className={clsx(
                  "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                  headline.sentiment === 'Positive' ? "bg-white text-black" :
                  headline.sentiment === 'Negative' ? "bg-zinc-800 text-zinc-400" :
                  "bg-zinc-800 text-zinc-400"
                )}>
                  {headline.sentiment}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{headline.source}</span>
                  <span>•</span>
                  <span>{headline.timeAgo}</span>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-8">
            No recent news found for {ticker}
          </div>
        )}
      </div>
    </div>
  );
}
