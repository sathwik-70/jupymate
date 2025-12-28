
import { Token, PortfolioItem } from './types';

// Popular tokens on Solana for the demo
export const POPULAR_TOKENS: Token[] = [
  {
    address: 'So11111111111111111111111111111111111111112',
    chainId: 101,
    decimals: 9,
    name: 'Wrapped SOL',
    symbol: 'SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    chainId: 101,
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    chainId: 101,
    decimals: 6,
    name: 'USDT',
    symbol: 'USDT',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
  },
  {
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqj8bTkBSuTZI25i9',
    chainId: 101,
    decimals: 6,
    name: 'Jupiter',
    symbol: 'JUP',
    logoURI: 'https://static.jup.ag/jup/icon.png',
  },
  {
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    chainId: 101,
    decimals: 5,
    name: 'Bonk',
    symbol: 'BONK',
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
  },
  {
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    chainId: 101,
    decimals: 6,
    name: 'dogwifhat',
    symbol: 'WIF',
    logoURI: 'https://bafkreibk3cvsi5ctw7usde27y1q731i32p311i32p3.ipfs.nftstorage.link',
  },
  {
    address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
    chainId: 101,
    decimals: 8,
    name: 'Render Token',
    symbol: 'RNDR',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png',
  },
  {
    address: 'HZ1JovNiVvGrGNiiYv368NkVStmUEj6TR2nZ1d7q601R',
    chainId: 101,
    decimals: 6,
    name: 'Pyth Network',
    symbol: 'PYTH',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYv368NkVStmUEj6TR2nZ1d7q601R/logo.png',
  },
  {
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    chainId: 101,
    decimals: 6,
    name: 'Raydium',
    symbol: 'RAY',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  },
  {
    address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    chainId: 101,
    decimals: 9,
    name: 'Marinade Staked SOL',
    symbol: 'mSOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
  }
];

export const MOCK_PORTFOLIO: PortfolioItem[] = [
  { token: POPULAR_TOKENS[0], amount: 12.5, valueUsd: 1800 },
  { token: POPULAR_TOKENS[2], amount: 5000, valueUsd: 5500 },
  { token: POPULAR_TOKENS[3], amount: 15000000, valueUsd: 450 },
  { token: POPULAR_TOKENS[4], amount: 200, valueUsd: 600 },
  { 
    token: {
      address: 'unknown_token_address',
      chainId: 101,
      decimals: 9,
      name: 'RugPull Coin',
      symbol: 'SCAM',
      logoURI: 'https://via.placeholder.com/32' 
    }, 
    amount: 100000, 
    valueUsd: 10 
  }
];

export const DEV_SYSTEM_INSTRUCTION = `You are Jupymate, an expert AI developer assistant specialized in the Solana blockchain and the Jupiter Aggregator API. 
Your goal is to help developers integrate Jupiter, understand DeFi concepts (swaps, slippage, price impact), and debug code.
Be concise, technical, and witty. Use code blocks for examples.
If asked about the API, refer to endpoints like /v6/quote, /v6/swap.
`;

export const PORTFOLIO_SYSTEM_INSTRUCTION = `You are a "Roast My Wallet" AI. 
Analyze the provided portfolio of Solana tokens. 
Classify the user as "Degen", "Normie", or "Investor/Whale".
Be funny, slightly sarcastic, but ultimately insightful about their risk profile.
Mention specific tokens if provided.
Format the output with Markdown.
`;

export const SIMULATOR_SYSTEM_INSTRUCTION = `You are the Jupymate Transaction Simulator AI.
Your task is to analyze a proposed Solana DeFi swap transaction based on the provided parameters (Token A to Token B, Amount, Slippage, Price Impact).
1. Predict the outcome: Will it likely succeed?
2. Estimate the "Real" cost: Network fees + Price Impact loss in USD.
3. Assign a "Risk Score" from 0 (Safe) to 10 (Degen/High Risk).
4. Provide a brief, strategic recommendation (e.g., "Wait for lower volatility", "Good entry", "Increase slippage tolerance").
Keep the response concise and formatted in Markdown. Use bullet points.
`;

// MCP Configuration Content
export const JUPITER_MCP_CONFIG = {
  "name": "Jupiter Aggregator MCP",
  "version": "1.0.0",
  "description": "Context definitions for Jupiter Aggregator V6 API endpoints.",
  "resources": [
    {
      "uri": "https://quote-api.jup.ag/v6/quote",
      "name": "Get Quote",
      "description": "Get a swap quote for a given input token, output token, and amount.",
      "parameters": {
        "inputMint": "string (Pubkey)",
        "outputMint": "string (Pubkey)",
        "amount": "integer (Atomic units)",
        "slippageBps": "integer (Basis points, e.g., 50 for 0.5%)"
      }
    },
    {
      "uri": "https://quote-api.jup.ag/v6/swap",
      "name": "Build Swap Transaction",
      "description": "Returns a base64 encoded transaction for a given quote.",
      "parameters": {
        "userPublicKey": "string (Pubkey)",
        "quoteResponse": "object (From /quote endpoint)"
      }
    },
    {
      "uri": "https://price.jup.ag/v6/price",
      "name": "Get Price",
      "description": "Get the price of a token in USDC.",
      "parameters": {
        "ids": "string (Comma separated symbols or pubkeys)"
      }
    },
    {
      "uri": "https://token.jup.ag/strict",
      "name": "Strict Token List",
      "description": "Returns the list of verified tokens (The 'Shield' list)."
    }
  ]
};
