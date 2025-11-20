
"use client";

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getJupiterQuote } from '@/ai/flows/contextual-assistance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Loader2, Repeat, Wallet } from 'lucide-react';
import SwapRouteVisualizer from './swap-route-visualizer';
import SwapBreakdownChart from './swap-breakdown-chart';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import { VersionedTransaction } from '@solana/web3.js';
import { tokens, tokenMap, mintMap } from '@/config/tokens';

interface QuoteDetails {
  outAmount: string;
  priceImpact: string;
  priceImpactValue: number;
  platformFee: string;
}

const CrossTokenSwap = () => {
  const [fromToken, setFromToken] = useState('BONK');
  const [toToken, setToToken] = useState('JUP');
  const [amount, setAmount] = useState('10000');
  const [route, setRoute] = useState<string[]>([]);
  const [visualizeKey, setVisualizeKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();

  const [quoteResponse, setQuoteResponse] = useState<any | null>(null);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [swapTx, setSwapTx] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleVisualize = async () => {
    if (!fromToken || !toToken || !amount) return;

    setLoading(true);
    setRoute([]);
    setQuoteResponse(null);
    setSwapTx(null);
    setQuoteDetails(null);

    try {
      const fromTokenInfo = tokenMap.get(fromToken);
      const toTokenInfo = tokenMap.get(toToken);

      if(!fromTokenInfo || !toTokenInfo) {
        throw new Error("Invalid token selection");
      }

      const amountInLamports = BigInt(Math.floor(Number(amount) * (10 ** fromTokenInfo.decimals)));

      const result = await getJupiterQuote({
        inputMint: fromTokenInfo.mint,
        outputMint: toTokenInfo.mint,
        amount: amountInLamports.toString(),
        userPublicKey: publicKey ? publicKey.toBase58() : undefined,
      });

      if (!result || result.error || !result.outAmount) {
        throw new Error(result.error?.message || 'Could not find a route for the swap.');
      }
      setQuoteResponse(result);
      
      const routeSymbols: string[] = [fromToken];
      result.routePlan.forEach((leg: any) => {
        const outSymbol = mintMap.get(leg.swapInfo.outMint)?.id;
        if(outSymbol) {
          routeSymbols.push(outSymbol);
        }
      });
      
      setRoute(routeSymbols);

      const outAmount = (Number(result.outAmount) / (10 ** toTokenInfo.decimals)).toLocaleString(undefined, { maximumFractionDigits: toTokenInfo.decimals });
      const priceImpactValue = Number(result.priceImpactPct);
      const priceImpactPct = (priceImpactValue * 100).toFixed(4);
      
      let platformFeeString = "No Fee";
      if (result.platformFee && result.platformFee.amount && Number(result.platformFee.amount) > 0) {
        const feeTokenInfo = mintMap.get(result.platformFee.mint) || { decimals: 6, id: 'UNK' };
        const platformFeeAmount = (Number(result.platformFee.amount) / (10 ** feeTokenInfo.decimals)).toLocaleString(undefined, { maximumFractionDigits: feeTokenInfo.decimals });
        platformFeeString = `${platformFeeAmount} ${feeTokenInfo.id}`;
      }

      setQuoteDetails({
        outAmount: `${outAmount} ${toTokenInfo.id}`,
        priceImpact: `${priceImpactPct}%`,
        priceImpactValue,
        platformFee: platformFeeString,
      });

    } catch(e: any) {
       toast({
        variant: "destructive",
        title: "Error Fetching Route",
        description: e.message || "Could not retrieve a swap route from Jupiter API.",
      });
    } finally {
      setLoading(false);
      setVisualizeKey(prev => prev + 1);
    }
  };
  
  const handleSwapDirection = () => {
      const currentFrom = fromToken;
      setFromToken(toToken);
      setToToken(currentFrom);
  }

  const handlePerformSwapWithWallet = async () => {
    if (!publicKey || !quoteResponse || !sendTransaction) {
        toast({
            variant: "destructive",
            title: "Wallet Not Ready",
            description: "Please connect your wallet and visualize a route to execute a swap.",
        });
        return;
    }

    setSwapping(true);
    setSwapTx(null);

    try {
        const swapUrl = 'https://quote-api.jup.ag/v6/swap';
        const swapApiResponse = await fetch(swapUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: publicKey.toBase58(),
                wrapAndUnwrapSol: true,
            })
        });
        
        const swapJson = await swapApiResponse.json();

        if (!swapApiResponse.ok) {
          throw new Error(swapJson.error || `Failed to get swap transaction: ${swapApiResponse.statusText}`);
        }

        const { swapTransaction } = swapJson;
        
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        const txid = await sendTransaction(transaction, connection);

        const confirmation = await connection.confirmTransaction(txid, 'confirmed');
        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        setSwapTx(txid);
        toast({
            title: "Swap Successful!",
            description: (
                <p>
                    Transaction ID: <a href={`https://solscan.io/tx/${txid}`} target="_blank" rel="noopener noreferrer" className="underline">{txid.slice(0, 10)}...</a>
                </p>
            ),
        });

    } catch (e: any) {
        if (e instanceof WalletSendTransactionError && e.message.includes('User rejected the request')) {
            toast({
                variant: "destructive",
                title: "Swap Cancelled",
                description: "You rejected the transaction in your wallet.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Swap Failed",
                description: e.message || "An error occurred during the swap.",
            });
        }
    } finally {
        setSwapping(false);
    }
  }

  if (!isMounted) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>
              <div className="flex items-center gap-2 font-headline text-2xl">
                  <Repeat className="w-6 h-6 text-primary"/>
                  Cross-Token Swap
              </div>
          </CardTitle>
          <CardDescription>
            Visualize and execute token swaps on Solana using the Jupiter API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground mt-2">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
            <div className="flex items-center gap-2 font-headline text-2xl">
                <Repeat className="w-6 h-6 text-primary"/>
                Cross-Token Swap
            </div>
        </CardTitle>
        <CardDescription>
          Visualize and execute token swaps on Solana using the Jupiter API.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-2">
                <div className="grid gap-2">
                    <Label htmlFor="fromToken">From</Label>
                    <Select value={fromToken} onValueChange={setFromToken} disabled={loading || swapping}>
                        <SelectTrigger id="fromToken">
                            <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                            {tokens.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleSwapDirection} className="hidden sm:flex" disabled={loading || swapping}>
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                </Button>

                <div className="grid gap-2">
                    <Label htmlFor="toToken">To</Label>
                    <Select value={toToken} onValueChange={setToToken} disabled={loading || swapping}>
                        <SelectTrigger id="toToken">
                            <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                             {tokens.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" disabled={loading || swapping}/>
            </div>
            
            <Button onClick={handleVisualize} disabled={loading || swapping || !fromToken || !toToken || !amount} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {loading ? 'Visualizing...' : 'Visualize Route'}
            </Button>
        </div>
        
        <div className="mt-4 flex-grow flex flex-col">
            <Label className="text-sm font-medium">Visualized Route</Label>
            <div className="mt-2 p-4 min-h-[84px] flex-grow flex items-center justify-center bg-muted/50 rounded-lg border border-dashed">
                {loading && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
                {!loading && route.length > 0 && <SwapRouteVisualizer route={route} key={visualizeKey} />}
                {!loading && !route.length && <div className="text-center text-muted-foreground animate-fade-in">Click "Visualize Route" to get started.</div>}
            </div>
        </div>

        {quoteDetails && !loading && (
          <div className="mt-6 space-y-6 animate-fade-in">
              <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Quote Breakdown</h3>
                  <div className="space-y-2 text-sm border p-4 rounded-lg bg-card">
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Estimated Output</span>
                          <span className="font-semibold text-foreground">{quoteDetails.outAmount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Price Impact</span>
                          <span className={`font-semibold ${
                              quoteDetails.priceImpactValue < 0.01
                                  ? 'text-green-600 dark:text-green-400'
                                  : quoteDetails.priceImpactValue < 0.03
                                  ? 'text-yellow-500 dark:text-yellow-400'
                                  : 'text-red-500 dark:text-red-400'
                          }`}>
                              {quoteDetails.priceImpact}
                          </span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Platform Fee</span>
                          <span className="font-semibold text-foreground">{quoteDetails.platformFee}</span>
                      </div>
                  </div>
              </div>

              {quoteResponse && <SwapBreakdownChart quoteResponse={quoteResponse} />}
          </div>
        )}

        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Execute Swap</h3>
             <p className="text-sm text-muted-foreground mb-4 text-center">
                Execute the swap securely using your connected wallet.
            </p>
            <Button 
                onClick={handlePerformSwapWithWallet} 
                disabled={loading || swapping || !quoteResponse || !publicKey}
                className="w-full"
            >
                {swapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                {swapping ? 'Executing Swap...' : `Execute with ${wallet?.adapter.name || 'Wallet'}`}
            </Button>
            
             {swapTx && (
                <div className="mt-4 text-center text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
                    <p>Swap successful! <a href={`https://solscan.io/tx/${swapTx}`} target="_blank" rel="noopener noreferrer" className="font-medium underline">View on Solscan</a></p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossTokenSwap;
