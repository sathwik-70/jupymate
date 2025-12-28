
import React, { useState, useEffect } from 'react';
import { POPULAR_TOKENS } from '../constants';
import { Token } from '../types';
import TokenPriceChart from './TokenPriceChart';
import { Search, TrendingUp } from 'lucide-react';

const MarketOverview: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<Token>(POPULAR_TOKENS[0]); // Default SOL
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingList(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTokens = POPULAR_TOKENS.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Sidebar: Token List */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full">
        {/* Search Bar */}
        <div className="bg-jup-surface rounded-xl p-3 flex items-center gap-3 border border-jup-muted/10 focus-within:border-jup-primary/50 transition-colors">
          <Search className="w-5 h-5 text-jup-muted" />
          <input 
            type="text" 
            placeholder="Search tokens..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-jup-text w-full placeholder-jup-muted/50 text-sm font-medium"
          />
        </div>

        {/* Token List */}
        <div className="glass-panel rounded-2xl flex-grow overflow-hidden flex flex-col shadow-lg border border-jup-muted/10">
          <div className="p-4 border-b border-jup-muted/10 bg-jup-surface/50">
            <h3 className="font-bold text-jup-text flex items-center gap-2 text-sm uppercase tracking-wide">
              <TrendingUp className="w-4 h-4 text-jup-primary" /> Assets
            </h3>
          </div>
          
          <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar flex-1 bg-jup-card/30">
            {isLoadingList ? (
              // Skeleton List Items
              [...Array(8)].map((_, i) => (
                <div key={i} className="w-full flex items-center gap-4 p-3 rounded-xl animate-pulse">
                   <div className="w-9 h-9 rounded-full bg-jup-muted/20" />
                   <div className="flex-1 space-y-2">
                      <div className="h-4 w-16 bg-jup-muted/20 rounded" />
                      <div className="h-3 w-32 bg-jup-muted/10 rounded" />
                   </div>
                </div>
              ))
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                    selectedToken.symbol === token.symbol 
                      ? 'bg-jup-surface border border-jup-muted/20' 
                      : 'hover:bg-jup-surface/50 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img src={token.logoURI} alt={token.symbol} className="w-9 h-9 rounded-full bg-jup-card" />
                    {selectedToken.symbol === token.symbol && (
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-jup-primary rounded-full border-2 border-jup-card"></div>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className={`font-bold text-sm ${selectedToken.symbol === token.symbol ? 'text-jup-primary' : 'text-jup-text'}`}>{token.symbol}</div>
                    <div className="text-xs text-jup-muted">{token.name}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-3 text-jup-muted">
                <Search className="w-8 h-8 opacity-20" />
                <span className="text-sm">No tokens found.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main: Chart */}
      <div className="lg:col-span-8 h-full animate-fade-in">
        <TokenPriceChart token={selectedToken} />
      </div>
    </div>
  );
};

export default MarketOverview;
