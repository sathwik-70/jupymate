
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SwapInterface from './components/SwapInterface';
import PortfolioAnalyzer from './components/PortfolioAnalyzer';
import DevAssistant from './components/DevAssistant';
import MarketOverview from './components/MarketOverview';
import DocsHub from './components/DocsHub';
import { FeatureView } from './types';
import { CheckCircle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<FeatureView>(FeatureView.SWAP);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Dynamic Browser Title
  useEffect(() => {
    const titles: Record<FeatureView, string> = {
      [FeatureView.SWAP]: 'Swap',
      [FeatureView.MARKET]: 'Market',
      [FeatureView.PORTFOLIO]: 'Portfolio',
      [FeatureView.DEV_ASSISTANT]: 'DevBot',
      [FeatureView.DOCS]: 'Docs',
    };
    document.title = `Jupymate | ${titles[activeView]}`;
  }, [activeView]);

  // Toast System for Clipboard feedback etc.
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const renderContent = () => {
    switch (activeView) {
      case FeatureView.SWAP:
        return <SwapInterface />;
      case FeatureView.MARKET:
        return <MarketOverview />;
      case FeatureView.PORTFOLIO:
        return <PortfolioAnalyzer />;
      case FeatureView.DEV_ASSISTANT:
        return <DevAssistant />;
      case FeatureView.DOCS:
        return <DocsHub />;
      default:
        return <SwapInterface />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onNavigate={setActiveView}
    >
      <div className="animate-fade-in relative">
        {renderContent()}

        {/* Global Toast System */}
        {toast && (
          <div className="fixed bottom-24 right-8 z-[100] animate-fade-in-up">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                : 'bg-jup-primary/10 border-jup-primary/30 text-jup-primary'
            }`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              <span className="font-bold text-sm tracking-tight">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
