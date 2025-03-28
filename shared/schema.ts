import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  companySize: text("company_size").notNull(),
  interest: text("interest").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  contacted: boolean("contacted").default(false),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  query: text("query").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial Account table
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // asset, liability, equity, income, expense
  balance: doublePrecision("balance").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Transaction Category table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Financial Transaction table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id"),
  debitAccountId: integer("debit_account_id").notNull(),
  creditAccountId: integer("credit_account_id").notNull(),
  reference: text("reference"),
  status: text("status").notNull().default("pending"), // pending, reconciled, flagged
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  aiProcessed: boolean("ai_processed").default(false),
  aiSuggestions: jsonb("ai_suggestions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// AI Anomaly Detection table
export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  type: text("type").notNull(), // duplicate, unusual_amount, unusual_category, etc.
  severity: text("severity").notNull(), // low, medium, high
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, resolved, dismissed
  aiReasoning: text("ai_reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at")
});

// Financial Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // income_statement, balance_sheet, cash_flow, custom
  dateRange: jsonb("date_range").notNull(),
  parameters: jsonb("parameters"),
  result: jsonb("result"),
  aiInsights: jsonb("ai_insights"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  fullName: true,
  email: true,
  company: true,
  companySize: true,
  interest: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).pick({
  userId: true,
  query: true,
  response: true,
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  name: true,
  type: true,
  balance: true,
  currency: true,
  description: true
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  parentId: true
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  description: true,
  amount: true,
  date: true,
  categoryId: true,
  debitAccountId: true,
  creditAccountId: true,
  reference: true,
  status: true,
  tags: true,
  metadata: true
});

export const insertAnomalySchema = createInsertSchema(anomalies).pick({
  transactionId: true,
  type: true,
  severity: true,
  description: true,
  status: true,
  aiReasoning: true
});

export const insertReportSchema = createInsertSchema(reports).pick({
  name: true,
  type: true,
  dateRange: true,
  parameters: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type Anomaly = typeof anomalies.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
