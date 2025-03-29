import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb, varchar, uuid, numeric, index, uniqueIndex, foreignKey, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Organizations/tenants table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull()
});

// Organization relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  accounts: many(accounts),
  categories: many(categories),
  documents: many(documents)
}));

// Users table with multi-tenant support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  email: text("email").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at", { mode: 'date' }),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull()
}, (table) => {
  return {
    orgUserIdxUnique: uniqueIndex("org_user_idx").on(table.organizationId, table.username),
    orgEmailIdxUnique: uniqueIndex("org_email_idx").on(table.organizationId, table.email)
  };
});

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id]
  }),
  aiConversations: many(aiConversations)
}));

// Demo requests table
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  companySize: text("company_size").notNull(),
  interest: text("interest").notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  contacted: boolean("contacted").default(false),
});

// AI conversations with multi-tenant support
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("user_id_idx").on(table.userId)
  };
});

// AI conversations relations
export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id]
  })
}));

// Documents (receipts, invoices, etc.) with multi-tenant support
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storageKey: text("storage_key").notNull(),
  processingStatus: text("processing_status").notNull().default("pending"),
  textContent: text("text_content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull()
}, (table) => {
  return {
    orgIdIdx: index("doc_org_id_idx").on(table.organizationId),
    userIdIdx: index("doc_user_id_idx").on(table.userId)
  };
});

// Documents relations
export const documentsRelations = relations(documents, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [documents.organizationId],
    references: [organizations.id]
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  }),
  transactions: many(transactions)
}));

// Financial accounts with multi-tenant support
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // asset, liability, equity, income, expense
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  description: text("description"),
  externalId: text("external_id"),
  connectionDetails: jsonb("connection_details"),
  lastSyncedAt: timestamp("last_synced_at", { mode: 'date' }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull()
}, (table) => {
  return {
    orgIdIdx: index("acc_org_id_idx").on(table.organizationId),
    nameOrgIdxUnique: uniqueIndex("acc_name_org_idx").on(table.organizationId, table.name)
  };
});

// Accounts relations
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.id]
  }),
  debitTransactions: many(transactions, { relationName: "debitTransactions" }),
  creditTransactions: many(transactions, { relationName: "creditTransactions" })
}));

// Transaction categories with multi-tenant support
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  color: varchar("color", { length: 7 }),
  icon: text("icon"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull()
}, (table) => {
  return {
    orgIdIdx: index("cat_org_id_idx").on(table.organizationId),
    nameOrgIdxUnique: uniqueIndex("cat_name_org_idx").on(table.organizationId, table.name),
    parentIdIdx: index("cat_parent_id_idx").on(table.parentId)
  };
});

// Categories relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [categories.organizationId],
    references: [organizations.id]
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  transactions: many(transactions)
}));

// Financial transactions with multi-tenant support
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  type: text("type").notNull().default("expense"), // income, expense
  date: timestamp("date", { mode: 'date' }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  debitAccountId: integer("debit_account_id").notNull().references(() => accounts.id),
  creditAccountId: integer("credit_account_id").notNull().references(() => accounts.id),
  documentId: integer("document_id").references(() => documents.id),
  reference: text("reference"),
  status: text("status").notNull().default("pending"), // pending, reconciled, flagged
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  aiProcessed: boolean("ai_processed").default(false),
  aiConfidence: numeric("ai_confidence", { precision: 5, scale: 4 }),
  aiSuggestions: jsonb("ai_suggestions"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull()
}, (table) => {
  return {
    orgIdIdx: index("tx_org_id_idx").on(table.organizationId),
    categoryIdIdx: index("tx_category_id_idx").on(table.categoryId),
    debitAccountIdIdx: index("tx_debit_acc_id_idx").on(table.debitAccountId),
    creditAccountIdIdx: index("tx_credit_acc_id_idx").on(table.creditAccountId),
    documentIdIdx: index("tx_document_id_idx").on(table.documentId),
    dateIdx: index("tx_date_idx").on(table.date)
  };
});

// Transactions relations
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [transactions.organizationId],
    references: [organizations.id]
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id]
  }),
  debitAccount: one(accounts, {
    fields: [transactions.debitAccountId],
    references: [accounts.id],
    relationName: "debitTransactions"
  }),
  creditAccount: one(accounts, {
    fields: [transactions.creditAccountId],
    references: [accounts.id],
    relationName: "creditTransactions"
  }),
  document: one(documents, {
    fields: [transactions.documentId],
    references: [documents.id]
  }),
  anomalies: many(anomalies)
}));

// AI anomaly detection with multi-tenant support
export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  type: text("type").notNull(), // duplicate, unusual_amount, unusual_category, etc.
  severity: text("severity").notNull(), // low, medium, high
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, resolved, dismissed
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
  aiReasoning: text("ai_reasoning"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { mode: 'date' })
}, (table) => {
  return {
    orgIdIdx: index("anomaly_org_id_idx").on(table.organizationId),
    transactionIdIdx: index("anomaly_tx_id_idx").on(table.transactionId),
    assignedToUserIdIdx: index("anomaly_assigned_user_idx").on(table.assignedToUserId),
    statusIdx: index("anomaly_status_idx").on(table.status)
  };
});

// Anomalies relations
export const anomaliesRelations = relations(anomalies, ({ one }) => ({
  organization: one(organizations, {
    fields: [anomalies.organizationId],
    references: [organizations.id]
  }),
  transaction: one(transactions, {
    fields: [anomalies.transactionId],
    references: [transactions.id]
  }),
  assignedToUser: one(users, {
    fields: [anomalies.assignedToUserId],
    references: [users.id]
  })
}));

// Financial reports with multi-tenant support
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // income_statement, balance_sheet, cash_flow, custom
  dateRange: jsonb("date_range").notNull(),
  parameters: jsonb("parameters"),
  filters: jsonb("filters"),
  result: jsonb("result"),
  aiInsights: jsonb("ai_insights"),
  status: text("status").notNull().default("draft"), // draft, processing, completed, error
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: 'date' })
}, (table) => {
  return {
    orgIdIdx: index("report_org_id_idx").on(table.organizationId),
    createdByUserIdIdx: index("report_user_id_idx").on(table.createdByUserId)
  };
});

// Organizations
export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  slug: true,
  plan: true,
  status: true,
  metadata: true
});

// Users
export const insertUserSchema = createInsertSchema(users).pick({
  organizationId: true,
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true
});

// Demo Requests
export const insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  fullName: true,
  email: true,
  company: true,
  companySize: true,
  interest: true,
});

// Documents
export const insertDocumentSchema = createInsertSchema(documents).pick({
  organizationId: true,
  userId: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  storageKey: true,
  processingStatus: true,
  textContent: true,
  metadata: true
});

// AI Conversations
export const insertAiConversationSchema = createInsertSchema(aiConversations).pick({
  userId: true,
  query: true,
  response: true,
  metadata: true
});

// Accounts
export const insertAccountSchema = createInsertSchema(accounts).pick({
  organizationId: true,
  name: true,
  type: true,
  balance: true,
  currency: true,
  description: true,
  externalId: true,
  connectionDetails: true,
  status: true
});

// Categories
export const insertCategorySchema = createInsertSchema(categories).pick({
  organizationId: true,
  name: true,
  description: true,
  parentId: true,
  color: true,
  icon: true,
  isSystem: true
});

// Transactions
export const insertTransactionSchema = createInsertSchema(transactions)
  .pick({
    organizationId: true,
    description: true,
    amount: true,
    type: true,
    date: true,
    categoryId: true,
    debitAccountId: true,
    creditAccountId: true,
    documentId: true,
    reference: true,
    status: true,
    tags: true,
    metadata: true
  })
  .transform((data) => {
    // Transform date string to Date object if it's a string
    // This handles both JSON serialized Date objects and ISO strings
    if (data.date && typeof data.date === 'string') {
      return {
        ...data,
        date: new Date(data.date)
      };
    }
    return data;
  });

// Anomalies
export const insertAnomalySchema = createInsertSchema(anomalies).pick({
  organizationId: true,
  transactionId: true,
  type: true,
  severity: true,
  description: true,
  status: true,
  assignedToUserId: true,
  aiReasoning: true,
  resolutionNotes: true
});

// Reports
export const insertReportSchema = createInsertSchema(reports).pick({
  organizationId: true,
  createdByUserId: true,
  name: true,
  type: true,
  dateRange: true,
  parameters: true,
  filters: true,
  status: true
});

// Export all types
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

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
