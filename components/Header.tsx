
import React, { useState, useRef, useEffect } from 'react';
import { FeatureView } from '../types';
import { Rocket, Wallet, Terminal, PieChart, Activity, BarChart2, X, BookOpen, Loader2, Menu, Sun, Moon, Copy, Check } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface HeaderProps {
  activeView: string;
  onNavigate: (view: FeatureView) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const { connected, publicKey, select, wallets, disconnect, wallet, connect, connecting } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { id: FeatureView.SWAP, label: 'Swap', icon: Activity },
    { id: FeatureView.MARKET, label: 'Market', icon: BarChart2 },
    { id: FeatureView.PORTFOLIO, label: 'Portfolio', icon: PieChart },
    { id: FeatureView.DEV_ASSISTANT, label: 'DevBot', icon: Terminal },
    { id: FeatureView.DOCS, label: 'Docs', icon: BookOpen },
  ];

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleConnectClick = () => {
    if (connected) {
      disconnect();
    } else if (!connected && wallet) {
      connect().catch(() => setShowWalletModal(true));
    } else {
      setShowWalletModal(true);
    }
  };

  const handleWalletSelect = (walletName: any) => {
    select(walletName);
    setShowWalletModal(false);
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowWalletModal(false);
      }
    };
    if (showWalletModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWalletModal]);

  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && publicKey) return `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    return 'Connect Wallet';
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-jup-muted/10 bg-jup-dark/80 backdrop-blur-md transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
            
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => onNavigate(FeatureView.SWAP)}
            >
              <div className="w-8 h-8 rounded-lg bg-jup-primary flex items-center justify-center text-white shadow-lg shadow-jup-primary/20">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-jup-text group-hover:text-jup-primary transition-colors">
                Jupymate
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-200
                    ${activeView === item.id 
                      ? 'text-jup-primary' 
                      : 'text-jup-muted hover:text-jup-text'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-jup-muted hover:text-jup-primary hover:bg-jup-surface/50 transition-all"
                title={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={handleConnectClick}
                  disabled={connecting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 border
                    ${connected 
                      ? 'bg-jup-surface border-jup-muted/20 text-jup-text hover:border-jup-muted/40' 
                      : 'bg-jup-secondary text-jup-dark border-jup-secondary hover:bg-opacity-90'
                    }`}
                >
                  {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {getButtonText()}
                  {connected && (
                    <div onClick={copyAddress} className="ml-1 p-1 hover:bg-black/5 rounded transition-colors" title="Copy Address">
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-jup-muted" />}
                    </div>
                  )}
                </button>

                {showWalletModal && (
                  <div className="absolute right-0 top-12 w-72 bg-jup-surface border border-jup-muted/20 rounded-xl shadow-2xl p-2 z-50 animate-fade-in-up" ref={modalRef}>
                    <div className="flex justify-between items-center p-3 border-b border-jup-muted/10 mb-2">
                      <span className="text-sm font-bold text-jup-text">Select Wallet</span>
                      <button onClick={() => setShowWalletModal(false)}><X className="w-4 h-4 text-jup-muted hover:text-jup-text" /></button>
                    </div>
                    <div className="space-y-1">
                      {wallets.length > 0 ? (
                        wallets.map((w) => (
                          <button
                            key={w.adapter.name}
                            onClick={() => handleWalletSelect(w.adapter.name)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-jup-card transition-colors text-left"
                          >
                            <img src={w.adapter.icon} alt={w.adapter.name} className="w-6 h-6" />
                            <span className="font-medium text-sm text-jup-text">{w.adapter.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-jup-muted">
                          No Solana wallets detected.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="md:hidden p-2 text-jup-muted hover:text-jup-text"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-jup-surface border-t border-jup-muted/10 animate-fade-in">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all
                    ${activeView === item.id 
                      ? 'bg-jup-primary/10 text-jup-primary' 
                      : 'text-jup-muted hover:text-jup-text'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
