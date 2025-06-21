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
import { ArrowRight, Key, Loader2, Repeat } from 'lucide-react';
import SwapRouteVisualizer from './swap-route-visualizer';
import { useWallet } from '@solana/wallet-adapter-react';

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

const CrossTokenSwap = () => {
  const [fromToken, setFromToken] = useState('BONK');
  const [toToken, setToToken] = useState('JUP');
  const [amount, setAmount] = useState('10000');
  const [route, setRoute] = useState<string[]>([]);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { publicKey } = useWallet();

  const [quoteResponse, setQuoteResponse] = useState<any | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [swapTx, setSwapTx] = useState<string | null>(null);


  const handleVisualize = async () => {
    if (!fromToken || !toToken || !amount || fromToken === toToken) return;

    setLoading(true);
    setRoute([]);
    setQuoteResponse(null);
    setSwapTx(null);

    try {
      const fromTokenInfo = tokenMap.get(fromToken);
      const toTokenInfo = tokenMap.get(toToken);

      if(!fromTokenInfo || !toTokenInfo) {
        throw new Error("Invalid token selection");
      }

      const amountInSmallestUnit = Number(amount) * (10 ** fromTokenInfo.decimals);

      const result = await getJupiterQuote({
        inputMint: fromTokenInfo.mint,
        outputMint: toTokenInfo.mint,
        amount: amountInSmallestUnit,
        userPublicKey: publicKey ? publicKey.toBase58() : undefined,
      });

      if (!result || !result.routePlan) {
        throw new Error('Could not find a route for the swap.');
      }
      setQuoteResponse(result);

      const routeMints: string[] = [
        result.inputMint,
        ...result.routePlan.map((hop: any) => hop.swapInfo.outputMint)
      ];
      const routeSymbols = routeMints.map(mint => mintMap.get(mint)?.id || 'UNK');
      setRoute(routeSymbols);

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
  
  const handleSwap = () => {
      const currentFrom = fromToken;
      setFromToken(toToken);
      setToToken(currentFrom);
  }

  const handlePerformSwap = async () => {
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


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Repeat className="w-6 h-6 text-primary"/>
            Cross-Token Swap
        </CardTitle>
        <CardDescription>
          Visualize a swap route or execute it directly using a private key.
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
                
                <Button variant="ghost" size="icon" onClick={handleSwap} className="hidden sm:flex" disabled={loading || swapping}>
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
            
            <Button onClick={handleVisualize} disabled={loading || swapping || !fromToken || !toToken || !amount || fromToken === toToken}>
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

        <div className="mt-6 space-y-4 border-t pt-6">
            <div className="grid gap-2">
                <Label htmlFor="privateKey">API Key (Base58 Private Key)</Label>
                <Input 
                    id="privateKey" 
                    type="password" 
                    value={privateKey} 
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your wallet's private key to swap"
                    disabled={loading || swapping}
                />
            </div>
            <Alert variant="destructive">
              <Key className="h-4 w-4" />
              <AlertTitle>Security Warning</AlertTitle>
              <AlertDescription>
                Never share your private key with a site you don't trust. This feature is for demonstration purposes only. Always use a burner wallet.
              </AlertDescription>
            </Alert>
            <Button 
                onClick={handlePerformSwap} 
                disabled={loading || swapping || !quoteResponse || !privateKey.trim()}
                className="w-full"
            >
                {swapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Repeat className="mr-2 h-4 w-4" />}
                {swapping ? 'Executing Swap...' : 'Execute Swap'}
            </Button>
            {swapTx && (
                <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
                    <p>Swap successful! <a href={`https://solscan.io/tx/${swapTx}`} target="_blank" rel="noopener noreferrer" className="font-medium underline">View on Solscan</a></p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossTokenSwap;
