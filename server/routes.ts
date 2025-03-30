import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDemoRequestSchema, 
  insertAiConversationSchema, 
  insertAccountSchema, 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertReportSchema,
  insertAnomalySchema,
  transactions,
  categories
} from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { processBusinessQuery } from "./huggingface";
import { clearCache, getCacheStats } from "./cache";
import { setupAuth, requireAuth } from "./auth";
import { resetDatabase } from "./reset-db";
import { db } from "./db";
import { sql, and, eq, gte, lte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
app.get("/api/test", (_req, res) => {
  res.json({ message: "Success! Your routes are working." });
});

  
  // Set up authentication routes and middleware
  setupAuth(app);
  // Demo Request API
  app.post("/api/demo-request", async (req: Request, res: Response) => {
    try {
      const demoRequestData = insertDemoRequestSchema.parse(req.body);
      const demoRequest = await storage.createDemoRequest(demoRequestData);
      res.status(201).json({ success: true, data: demoRequest });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  app.get("/api/demo-requests", async (_req: Request, res: Response) => {
    try {
      const demoRequests = await storage.getDemoRequests();
      res.status(200).json({ success: true, data: demoRequests });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // AI Conversation API
  app.post("/api/ai/conversation", async (req: Request, res: Response) => {
    try {
      const { query, useCache = true } = req.body;
      
      if (!query) {
        return res.status(400).json({ success: false, error: "Query is required" });
      }

      // Generate AI response using Hugging Face
      let response;
      try {
        // Use Hugging Face if API token is available
        if (process.env.HF_API_TOKEN) {
          console.log(`Using Hugging Face for AI response (cache ${useCache ? 'enabled' : 'disabled'})`);
          response = await processBusinessQuery(query, { useCache });
        } else {
          // Fallback to the local mock data
          console.log("Using mock data for AI response (no API token)");
          response = generateAiResponse(query);
        }
      } catch (aiError) {
        console.error("Error calling AI API:", aiError);
        // Fallback to the local mock data if AI API fails
        response = generateAiResponse(query);
      }
      
      const conversation = await storage.createAiConversation({
        userId: req.body.userId || null,
        query,
        response
      });
      
      res.status(201).json({ success: true, data: conversation });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        console.error("Error in AI conversation endpoint:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  app.get("/api/ai/conversations", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const conversations = await storage.getAiConversations(userId);
      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  // AI Cache Management API
  app.get("/api/ai/cache/stats", async (_req: Request, res: Response) => {
    try {
      const stats = getCacheStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({ success: false, error: "Failed to get cache statistics" });
    }
  });
  
  app.post("/api/ai/cache/clear", async (_req: Request, res: Response) => {
    try {
      clearCache();
      res.status(200).json({ 
        success: true, 
        message: "AI response cache cleared successfully" 
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ success: false, error: "Failed to clear cache" });
    }
  });

  // Forecast API for dashboard data
  app.get("/api/dashboard/revenue-forecast", async (_req: Request, res: Response) => {
    // Check if we have any transactions in the database
    const transactionCount = await db.select({ count: sql`count(*)` }).from(transactions);
    const count = Number(transactionCount[0].count);
    const hasData = count > 0;
    
    // Log for debugging
    console.log(`Revenue forecast endpoint - Transaction count: ${count}, hasData: ${hasData}`);
    
    if (!hasData) {
      // Return empty data
      const data = {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        actual: [null, null, null, null, null, null, null, null, null, null, null, null],
        forecast: [null, null, null, null, null, null, null, null, null, null, null, null],
        previousYear: [null, null, null, null, null, null, null, null, null, null, null, null]
      };
      return res.status(200).json({ success: true, data, noData: true });
    }
    
    // Get transactions joined with categories to determine income vs expense
    const txWithCategories = await db
      .select({
        txId: transactions.id,
        txAmount: transactions.amount,
        txDate: transactions.date,
        categoryId: transactions.categoryId
      })
      .from(transactions);
    
    // Get all categories to determine type based on name
    const categoriesList = await db.select().from(categories);
    const categoryNameMap = Object.fromEntries(
      categoriesList.map(cat => [cat.id, cat.name?.toLowerCase() || ''])
    );
    
    // Current year data
    const currentYear = new Date().getFullYear();
    const startOfThisYear = new Date(currentYear, 0, 1);
    
    // Previous year data
    const lastYear = currentYear - 1;
    const startOfLastYear = new Date(lastYear, 0, 1);
    const endOfLastYear = new Date(lastYear, 11, 31);
    
    // Filter transactions by category (income) and group by month
    const currentYearIncomeByMonth = new Array(12).fill(0);
    const previousYearIncomeByMonth = new Array(12).fill(0);
    
    // Process all transactions
    txWithCategories.forEach(tx => {
      if (!tx.txDate) return;
      
      const txDate = new Date(tx.txDate);
      const categoryName = tx.categoryId ? (categoryNameMap[tx.categoryId] || '') : '';
      const isIncome = categoryName.includes('income') || 
                       categoryName.includes('revenue') || 
                       categoryName.includes('sales');
      
      // Skip if not income
      if (!isIncome) return;
      
      const txAmount = Number(tx.txAmount || 0);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth(); // 0-based
      
      // Add to current year data
      if (txYear === currentYear) {
        currentYearIncomeByMonth[txMonth] += txAmount;
      } 
      // Add to previous year data
      else if (txYear === lastYear) {
        previousYearIncomeByMonth[txMonth] += txAmount;
      }
    });
    
    // Initialize arrays with null values for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const actual = Array(12).fill(null);
    const previousYear = Array(12).fill(null);
    const forecast = Array(12).fill(null);
    
    // Fill in actual data from our calculated arrays
    for (let i = 0; i < 12; i++) {
      const monthValue = currentYearIncomeByMonth[i];
      if (monthValue > 0) {
        actual[i] = Math.round(monthValue);
      }
      
      const prevYearValue = previousYearIncomeByMonth[i];
      if (prevYearValue > 0) {
        previousYear[i] = Math.round(prevYearValue);
      }
    }
    
    // Generate forecast for future months
    // Calculate the average growth rate based on available actual data
    const currentMonth = new Date().getMonth(); // 0-based
    
    let growthRate = 0.05; // Default 5% monthly growth
    let lastActualValue = null;
    
    // Find the last month with actual data
    for (let i = currentMonth; i >= 0; i--) {
      if (actual[i] !== null) {
        lastActualValue = actual[i];
        break;
      }
    }
    
    // If we have actual data, calculate growth based on available data
    if (lastActualValue !== null) {
      let sumGrowth = 0;
      let countGrowth = 0;
      
      // Calculate average month-to-month growth
      for (let i = 1; i <= currentMonth; i++) {
        if (actual[i] !== null && actual[i-1] !== null && actual[i-1] > 0) {
          sumGrowth += (actual[i] / actual[i-1]) - 1;
          countGrowth++;
        }
      }
      
      if (countGrowth > 0) {
        growthRate = sumGrowth / countGrowth;
        // Cap growth rate between -10% and +20%
        growthRate = Math.max(-0.1, Math.min(0.2, growthRate));
      }
      
      // Generate forecast starting from current month
      for (let i = currentMonth; i < 12; i++) {
        if (i === currentMonth) {
          // For current month, forecast = last actual * (1 + growth)
          // but only if we don't already have actual data
          if (actual[i] === null) {
            forecast[i] = Math.round(lastActualValue * (1 + growthRate));
          }
        } else {
          // For future months, forecast based on previous month's forecast
          const prevValue = forecast[i-1] !== null ? forecast[i-1] : 
                          (actual[i-1] !== null ? actual[i-1] : lastActualValue);
          forecast[i] = Math.round(prevValue * (1 + growthRate));
        }
      }
    }
    
    const data = { months, actual, forecast, previousYear };
    
    res.status(200).json({ success: true, data });
  });

  app.get("/api/dashboard/revenue-by-region", async (_req: Request, res: Response) => {
    // Check if we have any transactions in the database
    const transactionCount = await db.select({ count: sql`count(*)` }).from(transactions);
    const count = Number(transactionCount[0].count);
    const hasData = count > 0;
    
    // Log for debugging
    console.log(`Revenue by region endpoint - Transaction count: ${count}, hasData: ${hasData}`);
    
    if (!hasData) {
      // Return empty data
      return res.status(200).json({ 
        success: true, 
        data: [], 
        noData: true 
      });
    }
    
    // Get transactions with tags
    const txWithTags = await db
      .select({
        txAmount: transactions.amount,
        txTags: transactions.tags,
        categoryId: transactions.categoryId
      })
      .from(transactions);
    
    // Get all categories to determine type based on name
    const categoriesList = await db.select().from(categories);
    const categoryNameMap: Record<number, string> = {};
    
    // Add each category to the map, ensuring all keys are valid numbers
    categoriesList.forEach(cat => {
      if (cat.id !== null && cat.id !== undefined) {
        categoryNameMap[cat.id] = (cat.name || '').toLowerCase();
      }
    });
    
    // Group income transactions by tag (region)
    const tagTotals: Record<string, number> = {};
    
    txWithTags.forEach(tx => {
      // Skip if no tags
      if (!tx.txTags || tx.txTags.length === 0) return;
      
      // Determine if this is income based on category
      const categoryName = tx.categoryId ? (categoryNameMap[tx.categoryId] || '') : '';
      const isIncome = categoryName.includes('income') || 
                       categoryName.includes('revenue') || 
                       categoryName.includes('sales');
      
      // Skip if not income
      if (!isIncome) return;
      
      // Add amount to each tag
      const txAmount = Number(tx.txAmount || 0);
      tx.txTags.forEach(tag => {
        if (!tag) return;
        if (!tagTotals[tag]) {
          tagTotals[tag] = 0;
        }
        tagTotals[tag] += txAmount;
      });
    });
    
    // Convert to array of regions
    const regions = Object.entries(tagTotals).map(([tag, total]) => ({
      name: tag || 'Uncategorized',
      value: total
    }));
    
    // Sort by value descending
    regions.sort((a, b) => b.value - a.value);
    
    // Process results - if we have tags, use them as regions
    if (regions.length > 0) {
      // Calculate total to create percentages
      const total = regions.reduce((sum, item) => sum + item.value, 0);
      
      // Convert to percentages and round
      const dataWithPercentages = regions.map(item => ({
        name: item.name,
        value: Math.round((item.value / total) * 100)
      }));
      
      return res.status(200).json({ success: true, data: dataWithPercentages });
    }
    
    // Fallback to default regions if no tag data is available
    const data = [
      { name: 'North America', value: 45 },
      { name: 'Europe', value: 30 },
      { name: 'Asia Pacific', value: 15 },
      { name: 'Latin America', value: 7 },
      { name: 'Middle East & Africa', value: 3 }
    ];
    
    res.status(200).json({ success: true, data });
  });

  app.get("/api/dashboard/key-metrics", async (_req: Request, res: Response) => {
    // Check if we have any transactions in the database
    const transactionCount = await db.select({ count: sql`count(*)` }).from(transactions);
    const count = Number(transactionCount[0].count);
    
    // Directly get a list of transactions to verify they exist
    const allTransactions = await db.select().from(transactions).limit(5);
    console.log(`Key metrics endpoint - Transaction count from query: ${count}`);
    console.log(`First few transactions:`, JSON.stringify(allTransactions.slice(0, 2)));
    
    const hasData = count > 0;
    
    if (!hasData) {
      // Return empty data
      const data = {
        revenue: {
          value: 0,
          change: 0,
          trend: [0, 0, 0, 0, 0, 0]
        },
        expenses: {
          value: 0,
          change: 0,
          trend: [0, 0, 0, 0, 0, 0]
        },
        profitMargin: {
          value: 0,
          change: 0,
          trend: [0, 0, 0, 0, 0, 0]
        }
      };
      return res.status(200).json({ success: true, data, noData: true });
    }
    
    // If there is data, calculate real metrics based on transactions and categories
    // Get transactions joined with categories to determine income vs expense
    const txWithCategories = await db
      .select({
        txId: transactions.id,
        txAmount: transactions.amount,
        txDate: transactions.date,
        categoryId: transactions.categoryId
      })
      .from(transactions);
    
    // Get all categories to determine type based on name
    const categoriesList = await db.select().from(categories);
    const categoryNameMap: Record<number, string> = {};
    
    // Add each category to the map, ensuring all keys are valid numbers
    categoriesList.forEach(cat => {
      if (cat.id !== null && cat.id !== undefined) {
        categoryNameMap[cat.id] = (cat.name || '').toLowerCase();
      }
    });
    
    // Filter income by looking at category names containing "income" or "revenue" or "sales"
    const incomeTransactions = txWithCategories.filter(tx => {
      if (!tx.categoryId) return false;
      const categoryName = categoryNameMap[tx.categoryId] || '';
      return categoryName.includes('income') || 
             categoryName.includes('revenue') || 
             categoryName.includes('sales');
    });
    
    // Sum income transactions
    const income = incomeTransactions.reduce((sum, tx) => sum + Number(tx.txAmount || 0), 0);
    
    // Filter expense transactions (all non-income transactions)
    const expenseTransactions = txWithCategories.filter(tx => {
      if (!tx.categoryId) return true; // Default uncategorized to expenses
      const categoryName = categoryNameMap[tx.categoryId] || '';
      return !(categoryName.includes('income') || 
               categoryName.includes('revenue') || 
               categoryName.includes('sales'));
    });
    
    // Sum expense transactions
    const expenses = expenseTransactions.reduce((sum, tx) => sum + Number(tx.txAmount), 0);
    
    // Calculate profit margin
    const profitMargin = income > 0 ? ((income - expenses) / income) * 100 : 0;
    
    // Get data for trends (last 6 months of transactions)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Group transactions by month
    interface MonthData {
      income: number;
      expense: number;
    }
    
    const txByMonth: Record<string, MonthData> = {};
    
    // Group all transactions by month
    txWithCategories.forEach(tx => {
      if (tx.txDate && tx.txDate < sixMonthsAgo) return;
      if (!tx.txDate) return;
      
      const txDate = new Date(tx.txDate);
      const month = `${txDate.getFullYear()}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!txByMonth[month]) {
        txByMonth[month] = { income: 0, expense: 0 };
      }
      
      // Safely check category ID before accessing the map
      const categoryName = tx.categoryId && categoryNameMap[tx.categoryId] ? categoryNameMap[tx.categoryId] : '';
      if (categoryName.includes('income') || categoryName.includes('revenue') || categoryName.includes('sales')) {
        txByMonth[month].income += Number(tx.txAmount || 0);
      } else {
        txByMonth[month].expense += Number(tx.txAmount || 0);
      }
    });
    
    // Sort months chronologically
    const months = Object.keys(txByMonth).sort();
    
    // Create data arrays for trends
    const monthlyIncome = months.map(month => ({
      month,
      total: txByMonth[month].income
    }));
    
    const monthlyExpenses = months.map(month => ({
      month,
      total: txByMonth[month].expense
    }));
    
    // Create income and expense trends (convert to thousands for display)
    const incomeTrend = monthlyIncome.map(item => Number(item.total) / 1000);
    const expenseTrend = monthlyExpenses.map(item => Number(item.total) / 1000);
    
    // Calculate monthly profit margins for trend
    const profitMarginTrend = monthlyIncome.map((income, i) => {
      const expense = monthlyExpenses[i] ? Number(monthlyExpenses[i].total) : 0;
      const inc = Number(income.total);
      return inc > 0 ? ((inc - expense) / inc) * 100 : 0;
    });
    
    // Ensure we have 6 data points (pad with zeros if needed)
    while (incomeTrend.length < 6) incomeTrend.unshift(0);
    while (expenseTrend.length < 6) expenseTrend.unshift(0);
    while (profitMarginTrend.length < 6) profitMarginTrend.unshift(0);
    
    // If more than 6, take only the last 6
    const revenueTrend = incomeTrend.slice(-6);
    const expensesTrend = expenseTrend.slice(-6);
    const pmTrend = profitMarginTrend.slice(-6);
    
    // Calculate change (compare last value to previous value)
    const calcChange = (trend: number[]) => {
      if (trend.length < 2 || trend[trend.length - 2] === 0) return 0;
      return ((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 100;
    };
    
    const data = {
      revenue: {
        value: income / 1000, // Convert to thousands for display
        change: calcChange(revenueTrend),
        trend: revenueTrend
      },
      expenses: {
        value: expenses / 1000, // Convert to thousands for display
        change: calcChange(expensesTrend),
        trend: expensesTrend
      },
      profitMargin: {
        value: profitMargin,
        change: calcChange(pmTrend),
        trend: pmTrend
      }
    };
    
    res.status(200).json({ success: true, data });
  });

  // ======= Bookkeeping API Routes =======

  // Account routes
  app.post("/api/bookkeeping/accounts", async (req: Request, res: Response) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json({ success: true, data: account });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  app.get("/api/bookkeeping/accounts", async (_req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      res.status(200).json({ success: true, data: accounts });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.get("/api/bookkeeping/accounts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ success: false, error: "Account not found" });
      }
      res.status(200).json({ success: true, data: account });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.patch("/api/bookkeeping/accounts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, updateData);
      if (!account) {
        return res.status(404).json({ success: false, error: "Account not found" });
      }
      res.status(200).json({ success: true, data: account });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  // Category routes
  app.post("/api/bookkeeping/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  app.get("/api/bookkeeping/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.get("/api/bookkeeping/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ success: false, error: "Category not found" });
      }
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Transaction routes
  app.post("/api/bookkeeping/transactions", async (req: Request, res: Response) => {
    try {
      // Manual validation to handle date conversion correctly
      const rawData = req.body;
      
      // Convert date string to Date object explicitly if needed
      if (rawData.date && typeof rawData.date === 'string') {
        try {
          rawData.date = new Date(rawData.date);
          if (isNaN(rawData.date.getTime())) {
            return res.status(400).json({ 
              success: false, 
              error: "Invalid date format. Please provide a valid date." 
            });
          }
        } catch (dateError) {
          return res.status(400).json({ 
            success: false, 
            error: "Failed to parse date: " + (dateError instanceof Error ? dateError.message : String(dateError))
          });
        }
      }
      
      // Now parse with Zod schema
      const transactionData = insertTransactionSchema.parse(rawData);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        console.error("Error creating transaction:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  app.get("/api/bookkeeping/transactions", async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      
      if (req.query.accountId) {
        filters.accountId = parseInt(req.query.accountId as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      const transactions = await storage.getTransactions(Object.keys(filters).length > 0 ? filters : undefined);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.get("/api/bookkeeping/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ success: false, error: "Transaction not found" });
      }
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.patch("/api/bookkeeping/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Manual validation to handle date conversion for updates too
      const rawData = req.body;
      
      // Convert date string to Date object explicitly if needed
      if (rawData.date && typeof rawData.date === 'string') {
        try {
          rawData.date = new Date(rawData.date);
          if (isNaN(rawData.date.getTime())) {
            return res.status(400).json({ 
              success: false, 
              error: "Invalid date format. Please provide a valid date." 
            });
          }
        } catch (dateError) {
          return res.status(400).json({ 
            success: false, 
            error: "Failed to parse date: " + (dateError instanceof Error ? dateError.message : String(dateError))
          });
        }
      }
      
      // Create a copy of the schema without the transform function for partial updates
      const partialSchema = createInsertSchema(transactions).pick({
        organizationId: true,
        description: true,
        amount: true,
        // type field doesn't exist in database
        // type: true,
        date: true,
        categoryId: true,
        debitAccountId: true,
        creditAccountId: true,
        documentId: true,
        reference: true,
        status: true,
        tags: true,
        metadata: true
      }).partial();
      
      const updateData = partialSchema.parse(rawData);
      const transaction = await storage.updateTransaction(id, updateData);
      
      if (!transaction) {
        return res.status(404).json({ success: false, error: "Transaction not found" });
      }
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        console.error("Error updating transaction:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });

  // AI Bookkeeping routes
  app.post("/api/bookkeeping/transactions/:id/ai-process", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.processTransactionWithAI(id);
      if (!transaction) {
        return res.status(404).json({ success: false, error: "Transaction not found" });
      }
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      console.error("Error processing transaction with AI:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  app.get("/api/bookkeeping/anomalies", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const anomalies = await storage.getAnomalies(status);
      res.status(200).json({ success: true, data: anomalies });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  app.patch("/api/bookkeeping/anomalies/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['open', 'resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status provided" });
      }
      
      const anomaly = await storage.updateAnomalyStatus(id, status);
      if (!anomaly) {
        return res.status(404).json({ success: false, error: "Anomaly not found" });
      }
      
      res.status(200).json({ success: true, data: anomaly });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  // Financial reporting
  app.post("/api/bookkeeping/reports", async (req: Request, res: Response) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(reportData);
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  });
  
  app.get("/api/bookkeeping/reports", async (_req: Request, res: Response) => {
    try {
      const reports = await storage.getReports();
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  app.get("/api/bookkeeping/reports/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ success: false, error: "Report not found" });
      }
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  app.post("/api/bookkeeping/reports/:id/generate", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.generateReportWithAI(id);
      if (!report) {
        return res.status(404).json({ success: false, error: "Report not found" });
      }
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error("Error generating report with AI:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
  
  // FP&A Agent endpoint for financial insights
  app.get("/api/ai/financial-insights/:organizationId", async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.organizationId, 10);
      
      if (isNaN(organizationId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid organization ID" 
        });
      }
      
      const { generateInsights } = await import('./services/fpaAgent');
      const insights = await generateInsights(organizationId);
      
      res.json({ 
        success: true, 
        data: insights 
      });
    } catch (error) {
      console.error("Error generating financial insights:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate financial insights",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Database reset endpoint for testing
  app.post("/api/system/reset-database", async (_req: Request, res: Response) => {
    try {
      await resetDatabase();
      res.status(200).json({ 
        success: true, 
        message: "Database reset completed successfully" 
      });
    } catch (error) {
      console.error("Error resetting database:", error);
      res.status(500).json({ success: false, error: "Failed to reset database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate simulated AI responses
function generateAiResponse(query: string): string {
  query = query.toLowerCase();
  
  // Financial forecast response
  if (query.includes('forecast') || query.includes('revenue') || query.includes('sales')) {
    return JSON.stringify({
      type: 'forecast',
      message: "Here's your revenue forecast for the requested period:",
      data: {
        trend: [
          { month: 'Jan', value: 4.2 },
          { month: 'Feb', value: 4.5 },
          { month: 'Mar', value: 4.8 },
          { month: 'Apr', value: 5.1 },
          { month: 'May', value: 5.4 },
          { month: 'Jun', value: 5.7 }
        ],
        insight: "Revenue is projected to grow by 8.5% quarter-over-quarter."
      }
    });
  }
  
  // Region analysis
  if (query.includes('region') || query.includes('area') || query.includes('emea')) {
    return JSON.stringify({
      type: 'region',
      message: "Based on the data, here's the breakdown by region:",
      data: {
        regions: [
          { name: 'North America', performance: 12, status: 'above' },
          { name: 'EMEA', performance: -5, status: 'below' },
          { name: 'APAC', performance: 8, status: 'above' },
          { name: 'LATAM', performance: 3, status: 'on-track' }
        ],
        factors: [
          { factor: 'Delayed product launch', impact: -3.2 },
          { factor: 'Increased competitive pressure', impact: -1.5 },
          { factor: 'Currency exchange fluctuations', impact: -1.8 }
        ]
      }
    });
  }
  
  // Transaction anomaly detection
  if (query.includes('anomal') || query.includes('unusual') || query.includes('fraud') || query.includes('suspicious')) {
    return JSON.stringify({
      type: 'anomaly',
      message: "I've detected several transaction anomalies:",
      data: {
        anomalies: [
          { 
            id: 1,
            transactionId: 42,
            description: "Unusually large payment to unknown vendor",
            amount: 15750.00,
            date: "2025-03-15",
            confidence: 0.89,
            type: "unusual_amount",
            reasoning: "This transaction amount is 350% higher than the average payment to vendors in this category."
          },
          { 
            id: 2,
            transactionId: 57,
            description: "Potential duplicate payment",
            amount: 2450.00,
            date: "2025-03-22",
            confidence: 0.94,
            type: "duplicate",
            reasoning: "This transaction has the same amount, description and recipient as transaction #52 from 2025-03-21."
          },
          { 
            id: 3,
            transactionId: 63,
            description: "Unusual transaction timing",
            amount: 5200.00,
            date: "2025-03-27",
            confidence: 0.71,
            type: "unusual_timing",
            reasoning: "This transaction was processed outside normal business hours (3:42 AM) which differs from typical payment patterns."
          }
        ],
        summary: "3 high-priority anomalies detected across 120 transactions processed this month. Recommend immediate review of the flagged items."
      }
    });
  }
  
  // Expense categorization
  if (query.includes('categorize') || query.includes('classify') || query.includes('categories') || query.includes('spending') || query.includes('expenses')) {
    return JSON.stringify({
      type: 'categorization',
      message: "I've analyzed and categorized your recent transactions:",
      data: {
        categories: [
          { name: "Operating Expenses", amount: 42500, percentage: 38.6 },
          { name: "Payroll", amount: 35200, percentage: 32.0 },
          { name: "Software & Subscriptions", amount: 12300, percentage: 11.2 },
          { name: "Marketing", amount: 8650, percentage: 7.9 },
          { name: "Office Rent", amount: 7500, percentage: 6.8 },
          { name: "Travel", amount: 3850, percentage: 3.5 }
        ],
        insights: [
          "Software & Subscription expenses have increased 15% compared to last quarter",
          "Marketing expenses are down 12% year-over-year", 
          "There are 5 transactions ($3,240 total) that couldn't be automatically categorized and need manual review"
        ],
        uncategorized: [
          { id: 78, description: "Payment to XYZ Corp", amount: 1250.00 },
          { id: 92, description: "Service fee", amount: 750.00 },
          { id: 103, description: "Consultant payment", amount: 1240.00 }
        ]
      }
    });
  }
  
  // Tax preparation and analysis
  if (query.includes('tax') || query.includes('taxes') || query.includes('deduction') || query.includes('write-off')) {
    return JSON.stringify({
      type: 'tax',
      message: "Here's my tax analysis based on your transaction data:",
      data: {
        deductions: [
          { category: "Business Equipment", amount: 12750, eligibility: "Fully deductible" },
          { category: "Home Office", amount: 3600, eligibility: "Partially deductible" },
          { category: "Travel Expenses", amount: 8250, eligibility: "Fully deductible" },
          { category: "Meals & Entertainment", amount: 3200, eligibility: "50% deductible" }
        ],
        insights: [
          "I found $5,200 in potentially missed deductions from your Cloud Services expenses",
          "Your current effective tax rate is approximately 24.3%",
          "Consider adjusting your quarterly estimated tax payments based on projected Q4 revenue"
        ],
        warnings: [
          "3 transactions totaling $4,500 may require additional documentation for IRS compliance",
          "Your home office deduction appears higher than typical for your business size"
        ]
      }
    });
  }
  
  // Cash flow analysis
  if (query.includes('cash flow') || query.includes('liquidity') || query.includes('runway')) {
    return JSON.stringify({
      type: 'cashflow',
      message: "I've analyzed your cash flow trends:",
      data: {
        currentPosition: {
          cash: 285000,
          shortTermLiabilities: 72000,
          burn: 47000,
          runway: "6.1 months"
        },
        monthlyTrend: [
          { month: "Jan", inflow: 120000, outflow: 92000, net: 28000 },
          { month: "Feb", inflow: 135000, outflow: 97000, net: 38000 },
          { month: "Mar", inflow: 105000, outflow: 103000, net: 2000 }
        ],
        insights: [
          "Your monthly cash burn has increased 14% in the last quarter",
          "Account receivables aging is deteriorating - 45% of receivables are now >60 days", 
          "Based on current trends, you should consider adjusting payment terms with top 3 customers"
        ],
        recommendations: [
          "Implement invoice factoring for large accounts to improve immediate cash position",
          "Review SaaS subscriptions - potential savings of $2,700/month identified",
          "Consider adjusting payment schedules with vendors to better align with revenue timing"
        ]
      }
    });
  }
  
  // Financial health and metrics
  if (query.includes('financial health') || query.includes('metrics') || query.includes('ratio') || query.includes('performance')) {
    return JSON.stringify({
      type: 'financial_health',
      message: "Here's an analysis of your key financial metrics:",
      data: {
        ratios: [
          { name: "Current Ratio", value: 2.3, status: "healthy", benchmark: 2.0 },
          { name: "Quick Ratio", value: 1.8, status: "healthy", benchmark: 1.0 },
          { name: "Debt-to-Equity", value: 0.5, status: "excellent", benchmark: 1.5 },
          { name: "Gross Margin", value: 0.62, status: "above average", benchmark: 0.55 },
          { name: "Net Profit Margin", value: 0.08, status: "below average", benchmark: 0.12 }
        ],
        trends: [
          { metric: "Revenue Growth", value: "15% YoY", status: "positive" },
          { metric: "Customer Acquisition Cost", value: "$350", status: "improving" },
          { metric: "Customer Lifetime Value", value: "$2,850", status: "stable" },
          { metric: "Churn Rate", value: "2.8%", status: "needs attention" }
        ],
        insights: [
          "Your overall financial health is strong with excellent liquidity and manageable debt",
          "Net profit margin is below industry average primarily due to higher marketing expenses",
          "Current growth rate is sustainable given your cash reserves and capital structure"
        ]
      }
    });
  }
  
  // General analytics response (fallback)
  return JSON.stringify({
    type: 'general',
    message: "I've analyzed your business data:",
    data: {
      insights: [
        "Your Q3 targets are projected to exceed by 7%",
        "Marketing spend efficiency has improved by 12% year-over-year",
        "Customer acquisition cost has decreased by 8.5%"
      ],
      recommendation: "Consider reallocating 10% of your marketing budget to your top-performing channel."
    }
  });
}
