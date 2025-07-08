import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const accountTrackers = pgTable("account_trackers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  startingCapital: real("starting_capital").notNull(),
  currentBalance: real("current_balance").notNull(),
  maxDailyLoss: real("max_daily_loss").notNull(), // percentage
  maxOverallLoss: real("max_overall_loss").notNull(), // percentage
  profitTarget: real("profit_target").notNull(), // percentage
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountTrackerId: integer("account_tracker_id").notNull(),
  currencyPair: text("currency_pair").notNull(),
  outcome: text("outcome").notNull(), // 'win' or 'loss'
  lotSize: real("lot_size").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price").notNull(),
  stopLoss: real("stop_loss").notNull(), // in pips
  takeProfit: real("take_profit").notNull(), // in pips
  profitLoss: real("profit_loss").notNull(), // calculated P&L
  tradeDateTime: timestamp("trade_date_time").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingPlans = pgTable("trading_plans", {
  id: serial("id").primaryKey(),
  accountTrackerId: integer("account_tracker_id").notNull(),
  recommendedLotSize: real("recommended_lot_size").notNull(),
  maxOpenPositions: integer("max_open_positions").notNull(),
  stopLossPips: real("stop_loss_pips").notNull(),
  takeProfitPips: real("take_profit_pips").notNull(),
  suggestedTradesPerWeek: integer("suggested_trades_per_week").notNull(),
  riskPercentage: real("risk_percentage").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const growthPlans = pgTable("growth_plans", {
  id: serial("id").primaryKey(),
  accountTrackerId: integer("account_tracker_id").notNull(),
  targetTrades: integer("target_trades").notNull(),
  currentTrade: integer("current_trade").default(1),
  dailyRiskLimit: real("daily_risk_limit").notNull(), // 1% of capital
  dailyLossUsed: real("daily_loss_used").default(0),
  totalTradesCompleted: integer("total_trades_completed").default(0),
  remainingDays: integer("remaining_days").notNull(),
  lastTradeDate: timestamp("last_trade_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyTradePlans = pgTable("daily_trade_plans", {
  id: serial("id").primaryKey(),
  growthPlanId: integer("growth_plan_id").notNull(),
  currencyPair: text("currency_pair").notNull(),
  tradeNumber: integer("trade_number").notNull(), // 1, 2, or 3
  allocatedRisk: real("allocated_risk").notNull(), // percentage of daily risk
  lotSize: real("lot_size").notNull(),
  stopLossPips: real("stop_loss_pips").notNull(),
  takeProfitPips: real("take_profit_pips").notNull(),
  expectedProfit: real("expected_profit").notNull(),
  actualResult: real("actual_result"), // null if not executed
  isExecuted: boolean("is_executed").default(false),
  executedAt: timestamp("executed_at"),
  tradeDate: timestamp("trade_date").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAccountTrackerSchema = createInsertSchema(accountTrackers).omit({
  id: true,
  userId: true,
  currentBalance: true,
  createdAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  userId: true,
  profitLoss: true,
  createdAt: true,
});

export const insertTradingPlanSchema = createInsertSchema(tradingPlans).omit({
  id: true,
  lastUpdated: true,
});

export const insertGrowthPlanSchema = createInsertSchema(growthPlans).omit({
  id: true,
  currentTrade: true,
  dailyLossUsed: true,
  totalTradesCompleted: true,
  lastTradeDate: true,
  isCompleted: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyTradePlanSchema = createInsertSchema(dailyTradePlans).omit({
  id: true,
  actualResult: true,
  isExecuted: true,
  executedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AccountTracker = typeof accountTrackers.$inferSelect;
export type InsertAccountTracker = z.infer<typeof insertAccountTrackerSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type TradingPlan = typeof tradingPlans.$inferSelect;
export type InsertTradingPlan = z.infer<typeof insertTradingPlanSchema>;

export type GrowthPlan = typeof growthPlans.$inferSelect;
export type InsertGrowthPlan = z.infer<typeof insertGrowthPlanSchema>;

export type DailyTradePlan = typeof dailyTradePlans.$inferSelect;
export type InsertDailyTradePlan = z.infer<typeof insertDailyTradePlanSchema>;
