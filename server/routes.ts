import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertAccountTrackerSchema, insertTradeSchema, insertTradingPlanSchema } from "@shared/schema";
import { z } from "zod";

// Static dollar-per-pip values for major currency pairs
const DOLLAR_PER_PIP = {
  'EUR/USD': 10.00,
  'GBP/USD': 10.00,
  'USD/JPY': 8.33,
  'USD/CHF': 10.00,
  'AUD/USD': 10.00,
  'NZD/USD': 10.00,
  'USD/CAD': 7.50
};

// Trading plan calculation functions
function calculateProfitLoss(currencyPair: string, lotSize: number, entryPrice: number, exitPrice: number, outcome: string) {
  const pipValue = DOLLAR_PER_PIP[currencyPair as keyof typeof DOLLAR_PER_PIP] || 10.00;
  const pips = Math.abs(exitPrice - entryPrice) * (currencyPair.includes('JPY') ? 100 : 10000);
  const profitLoss = lotSize * pips * pipValue;
  return outcome === 'win' ? profitLoss : -profitLoss;
}

function generateTradingPlan(accountTracker: any) {
  const riskPercentage = 0.02; // 2% risk per trade
  const riskAmount = accountTracker.currentBalance * riskPercentage;
  
  // Conservative plan calculations
  const stopLossPips = 20;
  const takeProfitPips = 40; // 1:2 risk-reward ratio
  const recommendedLotSize = Math.min(0.5, riskAmount / (stopLossPips * 10)); // Conservative lot size
  
  return {
    accountTrackerId: accountTracker.id,
    recommendedLotSize: Math.round(recommendedLotSize * 100) / 100,
    maxOpenPositions: 3,
    stopLossPips,
    takeProfitPips,
    suggestedTradesPerWeek: 4,
    riskPercentage: riskPercentage * 100,
  };
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
      
      // Update account balance
      const accountTracker = await storage.getAccountTracker(validated.accountTrackerId);
      if (accountTracker) {
        const newBalance = accountTracker.currentBalance + profitLoss;
        await storage.updateAccountTracker(validated.accountTrackerId, {
          currentBalance: newBalance,
        });
        
        // Recalculate trading plan
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

  // Constants route
  app.get('/api/constants', (req, res) => {
    res.json({
      dollarPerPip: DOLLAR_PER_PIP,
      currencyPairs: Object.keys(DOLLAR_PER_PIP),
    });
  });

  return httpServer;
}
