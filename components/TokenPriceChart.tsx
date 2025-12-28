
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Token, PricePoint } from '../types';
import { fetchTokenPriceHistory } from '../services/jupiterService';
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';

interface TokenPriceChartProps {
  token: Token;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ token }) => {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    // Pass the full token object to leverage the address for live API calls
    const points = await fetchTokenPriceHistory(token, timeframe);
    setData(points);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Refresh every minute to keep "Live" feel
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [token, timeframe]);

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    if (timeframe === '1H') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (timeframe === '24H') return date.toLocaleTimeString([], { hour: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const startPrice = data.length > 0 ? data[0].price : 0;
  const isPositive = currentPrice >= startPrice;
  const percentChange = startPrice ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  // Skeleton Loader
  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-6 shadow-2xl h-full flex flex-col border border-jup-muted/10 relative overflow-hidden">
        <div className="flex justify-between items-start mb-8 animate-pulse">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-jup-muted/20" />
            <div className="space-y-3">
              <div className="h-6 w-32 bg-jup-muted/20 rounded-md" />
              <div className="flex gap-3 items-center">
                <div className="h-8 w-40 bg-jup-muted/20 rounded-md" />
                <div className="h-6 w-16 bg-jup-muted/10 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
             <div className="h-6 w-24 bg-jup-muted/10 rounded-full" />
             <div className="h-8 w-48 bg-jup-muted/10 rounded-xl" />
          </div>
        </div>
        <div className="flex-1 bg-jup-muted/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl h-full flex flex-col group relative overflow-hidden border border-jup-muted/10">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-jup-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative group-hover:scale-105 transition-transform duration-300">
             <div className="absolute inset-0 bg-jup-primary/20 rounded-full blur-md animate-pulse"></div>
             <img src={token.logoURI} alt={token.symbol} className="w-12 h-12 rounded-full relative z-10 bg-jup-card border-2 border-jup-muted/10" />
          </div>
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2 text-jup-text">
              {token.name} <span className="text-jup-muted text-sm font-medium bg-jup-surface px-2 py-0.5 rounded-md">USD</span>
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-4xl font-mono font-bold text-jup-text tracking-tight drop-shadow-[0_0_15px_rgba(var(--jup-primary),0.15)]">
                ${currentPrice < 0.01 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)}
              </span>
              <div className={`text-sm font-bold flex items-center px-2 py-0.5 rounded-full border backdrop-blur-md ${isPositive ? 'bg-jup-primary/10 text-jup-primary border-jup-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(percentChange).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-[10px] text-jup-primary font-mono bg-jup-primary/10 px-3 py-1 rounded-full border border-jup-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jup-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-jup-primary"></span>
                </span>
                LIVE ORACLE
            </div>

            <div className="flex bg-jup-surface p-1 rounded-xl border border-jup-muted/10 backdrop-blur-sm">
              {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    timeframe === tf 
                      ? 'bg-jup-card text-jup-primary shadow-sm scale-105 border border-jup-muted/10' 
                      : 'text-jup-muted hover:text-jup-text hover:bg-jup-card/50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[400px] relative z-10 -ml-2 animate-fade-in">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#FF5555'} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#FF5555'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--jup-muted)" opacity={0.1} vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis} 
              stroke="var(--jup-muted)" 
              fontSize={10} 
              tickMargin={15}
              minTickGap={50}
              axisLine={false}
              tickLine={false}
              fontWeight={500}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="var(--jup-muted)" 
              fontSize={10} 
              tickFormatter={(val) => `$${val < 1 ? val.toFixed(4) : val.toFixed(2)}`}
              width={70}
              axisLine={false}
              tickLine={false}
              fontWeight={500}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--jup-card)', 
                borderColor: 'var(--jup-muted)', 
                borderRadius: '16px',
                color: 'var(--jup-text)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: 'var(--jup-text)', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--jup-muted)', marginBottom: '4px', fontSize: '12px' }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [`$${value < 0.01 ? value.toFixed(6) : value.toFixed(2)}`, 'Price']}
              cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#22c55e' : '#FF5555'} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-jup-muted border-t border-jup-muted/10 pt-4">
         <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-jup-primary" />
            <span>Market Data powered by Jupiter V2 & CoinGecko</span>
         </div>
         <div className="flex items-center gap-1 font-mono">
            <RefreshCw className="w-3 h-3" /> Auto-updates active
         </div>
      </div>
    </div>
  );
};

export default TokenPriceChart;
