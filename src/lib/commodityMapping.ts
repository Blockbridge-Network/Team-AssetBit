// Mapping between frontend symbols and API keys
export const symbolToApiKey: Record<string, string> = {
  // Minerals
  XAU: 'gold',
  XAG: 'silver',
  COPPER: 'copper',
  ALUMINIUM: 'aluminium',
  PLATINUM: 'platinum',
  PALLADIUM: 'palladium',
  OIL: 'oil',
  NATGAS: 'natural_gas',

  // Farm Produce
  WHEAT: 'wheat',
  CORN: 'corn',
  SUGAR: 'sugar',
  COTTON: 'cotton',
  LUMBER: 'lumber',
  LEANHOGS: 'lean_hogs',
  LIVECATTLE: 'live_cattle',
  ORANGEJUICE: 'orange_juice',
  COCOA: 'cocoa',
  COFFEE: 'coffee',
  CASHEW: 'cashew'
};

// Reverse mapping for API keys to frontend symbols
export const apiKeyToSymbol: Record<string, string> = Object.entries(symbolToApiKey).reduce(
  (acc, [symbol, apiKey]) => ({ ...acc, [apiKey]: symbol }),
  {}
);

// Helper function to convert frontend symbol to API key
export function getApiKey(symbol: string): string {
  return symbolToApiKey[symbol] || symbol;
}

// Helper function to convert API key to frontend symbol
export function getSymbol(apiKey: string): string {
  return apiKeyToSymbol[apiKey] || apiKey;
} 