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

    const ids = tokenSymbols.join(',');
    const url = `https://price.jup.ag/v6/price?ids=${ids}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.data) {
        throw new Error('Invalid response format from Jupiter Price API.');
      }
      
      const prices: Record<string, number> = {};
      for (const symbol in data.data) {
        prices[symbol] = data.data[symbol].price;
      }

      return { prices };

    } catch (error: any) {
      console.error('Jupiter Price API error:', error);
      throw new Error(error.message || 'Failed to fetch token prices from Jupiter API.');
    }
  }
);
