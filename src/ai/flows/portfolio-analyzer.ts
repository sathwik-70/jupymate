
'use server';

/**
 * @fileOverview An AI flow to analyze a user's Solana token portfolio.
 *
 * - analyzePortfolio - A function that assesses risk and classifies a portfolio.
 * - AnalyzePortfolioInput - The input type for the analyzePortfolio function.
 * - AnalyzePortfolioOutput - The return type for the analyzePortfolio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePortfolioInputSchema = z.object({
  tokens: z.array(
    z.object({
      symbol: z.string().describe('The token symbol, e.g., "SOL" or "BONK".'),
      balance: z.number().describe('The amount of the token the user holds.'),
      type: z.enum(['blue-chip', 'stablecoin', 'meme', 'ecosystem'])
        .describe('The classification of the token.'),
    })
  ).describe("A list of the user's token holdings."),
});
export type AnalyzePortfolioInput = z.infer<typeof AnalyzePortfolioInputSchema>;

const AnalyzePortfolioOutputSchema = z.object({
  classification: z
    .enum(['Degen', 'Normie', 'Investor'])
    .describe('The classification of the portfolio.'),
  reasoning: z
    .string()
    .describe('A brief, witty, one-sentence explanation for the classification.'),
});
export type AnalyzePortfolioOutput = z.infer<typeof AnalyzePortfolioOutputSchema>;

export async function analyzePortfolio(input: AnalyzePortfolioInput): Promise<AnalyzePortfolioOutput> {
  return analyzePortfolioFlow(input);
}

const portfolioAnalysisPrompt = ai.definePrompt({
  name: 'portfolioAnalysisPrompt',
  input: { schema: AnalyzePortfolioInputSchema },
  output: { schema: AnalyzePortfolioOutputSchema },
  prompt: `You are a witty, slightly sarcastic Solana ecosystem expert. Your job is to analyze a user's token portfolio and classify them as a 'Degen', 'Normie', or 'Investor' based on the token types they hold.

Here are the classification rules:
- **Investor**: Portfolio is heavily weighted towards 'blue-chip' (like SOL) and 'stablecoin' (like USDC) tokens. They are playing the long game.
- **Degen**: Portfolio is heavily weighted towards 'meme' tokens (like BONK, WIF). They are here for a good time, not a long time. High risk, high reward.
- **Normie**: A balanced mix of 'blue-chip', 'stablecoin', 'ecosystem' (like JUP), and maybe a small amount of 'meme' tokens. They are diversified but still have a little fun.

Analyze the following portfolio based on the *composition* and *types* of tokens, not just the raw balance. Provide a classification and a short, witty, one-sentence reasoning.

Portfolio:
{{#each tokens}}
- {{symbol}}: {{balance}} (Type: {{type}})
{{/each}}
`,
});

const analyzePortfolioFlow = ai.defineFlow(
  {
    name: 'analyzePortfolioFlow',
    inputSchema: AnalyzePortfolioInputSchema,
    outputSchema: AnalyzePortfolioOutputSchema,
  },
  async (input) => {
    const { output } = await portfolioAnalysisPrompt(input);
    return output!;
  }
);
