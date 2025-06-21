// src/ai/flows/contextual-assistance.ts
'use server';

/**
 * @fileOverview A contextual assistance AI agent that provides tooltips based on MCP configuration.
 *
 * - getTooltip - A function that generates a tooltip for a given configuration parameter.
 * - GetTooltipInput - The input type for the getTooltip function.
 * - GetTooltipOutput - The return type for the getTooltip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'getTooltipPrompt',
  input: {schema: GetTooltipInputSchema},
  output: {schema: GetTooltipOutputSchema},
  prompt: `You are an AI assistant that helps developers understand configuration parameters.

  Based on the following MCP configuration, generate a concise and helpful tooltip for the given configuration parameter.

  MCP Configuration:
  {{mcpConfig}}

  Configuration Parameter:
  {{configParameter}}

  Tooltip:`, // No Handlebars `{{#if}}` block, so no need for `system` property.
});

const getTooltipFlow = ai.defineFlow(
  {
    name: 'getTooltipFlow',
    inputSchema: GetTooltipInputSchema,
    outputSchema: GetTooltipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
