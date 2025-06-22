
"use client";

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getJupiterQuote } from '@/ai/flows/contextual-assistance';
import { tokens } from '@/config/tokens';
import { Loader2, TrendingUp } from 'lucide-react';

interface TokenPrice {
  name: string;
  price: number;
}

// We'll fetch prices relative to USDC
const stablecoin = tokens.find(t => t.id === 'USDC');

const PriceBreakdownChart = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!stablecoin) {
        setError("USDC stablecoin configuration not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const tokensToFetch = tokens.filter(t => t.id !== 'USDC');
      
      try {
        const pricePromises = tokensToFetch.map(async (token) => {
          // We ask for the price of 1 whole unit of the token
          const amountInSmallestUnit = 1 * (10 ** token.decimals);
          
          const quote = await getJupiterQuote({
            inputMint: token.mint,
            outputMint: stablecoin.mint,
            amount: amountInSmallestUnit.toString(),
          });

          if (quote && quote.outAmount) {
            // The outAmount is in the smallest unit of the stablecoin (USDC)
            const price = Number(quote.outAmount) / (10 ** stablecoin.decimals);
            return { name: token.id, price };
          }
          return { name: token.id, price: 0 };
        });

        const settledPrices = await Promise.all(pricePromises);
        const validPrices = settledPrices.filter(p => p.price > 0);
        
        if(validPrices.length === 0) {
            setError("Could not fetch token prices from Jupiter API.");
        } else {
            setPrices(validPrices);
        }

      } catch (e: any) {
        console.error("Failed to fetch token prices:", e);
        setError("Failed to fetch token prices. The API may be unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary"/>
            Live Token Prices
        </CardTitle>
        <CardDescription>
            Current market prices for popular Solana tokens, fetched from Jupiter and quoted in USDC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            {loading && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    Fetching live prices...
                </div>
            )}
            {!loading && error && (
                <div className="flex items-center justify-center h-full text-destructive">
                    {error}
                </div>
            )}
            {!loading && !error && prices.length > 0 && (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prices} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))"/>
                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                            formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Price']}
                        />
                        <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }}/>
                        <Bar dataKey="price" name="Price (USDC)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceBreakdownChart;
