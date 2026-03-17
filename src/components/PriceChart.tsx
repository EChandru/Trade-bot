import React, { useState, useEffect } from 'react';
import { fetchChart } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function PriceChart({ ticker }: { ticker: string }) {
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState('1mo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChart = async () => {
      setLoading(true);
      try {
        const result = await fetchChart(ticker, period);
        const formattedData = result.dates.map((date: string, i: number) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: result.prices[i]
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Failed to load chart', error);
      } finally {
        setLoading(false);
      }
    };
    if (ticker) loadChart();
  }, [ticker, period]);

  return (
    <div className="h-64 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-zinc-400">Price History</h4>
        <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {['1mo', '3mo', '6mo', '1y'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10 rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        ) : null}
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#71717a" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#ffffff" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, fill: '#ffffff', stroke: '#09090b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
