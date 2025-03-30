import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  try {
    // Initialize the database connection
    log("Initializing database connection...");
    const { initializeDatabase } = await import("./db");
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      log("Failed to initialize database connection. Server will still start, but database functionality may be limited.");
    } else {
      log("Database connection initialized successfully.");
      
      // Run migrations in development mode, or if explicitly set via env var
      if (app.get("env") === "development" || process.env.RUN_MIGRATIONS === "true") {
        log("Running database migrations...");
        const { runMigrations } = await import("./migrations");
        await runMigrations();
        log("Database migrations completed.");
      }
    }
    
    // Register routes first
    await registerRoutes(app);
    
    // Then re-register critical API routes to ensure they're available
    try {
      // Try to import controllers. If they don't exist, we'll handle with basic responses
      const { aiController } = await import("./controllers/ai");
      app.post('/api/ai/conversation', (req, res) => {
        aiController.handleConversation(req, res);
      });
    } catch (error) {
      // Fallback route if controller import fails
      app.post('/api/ai/conversation', (req, res) => {
        res.json({ message: "AI conversation endpoint reached", query: req.body.query });
      });
    }
    
    // Add a test endpoint
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Test endpoint working' });
    });
    
    // Error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    
    // Create the server
    const server = http.createServer(app);
    
    // Setup vite or static file serving AFTER all API routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Start the server
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    log(`Fatal error during server initialization: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    process.exit(1);
  }
})();
