// src/ai/flows/contextual-assistance.ts
'use server';

/**
 * @fileOverview Contextual assistance and API interaction flows.
 *
 * - getTooltip - A function that generates a tooltip for a given configuration parameter.
 * - GetTooltipInput - The input type for the getTooltip function.
 * - GetTooltipOutput - The return type for the getTooltip function.
 * 
 * - getJupiterQuote - A function that fetches a swap quote from the Jupiter API.
 * - GetJupiterQuoteInput - The input type for the getJupiterQuote function.
 * - GetJupiterQuoteOutput - The return type for the getJupiterQuote function.
 *
 * - askDevAssistant - A function that gets a response from the AI developer assistant.
 * - AskDevAssistantInput - The input type for the askDevAssistant function.
 * - AskDevAssistantOutput - The return type for the askDevAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import mcpConfig from '@/config/mcpConfig.json';

// Tooltip Flow
const GetTooltipInputSchema = z.object({
  configParameter: z.string().describe('The configuration parameter to get a tooltip for.'),
  mcpConfig: z.string().describe('The MCP configuration as a JSON string.'),
});
export type GetTooltipInput = z.infer<typeof GetTooltipInputSchema>;

const GetTooltipOutputSchema = z.object({
  tooltip: z.string().describe('The AI-generated tooltip for the configuration parameter.'),
});
export type GetTooltipOutput = z.infer<typeof GetTooltipOutputSchema>;

export async function getTooltip(input: GetTooltipInput): Promise<GetTooltipOutput> {
  return getTooltipFlow(input);
}

const getTooltipFlow = ai.defineFlow(
  {
    name: 'getTooltipFlow',
    inputSchema: GetTooltipInputSchema,
    outputSchema: GetTooltipOutputSchema,
  },
  async input => {
    const {output} = await ai.definePrompt({
      name: 'getTooltipPrompt',
      input: {schema: GetTooltipInputSchema},
      output: {schema: GetTooltipOutputSchema},
      prompt: `You are an AI assistant that helps developers understand configuration parameters.
      Based on the following MCP configuration, generate a concise and helpful tooltip for the given configuration parameter.
      MCP Configuration:
      {{mcpConfig}}
      Configuration Parameter:
      {{configParameter}}
      Tooltip:`,
    })(input);
    return output!;
  }
);


// Jupiter Quote Flow
const GetJupiterQuoteInputSchema = z.object({
  inputMint: z.string(),
  outputMint: z.string(),
  amount: z.number(),
  userPublicKey: z.string().optional(),
});
export type GetJupiterQuoteInput = z.infer<typeof GetJupiterQuoteInputSchema>;

const GetJupiterQuoteOutputSchema = z.object({
  route: z.array(z.string()),
});
export type GetJupiterQuoteOutput = z.infer<typeof GetJupiterQuoteOutputSchema>;

export async function getJupiterQuote(input: GetJupiterQuoteInput): Promise<GetJupiterQuoteOutput> {
  return getJupiterQuoteFlow(input);
}

const getJupiterQuoteFlow = ai.defineFlow(
  {
    name: 'getJupiterQuoteFlow',
    inputSchema: GetJupiterQuoteInputSchema,
    outputSchema: GetJupiterQuoteOutputSchema,
  },
  async ({ inputMint, outputMint, amount, userPublicKey }) => {
    // Using v6 of the Jupiter API for better routes and features.
    let url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
    if (userPublicKey) {
      url += `&userPublicKey=${userPublicKey}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!data || !data.routePlan) {
        throw new Error('Could not find a route for the swap.');
      }
      
      // The route starts with the input mint, followed by the output mint of each hop in the plan.
      const routeMints: string[] = [
        data.inputMint, 
        ...data.routePlan.map((hop: any) => hop.swapInfo.outputMint)
      ];
      
      return {
        route: routeMints
      };
      
    } catch (error: any) {
      console.error('Jupiter quote API error:', error);
      throw new Error(error.message || 'Failed to fetch swap route from Jupiter API.');
    }
  }
);

// Dev Assistant Flow
const AskDevAssistantInputSchema = z.object({
  query: z.string().describe("The user's question for the assistant."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});
export type AskDevAssistantInput = z.infer<typeof AskDevAssistantInputSchema>;

const AskDevAssistantOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
export type AskDevAssistantOutput = z.infer<typeof AskDevAssistantOutputSchema>;

export async function askDevAssistant(input: AskDevAssistantInput): Promise<AskDevAssistantOutput> {
  return devAssistantFlow(input);
}

const devAssistantFlow = ai.defineFlow(
  {
    name: 'devAssistantFlow',
    inputSchema: AskDevAssistantInputSchema,
    outputSchema: AskDevAssistantOutputSchema,
  },
  async ({ query, history }) => {
    const systemPrompt = `You are an expert AI developer assistant specializing in the Jupiter API on Solana. Your goal is to help developers understand and use the Jupiter API effectively.
You have access to the Master Control Program (MCP) configuration, which describes the available API endpoints. Use this as your primary source of truth.
Respond to the user's question based on the history and the MCP config provided below. Be concise and provide code examples when relevant.
MCP Configuration:
\`\`\`json
${JSON.stringify(mcpConfig, null, 2)}
\`\`\`
`;
    
    const { text } = await ai.generate({
        prompt: query,
        history: (history || []).map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        system: systemPrompt
    });

    return { response: text };
  }
);
