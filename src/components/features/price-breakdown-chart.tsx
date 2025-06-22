
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';

interface CorePriceResponse {
  priceUSD: number;
}

const PriceBreakdownChart = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCorePrice = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestOptions = {
          method: "GET",
          redirect: "follow"
        };
        const response = await fetch("https://openapi.coredao.org/api/stats/last_core_price", requestOptions as RequestInit);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CorePriceResponse = await response.json();
        
        if (result && typeof result.priceUSD === 'number') {
          setPrice(result.priceUSD);
        } else {
          throw new Error("Invalid data format from API.");
        }
      } catch (e: any) {
        console.error("Failed to fetch CORE price:", e);
        setError("Failed to fetch price data from the API.");
      } finally {
        setLoading(false);
      }
    };

    fetchCorePrice();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary"/>
            Live CORE Price
        </CardTitle>
        <CardDescription>
            Current market price for CORE, fetched from the CoreDAO API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-40 w-full flex items-center justify-center text-center">
            {loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    Fetching live price...
                </div>
            )}
            {!loading && error && (
                <div className="flex items-center justify-center h-full text-destructive">
                    {error}
                </div>
            )}
            {!loading && !error && price !== null && (
                 <div className='animate-fade-in space-y-1'>
                    <p className="text-lg text-muted-foreground">CORE Price (USD)</p>
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        ${price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                    </p>
                 </div>
            )}
             {!loading && !error && price === null && (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    Could not load price data.
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceBreakdownChart;
