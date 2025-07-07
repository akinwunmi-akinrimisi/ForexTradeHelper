import { 
  users, 
  accountTrackers, 
  trades, 
  tradingPlans,
  type User, 
  type InsertUser,
  type AccountTracker,
  type InsertAccountTracker,
  type Trade,
  type InsertTrade,
  type TradingPlan,
  type InsertTradingPlan
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
  createTrade(trade: InsertTrade & { userId: number }): Promise<Trade>;
  
  // Trading plan operations
  getTradingPlan(accountTrackerId: number): Promise<TradingPlan | undefined>;
  createTradingPlan(plan: InsertTradingPlan): Promise<TradingPlan>;
  updateTradingPlan(accountTrackerId: number, updates: Partial<TradingPlan>): Promise<TradingPlan | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accountTrackers: Map<number, AccountTracker>;
  private trades: Map<number, Trade>;
  private tradingPlans: Map<number, TradingPlan>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.accountTrackers = new Map();
    this.trades = new Map();
    this.tradingPlans = new Map();
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

  async createTrade(data: InsertTrade & { userId: number }): Promise<Trade> {
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
}

export const storage = new MemStorage();
