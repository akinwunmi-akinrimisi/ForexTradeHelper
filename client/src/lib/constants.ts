export const DOLLAR_PER_PIP = {
  'GBPUSD': 10.00,
  'GBPJPY': 8.33,
  'EURJPY': 8.33,
  'EURUSD': 10.00,
  'USDJPY': 8.33
} as const;

export const CURRENCY_PAIRS = Object.keys(DOLLAR_PER_PIP);

export const TRADE_OUTCOMES = ['win', 'loss'] as const;
