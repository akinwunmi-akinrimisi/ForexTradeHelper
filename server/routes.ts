import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertAccountTrackerSchema, insertTradeSchema, insertTradingPlanSchema, insertGrowthPlanSchema, insertDailyTradePlanSchema } from "@shared/schema";
import { z } from "zod";
import { AITradingEngine, ENHANCED_DOLLAR_PER_PIP } from "./ai-trading-engine";

// Use AI engine's enhanced dollar per pip calculations
const DOLLAR_PER_PIP = ENHANCED_DOLLAR_PER_PIP;



// Trading plan calculation functions
function calculateProfitLoss(currencyPair: string, lotSize: number, entryPrice: number, exitPrice: number, outcome: string) {
  const pipValue = DOLLAR_PER_PIP[currencyPair as keyof typeof DOLLAR_PER_PIP] || 10.00;
  const pips = Math.abs(exitPrice - entryPrice) * (currencyPair.includes('JPY') ? 100 : 10000);
  const profitLoss = lotSize * pips * pipValue;
  return outcome === 'win' ? profitLoss : -profitLoss;
}

function generateTradingPlan(accountTracker: any) {
  const riskPercentage = 0.005; // 0.5% risk per trade (conservative)
  const riskAmount = accountTracker.currentBalance * riskPercentage;
  
  // AI-enhanced plan calculations with 1:3 minimum risk-reward
  const stopLossPips = 30;
  const takeProfitPips = 90; // 1:3 risk-reward ratio minimum
  const recommendedLotSize = AITradingEngine.calculateOptimalLotSize(
    accountTracker.currentBalance,
    riskPercentage * 100,
    stopLossPips,
    'GBPUSD' // Default pair for calculations
  );
  
  return {
    accountTrackerId: accountTracker.id,
    recommendedLotSize: Math.round(recommendedLotSize * 100) / 100,
    maxOpenPositions: 3,
    stopLossPips,
    takeProfitPips,
    suggestedTradesPerWeek: 15, // 3 trades per day, 5 days per week
    riskPercentage: riskPercentage * 100,
  };
}

function generateGrowthPlan(accountTracker: any) {
  const startingCapital = accountTracker.startingCapital;
  const targetAmount = startingCapital * (1 + accountTracker.profitTarget / 100);
  const profitNeeded = targetAmount - accountTracker.currentBalance;
  
  // Use AI engine for intelligent growth planning
  const timeframeDays = 30; // Default 30-day growth plan
  const aiAnalysis = AITradingEngine.generateAIGrowthPlan(
    accountTracker,
    targetAmount,
    timeframeDays,
    [] // Empty array for new accounts, will be populated with actual trades
  );
  
  // Calculate target trades based on AI recommendations
  const targetTrades = Math.min(90, Math.max(30, timeframeDays * 3)); // 3 trades per day max
  
  return {
    accountTrackerId: accountTracker.id,
    targetTrades,
    dailyRiskLimit: accountTracker.currentBalance * 0.01, // 1% of current balance
    remainingDays: timeframeDays,
    riskPerTrade: aiAnalysis.optimalRiskPerTrade,
    targetAmount: targetAmount,
  };
}

function generateDailyTradePlans(growthPlan: any, currentDate: Date) {
  const priorityPairs = ['GBPUSD', 'GBPJPY', 'EURJPY', 'EURUSD', 'USDJPY'];
  const dailyPlans = [];
  
  // Risk allocation: 50%, 25%, 25% for trades 1, 2, 3
  const riskAllocations = [0.5, 0.25, 0.25];
  
  for (let tradeNumber = 1; tradeNumber <= 3; tradeNumber++) {
    const currencyPair = priorityPairs[tradeNumber - 1] || priorityPairs[0];
    const pipValue = DOLLAR_PER_PIP[currencyPair as keyof typeof DOLLAR_PER_PIP];
    const allocatedRisk = growthPlan.dailyRiskLimit * riskAllocations[tradeNumber - 1];
    
    // AI-enhanced calculations with 1:3 minimum risk-reward
    const stopLossPips = 30;
    const takeProfitPips = 90; // 1:3 risk-reward ratio
    const lotSize = AITradingEngine.calculateOptimalLotSize(
      growthPlan.currentBalance || 1000,
      (allocatedRisk / (growthPlan.currentBalance || 1000)) * 100,
      stopLossPips,
      currencyPair
    );
    const expectedProfit = lotSize * takeProfitPips * pipValue;
    
    dailyPlans.push({
      growthPlanId: growthPlan.id,
      currencyPair,
      tradeNumber,
      allocatedRisk: riskAllocations[tradeNumber - 1] * 100,
      lotSize: Math.max(0.01, lotSize),
      stopLossPips,
      takeProfitPips,
      expectedProfit,
      tradeDate: currentDate,
    });
  }
  
  return dailyPlans;
}

async function updateGrowthPlanAfterTrade(growthPlan: any, tradeResult: number, isNewDay: boolean, allTrades: any[]) {
  // Use AI engine for intelligent growth plan updates
  const aiUpdates = AITradingEngine.updateGrowthPlanWithTradeResult(
    growthPlan,
    tradeResult,
    growthPlan.currentBalance + tradeResult,
    allTrades
  );
  
  const updates: any = {
    ...aiUpdates,
    totalTradesCompleted: growthPlan.totalTradesCompleted + 1,
    lastTradeDate: new Date(),
  };
  
  if (isNewDay) {
    updates.dailyLossUsed = tradeResult < 0 ? Math.abs(tradeResult) : 0;
    updates.currentTrade = 1;
  } else {
    updates.dailyLossUsed = growthPlan.dailyLossUsed + (tradeResult < 0 ? Math.abs(tradeResult) : 0);
    updates.currentTrade = growthPlan.currentTrade + 1;
  }
  
  // Check if daily loss limit reached
  if (updates.dailyLossUsed >= growthPlan.dailyRiskLimit) {
    updates.currentTrade = 4; // Force end of day
  }
  
  // Check if target reached or plan completed
  if (updates.totalTradesCompleted >= growthPlan.targetTrades) {
    updates.isCompleted = true;
  }
  
  return updates;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle WebSocket messages here
        console.log('Received:', data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Mock user authentication (in real app, implement proper auth)
  const mockUserId = 1;
  
  // Account Tracker routes
  app.get('/api/account-trackers', async (req, res) => {
    try {
      const trackers = await storage.getAccountTrackers(mockUserId);
      res.json(trackers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch account trackers' });
    }
  });

  app.post('/api/account-trackers', async (req, res) => {
    try {
      const validated = insertAccountTrackerSchema.parse(req.body);
      const tracker = await storage.createAccountTracker({
        ...validated,
        userId: mockUserId,
      });
      
      // Generate initial trading plan
      const planData = generateTradingPlan(tracker);
      await storage.createTradingPlan(planData);
      
      // Generate growth plan
      const growthPlanData = generateGrowthPlan(tracker);
      const growthPlan = await storage.createGrowthPlan(growthPlanData);
      
      // Generate initial daily trade plans for today
      const today = new Date();
      const dailyPlans = generateDailyTradePlans(growthPlan, today);
      for (const dailyPlan of dailyPlans) {
        await storage.createDailyTradePlan(dailyPlan);
      }
      
      broadcast({ type: 'accountTrackerCreated', data: tracker });
      res.json(tracker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create account tracker' });
      }
    }
  });

  // Trade routes
  app.get('/api/trades', async (req, res) => {
    try {
      const trades = await storage.getTrades(mockUserId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  // AI Trading Recommendations endpoint
  app.get('/api/ai-recommendations/:accountTrackerId', async (req, res) => {
    try {
      const accountTrackerId = parseInt(req.params.accountTrackerId);
      const accountTracker = await storage.getAccountTracker(accountTrackerId);
      
      if (!accountTracker) {
        return res.status(404).json({ message: 'Account tracker not found' });
      }
      
      const userTrades = await storage.getTradesByAccount(accountTrackerId);
      const targetAmount = accountTracker.startingCapital * (1 + accountTracker.profitTarget / 100);
      
      const aiAnalysis = AITradingEngine.generateAIGrowthPlan(
        accountTracker,
        targetAmount,
        30, // 30-day plan
        userTrades
      );
      
      res.json(aiAnalysis);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate AI recommendations' });
    }
  });

  app.post('/api/trades', async (req, res) => {
    try {
      const validated = insertTradeSchema.parse(req.body);
      
      // Calculate profit/loss
      const profitLoss = calculateProfitLoss(
        validated.currencyPair,
        validated.lotSize,
        validated.entryPrice,
        validated.exitPrice,
        validated.outcome
      );
      
      const trade = await storage.createTrade({
        ...validated,
        userId: mockUserId,
        profitLoss,
      });
      
      // Update account balance and AI-powered growth plan
      const accountTracker = await storage.getAccountTracker(validated.accountTrackerId);
      if (accountTracker) {
        const newBalance = accountTracker.currentBalance + profitLoss;
        await storage.updateAccountTracker(validated.accountTrackerId, {
          currentBalance: newBalance,
        });
        
        // Update growth plan with AI analysis
        const growthPlan = await storage.getGrowthPlan(validated.accountTrackerId);
        if (growthPlan) {
          const allTrades = await storage.getTradesByAccount(validated.accountTrackerId);
          const lastTradeDate = growthPlan.lastTradeDate ? new Date(growthPlan.lastTradeDate) : null;
          const today = new Date();
          const isNewDay = !lastTradeDate || today.toDateString() !== lastTradeDate.toDateString();
          
          const aiUpdates = await updateGrowthPlanAfterTrade(growthPlan, profitLoss, isNewDay, allTrades);
          await storage.updateGrowthPlan(validated.accountTrackerId, aiUpdates);
        }
        
        // Recalculate trading plan with AI enhancements
        const updatedTracker = await storage.getAccountTracker(validated.accountTrackerId);
        if (updatedTracker) {
          const newPlan = generateTradingPlan(updatedTracker);
          await storage.updateTradingPlan(validated.accountTrackerId, newPlan);
        }
      }
      
      broadcast({ type: 'tradeCreated', data: trade });
      res.json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create trade' });
      }
    }
  });

  // Trading plan routes
  app.get('/api/trading-plans/:accountTrackerId', async (req, res) => {
    try {
      const accountTrackerId = parseInt(req.params.accountTrackerId);
      const plan = await storage.getTradingPlan(accountTrackerId);
      if (!plan) {
        return res.status(404).json({ message: 'Trading plan not found' });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trading plan' });
    }
  });

  // Performance analytics route
  app.get('/api/performance/:accountTrackerId', async (req, res) => {
    try {
      const accountTrackerId = parseInt(req.params.accountTrackerId);
      const trades = await storage.getTradesByAccount(accountTrackerId);
      
      const totalTrades = trades.length;
      const winningTrades = trades.filter(t => t.outcome === 'win').length;
      const losingTrades = trades.filter(t => t.outcome === 'loss').length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      
      const totalPnL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const avgWin = winningTrades > 0 
        ? trades.filter(t => t.outcome === 'win').reduce((sum, t) => sum + t.profitLoss, 0) / winningTrades 
        : 0;
      const avgLoss = losingTrades > 0 
        ? trades.filter(t => t.outcome === 'loss').reduce((sum, t) => sum + Math.abs(t.profitLoss), 0) / losingTrades 
        : 0;
      
      // Group by currency pair
      const pairPerformance = trades.reduce((acc, trade) => {
        if (!acc[trade.currencyPair]) {
          acc[trade.currencyPair] = { trades: 0, pnl: 0 };
        }
        acc[trade.currencyPair].trades++;
        acc[trade.currencyPair].pnl += trade.profitLoss;
        return acc;
      }, {} as Record<string, { trades: number; pnl: number }>);
      
      res.json({
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        totalPnL,
        avgWin,
        avgLoss,
        pairPerformance,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch performance data' });
    }
  });

  // Growth plan routes
  app.get('/api/growth-plans/:accountTrackerId', async (req, res) => {
    try {
      const accountTrackerId = parseInt(req.params.accountTrackerId);
      const growthPlan = await storage.getGrowthPlan(accountTrackerId);
      if (!growthPlan) {
        return res.status(404).json({ message: 'Growth plan not found' });
      }
      res.json(growthPlan);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch growth plan' });
    }
  });

  // Daily trade plans routes
  app.get('/api/daily-trade-plans/:growthPlanId', async (req, res) => {
    try {
      const growthPlanId = parseInt(req.params.growthPlanId);
      const plans = await storage.getDailyTradePlans(growthPlanId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch daily trade plans' });
    }
  });

  app.get('/api/daily-trade-plans/:growthPlanId/:date', async (req, res) => {
    try {
      const growthPlanId = parseInt(req.params.growthPlanId);
      const date = new Date(req.params.date);
      const plans = await storage.getDailyTradePlansForDate(growthPlanId, date);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch daily trade plans for date' });
    }
  });

  // Update daily trade plan with actual result
  app.patch('/api/daily-trade-plans/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { actualResult } = req.body;
      
      const updated = await storage.updateDailyTradePlan(id, {
        actualResult,
        isExecuted: true,
        executedAt: new Date(),
      });
      
      if (!updated) {
        return res.status(404).json({ message: 'Daily trade plan not found' });
      }

      // Find the growth plan
      const growthPlan = Array.from((storage as any).growthPlans.values()).find((gp: any) => gp.id === updated.growthPlanId);
      
      if (growthPlan) {
        const lastTradeDate = growthPlan.lastTradeDate ? new Date(growthPlan.lastTradeDate) : null;
        const today = new Date();
        const isNewDay = !lastTradeDate || lastTradeDate.toDateString() !== today.toDateString();
        
        const growthUpdates = updateGrowthPlanAfterTrade(growthPlan, actualResult, isNewDay);
        await storage.updateGrowthPlan(growthPlan.accountTrackerId, growthUpdates);
        
        // Generate new daily plans if needed
        if (isNewDay && !growthUpdates.isCompleted) {
          const newDailyPlans = generateDailyTradePlans(growthPlan, today);
          for (const dailyPlan of newDailyPlans) {
            await storage.createDailyTradePlan(dailyPlan);
          }
        }
      }
      
      broadcast({ type: 'dailyTradePlanUpdated', data: updated });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update daily trade plan' });
    }
  });

  // Generate new daily plans for a specific currency pair
  app.post('/api/daily-trade-plans/generate/:growthPlanId', async (req, res) => {
    try {
      const growthPlanId = parseInt(req.params.growthPlanId);
      const { currencyPair, date } = req.body;
      
      const growthPlan = await storage.getGrowthPlan(growthPlanId);
      if (!growthPlan) {
        return res.status(404).json({ message: 'Growth plan not found' });
      }
      
      const targetDate = new Date(date);
      const existingPlans = await storage.getDailyTradePlansForDate(growthPlanId, targetDate);
      
      // Generate plans for specific currency pair
      const newPlans = generateDailyTradePlans(growthPlan, targetDate)
        .map(plan => ({ ...plan, currencyPair }));
      
      const createdPlans = [];
      for (const plan of newPlans) {
        const created = await storage.createDailyTradePlan(plan);
        createdPlans.push(created);
      }
      
      res.json(createdPlans);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate daily trade plans' });
    }
  });

  // Constants route
  app.get('/api/constants', (req, res) => {
    res.json({
      dollarPerPip: DOLLAR_PER_PIP,
      currencyPairs: Object.keys(DOLLAR_PER_PIP),
    });
  });

  return httpServer;
}
