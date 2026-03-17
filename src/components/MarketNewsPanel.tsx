import React, { useState, useEffect } from 'react';
import { fetchMarketNews } from '../api';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

export default function MarketNewsPanel() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchMarketNews();
        setNews(data);
      } catch (error) {
        console.error('Failed to load market news', error);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="w-5 h-5 text-white" />
        <h3 className="text-lg font-medium">Global Market News</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <span className="text-sm animate-pulse">Loading latest headlines...</span>
          </div>
        ) : news.length > 0 ? (
          news.map((item: any, idx: number) => (
            <a 
              key={idx} 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-white shrink-0" />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-medium">{item.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(item.pubDate)}</span>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            No market news available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
