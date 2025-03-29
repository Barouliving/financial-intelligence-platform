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
  insertAnomalySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { processBusinessQuery } from "./huggingface";
import { clearCache, getCacheStats } from "./cache";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/dashboard/revenue-forecast", (_req: Request, res: Response) => {
    const data = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      actual: [4200, 4500, 4800, 5100, 5400, 5700, 6000, 6300, null, null, null, null],
      forecast: [null, null, null, null, null, null, null, 6300, 6600, 6900, 7200, 7500],
      previousYear: [3800, 4000, 4200, 4400, 4600, 4800, 5000, 5200, 5400, 5600, 5800, 6000]
    };
    
    res.status(200).json({ success: true, data });
  });

  app.get("/api/dashboard/revenue-by-region", (_req: Request, res: Response) => {
    const data = [
      { name: 'North America', value: 45 },
      { name: 'Europe', value: 30 },
      { name: 'Asia Pacific', value: 15 },
      { name: 'Latin America', value: 7 },
      { name: 'Middle East & Africa', value: 3 }
    ];
    
    res.status(200).json({ success: true, data });
  });

  app.get("/api/dashboard/key-metrics", (_req: Request, res: Response) => {
    const data = {
      revenue: {
        value: 4.2,
        change: 12.5,
        trend: [4.0, 4.1, 4.15, 4.2, 4.25, 4.3]
      },
      expenses: {
        value: 2.8,
        change: 3.2,
        trend: [2.6, 2.65, 2.7, 2.75, 2.8, 2.85]
      },
      profitMargin: {
        value: 33.4,
        change: 5.3,
        trend: [30.1, 31.2, 32.0, 32.8, 33.4, 33.5]
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
      const transactionData = insertTransactionSchema.parse(req.body);
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
      const updateData = insertTransactionSchema.partial().parse(req.body);
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
