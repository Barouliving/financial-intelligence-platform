import { 
  users, type User, type InsertUser,
  demoRequests, type DemoRequest, type InsertDemoRequest,
  aiConversations, type AiConversation, type InsertAiConversation,
  accounts, type Account, type InsertAccount,
  categories, type Category, type InsertCategory,
  transactions, type Transaction, type InsertTransaction,
  anomalies, type Anomaly, type InsertAnomaly,
  reports, type Report, type InsertReport,
  organizations, type Organization, type InsertOrganization,
  documents, type Document, type InsertDocument
} from "@shared/schema";

import session from "express-session";

export interface IStorage {
  // Session management
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Organizations
  getOrganization?(id: number): Promise<Organization | undefined>;
  getOrganizationBySlug?(slug: string): Promise<Organization | undefined>;
  createOrganization?(organization: InsertOrganization): Promise<Organization>;
  updateOrganization?(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined>;
  
  // Documents
  createDocument?(document: InsertDocument): Promise<Document>;
  getDocument?(id: number): Promise<Document | undefined>;
  getDocuments?(organizationId: number): Promise<Document[]>;
  updateDocument?(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  
  // Demo requests
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequests(): Promise<DemoRequest[]>;
  getDemoRequest(id: number): Promise<DemoRequest | undefined>;
  
  // AI conversations
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  getAiConversations(userId?: number): Promise<AiConversation[]>;
  getAiConversation(id: number): Promise<AiConversation | undefined>;
  
  // Accounts
  createAccount(account: InsertAccount): Promise<Account>;
  getAccounts(organizationId?: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  updateAccount(id: number, updates: Partial<InsertAccount>): Promise<Account | undefined>;
  
  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(organizationId?: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string, organizationId?: number): Promise<Category | undefined>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(filters?: {
    organizationId?: number;
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
    accountId?: number;
    status?: string;
  }): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  processTransactionWithAI(id: number): Promise<Transaction | undefined>;
  
  // Anomalies
  createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  getAnomalies(status?: string, organizationId?: number): Promise<Anomaly[]>;
  getAnomaly(id: number): Promise<Anomaly | undefined>;
  updateAnomalyStatus(id: number, status: string): Promise<Anomaly | undefined>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(organizationId?: number): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  generateReportWithAI(id: number): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private demoRequests: Map<number, DemoRequest>;
  private aiConversations: Map<number, AiConversation>;
  private accounts: Map<number, Account>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private anomalies: Map<number, Anomaly>;
  private reports: Map<number, Report>;
  
  private currentUserId: number;
  private currentDemoRequestId: number;
  private currentAiConversationId: number;
  private currentAccountId: number;
  private currentCategoryId: number;
  private currentTransactionId: number;
  private currentAnomalyId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.demoRequests = new Map();
    this.aiConversations = new Map();
    this.accounts = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.anomalies = new Map();
    this.reports = new Map();
    
    this.currentUserId = 1;
    this.currentDemoRequestId = 1;
    this.currentAiConversationId = 1;
    this.currentAccountId = 1;
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    this.currentAnomalyId = 1;
    this.currentReportId = 1;
    
    // Initialize with some default categories
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Revenue", description: "Income from business operations" },
      { name: "Cost of Goods Sold", description: "Direct costs attributable to the production of goods sold" },
      { name: "Operating Expenses", description: "Expenses related to business operations" },
      { name: "Payroll", description: "Employee salaries and wages", parentId: 3 },
      { name: "Rent", description: "Office space and facilities rent", parentId: 3 },
      { name: "Utilities", description: "Electricity, water, and other utilities", parentId: 3 },
      { name: "Marketing", description: "Advertising and promotion expenses", parentId: 3 },
      { name: "Travel", description: "Business travel expenses", parentId: 3 },
      { name: "Software", description: "Software subscriptions and licenses", parentId: 3 }
    ];
    
    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDemoRequest(insertDemoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const id = this.currentDemoRequestId++;
    const demoRequest: DemoRequest = {
      ...insertDemoRequest,
      id,
      createdAt: new Date(),
      contacted: false
    };
    this.demoRequests.set(id, demoRequest);
    return demoRequest;
  }

  async getDemoRequests(): Promise<DemoRequest[]> {
    return Array.from(this.demoRequests.values());
  }

  async getDemoRequest(id: number): Promise<DemoRequest | undefined> {
    return this.demoRequests.get(id);
  }

  async createAiConversation(insertAiConversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.currentAiConversationId++;
    const aiConversation: AiConversation = {
      ...insertAiConversation,
      id,
      createdAt: new Date()
    };
    this.aiConversations.set(id, aiConversation);
    return aiConversation;
  }

  async getAiConversations(userId?: number): Promise<AiConversation[]> {
    const conversations = Array.from(this.aiConversations.values());
    if (userId) {
      return conversations.filter(conv => conv.userId === userId);
    }
    return conversations;
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }
  
  // Account methods
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const now = new Date();
    const account: Account = {
      ...insertAccount,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.accounts.set(id, account);
    return account;
  }
  
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async updateAccount(id: number, updates: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount: Account = {
      ...account,
      ...updates,
      updatedAt: new Date()
    };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  // Category methods
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }
  
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      aiProcessed: false,
      aiSuggestions: null,
      createdAt: now,
      updatedAt: now
    };
    this.transactions.set(id, transaction);
    
    // Update account balances
    await this.updateAccountBalance(transaction.debitAccountId, transaction.amount, 'debit');
    await this.updateAccountBalance(transaction.creditAccountId, transaction.amount, 'credit');
    
    return transaction;
  }
  
  private async updateAccountBalance(accountId: number, amount: number, type: 'debit' | 'credit'): Promise<void> {
    const account = await this.getAccount(accountId);
    if (!account) return;
    
    let newBalance = account.balance;
    if (type === 'debit') {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }
    
    await this.updateAccount(accountId, { balance: newBalance });
  }
  
  async getTransactions(filters?: {
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
    accountId?: number;
    status?: string;
  }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());
    
    if (filters) {
      if (filters.startDate) {
        transactions = transactions.filter(t => t.date >= filters.startDate!);
      }
      
      if (filters.endDate) {
        transactions = transactions.filter(t => t.date <= filters.endDate!);
      }
      
      if (filters.categoryId) {
        transactions = transactions.filter(t => t.categoryId === filters.categoryId);
      }
      
      if (filters.accountId) {
        transactions = transactions.filter(t => 
          t.debitAccountId === filters.accountId || 
          t.creditAccountId === filters.accountId
        );
      }
      
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
    }
    
    return transactions;
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    // Handle special case where amount is changing
    if (updates.amount && updates.amount !== transaction.amount) {
      // Reverse the old transaction's effect
      await this.updateAccountBalance(transaction.debitAccountId, -transaction.amount, 'debit');
      await this.updateAccountBalance(transaction.creditAccountId, -transaction.amount, 'credit');
      
      // Apply the new amount
      const debitAccountId = updates.debitAccountId || transaction.debitAccountId;
      const creditAccountId = updates.creditAccountId || transaction.creditAccountId;
      await this.updateAccountBalance(debitAccountId, updates.amount, 'debit');
      await this.updateAccountBalance(creditAccountId, updates.amount, 'credit');
    }
    
    const updatedTransaction: Transaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date()
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async processTransactionWithAI(id: number): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    // Simulating AI processing using a simple rules-based approach for now
    // Real AI processing would be implemented here using AI models
    const suggestions: any = {
      categories: [] as string[],
      anomalyProbability: 0,
      confidence: 0
    };
    
    // Simple category suggestion based on description keywords
    const description = transaction.description.toLowerCase();
    if (description.includes('salary') || description.includes('payroll')) {
      suggestions.categories.push('Payroll');
    } else if (description.includes('rent') || description.includes('lease')) {
      suggestions.categories.push('Rent');
    } else if (description.includes('electric') || description.includes('water') || description.includes('gas')) {
      suggestions.categories.push('Utilities');
    } else if (description.includes('ads') || description.includes('marketing') || description.includes('promotion')) {
      suggestions.categories.push('Marketing');
    } else if (description.includes('flight') || description.includes('hotel') || description.includes('travel')) {
      suggestions.categories.push('Travel');
    } else if (description.includes('software') || description.includes('subscription') || description.includes('license')) {
      suggestions.categories.push('Software');
    } else {
      suggestions.categories.push('Operating Expenses');
    }
    
    // Simple anomaly detection
    // Check if amount is unusually large (> $10,000)
    if (transaction.amount > 10000) {
      suggestions.anomalyProbability = 0.8;
      suggestions.confidence = 0.7;
      
      // Create an anomaly record
      await this.createAnomaly({
        transactionId: transaction.id,
        type: 'unusual_amount',
        severity: 'high',
        description: 'Transaction amount is unusually large',
        status: 'open',
        aiReasoning: 'The transaction amount exceeds the typical threshold.'
      });
    } else {
      suggestions.anomalyProbability = 0.1;
      suggestions.confidence = 0.9;
    }
    
    // Find duplicate transactions (same amount, close dates)
    const similarTransactions = Array.from(this.transactions.values()).filter(t => 
      t.id !== transaction.id &&
      t.amount === transaction.amount &&
      Math.abs(t.date.getTime() - transaction.date.getTime()) < 86400000 // Within 24 hours
    );
    
    if (similarTransactions.length > 0) {
      suggestions.anomalyProbability = 0.9;
      suggestions.confidence = 0.8;
      
      // Create a duplicate anomaly
      await this.createAnomaly({
        transactionId: transaction.id,
        type: 'potential_duplicate',
        severity: 'medium',
        description: `Potential duplicate of transaction ${similarTransactions[0].id}`,
        status: 'open',
        aiReasoning: 'Similar amount and date to another transaction.'
      });
    }
    
    // Update the transaction with AI suggestions
    const updatedTransaction: Transaction = {
      ...transaction,
      aiProcessed: true,
      aiSuggestions: suggestions,
      updatedAt: new Date()
    };
    
    // If we have a category suggestion and no category is set, try to set it
    if (suggestions.categories.length > 0 && !transaction.categoryId) {
      const suggestedCategory = await this.getCategoryByName(suggestions.categories[0]);
      if (suggestedCategory) {
        updatedTransaction.categoryId = suggestedCategory.id;
      }
    }
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  // Anomaly methods
  async createAnomaly(insertAnomaly: InsertAnomaly): Promise<Anomaly> {
    const id = this.currentAnomalyId++;
    const anomaly: Anomaly = {
      ...insertAnomaly,
      id,
      createdAt: new Date(),
      resolvedAt: null
    };
    this.anomalies.set(id, anomaly);
    return anomaly;
  }
  
  async getAnomalies(status?: string): Promise<Anomaly[]> {
    let anomalies = Array.from(this.anomalies.values());
    if (status) {
      anomalies = anomalies.filter(a => a.status === status);
    }
    return anomalies;
  }
  
  async getAnomaly(id: number): Promise<Anomaly | undefined> {
    return this.anomalies.get(id);
  }
  
  async updateAnomalyStatus(id: number, status: string): Promise<Anomaly | undefined> {
    const anomaly = this.anomalies.get(id);
    if (!anomaly) return undefined;
    
    const updatedAnomaly: Anomaly = {
      ...anomaly,
      status,
      resolvedAt: status === 'resolved' ? new Date() : anomaly.resolvedAt
    };
    this.anomalies.set(id, updatedAnomaly);
    return updatedAnomaly;
  }
  
  // Report methods
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const now = new Date();
    const report: Report = {
      ...insertReport,
      id,
      result: null,
      aiInsights: null,
      createdAt: now,
      updatedAt: now
    };
    this.reports.set(id, report);
    return report;
  }
  
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
  
  async generateReportWithAI(id: number): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    // Extract date range
    const dateRange = report.dateRange as { startDate: string; endDate: string };
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Get transactions for the period
    const transactions = await this.getTransactions({
      startDate,
      endDate
    });
    
    // Generate simple report data based on type
    let result: any = {};
    let aiInsights: any = [];
    
    if (report.type === 'income_statement') {
      // Calculate revenue and expenses
      const revenue = transactions
        .filter(t => {
          const category = this.categories.get(t.categoryId || 0);
          return category && category.name === 'Revenue';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const cogs = transactions
        .filter(t => {
          const category = this.categories.get(t.categoryId || 0);
          return category && category.name === 'Cost of Goods Sold';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const opex = transactions
        .filter(t => {
          const category = this.categories.get(t.categoryId || 0);
          return category && category.name === 'Operating Expenses';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const grossProfit = revenue - cogs;
      const operatingIncome = grossProfit - opex;
      
      result = {
        revenue,
        cogs,
        grossProfit,
        opex,
        operatingIncome
      };
      
      // Generate simple AI insights
      if (revenue > 0) {
        const grossMargin = (grossProfit / revenue) * 100;
        aiInsights.push({
          type: 'highlight',
          message: `Gross margin for this period is ${grossMargin.toFixed(2)}%`
        });
        
        if (grossMargin < 20) {
          aiInsights.push({
            type: 'warning',
            message: 'Gross margin is below industry average. Consider pricing strategy review.'
          });
        }
      }
      
      if (opex > revenue * 0.7) {
        aiInsights.push({
          type: 'warning',
          message: 'Operating expenses are high relative to revenue. Consider cost-cutting measures.'
        });
      }
    } else if (report.type === 'balance_sheet') {
      // Get all accounts
      const accounts = await this.getAccounts();
      
      const assets = accounts
        .filter(a => a.type === 'asset')
        .reduce((sum, a) => sum + a.balance, 0);
      
      const liabilities = accounts
        .filter(a => a.type === 'liability')
        .reduce((sum, a) => sum + a.balance, 0);
      
      const equity = assets - liabilities;
      
      result = {
        assets,
        liabilities,
        equity
      };
      
      // Simple AI insights
      const debtToEquityRatio = equity !== 0 ? liabilities / equity : 0;
      aiInsights.push({
        type: 'highlight',
        message: `Debt-to-Equity ratio: ${debtToEquityRatio.toFixed(2)}`
      });
      
      if (debtToEquityRatio > 2) {
        aiInsights.push({
          type: 'warning',
          message: 'High debt-to-equity ratio may indicate overleverage. Consider debt reduction strategies.'
        });
      }
    }
    
    // Update the report with generated data
    const updatedReport: Report = {
      ...report,
      result,
      aiInsights,
      updatedAt: new Date()
    };
    
    this.reports.set(id, updatedReport);
    return updatedReport;
  }
}

import { DatabaseStorage } from "./database-storage";

// Create instance of DatabaseStorage as the application's storage provider
export const storage = new DatabaseStorage();
