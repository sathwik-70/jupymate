
import React, { useState, useEffect } from 'react';
import { POPULAR_TOKENS } from '../constants';
import { analyzePortfolioWithGemini } from '../services/geminiService';
import { checkTokenVerification, fetchCurrentTokenPrice } from '../services/jupiterService';
import { Sparkles, ShieldCheck, Wallet, Loader2, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { PortfolioItem, Token } from '../types';

const PortfolioAnalyzer: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [loadingBalances, setLoadingBalances] = useState<boolean>(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [verificationMap, setVerificationMap] = useState<Map<string, boolean>>(new Map());

  // Function to fetch balances
  const fetchBalances = async () => {
    if (!connected || !publicKey) return;

    setLoadingBalances(true);
    try {
      const items: PortfolioItem[] = [];

      // 1. Fetch SOL Balance
      const solBalance = await connection.getBalance(publicKey);
      if (solBalance > 0) {
        const solToken = POPULAR_TOKENS.find(t => t.symbol === 'SOL')!;
        const solPrice = await fetchCurrentTokenPrice(solToken.address) || 0;
        
        items.push({
          token: solToken,
          amount: solBalance / LAMPORTS_PER_SOL,
          valueUsd: (solBalance / LAMPORTS_PER_SOL) * solPrice
        });
      }

      // 2. Fetch SPL Tokens
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') 
      });

      for (const { account } of tokenAccounts.value) {
        const info = account.data.parsed.info;
        const mintAddress = info.mint;
        const amount = info.tokenAmount.uiAmount;
        
        if (amount > 0) {
          let token: Token | undefined = POPULAR_TOKENS.find(t => t.address === mintAddress);
          if (!token) {
            token = {
              address: mintAddress,
              chainId: 101,
              decimals: info.tokenAmount.decimals,
              name: `Unknown Token (${mintAddress.slice(0,4)}..)`,
              symbol: 'UNKNOWN',
              logoURI: 'https://via.placeholder.com/32'
            };
          }

          const price = await fetchCurrentTokenPrice(mintAddress) || 0;
          
          items.push({
            token,
            amount,
            valueUsd: amount * price
          });
        }
      }
      
      items.sort((a, b) => b.valueUsd - a.valueUsd);
      setPortfolio(items);

      const tokensToCheck = items.map(p => p.token);
      const verified = await checkTokenVerification(tokensToCheck);
      setVerificationMap(verified);

    } catch (err) {
      console.error("Error fetching balances:", err);
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setPortfolio([]);
    }
  }, [connected, publicKey, connection]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzePortfolioWithGemini(portfolio);
    setAnalysis(result);
    setAnalyzing(false);
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-jup-card border border-jup-muted/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <Wallet className="w-10 h-10 text-jup-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-jup-text">Connect Wallet</h2>
        <p className="text-jup-muted max-w-sm text-base">Connect to unlock real-time portfolio tracking and AI analysis.</p>
      </div>
    );
  }

  const totalValue = portfolio.reduce((acc, curr) => acc + curr.valueUsd, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      
      {/* Portfolio Holdings View */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col h-[calc(100vh-140px)] border border-jup-muted/10 bg-jup-surface/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-jup-text flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-jup-primary" /> 
              Holdings
            </h3>
            <p className="text-xs text-jup-muted mt-1 font-mono">
              {publicKey ? publicKey.toBase58().slice(0,6) + '...' + publicKey.toBase58().slice(-6) : ''}
            </p>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-jup-muted uppercase tracking-wider font-bold">Net Worth</div>
             <div className="text-2xl font-bold text-jup-text tracking-tight">
               {loadingBalances ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
             </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2 px-1">
           <span className="text-xs text-jup-muted">Assets</span>
           <button onClick={fetchBalances} disabled={loadingBalances} className="text-jup-primary hover:text-jup-text transition-colors p-1">
             <RefreshCw className={`w-3 h-3 ${loadingBalances ? 'animate-spin' : ''}`} />
           </button>
        </div>
        
        <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {loadingBalances ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className="w-8 h-8 text-jup-primary animate-spin" />
              <span className="text-sm text-jup-muted">Scanning blockchain...</span>
            </div>
          ) : portfolio.length === 0 ? (
             <div className="text-center py-10 text-jup-muted text-sm">
               No tokens found in this wallet.
             </div>
          ) : (
            portfolio.map((item, idx) => {
               const isVerified = verificationMap.get(item.token.address);
               return (
                <div key={idx} className="group flex items-center justify-between p-4 bg-jup-card/80 rounded-xl border border-transparent hover:border-jup-primary/20 hover:bg-jup-card transition-all duration-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={item.token.logoURI} 
                        alt={item.token.symbol} 
                        className="w-10 h-10 rounded-full bg-jup-surface" 
                        onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/32'} 
                      />
                      {isVerified && <div className="absolute -bottom-1 -right-1 bg-jup-card rounded-full border border-jup-card"><CheckCircle className="w-3 h-3 text-jup-primary" /></div>}
                    </div>
                    <div>
                      <div className="font-bold text-jup-text text-base">{item.token.symbol}</div>
                      <div className="text-xs text-jup-muted">{item.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} Tokens</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-jup-text text-base">${item.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={`text-[9px] px-1.5 py-0.5 rounded-sm inline-block mt-1 font-bold tracking-wide uppercase ${isVerified ? 'bg-jup-primary/10 text-jup-primary' : 'bg-red-500/10 text-red-500'}`}>
                      {isVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-jup-muted/10">
          <button 
            onClick={handleAnalyze}
            disabled={analyzing || portfolio.length === 0}
            className="w-full py-3.5 bg-accent-gradient rounded-xl font-bold text-white shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
          >
            {analyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Analyzing...' : 'Generate AI Risk Report'}
          </button>
        </div>
      </div>

      {/* AI Analysis Result */}
      <div className="glass-panel rounded-2xl p-1 shadow-xl relative overflow-hidden group h-[calc(100vh-140px)] border border-jup-muted/10">
        <div className="h-full bg-jup-card/90 rounded-[14px] p-8 overflow-y-auto custom-scrollbar relative z-10 backdrop-blur-sm">
          {!analysis ? (
             <div className="h-full flex flex-col items-center justify-center text-center text-jup-muted/50">
               <div className="w-16 h-16 bg-jup-surface rounded-2xl flex items-center justify-center mb-6">
                 <Sparkles className="w-8 h-8 opacity-50 text-jup-primary" />
               </div>
               <p className="text-base">Click <span className="text-jup-primary font-bold">"Generate Report"</span> to get an AI analysis.</p>
             </div>
          ) : (
            <div className="prose prose-sm max-w-none text-jup-text">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-jup-muted/10">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jup-primary to-jup-accent flex items-center justify-center text-white font-bold shadow-lg text-xs">AI</div>
                 <div>
                   <h3 className="font-bold text-jup-text text-base m-0 leading-none">Jupymate Analyst</h3>
                   <span className="text-xs text-jup-muted">Risk Assessment</span>
                 </div>
              </div>
              
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-jup-text mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-jup-primary mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-jup-text/80" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4 text-jup-text/80" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-jup-text font-bold" {...props} />
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PortfolioAnalyzer;
