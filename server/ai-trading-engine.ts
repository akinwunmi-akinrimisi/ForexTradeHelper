import { AccountTracker, Trade, GrowthPlan, DailyTradePlan } from "@shared/schema";

// Enhanced dollar per pip calculations for major pairs
export const ENHANCED_DOLLAR_PER_PIP = {
  'EURUSD': 10.0,
  'GBPUSD': 10.0,
  'USDJPY': 0.91,  // Updated based on current rates
  'USDCHF': 11.0,
  'AUDUSD': 10.0,
  'USDCAD': 7.5,
  'NZDUSD': 10.0,
  'EURJPY': 0.91,
  'GBPJPY': 0.91,
  'EURGBP': 12.5,
  'AUDCAD': 7.5,
  'AUDCHF': 11.0,
  'AUDJPY': 0.91,
  'CADJPY': 0.91,
  'CHFJPY': 0.91,
  'EURAUD': 6.7,
  'EURCAD': 7.5,
  'EURCHF': 11.0,
  'GBPAUD': 6.7,
  'GBPCAD': 7.5,
  'GBPCHF': 11.0,
  'GBPNZD': 6.2,
  'NZDCAD': 7.5,
  'NZDCHF': 11.0,
  'NZDJPY': 0.91,
} as const;

export interface AITradingRecommendation {
  currencyPair: string;
  lotSize: number;
  riskAmount: number;
  potentialProfit: number;
  riskRewardRatio: number;
  stopLossDistance: number;
  takeProfitDistance: number;
  confidence: number;
}

export interface GrowthPlanAnalysis {
  currentProgress: number;
  daysToTarget: number;
  requiredDailyReturn: number;
  optimalRiskPerTrade: number;
  recommendedTrades: AITradingRecommendation[];
  adjustmentReason: string;
}

export class AITradingEngine {
  private static readonly MIN_RISK_REWARD_RATIO = 3.0;
  private static readonly MAX_DAILY_RISK = 0.01; // 1% max daily risk
  private static readonly MAX_SINGLE_TRADE_RISK = 0.005; // 0.5% max per trade

  /**
   * Calculate optimal lot size based on risk parameters
   */
  static calculateOptimalLotSize(
    accountBalance: number,
    riskPercentage: number,
    stopLossDistance: number,
    currencyPair: string
  ): number {
    const dollarPerPip = ENHANCED_DOLLAR_PER_PIP[currencyPair as keyof typeof ENHANCED_DOLLAR_PER_PIP];
    if (!dollarPerPip) return 0;

    const riskAmount = accountBalance * (riskPercentage / 100);
    const lotSize = riskAmount / (stopLossDistance * dollarPerPip);
    
    // Round to 2 decimal places for standard lot sizing
    return Math.round(lotSize * 100) / 100;
  }

  /**
   * Generate intelligent growth plan based on target and timeline
   */
  static generateAIGrowthPlan(
    accountTracker: AccountTracker,
    targetAmount: number,
    timeframeDays: number,
    userTradingHistory: Trade[]
  ): GrowthPlanAnalysis {
    const currentBalance = accountTracker.currentBalance;
    const totalGrowthNeeded = targetAmount - currentBalance;
    const growthPercentage = (totalGrowthNeeded / currentBalance) * 100;
    
    // Analyze user's trading performance
    const tradingStats = this.analyzeUserTradingPerformance(userTradingHistory);
    
    // Calculate required daily return based on compound growth
    const requiredDailyReturn = Math.pow(targetAmount / currentBalance, 1 / timeframeDays) - 1;
    
    // Generate optimal trading recommendations
    const recommendations = this.generateOptimalTrades(
      currentBalance,
      requiredDailyReturn,
      tradingStats
    );

    return {
      currentProgress: (currentBalance / targetAmount) * 100,
      daysToTarget: timeframeDays,
      requiredDailyReturn: requiredDailyReturn * 100,
      optimalRiskPerTrade: this.calculateOptimalRisk(requiredDailyReturn, tradingStats.winRate),
      recommendedTrades: recommendations,
      adjustmentReason: this.generateAdjustmentReason(tradingStats, requiredDailyReturn)
    };
  }

  /**
   * Analyze user's historical trading performance
   */
  private static analyzeUserTradingPerformance(trades: Trade[]) {
    if (trades.length === 0) {
      return {
        winRate: 0.6, // Default conservative win rate
        averageRiskReward: 2.5,
        averageTradeSize: 0.01,
        consecutiveLosses: 0,
        totalTrades: 0
      };
    }

    const wins = trades.filter(t => t.profitLoss > 0);
    const losses = trades.filter(t => t.profitLoss < 0);
    const winRate = wins.length / trades.length;
    
    // Calculate average risk/reward based on actual trades
    const avgWin = wins.reduce((sum, t) => sum + t.profitLoss, 0) / (wins.length || 1);
    const avgLoss = Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0)) / (losses.length || 1);
    const averageRiskReward = avgWin / avgLoss;

    // Calculate consecutive losses for risk adjustment
    let consecutiveLosses = 0;
    let currentStreak = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].profitLoss < 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    consecutiveLosses = currentStreak;

    return {
      winRate,
      averageRiskReward,
      averageTradeSize: trades.reduce((sum, t) => sum + t.lotSize, 0) / trades.length,
      consecutiveLosses,
      totalTrades: trades.length
    };
  }

  /**
   * Generate optimal trading recommendations
   */
  private static generateOptimalTrades(
    balance: number,
    requiredDailyReturn: number,
    tradingStats: any
  ): AITradingRecommendation[] {
    const priorityPairs = ['GBPUSD', 'GBPJPY', 'EURJPY', 'EURUSD', 'USDJPY'];
    const recommendations: AITradingRecommendation[] = [];

    // Risk allocation: 50%, 25%, 25% for 3 daily trades
    const riskAllocations = [0.5, 0.25, 0.25];
    const maxDailyRisk = Math.min(this.MAX_DAILY_RISK, requiredDailyReturn * 0.5);

    priorityPairs.slice(0, 3).forEach((pair, index) => {
      const riskPercentage = maxDailyRisk * riskAllocations[index];
      const riskAmount = balance * riskPercentage;
      
      // Calculate stop loss distance based on pair volatility
      const stopLossDistance = this.calculateOptimalStopLoss(pair, tradingStats);
      const takeProfitDistance = stopLossDistance * this.MIN_RISK_REWARD_RATIO;
      
      const lotSize = this.calculateOptimalLotSize(
        balance,
        riskPercentage * 100,
        stopLossDistance,
        pair
      );

      const potentialProfit = takeProfitDistance * lotSize * 
        ENHANCED_DOLLAR_PER_PIP[pair as keyof typeof ENHANCED_DOLLAR_PER_PIP];

      recommendations.push({
        currencyPair: pair,
        lotSize,
        riskAmount,
        potentialProfit,
        riskRewardRatio: this.MIN_RISK_REWARD_RATIO,
        stopLossDistance,
        takeProfitDistance,
        confidence: this.calculateConfidence(pair, tradingStats)
      });
    });

    return recommendations;
  }

  /**
   * Calculate optimal stop loss based on pair volatility
   */
  private static calculateOptimalStopLoss(pair: string, tradingStats: any): number {
    const volatilityMap = {
      'GBPUSD': 30,
      'GBPJPY': 40,
      'EURJPY': 35,
      'EURUSD': 25,
      'USDJPY': 30
    };

    const baseStopLoss = volatilityMap[pair as keyof typeof volatilityMap] || 30;
    
    // Adjust based on user's performance
    if (tradingStats.consecutiveLosses > 2) {
      return baseStopLoss * 0.8; // Tighter stops after losses
    }
    
    if (tradingStats.winRate > 0.7) {
      return baseStopLoss * 1.2; // Wider stops for successful traders
    }

    return baseStopLoss;
  }

  /**
   * Calculate confidence score for trade recommendation
   */
  private static calculateConfidence(pair: string, tradingStats: any): number {
    let confidence = 0.7; // Base confidence

    // Adjust based on user's historical performance with similar pairs
    if (tradingStats.winRate > 0.6) confidence += 0.1;
    if (tradingStats.averageRiskReward > 2.0) confidence += 0.1;
    if (tradingStats.consecutiveLosses > 3) confidence -= 0.2;

    return Math.max(0.3, Math.min(0.95, confidence));
  }

  /**
   * Calculate optimal risk per trade
   */
  private static calculateOptimalRisk(requiredDailyReturn: number, winRate: number): number {
    const kellyPercentage = winRate - ((1 - winRate) / this.MIN_RISK_REWARD_RATIO);
    const conservativeRisk = Math.min(kellyPercentage * 0.25, this.MAX_SINGLE_TRADE_RISK);
    
    return Math.max(0.001, conservativeRisk * 100); // Return as percentage
  }

  /**
   * Generate adjustment reason based on analysis
   */
  private static generateAdjustmentReason(tradingStats: any, requiredDailyReturn: number): string {
    if (tradingStats.totalTrades < 10) {
      return "Conservative approach recommended due to limited trading history";
    }
    
    if (tradingStats.consecutiveLosses > 3) {
      return "Reduced risk allocation due to recent consecutive losses";
    }
    
    if (requiredDailyReturn > 0.02) {
      return "High target requires aggressive approach - consider extending timeframe";
    }
    
    if (tradingStats.winRate > 0.7) {
      return "Increased confidence based on strong historical performance";
    }
    
    return "Balanced approach based on current market conditions and your trading history";
  }

  /**
   * Update growth plan based on new trade results
   */
  static updateGrowthPlanWithTradeResult(
    growthPlan: GrowthPlan,
    tradeResult: number,
    currentBalance: number,
    trades: Trade[]
  ): Partial<GrowthPlan> {
    const updatedStats = this.analyzeUserTradingPerformance(trades);
    const progressToTarget = (currentBalance / growthPlan.targetAmount) * 100;
    
    // Adjust risk based on recent performance
    let newRiskPerTrade = growthPlan.riskPerTrade;
    
    if (tradeResult < 0 && updatedStats.consecutiveLosses >= 2) {
      newRiskPerTrade = Math.max(0.1, newRiskPerTrade * 0.8); // Reduce risk after losses
    } else if (tradeResult > 0 && updatedStats.winRate > 0.7) {
      newRiskPerTrade = Math.min(1.0, newRiskPerTrade * 1.1); // Increase risk after wins
    }

    return {
      currentBalance,
      totalTradesCompleted: trades.length,
      dailyLossUsed: this.calculateDailyLossUsed(trades),
      riskPerTrade: newRiskPerTrade,
      isCompleted: progressToTarget >= 100,
      updatedAt: new Date()
    };
  }

  /**
   * Calculate daily loss used from today's trades
   */
  private static calculateDailyLossUsed(trades: Trade[]): number {
    const today = new Date().toDateString();
    const todayTrades = trades.filter(t => 
      new Date(t.createdAt).toDateString() === today
    );
    
    return todayTrades
      .filter(t => t.profitLoss < 0)
      .reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
  }
}