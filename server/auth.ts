import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import config from "../client/src/lib/appConfig";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

/**
 * Hash a password for secure storage
 * @param password - Plain text password to hash
 * @returns Hashed password with salt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare supplied password with stored hashed password
 * @param supplied - Plain text password to check
 * @param stored - Stored hashed password
 * @returns Boolean indicating if passwords match
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Setup authentication middleware and routes
 * @param app - Express application
 */
export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || 'pigment-financial-platform-secret';
  
  const sessionSettings: session.SessionOptions = {
    name: 'pigment.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: config.auth.tokenExpiration * 1000
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Don't allow login for inactive users
        if (user.status === 'inactive') {
          return done(null, false, { message: "This account has been deactivated" });
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Update last login timestamp
        if (user.id) {
          try {
            await storage.updateUserLastLogin(user.id);
          } catch (err) {
            console.error("Error updating last login timestamp:", err);
            // Continue with login even if timestamp update fails
          }
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // Middleware to handle authentication errors
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === "AuthenticationError") {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  });

  // Register a new user
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email exists
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(req.body.password);
      
      // Generate uuid for user
      const uuid = uuidv4();
      
      // Default organization ID if not specified
      const organizationId = req.body.organizationId || 1;

      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        uuid,
        status: 'active',
        role: req.body.role || 'user',
        organizationId
      });

      // Log in the user automatically
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "An error occurred during registration" });
    }
  });

  // Login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        res.clearCookie('pigment.sid');
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Don't include password in response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Update user profile
  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const userId = req.user.id;
      
      // Don't allow updating critical fields
      const { id, uuid, role, status, password, organizationId, ...allowedUpdates } = req.body;
      
      // If new password is provided, hash it
      if (req.body.newPassword) {
        allowedUpdates.password = await hashPassword(req.body.newPassword);
      }
      
      const updatedUser = await storage.updateUser(userId, allowedUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't include password in response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
      
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "An error occurred while updating user" });
    }
  });

  // Admin: Get all users (protected)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Only allow admins to access all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const users = await storage.getUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  });
  
  // Admin: Create user (protected)
  app.post("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Only allow admins to create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      // Check if username exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email exists
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Generate uuid
      const uuid = uuidv4();
      
      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        uuid,
        status: req.body.status || 'active',
      });

      // Don't include password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
      
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "An error occurred while creating user" });
    }
  });
  
  // Admin: Update user (protected)
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Only allow admins to update other users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const updates = req.body;
      
      // If password update is requested, hash it
      if (req.body.password) {
        updates.password = await hashPassword(req.body.password);
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't include password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
      
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "An error occurred while updating user" });
    }
  });
  
  // Admin: Delete/deactivate user (protected)
  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Only allow admins to delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Prevent deleting own account
      if (userId === req.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      // Instead of hard delete, deactivate the user
      const deactivated = await storage.updateUser(userId, { status: 'inactive' });
      
      if (!deactivated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.status(200).json({ message: "User deactivated successfully" });
      
    } catch (err) {
      console.error("Error deactivating user:", err);
      res.status(500).json({ error: "An error occurred while deactivating user" });
    }
  });
}

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  
  next();
}

/**
 * Middleware to check if user belongs to organization
 */
export function requireOrganizationAccess(orgId: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Allow admins to access any organization
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user belongs to the specified organization
    if (req.user.organizationId !== orgId) {
      return res.status(403).json({ error: "Unauthorized access to organization" });
    }
    
    next();
  };
}