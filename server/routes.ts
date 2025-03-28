import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDemoRequestSchema, insertAiConversationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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
      // For demo purposes, we'll create a simulated AI response
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ success: false, error: "Query is required" });
      }

      // Generate a simulated response based on the query
      const response = generateAiResponse(query);
      
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
  
  // General analytics response
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
