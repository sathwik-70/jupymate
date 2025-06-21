"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getJupiterQuote } from '@/ai/flows/contextual-assistance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Loader2, Repeat } from 'lucide-react';
import SwapRouteVisualizer from './swap-route-visualizer';

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

  const handleVisualize = async () => {
    if (!fromToken || !toToken || !amount || fromToken === toToken) return;

    setLoading(true);
    setRoute([]);

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
      });

      const routeSymbols = result.route.map(mint => mintMap.get(mint)?.id || 'UNK');
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Repeat className="w-6 h-6 text-primary"/>
            Cross-Token Swap Visualizer
        </CardTitle>
        <CardDescription>
          Select tokens to visualize a potential swap route through Jupiter's liquidity aggregator.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-2">
                <div className="grid gap-2">
                    <Label htmlFor="fromToken">From</Label>
                    <Select value={fromToken} onValueChange={setFromToken} disabled={loading}>
                        <SelectTrigger id="fromToken">
                            <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                            {tokens.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleSwap} className="hidden sm:flex" disabled={loading}>
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                </Button>

                <div className="grid gap-2">
                    <Label htmlFor="toToken">To</Label>
                    <Select value={toToken} onValueChange={setToToken} disabled={loading}>
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
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" disabled={loading}/>
            </div>
            
            <Button onClick={handleVisualize} disabled={loading || !fromToken || !toToken || !amount || fromToken === toToken}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {loading ? 'Visualizing...' : 'Visualize Route'}
            </Button>
        </div>
        <div className="mt-4 flex-grow flex flex-col">
            <Label className="text-sm font-medium">Visualized Route</Label>
            <div className="mt-2 p-4 min-h-[84px] flex-grow flex items-center justify-center bg-muted/50 rounded-lg border border-dashed">
                {loading && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
                {!loading && <SwapRouteVisualizer route={route} key={key} />}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossTokenSwap;
