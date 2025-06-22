'use server';

/**
 * @fileOverview A flow to fetch token prices from the Jupiter API.
 *
 * - getTokenPrices - A function that gets prices for a list of tokens.
 * - GetTokenPricesInput - The input type for the getTokenPrices function.
 * - GetTokenPricesOutput - The return type for the getTokenPrices function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { tokenMap } from '@/config/tokens';

const GetTokenPricesInputSchema = z.object({
  tokenSymbols: z.array(z.string()).describe("An array of token symbols, e.g., ['SOL', 'JUP']."),
});
export type GetTokenPricesInput = z.infer<typeof GetTokenPricesInputSchema>;

const GetTokenPricesOutputSchema = z.object({
  prices: z.record(z.string(), z.number()).describe("An object mapping token symbols to their price in USD."),
});
export type GetTokenPricesOutput = z.infer<typeof GetTokenPricesOutputSchema>;

export async function getTokenPrices(input: GetTokenPricesInput): Promise<GetTokenPricesOutput> {
  return getTokenPricesFlow(input);
}

const getTokenPricesFlow = ai.defineFlow(
  {
    name: 'getTokenPricesFlow',
    inputSchema: GetTokenPricesInputSchema,
    outputSchema: GetTokenPricesOutputSchema,
  },
  async ({ tokenSymbols }) => {
    if (tokenSymbols.length === 0) {
      return { prices: {} };
    }

    const usdcInfo = tokenMap.get('USDC');
    if (!usdcInfo) {
      throw new Error('Internal error: USDC token configuration not found.');
    }

    const prices: Record<string, number> = {};

    // Concurrently fetch the price for each token by quoting it against USDC.
    const pricePromises = tokenSymbols.map(async (symbol) => {
      if (symbol === 'USDC') {
        return { symbol, price: 1 };
      }

      const tokenInfo = tokenMap.get(symbol);
      if (!tokenInfo) {
        console.warn(`Token info not found for ${symbol}, skipping price fetch.`);
        return { symbol, price: 0 };
      }

      // We calculate the price for 1 whole unit of the token.
      const amountInLamports = 1 * (10 ** tokenInfo.decimals);
      
      // Using the Quote API as a robust, aggregator-based price source.
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenInfo.mint}&outputMint=${usdcInfo.mint}&amount=${amountInLamports.toString()}&slippageBps=50`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Could not fetch price for ${symbol} from Quote API. Status: ${response.status}`);
          return { symbol, price: 0 };
        }
        const quoteData = await response.json();
        
        if (quoteData && quoteData.outAmount) {
          const price = Number(quoteData.outAmount) / (10 ** usdcInfo.decimals);
          return { symbol, price };
        }
        return { symbol, price: 0 };

      } catch (error: any) {
        console.error(`Jupiter Quote API error for ${symbol}:`, error);
        return { symbol, price: 0 };
      }
    });

    const results = await Promise.all(pricePromises);

    for (const result of results) {
        if(result) {
            prices[result.symbol] = result.price;
        }
    }
    
    return { prices };
  }
);