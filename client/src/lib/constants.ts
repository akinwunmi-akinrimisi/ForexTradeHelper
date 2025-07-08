export const DOLLAR_PER_PIP = {
  'GBPUSD': 10.00,
  'GBPJPY': 0.91,
  'EURJPY': 0.91,
  'EURUSD': 10.00,
  'USDJPY': 0.91
} as const;

export const CURRENCY_PAIRS = Object.keys(DOLLAR_PER_PIP);

export const TRADE_OUTCOMES = ['win', 'loss'] as const;
