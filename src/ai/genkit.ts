import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use a model that is good for structured output and complex instructions.
  model: 'googleai/gemini-pro',
});
