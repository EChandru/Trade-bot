import React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function StockCard({ data, isSelected, onClick }: { key?: React.Key, data: any, isSelected: boolean, onClick: () => void }) {
  const isBuy = data.predicted_direction === 'BUY';
  const isAvoid = data.predicted_direction === 'AVOID';
  
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-zinc-900/40 border rounded-2xl p-5 cursor-pointer transition-all hover:bg-zinc-800/60 group",
        isSelected ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "border-zinc-800"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight">{data.ticker}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              {data.type}
            </span>
          </div>
          <p className="text-sm text-zinc-500 truncate max-w-[200px]">{data.name}</p>
        </div>
        
        <div className="text-right">
          <div className="font-mono text-lg">${data.current_price?.toFixed(2)}</div>
          <div className={clsx(
            "text-sm font-medium flex items-center justify-end gap-1",
            data.change_today >= 0 ? "text-white" : "text-zinc-500"
          )}>
            {data.change_today >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(data.change_today || 0).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-1">AI Signal</div>
          <div className={clsx(
            "font-bold flex items-center gap-1.5",
            isBuy ? "text-white" : isAvoid ? "text-zinc-500" : "text-zinc-400"
          )}>
            {isBuy ? <TrendingUp className="w-4 h-4" /> : isAvoid ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {data.predicted_direction}
            <span className="text-xs font-normal opacity-70 ml-1">({data.confidence_score}%)</span>
          </div>
        </div>
        
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-1">Allocation</div>
          <div className="font-bold text-white">
            {data.suggested_allocation_percent}%
            <span className="text-xs font-normal text-zinc-500 ml-2">
              ${data.suggested_amount?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={clsx(
              "h-full rounded-full",
              isBuy ? "bg-white" : isAvoid ? "bg-zinc-600" : "bg-zinc-400"
            )}
            style={{ width: `${data.confidence_score}%` }}
          />
        </div>
        <div className="text-xs font-medium text-zinc-400 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {data.sentiment_label}
        </div>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3">
        {data.reasoning}
      </p>
    </div>
  );
}
