import { DOLLAR_PER_PIP } from './constants';

export function calculateProfitLoss(
  currencyPair: string, 
  lotSize: number, 
  entryPrice: number, 
  exitPrice: number, 
  outcome: string
): number {
  const pipValue = DOLLAR_PER_PIP[currencyPair as keyof typeof DOLLAR_PER_PIP] || 10.00;
  const pips = Math.abs(exitPrice - entryPrice) * (currencyPair.includes('JPY') ? 100 : 10000);
  const profitLoss = lotSize * pips * pipValue;
  return outcome === 'win' ? profitLoss : -profitLoss;
}

export function calculateRiskReward(stopLoss: number, takeProfit: number): number {
  return takeProfit / stopLoss;
}

export function calculateRecommendedLotSize(
  accountBalance: number,
  riskPercentage: number,
  stopLossPips: number
): number {
  const riskAmount = accountBalance * (riskPercentage / 100);
  return Math.min(0.5, riskAmount / (stopLossPips * 10));
}
