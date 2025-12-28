
import React from 'react';
import { RoutePlan, Token } from '../types';
import { ArrowRight, Box } from 'lucide-react';
import { POPULAR_TOKENS } from '../constants';

interface RouteVisualizerProps {
  routePlan: RoutePlan[];
  inputToken: Token;
  outputToken: Token;
}

const RouteVisualizer: React.FC<RouteVisualizerProps> = ({ routePlan, inputToken, outputToken }) => {
  if (!routePlan || routePlan.length === 0) return null;

  return (
    <div className="w-full mt-6 bg-jup-card/50 rounded-xl p-6 border border-jup-muted/10">
      <h3 className="text-jup-muted text-sm font-bold uppercase tracking-wider mb-4">Route Visualization</h3>
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto pb-4">
        
        {/* Start Node */}
        <div className="flex flex-col items-center z-10">
          <div className="w-12 h-12 rounded-full bg-jup-surface border-2 border-jup-muted/20 flex items-center justify-center shadow-md">
            <img src={inputToken.logoURI} alt={inputToken.symbol} className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/32')} />
          </div>
          <span className="mt-2 text-sm font-bold text-jup-text">{inputToken.symbol}</span>
          <span className="text-xs text-jup-muted">100%</span>
        </div>

        {/* Route Steps */}
        {routePlan.map((step, index) => (
          <React.Fragment key={index}>
             {/* Connector Line/Arrow */}
             <div className="flex-1 min-w-[60px] h-[2px] bg-jup-muted/20 relative flex items-center justify-center">
                <div className="absolute -top-3 text-[10px] text-jup-muted whitespace-nowrap bg-jup-card px-2 rounded-full border border-jup-muted/20">
                  {step.swapInfo.label}
                </div>
                <ArrowRight className="w-4 h-4 text-jup-muted" />
             </div>

             {/* Intermediate/End Node logic simplified for visualizer */}
             <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-lg bg-jup-surface border border-jup-muted/20 flex items-center justify-center transform rotate-45 group hover:rotate-0 transition-all duration-300">
                  <Box className="w-5 h-5 text-jup-primary transform -rotate-45 group-hover:rotate-0 transition-all duration-300" />
                </div>
                 <span className="mt-2 text-xs font-mono text-jup-text/70">
                   Step {index + 1}
                 </span>
             </div>
          </React.Fragment>
        ))}

        <div className="flex-1 min-w-[60px] h-[2px] bg-jup-muted/20 relative flex items-center justify-center">
             <ArrowRight className="w-4 h-4 text-jup-primary" />
        </div>

        {/* End Node */}
        <div className="flex flex-col items-center z-10">
          <div className="w-12 h-12 rounded-full bg-jup-surface border-2 border-jup-primary flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
             <img src={outputToken.logoURI} alt={outputToken.symbol} className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/32')} />
          </div>
          <span className="mt-2 text-sm font-bold text-jup-primary">{outputToken.symbol}</span>
          <span className="text-xs text-jup-muted">Receive</span>
        </div>

      </div>
      
      <div className="mt-4 p-3 bg-jup-surface/50 rounded-lg border border-jup-muted/10 text-xs text-jup-muted font-mono">
        <span className="text-jup-text">DEBUG_ROUTE:</span> {routePlan.map(r => r.swapInfo.label).join(' -> ')}
      </div>
    </div>
  );
};

export default RouteVisualizer;
