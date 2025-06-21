import { ArrowRight } from 'lucide-react';
import React from 'react';

const tokenColors: { [key: string]: string } = {
  SOL: 'bg-gradient-to-r from-purple-500 to-pink-500',
  USDC: 'bg-blue-500',
  JUP: 'bg-orange-500',
  BONK: 'bg-yellow-400',
  WIF: 'bg-pink-300',
  DEFAULT: 'bg-gray-400',
};

const TokenDisplay = ({ symbol }: { symbol: string }) => (
  <div className="flex flex-col items-center gap-2 animate-fade-in">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ${tokenColors[symbol] || tokenColors.DEFAULT}`}>
      {symbol.slice(0, 4)}
    </div>
    <span className="font-medium text-sm">{symbol}</span>
  </div>
);

const SwapRouteVisualizer = ({ route }: { route: string[] }) => {
  if (!route.length) {
    return <div className="text-center text-muted-foreground animate-fade-in">Click "Visualize Route" to see the magic.</div>;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full">
      {route.map((token, index) => (
        <React.Fragment key={`${token}-${index}`}>
          <TokenDisplay symbol={token} />
          {index < route.length - 1 && 
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground animate-fade-in" style={{animationDelay: `${index * 150 + 100}ms`}}/>
          }
        </React.Fragment>
      ))}
    </div>
  );
};

export default SwapRouteVisualizer;
