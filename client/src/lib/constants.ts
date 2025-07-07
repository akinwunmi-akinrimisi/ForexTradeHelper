export const DOLLAR_PER_PIP = {
  'EUR/USD': 10.00,
  'GBP/USD': 10.00,
  'USD/JPY': 8.33,
  'USD/CHF': 10.00,
  'AUD/USD': 10.00,
  'NZD/USD': 10.00,
  'USD/CAD': 7.50
} as const;

export const CURRENCY_PAIRS = Object.keys(DOLLAR_PER_PIP);

export const TRADE_OUTCOMES = ['win', 'loss'] as const;
