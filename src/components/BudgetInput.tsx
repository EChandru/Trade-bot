import React, { useState } from 'react';
import { DollarSign, Activity, Play } from 'lucide-react';

export default function BudgetInput({ onAnalyze, analyzing }: { onAnalyze: (amount: number, currency: string, riskLevel: string) => void, analyzing: boolean }) {
  const [amount, setAmount] = useState<number>(50000);
  const [currency, setCurrency] = useState('USD');
  const [riskLevel, setRiskLevel] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(amount, currency, riskLevel);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-white" />
        Investment Strategy
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Budget Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="block w-full pl-10 pr-12 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="50000"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-zinc-400 sm:text-sm rounded-md focus:ring-white focus:border-white"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Risk Tolerance</label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskLevel(level)}
                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                  riskLevel === level
                    ? 'bg-white text-black border border-white'
                    : 'bg-black border border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={analyzing}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {analyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              Analyzing Markets...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Analyze & Recommend
            </>
          )}
        </button>
      </div>
    </form>
  );
}
