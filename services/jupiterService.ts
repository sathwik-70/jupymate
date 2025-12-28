
import { JupiterQuoteResponse, JupiterSwapResponse, PricePoint, Token } from '../types';
import { POPULAR_TOKENS } from '../constants';

const JUP_API_URL = 'https://quote-api.jup.ag/v6';
const PRICE_API_URL = 'https://api.jup.ag/price/v2';
const TOKEN_LIST_API = 'https://token.jup.ag/strict'; // Shield API source

// Mock Prices for Fallback Generator
const MOCK_PRICES: Record<string, number> = {
  'SOL': 148.50,
  'USDC': 1.00,
  'JUP': 0.95,
  'BONK': 0.000024,
  'WIF': 2.85
};

const getTokenSymbol = (mint: string): string => {
  const token = POPULAR_TOKENS.find(t => t.address === mint);
  return token ? token.symbol : 'UNKNOWN';
};

export const getJupiterQuote = async (
  inputMint: string,
  outputMint: string,
  amount: number, 
  decimals: number
): Promise<JupiterQuoteResponse | null> => {
  // Prevent API call if tokens are identical
  if (inputMint === outputMint) return null;

  try {
    // Check if amount is valid
    if (!amount || amount <= 0) return null;

    const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals));
    
    // Create params
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountInSmallestUnit.toString(),
      slippageBps: '50', // 0.5%
    });

    // Attempt Fetch
    const response = await fetch(`${JUP_API_URL}/quote?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as JupiterQuoteResponse;

  } catch (error) {
    console.warn("Jupiter API unreachable. Switching to Demo Mode (Mock Data).", error);
    return generateMockQuote(inputMint, outputMint, amount, decimals);
  }
};

export const getSwapTransaction = async (
  userPublicKey: string,
  quote: JupiterQuoteResponse
): Promise<JupiterSwapResponse | null> => {
  try {
    const body = {
      quoteResponse: quote,
      userPublicKey: userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true, // Crucial for transaction landing
      prioritizationFeeLamports: "auto" // Crucial for transaction landing
    };

    const response = await fetch(`${JUP_API_URL}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Swap API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as JupiterSwapResponse;
  } catch (error) {
    console.error("Failed to fetch swap transaction:", error);
    throw error;
  }
};

// Helper to generate realistic-looking mock data
const generateMockQuote = (inputMint: string, outputMint: string, amount: number, decimals: number): JupiterQuoteResponse => {
  const inputSymbol = getTokenSymbol(inputMint);
  const outputSymbol = getTokenSymbol(outputMint);
  
  const inputPrice = MOCK_PRICES[inputSymbol] || 1;
  const outputPrice = MOCK_PRICES[outputSymbol] || 1;
  
  // Calculate exchange rate
  const inputValueUsd = amount * inputPrice;
  const outputAmountRaw = inputValueUsd / outputPrice;
  
  // Apply mock slippage/fees (0.5%)
  const outputAmountNet = outputAmountRaw * 0.995;
  
  const outputToken = POPULAR_TOKENS.find(t => t.address === outputMint);
  const outDecimals = outputToken ? outputToken.decimals : 6;
  
  const outAmountInteger = Math.floor(outputAmountNet * Math.pow(10, outDecimals)).toString();
  const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals)).toString();

  return {
    inputMint,
    outputMint,
    inAmount: amountInSmallestUnit,
    outAmount: outAmountInteger,
    otherAmountThreshold: "0",
    swapMode: "ExactIn",
    slippageBps: 50,
    platformFee: null,
    priceImpactPct: "0.15",
    routePlan: [
      {
        swapInfo: {
          ammKey: "mock-amm-raydium",
          label: "Raydium",
          inputMint,
          outputMint: "So11111111111111111111111111111111111111112", // Mock hop
          inAmount: amountInSmallestUnit,
          outAmount: amountInSmallestUnit,
          feeAmount: "5000",
          feeMint: inputMint
        },
        percent: 100
      },
      {
        swapInfo: {
          ammKey: "mock-amm-orca",
          label: "Orca",
          inputMint: "So11111111111111111111111111111111111111112",
          outputMint,
          inAmount: amountInSmallestUnit, 
          outAmount: outAmountInteger,
          feeAmount: "100",
          feeMint: outputMint
        },
        percent: 100
      }
    ],
    timeTaken: 0.15
  };
};

/**
 * Fetches the current price of a token from Jupiter Price API V2.
 */
export const fetchCurrentTokenPrice = async (mint: string): Promise<number | null> => {
  try {
    const response = await fetch(`${PRICE_API_URL}?ids=${mint}`);
    if (!response.ok) throw new Error('Price API failed');
    const data = await response.json();
    // API v2 structure: { data: { "address": { id, type, price } } }
    const priceData = data.data?.[mint];
    return priceData ? parseFloat(priceData.price) : null;
  } catch (error) {
    console.warn("Failed to fetch real-time price:", error);
    return null;
  }
};

/**
 * Fetches token price history.
 * Tries CoinGecko first (for real history), falls back to simulation anchored by Jupiter V2 price.
 */
export const fetchTokenPriceHistory = async (token: Token, timeframe: '1H' | '24H' | '7D' | '30D'): Promise<PricePoint[]> => {
  const now = Date.now();
  
  // 1. Get the REAL current price from Jupiter V2 to ensure the "Live" number is accurate
  const realPrice = await fetchCurrentTokenPrice(token.address);

  try {
    // 2. Try CoinGecko for real history
    // Note: CoinGecko Public API has strict rate limits (approx 10-30 calls/min)
    const daysMap = { '1H': '1', '24H': '1', '7D': '7', '30D': '30' };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/solana/contract/${token.address}/market_chart?vs_currency=usd&days=${daysMap[timeframe]}`
    );
    
    if (!response.ok) throw new Error('CoinGecko API limit or error');
    
    const data = await response.json();
    let prices: [number, number][] = data.prices || [];

    // Filter for 1H specifically since API min is 1 day
    if (timeframe === '1H') {
        const oneHourAgo = now - 60 * 60 * 1000;
        prices = prices.filter(p => p[0] >= oneHourAgo);
        
        // If API returns too few points for 1H (e.g. illiquid token or daily resolution), 
        // throw error to fallback to high-res simulation
        if (prices.length < 5) throw new Error('Insufficient granular data for 1H');
    }
    
    const mappedPrices = prices.map(([timestamp, price]) => ({ timestamp, price }));

    // Anchor the chart to the latest Jupiter price for consistency with the header
    if (realPrice) {
       mappedPrices.push({ timestamp: now, price: realPrice });
    }

    if (mappedPrices.length === 0) throw new Error('No data from CoinGecko');

    return mappedPrices;

  } catch (error) {
    // 3. Fallback: Generate history backwards from the current real price
    // This ensures the chart ends exactly at the live market price even if simulated
    
    const basePrice = realPrice || MOCK_PRICES[token.symbol] || 1;
  
    let pointsCount = 0;
    let interval = 0;
    let volatility = 0;
  
    switch (timeframe) {
      case '1H': pointsCount = 60; interval = 60 * 1000; volatility = 0.002; break; // 1 min intervals
      case '24H': pointsCount = 96; interval = 15 * 60 * 1000; volatility = 0.015; break; // 15 min intervals
      case '7D': pointsCount = 168; interval = 60 * 60 * 1000; volatility = 0.05; break; // 1 hour intervals
      case '30D': pointsCount = 30; interval = 24 * 60 * 60 * 1000; volatility = 0.10; break; // 1 day intervals
      default: pointsCount = 96; interval = 15 * 60 * 1000; volatility = 0.015; break;
    }

    // Generate history backwards from the current real price
    let currentSimPrice = basePrice;
    const historyPrices: number[] = [basePrice];
  
    for (let i = 0; i < pointsCount; i++) {
      // Random walk
      const change = currentSimPrice * (Math.random() - 0.5) * volatility;
      currentSimPrice -= change; // Go backwards
      
      // Ensure price doesn't go negative
      if (currentSimPrice < 0.000001) currentSimPrice = 0.000001;
      
      historyPrices.push(currentSimPrice);
    }
  
    // Reverse and map to PricePoint
    // The first element in historyPrices is the current price (last in time)
    // So when we reverse, it becomes the last element.
    return historyPrices.reverse().map((price, index) => ({
      timestamp: now - ((pointsCount - index) * interval),
      price: price
    }));
  }
};

/**
 * Checks if tokens are in the Jupiter Strict List (Verified).
 * Simulates Shield functionality.
 */
export const checkTokenVerification = async (tokens: Token[]): Promise<Map<string, boolean>> => {
  try {
    const response = await fetch(TOKEN_LIST_API);
    if (!response.ok) throw new Error('Failed to fetch strict list');
    
    const strictList = await response.json() as Token[];
    const strictSet = new Set(strictList.map(t => t.address));
    
    const verificationMap = new Map<string, boolean>();
    tokens.forEach(t => {
      // For demo, check strictly against list or our POPULAR_TOKENS (assumed safe)
      const isVerified = strictSet.has(t.address) || POPULAR_TOKENS.some(pt => pt.address === t.address);
      verificationMap.set(t.address, isVerified);
    });
    
    return verificationMap;
  } catch (e) {
    console.warn("Could not fetch strict token list, defaulting to basic check", e);
    // Fallback: verified if in POPULAR_TOKENS constant
    const verificationMap = new Map<string, boolean>();
    tokens.forEach(t => {
       const isVerified = POPULAR_TOKENS.some(pt => pt.address === t.address);
       verificationMap.set(t.address, isVerified);
    });
    return verificationMap;
  }
};
