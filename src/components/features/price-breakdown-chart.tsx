
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { getTokenPrices } from '@/ai/flows/price-fetcher';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface PriceData {
  token: string;
  price: number;
}

const PriceBreakdownChart = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokenSymbols = ['SOL', 'JUP', 'WIF', 'BONK'];
        const result = await getTokenPrices({ tokenSymbols });

        if (result && result.prices) {
          const formattedData = tokenSymbols.map(symbol => ({
            token: symbol,
            price: result.prices[symbol] || 0,
          })).sort((a,b) => b.price - a.price); // Sort for better visualization
          setPriceData(formattedData);
        } else {
          throw new Error("Invalid data format from API.");
        }
      } catch (e: any) {
        console.error("Failed to fetch token prices:", e);
        setError("Failed to fetch price data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const chartConfig = priceData.reduce((acc, item, index) => {
    acc[item.token] = {
      label: item.token,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return acc;
  }, {} as ChartConfig & { price: { label: string } });

  chartConfig.price = { label: "Price (USD)" };

  const prices = priceData.map(p => p.price).filter(p => p > 0);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 1;
  const useLogScale = maxPrice / minPrice > 1000;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary"/>
            Live Token Prices
        </CardTitle>
        <CardDescription>
            Current market prices from Jupiter API for key Solana tokens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            {loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    Fetching live prices...
                </div>
            )}
            {!loading && error && (
                <div className="flex items-center justify-center h-full text-destructive">
                    {error}
                </div>
            )}
            {!loading && !error && priceData.length > 0 && (
                 <ChartContainer config={chartConfig} className="w-full h-full">
                    <BarChart
                        accessibilityLayer
                        data={priceData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="token"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                           stroke="hsl(var(--muted-foreground))"
                           tickLine={false}
                           axisLine={false}
                           tickFormatter={(value) => value > 1 ? `$${Math.round(Number(value))}` : `$${Number(value).toPrecision(2)}`}
                           scale={useLogScale ? "log" : "auto"}
                           domain={useLogScale ? [0.00001, 'auto'] : [0, 'auto']}
                           allowDataOverflow
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                indicator="dot"
                                formatter={(value, name, props) => {
                                    return (
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-foreground">{props.payload.token}</span>
                                            <span className="text-muted-foreground">
                                                ${typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6}) : value}
                                            </span>
                                        </div>
                                    );
                                }}
                            />}
                        />
                        <Bar dataKey="price" radius={4}>
                           {priceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartConfig[entry.token]?.color || 'hsl(var(--chart-1))'} />
                            ))}
                        </Bar>
                    </BarChart>
                 </ChartContainer>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceBreakdownChart;
