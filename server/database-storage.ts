import { 
  InsertUser, User,
  InsertDemoRequest, DemoRequest,
  InsertAiConversation, AiConversation,
  InsertAccount, Account,
  InsertCategory, Category,
  InsertTransaction, Transaction,
  InsertAnomaly, Anomaly,
  InsertReport, Report,
  InsertOrganization, Organization,
  InsertDocument, Document
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { 
  users, 
  demoRequests,
  aiConversations,
  accounts,
  categories,
  transactions,
  anomalies,
  reports,
  organizations,
  documents
} from "@shared/schema";
import { eq, and, between, or, desc, sql, asc, inArray, isNull } from "drizzle-orm";
import session from "express-session";
import { pool } from "./db";
import connect from "connect-pg-simple";

// Define the session store for express-session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    organizationId?: number;
  }
}

// PostgreSQL session store
const PostgresSessionStore = connect(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "session",
      createTableIfMissing: true
    });
  }

  // ===== USER METHODS =====
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // ===== ORGANIZATION METHODS =====
  
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }
  
  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return organization;
  }
  
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db.insert(organizations).values(organization).returning();
    return newOrganization;
  }
  
  async updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    
    return updatedOrganization;
  }
  
  // ===== DOCUMENT METHODS =====
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async getDocuments(organizationId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.organizationId, organizationId))
      .orderBy(desc(documents.createdAt));
  }
  
  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    
    return updatedDocument;
  }

  // ===== DEMO REQUEST METHODS =====
  
  async createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const [newDemoRequest] = await db.insert(demoRequests).values(demoRequest).returning();
    return newDemoRequest;
  }

  async getDemoRequests(): Promise<DemoRequest[]> {
    return await db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt));
  }

  async getDemoRequest(id: number): Promise<DemoRequest | undefined> {
    const [demoRequest] = await db.select().from(demoRequests).where(eq(demoRequests.id, id));
    return demoRequest;
  }

  // ===== AI CONVERSATION METHODS =====
  
  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [newConversation] = await db.insert(aiConversations).values(conversation).returning();
    return newConversation;
  }

  async getAiConversations(userId?: number): Promise<AiConversation[]> {
    if (userId) {
      return await db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.userId, userId))
        .orderBy(desc(aiConversations.createdAt));
    }
    
    return await db
      .select()
      .from(aiConversations)
      .orderBy(desc(aiConversations.createdAt));
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, id));
    
    return conversation;
  }

  // ===== ACCOUNT METHODS =====
  
  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async getAccounts(organizationId?: number): Promise<Account[]> {
    if (organizationId) {
      return await db
        .select()
        .from(accounts)
        .where(eq(accounts.organizationId, organizationId))
        .orderBy(asc(accounts.name));
    }
    
    return await db
      .select()
      .from(accounts)
      .orderBy(asc(accounts.name));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async updateAccount(id: number, updates: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await db
      .update(accounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    
    return updatedAccount;
  }

  // ===== CATEGORY METHODS =====
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategories(organizationId?: number): Promise<Category[]> {
    if (organizationId) {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.organizationId, organizationId))
        .orderBy(asc(categories.name));
    }
    
    return await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryByName(name: string, organizationId?: number): Promise<Category | undefined> {
    let query = eq(categories.name, name);
    
    if (organizationId) {
      query = and(query, eq(categories.organizationId, organizationId));
    }
    
    const [category] = await db.select().from(categories).where(query);
    return category;
  }

  // ===== TRANSACTION METHODS =====
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update account balances
    await this.updateAccountBalance(
      newTransaction.debitAccountId, 
      Number(newTransaction.amount), 
      'debit'
    );
    
    await this.updateAccountBalance(
      newTransaction.creditAccountId, 
      Number(newTransaction.amount), 
      'credit'
    );
    
    return newTransaction;
  }

  private async updateAccountBalance(accountId: number, amount: number, type: 'debit' | 'credit'): Promise<void> {
    const account = await this.getAccount(accountId);
    if (!account) return;
    
    let newBalance = Number(account.balance);
    if (type === 'debit') {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }
    
    await db
      .update(accounts)
      .set({ 
        balance: newBalance.toString(), 
        updatedAt: new Date() 
      })
      .where(eq(accounts.id, accountId));
  }

  async getTransactions(filters?: {
    organizationId?: number;
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
    accountId?: number;
    status?: string;
  }): Promise<Transaction[]> {
    let query = sql`1 = 1`; // Always true condition to start with
    
    if (filters) {
      if (filters.organizationId) {
        query = sql`${query} AND ${transactions.organizationId} = ${filters.organizationId}`;
      }
      
      if (filters.startDate) {
        query = sql`${query} AND ${transactions.date} >= ${filters.startDate}`;
      }
      
      if (filters.endDate) {
        query = sql`${query} AND ${transactions.date} <= ${filters.endDate}`;
      }
      
      if (filters.categoryId) {
        query = sql`${query} AND ${transactions.categoryId} = ${filters.categoryId}`;
      }
      
      if (filters.accountId) {
        query = sql`${query} AND (${transactions.debitAccountId} = ${filters.accountId} OR ${transactions.creditAccountId} = ${filters.accountId})`;
      }
      
      if (filters.status) {
        query = sql`${query} AND ${transactions.status} = ${filters.status}`;
      }
    }
    
    return await db
      .select()
      .from(transactions)
      .where(query)
      .orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;
    
    // Handle amount changes to update account balances
    if (updates.amount && Number(updates.amount) !== Number(transaction.amount)) {
      // Reverse the old transaction's effect
      await this.updateAccountBalance(
        transaction.debitAccountId, 
        -Number(transaction.amount), 
        'debit'
      );
      
      await this.updateAccountBalance(
        transaction.creditAccountId, 
        -Number(transaction.amount), 
        'credit'
      );
      
      // Apply the new amount
      const debitAccountId = updates.debitAccountId || transaction.debitAccountId;
      const creditAccountId = updates.creditAccountId || transaction.creditAccountId;
      
      await this.updateAccountBalance(
        debitAccountId, 
        Number(updates.amount), 
        'debit'
      );
      
      await this.updateAccountBalance(
        creditAccountId, 
        Number(updates.amount), 
        'credit'
      );
    }
    
    // Handle account changes
    if ((updates.debitAccountId && updates.debitAccountId !== transaction.debitAccountId) || 
        (updates.creditAccountId && updates.creditAccountId !== transaction.creditAccountId)) {
      
      // Reverse the old transaction's effect
      await this.updateAccountBalance(
        transaction.debitAccountId, 
        -Number(transaction.amount), 
        'debit'
      );
      
      await this.updateAccountBalance(
        transaction.creditAccountId, 
        -Number(transaction.amount), 
        'credit'
      );
      
      // Apply to the new accounts
      const amount = updates.amount || transaction.amount;
      const debitAccountId = updates.debitAccountId || transaction.debitAccountId;
      const creditAccountId = updates.creditAccountId || transaction.creditAccountId;
      
      await this.updateAccountBalance(
        debitAccountId, 
        Number(amount), 
        'debit'
      );
      
      await this.updateAccountBalance(
        creditAccountId, 
        Number(amount), 
        'credit'
      );
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    
    return updatedTransaction;
  }

  async processTransactionWithAI(id: number): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;
    
    // In a real implementation, this would call AI services
    // For now, we'll simulate AI processing with simple rules
    
    // Simulate AI suggestions
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
      suggestions.categories.push('Uncategorized');
    }
    
    // Confidence level
    suggestions.confidence = 0.85;
    
    // Check for potential anomalies - large amounts
    if (Number(transaction.amount) > 10000) {
      suggestions.anomalyProbability = 0.8;
      
      // Create an anomaly record
      await this.createAnomaly({
        organizationId: transaction.organizationId,
        transactionId: transaction.id,
        type: 'unusual_amount',
        severity: 'high',
        description: 'Transaction amount is unusually large',
        status: 'open',
        aiReasoning: 'The transaction amount exceeds the typical threshold.'
      });
    } else {
      suggestions.anomalyProbability = 0.1;
    }
    
    // Find duplicate transactions (same amount, close dates)
    const similarTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.organizationId, transaction.organizationId),
          eq(transactions.amount, transaction.amount),
          sql`ABS(EXTRACT(EPOCH FROM (${transactions.date} - ${transaction.date})) / 3600) < 24`, // Within 24 hours
          sql`${transactions.id} != ${transaction.id}`
        )
      );
      
    if (similarTransactions.length > 0) {
      suggestions.anomalyProbability = 0.9;
      
      // Create a duplicate anomaly
      await this.createAnomaly({
        organizationId: transaction.organizationId,
        transactionId: transaction.id,
        type: 'potential_duplicate',
        severity: 'medium',
        description: `Potential duplicate of transaction ${similarTransactions[0].id}`,
        status: 'open',
        aiReasoning: 'Similar amount and date to another transaction.'
      });
    }
    
    // Update the transaction with AI suggestions and category if possible
    let categoryId = transaction.categoryId;
    
    // If we have a category suggestion and no category is set, try to set it
    if (suggestions.categories.length > 0 && !transaction.categoryId) {
      const suggestedCategory = await this.getCategoryByName(
        suggestions.categories[0], 
        transaction.organizationId
      );
      
      if (suggestedCategory) {
        categoryId = suggestedCategory.id;
      }
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        aiProcessed: true,
        aiSuggestions: suggestions,
        aiConfidence: suggestions.confidence,
        categoryId,
        updatedAt: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();
    
    return updatedTransaction;
  }

  // ===== ANOMALY METHODS =====
  
  async createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly> {
    const [newAnomaly] = await db.insert(anomalies).values(anomaly).returning();
    return newAnomaly;
  }

  async getAnomalies(status?: string, organizationId?: number): Promise<Anomaly[]> {
    let query = sql`1 = 1`;
    
    if (status) {
      query = sql`${query} AND ${anomalies.status} = ${status}`;
    }
    
    if (organizationId) {
      query = sql`${query} AND ${anomalies.organizationId} = ${organizationId}`;
    }
    
    return await db
      .select()
      .from(anomalies)
      .where(query)
      .orderBy(desc(anomalies.createdAt));
  }

  async getAnomaly(id: number): Promise<Anomaly | undefined> {
    const [anomaly] = await db.select().from(anomalies).where(eq(anomalies.id, id));
    return anomaly;
  }

  async updateAnomalyStatus(id: number, status: string): Promise<Anomaly | undefined> {
    const resolvedAt = status === 'resolved' ? new Date() : null;
    
    const [updatedAnomaly] = await db
      .update(anomalies)
      .set({ 
        status, 
        resolvedAt, 
        updatedAt: new Date() 
      })
      .where(eq(anomalies.id, id))
      .returning();
    
    return updatedAnomaly;
  }

  // ===== REPORT METHODS =====
  
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReports(organizationId?: number): Promise<Report[]> {
    if (organizationId) {
      return await db
        .select()
        .from(reports)
        .where(eq(reports.organizationId, organizationId))
        .orderBy(desc(reports.createdAt));
    }
    
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async generateReportWithAI(id: number): Promise<Report | undefined> {
    const report = await this.getReport(id);
    if (!report) return undefined;
    
    // In a real implementation, this would call AI services
    // For now, we'll simulate AI report generation
    
    // Sample report result
    const result = {
      summary: {
        totalRevenue: 125000,
        totalExpenses: 87500,
        netIncome: 37500,
        marginPercent: 30
      },
      breakdown: [
        { category: 'Sales', amount: 100000 },
        { category: 'Services', amount: 25000 },
        { category: 'Payroll', amount: 45000 },
        { category: 'Rent', amount: 12000 },
        { category: 'Marketing', amount: 15000 },
        { category: 'Software', amount: 8500 },
        { category: 'Utilities', amount: 3500 },
        { category: 'Office Supplies', amount: 2500 },
        { category: 'Travel', amount: 1000 }
      ]
    };
    
    // Sample AI insights
    const aiInsights = {
      keyFindings: [
        'Revenue has increased by 15% compared to the previous period',
        'Marketing expenses have doubled, contributing to revenue growth',
        'Software expenses are rising faster than other categories',
        'Travel expenses are down significantly'
      ],
      recommendations: [
        'Consider optimizing software subscriptions to reduce costs',
        'Maintain marketing investment as it shows positive ROI',
        'Evaluate office supply vendors for potential cost savings'
      ],
      forecast: {
        nextPeriodRevenue: 137500,
        nextPeriodExpenses: 92000,
        projectedGrowthRate: 0.10
      }
    };
    
    const [updatedReport] = await db
      .update(reports)
      .set({
        result,
        aiInsights,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(reports.id, id))
      .returning();
    
    return updatedReport;
  }
}