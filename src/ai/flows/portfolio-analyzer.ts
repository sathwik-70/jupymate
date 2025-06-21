'use server';

/**
 * @fileOverview An AI flow to analyze a user's Solana token portfolio, including safety validation.
 *
 * - analyzePortfolio - A function that assesses risk, classifies a portfolio, and validates token safety.
 * - AnalyzePortfolioInput - The input type for the analyzePortfolio function.
 * - AnalyzePortfolioOutput - The return type for the analyzePortfolio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Helper to fetch and cache token lists
const getTokenLists = (() => {
  let strictList: Set<string> | null = null;
  let allList: Set<string> | null = null;

  async function fetchLists() {
    if (!strictList || !allList) {
      try {
        const [strictResponse, allResponse] = await Promise.all([
          fetch('https://token.jup.ag/strict'),
          fetch('https://token.jup.ag/all'),
        ]);
        const strictJson = await strictResponse.json();
        const allJson = await allResponse.json();
        strictList = new Set(strictJson.map((token: any) => token.address));
        allList = new Set(allJson.map((token: any) => token.address));
      } catch (error) {
        console.error("Failed to fetch Jupiter token lists:", error);
        // On failure, use empty sets to avoid breaking the app
        strictList = new Set();
        allList = new Set();
      }
    }
    return { strictList, allList };
  }

  return fetchLists;
})();


async function getTokenValidations(mints: string[]): Promise<Map<string, 'Verified' | 'Community' | 'Unknown'>> {
  const { strictList, allList } = await getTokenLists();
  const validationMap = new Map<string, 'Verified' | 'Community' | 'Unknown'>();

  for (const mint of mints) {
    if (strictList.has(mint)) {
      validationMap.set(mint, 'Verified');
    } else if (allList.has(mint)) {
      validationMap.set(mint, 'Community');
    } else {
      validationMap.set(mint, 'Unknown');
    }
  }
  return validationMap;
}


const AnalyzePortfolioInputSchema = z.object({
  tokens: z.array(
    z.object({
      symbol: z.string().describe('The token symbol, e.g., "SOL" or "BONK".'),
      balance: z.number().describe('The amount of the token the user holds.'),
      type: z.enum(['blue-chip', 'stablecoin', 'meme', 'ecosystem'])
        .describe('The classification of the token.'),
      mint: z.string().describe("The token's mint address."),
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
  tokenSafety: z.array(
    z.object({
      symbol: z.string(),
      mint: z.string(),
      status: z.enum(['Verified', 'Community', 'Unknown']),
    })
  ).describe("The safety status of each token based on Jupiter's token lists."),
});
export type AnalyzePortfolioOutput = z.infer<typeof AnalyzePortfolioOutputSchema>;

export async function analyzePortfolio(input: AnalyzePortfolioInput): Promise<AnalyzePortfolioOutput> {
  return analyzePortfolioFlow(input);
}

const portfolioAnalysisPrompt = ai.definePrompt({
  name: 'portfolioAnalysisPrompt',
  input: { schema: z.object({
    analysisInput: AnalyzePortfolioInputSchema,
    safetyData: z.record(z.string(), z.enum(['Verified', 'Community', 'Unknown'])),
  })},
  output: { schema: z.object({
    classification: z.enum(['Degen', 'Normie', 'Investor']),
    reasoning: z.string(),
  }) },
  prompt: `You are a witty, slightly sarcastic Solana ecosystem expert. Your job is to analyze a user's token portfolio and classify them as a 'Degen', 'Normie', or 'Investor' based on the token types and their safety validation status.

Here are the classification rules:
- **Investor**: Portfolio is heavily weighted towards 'blue-chip' (like SOL, mSOL, stSOL, JitoSOL) and 'stablecoin' (like USDC) tokens. They are playing the long game. The tokens should be 'Verified'.
- **Degen**: Portfolio is heavily weighted towards 'meme' tokens (like BONK, WIF) or tokens with an 'Unknown' or 'Community' safety status. They are here for a good time, not a long time. High risk, high reward.
- **Normie**: A balanced mix of 'blue-chip', 'stablecoin', 'ecosystem' (like JUP, RAY), and maybe a small amount of 'meme' tokens. Their tokens are mostly 'Verified' or 'Community' listed. They are diversified but still have a little fun.

Analyze the following portfolio based on the *composition*, *types*, and *safety status* of tokens. Provide a classification and a short, witty, one-sentence reasoning.

Portfolio:
{{#each analysisInput.tokens}}
- {{symbol}}: {{balance}} (Type: {{type}}, Safety: {{lookup ../safetyData mint}})
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
    const tokenMints = input.tokens.map(t => t.mint);
    const safetyValidations = await getTokenValidations(tokenMints);
    
    const safetyDataForPrompt: Record<string, 'Verified' | 'Community' | 'Unknown'> = {};
    const tokenSafetyResult: AnalyzePortfolioOutput['tokenSafety'] = [];

    for (const token of input.tokens) {
      const status = safetyValidations.get(token.mint) || 'Unknown';
      safetyDataForPrompt[token.mint] = status;
      tokenSafetyResult.push({ symbol: token.symbol, mint: token.mint, status });
    }

    const { output } = await portfolioAnalysisPrompt({ 
      analysisInput: input,
      safetyData: safetyDataForPrompt,
    });
    
    return {
      ...output!,
      tokenSafety: tokenSafetyResult,
    };
  }
);
