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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accountTrackers: Map<number, AccountTracker>;
  private trades: Map<number, Trade>;
  private tradingPlans: Map<number, TradingPlan>;
  private growthPlans: Map<number, GrowthPlan>;
  private dailyTradePlans: Map<number, DailyTradePlan>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.accountTrackers = new Map();
    this.trades = new Map();
    this.tradingPlans = new Map();
    this.growthPlans = new Map();
    this.dailyTradePlans = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAccountTrackers(userId: number): Promise<AccountTracker[]> {
    return Array.from(this.accountTrackers.values()).filter(
      tracker => tracker.userId === userId
    );
  }

  async getAccountTracker(id: number): Promise<AccountTracker | undefined> {
    return this.accountTrackers.get(id);
  }

  async createAccountTracker(data: InsertAccountTracker & { userId: number }): Promise<AccountTracker> {
    const id = this.currentId++;
    const accountTracker: AccountTracker = {
      ...data,
      id,
      currentBalance: data.startingCapital,
      isActive: true,
      createdAt: new Date(),
    };
    this.accountTrackers.set(id, accountTracker);
    return accountTracker;
  }

  async updateAccountTracker(id: number, updates: Partial<AccountTracker>): Promise<AccountTracker | undefined> {
    const existing = this.accountTrackers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.accountTrackers.set(id, updated);
    return updated;
  }

  async getTrades(userId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(trade => trade.userId === userId);
  }

  async getTradesByAccount(accountTrackerId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(
      trade => trade.accountTrackerId === accountTrackerId
    );
  }

  async createTrade(data: InsertTrade & { userId: number; profitLoss: number }): Promise<Trade> {
    const id = this.currentId++;
    const trade: Trade = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.trades.set(id, trade);
    return trade;
  }

  async getTradingPlan(accountTrackerId: number): Promise<TradingPlan | undefined> {
    return Array.from(this.tradingPlans.values()).find(
      plan => plan.accountTrackerId === accountTrackerId
    );
  }

  async createTradingPlan(data: InsertTradingPlan): Promise<TradingPlan> {
    const id = this.currentId++;
    const plan: TradingPlan = {
      ...data,
      id,
      lastUpdated: new Date(),
    };
    this.tradingPlans.set(id, plan);
    return plan;
  }

  async updateTradingPlan(accountTrackerId: number, updates: Partial<TradingPlan>): Promise<TradingPlan | undefined> {
    const existing = Array.from(this.tradingPlans.values()).find(
      plan => plan.accountTrackerId === accountTrackerId
    );
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    this.tradingPlans.set(existing.id, updated);
    return updated;
  }

  async getGrowthPlan(accountTrackerId: number): Promise<GrowthPlan | undefined> {
    return Array.from(this.growthPlans.values()).find(
      plan => plan.accountTrackerId === accountTrackerId
    );
  }

  async createGrowthPlan(data: InsertGrowthPlan): Promise<GrowthPlan> {
    const id = this.currentId++;
    const plan: GrowthPlan = {
      ...data,
      id,
      currentTrade: 1,
      dailyLossUsed: 0,
      totalTradesCompleted: 0,
      lastTradeDate: null,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.growthPlans.set(id, plan);
    return plan;
  }

  async updateGrowthPlan(accountTrackerId: number, updates: Partial<GrowthPlan>): Promise<GrowthPlan | undefined> {
    const existing = Array.from(this.growthPlans.values()).find(
      plan => plan.accountTrackerId === accountTrackerId
    );
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.growthPlans.set(existing.id, updated);
    return updated;
  }

  async getDailyTradePlans(growthPlanId: number): Promise<DailyTradePlan[]> {
    return Array.from(this.dailyTradePlans.values()).filter(
      plan => plan.growthPlanId === growthPlanId
    );
  }

  async getDailyTradePlansForDate(growthPlanId: number, date: Date): Promise<DailyTradePlan[]> {
    const dateStr = date.toDateString();
    return Array.from(this.dailyTradePlans.values()).filter(
      plan => plan.growthPlanId === growthPlanId && 
               plan.tradeDate && new Date(plan.tradeDate).toDateString() === dateStr
    );
  }

  async createDailyTradePlan(data: InsertDailyTradePlan): Promise<DailyTradePlan> {
    const id = this.currentId++;
    const plan: DailyTradePlan = {
      ...data,
      id,
      actualResult: null,
      isExecuted: false,
      executedAt: null,
    };
    this.dailyTradePlans.set(id, plan);
    return plan;
  }

  async updateDailyTradePlan(id: number, updates: Partial<DailyTradePlan>): Promise<DailyTradePlan | undefined> {
    const existing = this.dailyTradePlans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.dailyTradePlans.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
