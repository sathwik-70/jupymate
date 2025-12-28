
import { GoogleGenAI } from "@google/genai";
import { DEV_SYSTEM_INSTRUCTION, PORTFOLIO_SYSTEM_INSTRUCTION, SIMULATOR_SYSTEM_INSTRUCTION } from '../constants';
import { PortfolioItem, ChatMessage, JupiterQuoteResponse, Token } from '../types';

// Initialize Gemini Client
// Using named parameter and direct process.env.API_KEY access as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze portfolio using the recommended model for basic text tasks.
export const analyzePortfolioWithGemini = async (portfolio: PortfolioItem[]): Promise<string> => {
  try {
    const portfolioDesc = portfolio.map(p => 
      `${p.amount} ${p.token.symbol} ($${p.valueUsd})`
    ).join(', ');

    const prompt = `Here is my portfolio holding: [${portfolioDesc}]. Analyze it.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: PORTFOLIO_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Flash is optimized for speed
      }
    });

    // Extract text output using the property access (not method call).
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error communicating with AI. Please check your configuration.";
  }
};

// Handle chat interactions for dev assistance using the recommended model for complex reasoning.
export const chatWithDevAssistant = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: DEV_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 32768 } // Max budget for deep coding reasoning
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    // Extract text output using the property access.
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the neural network. Try again later.";
  }
};

// Simulate transaction details using Gemini 3 series for enhanced reasoning.
export const simulateTransactionWithGemini = async (
  inputToken: Token,
  outputToken: Token,
  amount: number,
  quote: JupiterQuoteResponse
): Promise<string> => {
  try {
    const prompt = `
      Simulate this transaction:
      - Swap ${amount} ${inputToken.symbol} for ${outputToken.symbol}
      - Route Plan Steps: ${quote.routePlan.length}
      - Price Impact: ${quote.priceImpactPct}%
      - Minimum Received: ${quote.outAmount} (raw units)
      - Slippage Setting: ${quote.slippageBps / 100}%
      
      Analyze the risks, fees, and likely execution success.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SIMULATOR_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Extract text output using the property access.
    return response.text || "Simulation failed to generate data.";
  } catch (error) {
    console.error("Gemini Simulation Error:", error);
    return "AI Simulator is offline. Please check connection.";
  }
};
