import { 
  users, 
  accountTrackers, 
  trades, 
  tradingPlans,
  growthPlans,
  dailyTradePlans,
  type User, 
  type InsertUser,
  type AccountTracker,
  type InsertAccountTracker,
  type Trade,
  type InsertTrade,
  type TradingPlan,
  type InsertTradingPlan,
  type GrowthPlan,
  type InsertGrowthPlan,
  type DailyTradePlan,
  type InsertDailyTradePlan
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account tracker operations
  getAccountTrackers(userId: number): Promise<AccountTracker[]>;
  getAccountTracker(id: number): Promise<AccountTracker | undefined>;
  createAccountTracker(accountTracker: InsertAccountTracker & { userId: number }): Promise<AccountTracker>;
  updateAccountTracker(id: number, updates: Partial<AccountTracker>): Promise<AccountTracker | undefined>;
  
  // Trade operations
  getTrades(userId: number): Promise<Trade[]>;
  getTradesByAccount(accountTrackerId: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade & { userId: number; profitLoss: number }): Promise<Trade>;
  
  // Trading plan operations
  getTradingPlan(accountTrackerId: number): Promise<TradingPlan | undefined>;
  createTradingPlan(plan: InsertTradingPlan): Promise<TradingPlan>;
  updateTradingPlan(accountTrackerId: number, updates: Partial<TradingPlan>): Promise<TradingPlan | undefined>;
  
  // Growth plan operations
  getGrowthPlan(accountTrackerId: number): Promise<GrowthPlan | undefined>;
  createGrowthPlan(plan: InsertGrowthPlan): Promise<GrowthPlan>;
  updateGrowthPlan(accountTrackerId: number, updates: Partial<GrowthPlan>): Promise<GrowthPlan | undefined>;
  
  // Daily trade plan operations
  getDailyTradePlans(growthPlanId: number): Promise<DailyTradePlan[]>;
  getDailyTradePlansForDate(growthPlanId: number, date: Date): Promise<DailyTradePlan[]>;
  createDailyTradePlan(plan: InsertDailyTradePlan): Promise<DailyTradePlan>;
  updateDailyTradePlan(id: number, updates: Partial<DailyTradePlan>): Promise<DailyTradePlan | undefined>;
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAccountTrackers(userId: number): Promise<AccountTracker[]> {
    return await db.select().from(accountTrackers).where(eq(accountTrackers.userId, userId));
  }

  async getAccountTracker(id: number): Promise<AccountTracker | undefined> {
    const [tracker] = await db.select().from(accountTrackers).where(eq(accountTrackers.id, id));
    return tracker || undefined;
  }

  async createAccountTracker(data: InsertAccountTracker & { userId: number }): Promise<AccountTracker> {
    const [tracker] = await db
      .insert(accountTrackers)
      .values(data)
      .returning();
    return tracker;
  }

  async updateAccountTracker(id: number, updates: Partial<AccountTracker>): Promise<AccountTracker | undefined> {
    const [updated] = await db
      .update(accountTrackers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(accountTrackers.id, id))
      .returning();
    return updated || undefined;
  }

  async getTrades(userId: number): Promise<Trade[]> {
    return await db.select().from(trades).where(eq(trades.userId, userId));
  }

  async getTradesByAccount(accountTrackerId: number): Promise<Trade[]> {
    return await db.select().from(trades).where(eq(trades.accountTrackerId, accountTrackerId));
  }

  async createTrade(data: InsertTrade & { userId: number; profitLoss: number }): Promise<Trade> {
    const [trade] = await db
      .insert(trades)
      .values(data)
      .returning();
    return trade;
  }

  async getTradingPlan(accountTrackerId: number): Promise<TradingPlan | undefined> {
    const [plan] = await db.select().from(tradingPlans).where(eq(tradingPlans.accountTrackerId, accountTrackerId));
    return plan || undefined;
  }

  async createTradingPlan(data: InsertTradingPlan): Promise<TradingPlan> {
    const [plan] = await db
      .insert(tradingPlans)
      .values(data)
      .returning();
    return plan;
  }

  async updateTradingPlan(accountTrackerId: number, updates: Partial<TradingPlan>): Promise<TradingPlan | undefined> {
    const [updated] = await db
      .update(tradingPlans)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(tradingPlans.accountTrackerId, accountTrackerId))
      .returning();
    return updated || undefined;
  }

  async getGrowthPlan(accountTrackerId: number): Promise<GrowthPlan | undefined> {
    const [plan] = await db.select().from(growthPlans).where(eq(growthPlans.accountTrackerId, accountTrackerId));
    return plan || undefined;
  }

  async createGrowthPlan(data: InsertGrowthPlan): Promise<GrowthPlan> {
    const [plan] = await db
      .insert(growthPlans)
      .values(data)
      .returning();
    return plan;
  }

  async updateGrowthPlan(accountTrackerId: number, updates: Partial<GrowthPlan>): Promise<GrowthPlan | undefined> {
    const [updated] = await db
      .update(growthPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(growthPlans.accountTrackerId, accountTrackerId))
      .returning();
    return updated || undefined;
  }

  async getDailyTradePlans(growthPlanId: number): Promise<DailyTradePlan[]> {
    return await db.select().from(dailyTradePlans).where(eq(dailyTradePlans.growthPlanId, growthPlanId));
  }

  async getDailyTradePlansForDate(growthPlanId: number, date: Date): Promise<DailyTradePlan[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await db.select().from(dailyTradePlans)
      .where(eq(dailyTradePlans.growthPlanId, growthPlanId));
  }

  async createDailyTradePlan(data: InsertDailyTradePlan): Promise<DailyTradePlan> {
    const [plan] = await db
      .insert(dailyTradePlans)
      .values(data)
      .returning();
    return plan;
  }

  async updateDailyTradePlan(id: number, updates: Partial<DailyTradePlan>): Promise<DailyTradePlan | undefined> {
    const [updated] = await db
      .update(dailyTradePlans)
      .set(updates)
      .where(eq(dailyTradePlans.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
