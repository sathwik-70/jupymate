"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Bot, Repeat } from 'lucide-react';
import SwapRouteVisualizer from './swap-route-visualizer';

const tokens = [
  { id: 'SOL', name: 'Solana' },
  { id: 'USDC', name: 'USD Coin' },
  { id: 'JUP', name: 'Jupiter' },
  { id: 'BONK', name: 'Bonk' },
  { id: 'WIF', name: 'dogwifhat' },
];

const CrossTokenSwap = () => {
  const [fromToken, setFromToken] = useState('BONK');
  const [toToken, setToToken] = useState('JUP');
  const [amount, setAmount] = useState('10000');
  const [route, setRoute] = useState<string[]>([]);
  const [key, setKey] = useState(0);

  const handleVisualize = () => {
    if (!fromToken || !toToken || !amount || fromToken === toToken) return;

    // Mock route generation
    let generatedRoute = [fromToken];
    if (fromToken !== 'USDC' && toToken !== 'USDC') {
      generatedRoute.push('USDC');
    }
    generatedRoute.push(toToken);

    setRoute(generatedRoute);
    setKey(prev => prev + 1);
  };
  
  const handleSwap = () => {
      const currentFrom = fromToken;
      setFromToken(toToken);
      setToToken(currentFrom);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Repeat className="w-6 h-6 text-primary"/>
            Cross-Token Swap Visualizer
        </CardTitle>
        <CardDescription>
          Select tokens to visualize a potential swap route through Jupiter's liquidity aggregator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-2">
                <div className="grid gap-2">
                    <Label htmlFor="fromToken">From</Label>
                    <Select value={fromToken} onValueChange={setFromToken}>
                        <SelectTrigger id="fromToken">
                            <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                            {tokens.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleSwap} className="hidden sm:flex">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                </Button>

                <div className="grid gap-2">
                    <Label htmlFor="toToken">To</Label>
                    <Select value={toToken} onValueChange={setToToken}>
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
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
            </div>
            
            <Button onClick={handleVisualize} disabled={!fromToken || !toToken || !amount || fromToken === toToken}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Visualize Route
            </Button>

            <div className="mt-4">
                <Label className="text-sm font-medium">Visualized Route</Label>
                <div className="mt-2 p-4 min-h-[84px] flex items-center justify-center bg-muted/50 rounded-lg border border-dashed">
                    <SwapRouteVisualizer route={route} key={key} />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossTokenSwap;
