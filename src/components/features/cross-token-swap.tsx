
"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getJupiterQuote, performSwap } from '@/ai/flows/contextual-assistance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, Key, Loader2, Repeat, Wallet } from 'lucide-react';
import SwapRouteVisualizer from './swap-route-visualizer';
import SwapBreakdownChart from './swap-breakdown-chart';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface TokenInfo {
  id: string;
  name: string;
  mint: string;
  decimals: number;
}

const tokens: TokenInfo[] = [
  { id: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  { id: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  { id: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6 },
  { id: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
  { id: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzL7gmAJsCn7V', decimals: 6 },
];
const tokenMap = new Map<string, TokenInfo>(tokens.map(t => [t.id, t]));
const mintMap = new Map<string, TokenInfo>(tokens.map(t => [t.mint, t]));

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
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [quoteResponse, setQuoteResponse] = useState<any | null>(null);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [swapTx, setSwapTx] = useState<string | null>(null);


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

      if (!result || !result.outAmount) {
        throw new Error('Could not find a route for the swap.');
      }
      setQuoteResponse(result);

      // Correctly extract route from marketInfos for v6 API
      const routeMints: string[] = [
        result.inputMint,
        ...result.marketInfos.map((market: any) => market.outputMint)
      ];
      const routeSymbols = routeMints.map(mint => mintMap.get(mint)?.id || 'UNK');
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
        title: "Error fetching route",
        description: e.message || "Could not retrieve a swap route from Jupiter API.",
      });
    } finally {
      setLoading(false);
      setKey(prev => prev + 1);
    }
  };
  
  const handleSwapDirection = () => {
      const currentFrom = fromToken;
      setFromToken(toToken);
      setToToken(currentFrom);
  }

  const handlePerformSwapWithApiKey = async () => {
    if (!privateKey || !quoteResponse) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide your private key and visualize a route first.",
        });
        return;
    }

    setSwapping(true);
    setSwapTx(null);

    try {
        const result = await performSwap({
            userPrivateKey: privateKey,
            quoteResponse,
        });

        setSwapTx(result.transactionId);
        toast({
            title: "Swap Successful!",
            description: (
                <p>
                    Transaction ID: <a href={`https://solscan.io/tx/${result.transactionId}`} target="_blank" rel="noopener noreferrer" className="underline">{result.transactionId.slice(0, 10)}...</a>
                </p>
            ),
        });

    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Swap Failed",
            description: e.message || "An error occurred during the swap.",
        });
    } finally {
        setSwapping(false);
    }
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
        // Get swap transaction from Jupiter API
        const swapUrl = 'https://quote-api.jup.ag/v6/swap';
        const swapResponse = await fetch(swapUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: publicKey.toBase58(),
                wrapAndUnwrapSol: true,
            })
        });

        if (!swapResponse.ok) {
          const errorData = await swapResponse.json();
          throw new Error(errorData.error || `Failed to get swap transaction: ${swapResponse.status}`);
        }

        const { swapTransaction } = await swapResponse.json();
        
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
        toast({
            variant: "destructive",
            title: "Swap Failed",
            description: e.message || "An error occurred during the swap.",
        });
    } finally {
        setSwapping(false);
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Repeat className="w-6 h-6 text-primary"/>
            Cross-Token Swap
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
                {!loading && route.length > 0 && <SwapRouteVisualizer route={route} key={key} />}
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
            <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="wallet">Wallet Swap</TabsTrigger>
                    <TabsTrigger value="apikey">API Key Swap</TabsTrigger>
                </TabsList>
                <TabsContent value="wallet" className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Execute the swap securely using your connected wallet.
                    </p>
                    <Button 
                        onClick={handlePerformSwapWithWallet} 
                        disabled={loading || swapping || !quoteResponse || !publicKey}
                        className="w-full"
                    >
                        {swapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                        {swapping ? 'Executing Swap...' : `Execute with Wallet`}
                    </Button>
                </TabsContent>
                <TabsContent value="apikey" className="mt-4 space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="privateKey">API Key (Base58 Private Key)</Label>
                        <Input 
                            id="privateKey" 
                            type="password" 
                            value={privateKey} 
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder="Enter a burner wallet's private key"
                            disabled={loading || swapping}
                        />
                    </div>
                    <Alert variant="destructive">
                      <Key className="h-4 w-4" />
                      <AlertTitle>Security Warning</AlertTitle>
                      <AlertDescription>
                        Never share your private key with a site you don't trust. This is for development purposes only.
                      </AlertDescription>
                    </Alert>
                    <Button 
                        onClick={handlePerformSwapWithApiKey} 
                        disabled={loading || swapping || !quoteResponse || !privateKey.trim()}
                        className="w-full"
                    >
                        {swapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                        {swapping ? 'Executing Swap...' : 'Execute with API Key'}
                    </Button>
                </TabsContent>
            </Tabs>
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
