
export interface TokenInfo {
  id: string;
  name: string;
  mint: string;
  decimals: number;
  type: 'blue-chip' | 'stablecoin' | 'meme' | 'ecosystem';
}

export const tokens: TokenInfo[] = [
  { id: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9, type: 'blue-chip' },
  { id: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, type: 'stablecoin' },
  { id: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, type: 'ecosystem' },
  { id: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, type: 'meme' },
  { id: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzL7gmAJsCn7V', decimals: 6, type: 'meme' },
];

export const tokenMap = new Map<string, TokenInfo>(tokens.map(t => [t.id, t]));
export const mintMap = new Map<string, TokenInfo>(tokens.map(t => [t.mint, t]));
