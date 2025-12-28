
import React, { useState, useEffect } from 'react';
import { POPULAR_TOKENS } from '../constants';
import { Token, JupiterQuoteResponse } from '../types';
import { getJupiterQuote, getSwapTransaction } from '../services/jupiterService';
import { simulateTransactionWithGemini } from '../services/geminiService';
import RouteVisualizer from './RouteVisualizer';
// Added missing Activity and Shield imports to fix reported errors
import { ArrowDown, RefreshCw, Zap, TrendingUp, AlertTriangle, Bot, BrainCircuit, X, WifiOff, Clock, BarChart3, Settings, ChevronDown, CheckCircle, Loader2, Info, Activity, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

type TabMode = 'SWAP' | 'LIMIT' | 'DCA';

const SwapInterface: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [activeTab, setActiveTab] = useState<TabMode>('SWAP');
  
  // Common State
  const [inputToken, setInputToken] = useState<Token>(POPULAR_TOKENS[0]); // SOL
  const [outputToken, setOutputToken] = useState<Token>(POPULAR_TOKENS[1]); // USDC
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [quote, setQuote] = useState<JupiterQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [swapStatus, setSwapStatus] = useState<'IDLE' | 'SIGNING' | 'CONFIRMING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  
  // Simulator State
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Limit Order Specific
  const [limitRate, setLimitRate] = useState<string>('150.00');
  const [expiry, setExpiry] = useState<string>('never');

  const fetchQuote = async () => {
    if (inputToken.address === outputToken.address) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSimulationResult(null); 
    setSwapStatus('IDLE');
    setTxSignature(null);
    
    try {
      const data = await getJupiterQuote(inputToken.address, outputToken.address, amount, inputToken.decimals);
      setQuote(data);
      const isMock = data?.routePlan?.[0]?.swapInfo?.ammKey?.startsWith('mock-');
      setIsDemoMode(!!isMock);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if(!quote && activeTab === 'SWAP') return;
    setSimulating(true);
    
    const result = await simulateTransactionWithGemini(
      inputToken, 
      outputToken, 
      amount, 
      quote || { 
        priceImpactPct: "0.5", 
        slippageBps: 50, 
        routePlan: [], 
        inAmount: amount.toString(), 
        outAmount: "0",
        inputMint: inputToken.address,
        outputMint: outputToken.address,
        otherAmountThreshold: "0",
        swapMode: "ExactIn",
        platformFee: null
      }
    );
    setSimulationResult(result);
    setSimulating(false);
  };

  const handleSwap = async () => {
    if (!connected || !publicKey || !quote) {
      setError("Please connect your wallet first.");
      return;
    }

    if (isDemoMode) {
      setError("Cannot execute real transaction in Demo Mode (API disconnected).");
      return;
    }

    setError(null);
    setSwapStatus('SIGNING');

    try {
      const swapResponse = await getSwapTransaction(publicKey.toBase58(), quote);
      
      if (!swapResponse || !swapResponse.swapTransaction) {
        throw new Error("Failed to prepare transaction.");
      }

      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 2
      });
      
      setTxSignature(signature);
      setSwapStatus('CONFIRMING');

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

      setSwapStatus('SUCCESS');
      setAmount(0); 
    } catch (err: any) {
      console.error("Swap Error:", err);
      setSwapStatus('FAILED');
      if (err.message?.includes('User rejected')) {
         setError("Transaction cancelled by user.");
      } else {
         setError(err.message || "Transaction failed.");
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if(amount > 0 && activeTab === 'SWAP') fetchQuote();
    }, 600);
    return () => clearTimeout(timer);
  }, [amount, inputToken, outputToken, activeTab]);

  const handleSwapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
  };

  const chartData = quote ? [
    { name: 'Receive', value: 100 - parseFloat(quote.priceImpactPct) * 100 },
    { name: 'Impact/Fees', value: parseFloat(quote.priceImpactPct) * 100 }
  ] : [];

  const COLORS = ['#10B981', 'rgba(128, 128, 128, 0.1)'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT: Main Interaction Card */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Tabs */}
        <div className="flex justify-center animate-fade-in">
           <div className="flex bg-jup-surface/50 backdrop-blur-md rounded-2xl p-1.5 border border-jup-muted/10 shadow-inner">
            {[
              { id: 'SWAP', label: 'Swap', icon: Zap },
              { id: 'LIMIT', label: 'Limit', icon: BarChart3 },
              { id: 'DCA', label: 'DCA', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-white dark:bg-jup-surface text-jup-primary shadow-lg scale-105' 
                    : 'text-jup-muted hover:text-jup-text hover:bg-white/10'}`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                {tab.label}
              </button>
            ))}
           </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-[32px] p-6 shadow-2xl relative overflow-hidden group animate-fade-in-up">
          {/* Subtle Shimmer Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-jup-primary/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-bold text-jup-text tracking-tight flex items-center gap-3">
              {activeTab === 'SWAP' && <div className="w-2 h-2 rounded-full bg-jup-primary shadow-[0_0_10px_#10B981]" />}
              {activeTab === 'SWAP' ? 'Exchange' : activeTab === 'LIMIT' ? 'Limit Order' : 'Auto DCA'}
            </h2>
            <div className="flex gap-2">
               <button className="text-jup-muted hover:text-jup-text transition-all p-2 bg-jup-surface rounded-full">
                 <RefreshCw onClick={fetchQuote} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
               </button>
               <button className="text-jup-muted hover:text-jup-text transition-all p-2 bg-jup-surface rounded-full">
                 <Settings className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            {/* INPUT SECTION */}
            <div className="bg-jup-surface/40 p-5 rounded-2xl border border-jup-muted/5 hover:border-jup-primary/20 transition-all duration-300 focus-within:ring-1 ring-jup-primary/20">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-jup-muted font-black uppercase tracking-widest">You Pay</span>
                <span className="text-[10px] text-jup-muted font-bold">Balance: {connected ? '8.42' : '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                 <input 
                  type="number"
                  min="0"
                  step="any" 
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') { setAmount(0); return; }
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0) setAmount(num);
                  }}
                  className="w-full bg-transparent text-3xl font-bold text-jup-text focus:outline-none placeholder-jup-muted/20"
                  placeholder="0.00"
                />
                <button className="flex items-center gap-2 bg-jup-card/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-jup-muted/10 hover:border-jup-primary/30 transition-all shadow-md group/token">
                  <img src={inputToken.logoURI} className="w-6 h-6 rounded-full group-hover/token:rotate-12 transition-transform" />
                  <span className="font-bold text-sm text-jup-text">{inputToken.symbol}</span>
                  <ChevronDown className="w-4 h-4 text-jup-muted" />
                  <select 
                    value={inputToken.symbol}
                    onChange={(e) => setInputToken(POPULAR_TOKENS.find(t => t.symbol === e.target.value) || POPULAR_TOKENS[0])}
                    className="absolute opacity-0 w-full inset-0 cursor-pointer"
                  >
                    {POPULAR_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                  </select>
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                 {['25%', '50%', 'MAX'].map(pct => (
                   <button key={pct} className="text-[9px] font-bold px-2 py-1 bg-jup-muted/5 text-jup-muted rounded hover:bg-jup-primary/10 hover:text-jup-primary transition-all uppercase tracking-tighter">{pct}</button>
                 ))}
              </div>
            </div>

            {/* SWITCHER - ANIMATED */}
            <div className="flex justify-center -my-4 z-10 relative">
               <button 
                onClick={handleSwapTokens}
                className="bg-jup-card border border-jup-muted/20 p-2.5 rounded-2xl text-jup-muted hover:text-jup-primary hover:border-jup-primary/50 transition-all shadow-xl hover:rotate-180 duration-500 scale-110 active:scale-95 bg-white dark:bg-jup-dark"
               >
                 <ArrowDown className="w-5 h-5" />
               </button>
            </div>

            {/* OUTPUT SECTION */}
            <div className="bg-jup-surface/40 p-5 rounded-2xl border border-jup-muted/5 hover:border-jup-primary/20 transition-all duration-300">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-jup-muted font-black uppercase tracking-widest">You Receive</span>
                <span className="text-[10px] text-jup-muted font-bold">Est. Fee: $0.12</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                 {activeTab === 'SWAP' ? (
                   <input 
                     type="text" 
                     readOnly
                     value={quote ? (parseInt(quote.outAmount) / Math.pow(10, outputToken.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 }) : ''}
                     className="w-full bg-transparent text-3xl font-bold text-jup-primary focus:outline-none placeholder-jup-muted/20"
                     placeholder="0.00"
                   />
                ) : (
                  <div className="w-full text-jup-muted text-lg italic font-medium">To be determined</div>
                )}
                
                <button className="flex items-center gap-2 bg-jup-card/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-jup-muted/10 hover:border-jup-primary/30 transition-all shadow-md group/token">
                  <img src={outputToken.logoURI} className="w-6 h-6 rounded-full group-hover/token:rotate-12 transition-transform" />
                   <span className="font-bold text-sm text-jup-text">{outputToken.symbol}</span>
                   <ChevronDown className="w-4 h-4 text-jup-muted" />
                   <select 
                    value={outputToken.symbol}
                    onChange={(e) => setOutputToken(POPULAR_TOKENS.find(t => t.symbol === e.target.value) || POPULAR_TOKENS[1])}
                    className="absolute opacity-0 w-full inset-0 cursor-pointer"
                  >
                    {POPULAR_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                  </select>
                </button>
              </div>
            </div>
          </div>

          {/* STATUS AREA */}
          <div className="mt-4 relative z-10">
            {loading && (
              <div className="flex items-center justify-center gap-3 text-jup-primary text-xs font-bold py-2 bg-jup-primary/5 rounded-xl border border-jup-primary/10 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching real-time liquidity...
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-[11px] font-bold bg-red-500/10 p-4 rounded-xl flex items-start gap-3 border border-red-500/20 animate-fade-in shadow-inner">
                <AlertTriangle className="w-4 h-4 shrink-0" /> 
                <p>{error}</p>
              </div>
            )}

            {isDemoMode && !loading && activeTab === 'SWAP' && (
               <div className="text-jup-accent text-[10px] font-bold bg-jup-accent/10 p-3 rounded-xl flex items-center gap-2 border border-jup-accent/20 justify-center uppercase tracking-wider">
                 <WifiOff className="w-3.5 h-3.5" /> 
                 <span>Offline Simulation Active</span>
               </div>
            )}
          </div>

          {/* SWAP STATUS OVERLAY */}
          {swapStatus !== 'IDLE' && (
            <div className="mt-4 p-5 rounded-2xl border border-jup-primary/30 bg-jup-primary/5 backdrop-blur-xl flex flex-col items-center animate-fade-in shadow-2xl">
              {swapStatus === 'SIGNING' && (
                <>
                  <div className="w-12 h-12 bg-jup-primary/20 rounded-full flex items-center justify-center mb-3">
                    <Loader2 className="w-6 h-6 animate-spin text-jup-primary" />
                  </div>
                  <span className="font-bold text-sm">Approve in Wallet</span>
                  <span className="text-[10px] text-jup-muted uppercase tracking-tighter">Waiting for signature...</span>
                </>
              )}
              {swapStatus === 'CONFIRMING' && (
                <>
                  <div className="w-12 h-12 bg-jup-primary/20 rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 animate-pulse text-jup-primary" />
                  </div>
                  <span className="font-bold text-sm">Confirming Transaction</span>
                  <span className="text-[10px] text-jup-muted uppercase tracking-tighter">Broadcasting to Solana...</span>
                </>
              )}
              {swapStatus === 'SUCCESS' && (
                <>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="font-bold text-sm text-green-500">Transaction Confirmed</span>
                  {txSignature && <a href={`https://solscan.io/tx/${txSignature}`} target="_blank" rel="noopener noreferrer" className="text-[10px] underline mt-1 text-jup-primary font-bold uppercase tracking-tighter">View on Explorer</a>}
                </>
              )}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex flex-col gap-4 relative z-10">
             <button 
                onClick={handleSwap}
                disabled={loading || !connected || amount <= 0 || (activeTab === 'SWAP' && !quote) || swapStatus !== 'IDLE'}
                className={`w-full font-black text-sm uppercase tracking-[0.15em] py-4.5 rounded-2xl shadow-[0_15px_30px_-10px_rgba(var(--jup-primary-rgb),0.4)] transform transition-all active:scale-[0.97] disabled:opacity-30 disabled:grayscale disabled:transform-none h-14 overflow-hidden relative group/btn
                  ${!connected ? 'bg-jup-surface text-jup-muted border border-jup-muted/10' : 'bg-jup-primary text-jup-dark'}
                `}
             >
               <span className="relative z-10">
                 {!connected 
                   ? 'Connect Wallet' 
                   : amount <= 0
                     ? 'Enter Amount'
                     : activeTab === 'SWAP' 
                       ? (loading ? 'Loading...' : (quote ? 'Execute Swap' : 'Get Quote')) 
                       : (activeTab === 'LIMIT' ? 'Place Order' : 'Start DCA')}
               </span>
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
             </button>
             
             <button 
                onClick={handleSimulate}
                disabled={simulating || (activeTab === 'SWAP' && !quote)}
                className="w-full bg-jup-surface/50 border border-jup-muted/20 text-jup-muted font-bold text-xs py-3 rounded-2xl hover:bg-jup-primary/10 hover:text-jup-primary hover:border-jup-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                {simulating ? 'Analyzing Transaction Risk...' : 'Run AI Pre-Execution Simulation'}
             </button>
          </div>
        </div>
        
        {/* Token Info Footer */}
        <div className="bg-jup-surface/30 p-4 rounded-3xl border border-jup-muted/10 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <div className="p-2.5 bg-jup-primary/10 rounded-2xl">
             <Info className="w-5 h-5 text-jup-primary" />
           </div>
           <div>
              <h4 className="text-xs font-bold text-jup-text">Price Impact & Fees</h4>
              <p className="text-[10px] text-jup-muted leading-tight mt-0.5">Jupiter aggregates 100+ DEXs to ensure you get the absolute best price with minimal slippage.</p>
           </div>
        </div>
      </div>

      {/* RIGHT: Visuals & Analytics */}
      <div className="lg:col-span-7 flex flex-col gap-8 h-full">
        
        {/* Route Visualizer */}
        {activeTab === 'SWAP' && quote && (
          <div className="glass-panel border-none rounded-3xl p-8 shadow-2xl animate-fade-in-up bg-jup-card/40 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold flex items-center gap-3 text-jup-text text-lg italic">
                 <div className="p-2 bg-jup-primary/10 rounded-xl"><TrendingUp className="text-jup-primary w-5 h-5" /></div>
                 Route Optimization
               </h3>
               <span className="text-[10px] font-black tracking-[0.2em] bg-jup-primary/20 px-3 py-1.5 rounded-full text-jup-primary uppercase shadow-sm">Verified Best</span>
            </div>
            <RouteVisualizer routePlan={quote.routePlan} inputToken={inputToken} outputToken={outputToken} />
          </div>
        )}

        {/* AI Result Overlay */}
        {simulationResult && (
           <div className="glass-panel border-2 border-jup-primary/30 bg-white/50 dark:bg-jup-dark/50 rounded-3xl p-8 shadow-[0_20px_50px_rgba(16,185,129,0.1)] animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-24 h-24 text-jup-primary" />
              </div>
              <div className="flex items-center justify-between mb-6 border-b border-jup-muted/10 pb-4 relative z-10">
                 <h3 className="font-bold flex items-center gap-3 text-jup-text text-xl">
                    <Bot className="text-jup-primary w-6 h-6" /> Jupymate AI Analysis
                 </h3>
                 <button onClick={() => setSimulationResult(null)} className="text-jup-muted hover:text-jup-text p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all"><X className="w-5 h-5"/></button>
              </div>
              <div className="prose prose-sm max-w-none text-jup-text/90 relative z-10 leading-relaxed font-medium">
                <ReactMarkdown>{simulationResult}</ReactMarkdown>
              </div>
           </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {/* Price Impact Chart */}
          <div className="glass-panel bg-jup-surface/40 border-none rounded-3xl p-8 flex flex-col shadow-lg hover:shadow-2xl transition-all">
            <h4 className="text-[10px] font-black text-jup-muted mb-6 uppercase tracking-[0.2em]">Swap Composition</h4>
            {activeTab === 'SWAP' && quote ? (
               <div className="flex-1 w-full h-[180px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={chartData}
                       cx="50%"
                       cy="50%"
                       innerRadius={65}
                       outerRadius={80}
                       paddingAngle={10}
                       dataKey="value"
                       stroke="none"
                       cornerRadius={5}
                     >
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm" />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: 'var(--jup-card)', border: 'none', borderRadius: '16px', color: 'var(--jup-text)', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
                   <span className="text-2xl font-black text-jup-text">
                     {parseFloat(quote.priceImpactPct) < 0.01 ? '<0.01' : parseFloat(quote.priceImpactPct).toFixed(2)}%
                   </span>
                   <span className="text-[9px] text-jup-muted font-bold uppercase tracking-tighter">Impact</span>
                 </div>
               </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-jup-muted/40 gap-3 opacity-50">
                <PieChart className="w-12 h-12" />
                <span className="text-sm italic font-medium">Waiting for quote...</span>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="glass-panel bg-jup-surface/40 border-none rounded-3xl p-8 flex flex-col gap-4 shadow-lg hover:shadow-2xl transition-all">
             <h4 className="text-[10px] font-black text-jup-muted mb-4 uppercase tracking-[0.2em]">Transaction Summary</h4>
             
             {[
               { label: 'Platform Fee', value: '0.00%', icon: Shield },
               { label: 'Minimum Out', value: quote && activeTab === 'SWAP' ? `${(parseInt(quote.outAmount) * 0.995 / Math.pow(10, outputToken.decimals)).toFixed(4)} ${outputToken.symbol}` : '-', color: 'text-jup-primary' },
               { label: 'Route Type', value: quote ? (quote.routePlan.length > 1 ? 'Multi-Hop' : 'Direct') : '-', color: 'text-jup-accent' }
             ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/40 dark:bg-jup-dark/20 rounded-2xl border border-jup-muted/5 group/row hover:border-jup-primary/20 transition-all">
                  <span className="text-xs text-jup-muted font-bold">{item.label}</span>
                  <span className={`font-mono text-sm font-black group-hover:scale-110 transition-transform ${item.color || 'text-jup-text'}`}>{item.value}</span>
               </div>
             ))}
             
             <div className="mt-2 text-[10px] text-jup-muted font-medium italic text-center leading-tight">
               *Slippage tolerance: 0.5%. Your swap will automatically fail if the price moves more than this.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;
