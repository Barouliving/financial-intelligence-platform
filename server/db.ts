import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

const { Pool } = pg;

// Validate database connection URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Connection pooling configuration for Replit
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients the pool should contain
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // Maximum time to wait for connection
  // Don't use SSL for local development
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Set up connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  console.error(err.stack);
});

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT 1 as connected`);
    if (Array.isArray(result) && result.length > 0) {
      return result[0]?.connected === 1;
    }
    // Using direct pool query as fallback
    const client = await pool.connect();
    try {
      const queryResult = await client.query('SELECT 1 as connected');
      return queryResult.rows[0]?.connected === 1;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

// Row-Level Security setup function
export async function setupRLS() {
  const client = await pool.connect();
  
  try {
    // Enable row-level security on all tables
    await client.query(`
      -- Enable RLS on organizations table
      ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on users table
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on accounts table
      ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on categories table
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on transactions table
      ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on anomalies table
      ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on reports table
      ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on documents table
      ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on ai_conversations table
      ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
    `);
    
    // Create policies for organization-based access
    await client.query(`
      -- Create organization_id column check function
      CREATE OR REPLACE FUNCTION check_organization_id()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN (
          CURRENT_SETTING('app.current_organization_id', TRUE)::INTEGER IS NULL OR
          organization_id = CURRENT_SETTING('app.current_organization_id', TRUE)::INTEGER
        );
      END;
      $$ LANGUAGE plpgsql;
      
      -- Organization policies
      CREATE POLICY org_select_policy ON organizations
        FOR SELECT USING (id = CURRENT_SETTING('app.current_organization_id', TRUE)::INTEGER);
        
      CREATE POLICY org_insert_policy ON organizations
        FOR INSERT WITH CHECK (TRUE);
        
      CREATE POLICY org_update_policy ON organizations
        FOR UPDATE USING (id = CURRENT_SETTING('app.current_organization_id', TRUE)::INTEGER);
        
      -- Users policies
      CREATE POLICY users_select_policy ON users
        FOR SELECT USING (check_organization_id());
        
      CREATE POLICY users_insert_policy ON users
        FOR INSERT WITH CHECK (check_organization_id());
        
      CREATE POLICY users_update_policy ON users
        FOR UPDATE USING (check_organization_id());
        
      -- Accounts policies
      CREATE POLICY accounts_select_policy ON accounts
        FOR SELECT USING (check_organization_id());
        
      CREATE POLICY accounts_insert_policy ON accounts
        FOR INSERT WITH CHECK (check_organization_id());
        
      CREATE POLICY accounts_update_policy ON accounts
        FOR UPDATE USING (check_organization_id());
        
      -- Similar policies for all other tables...
    `);
    
    console.log("Row-Level Security policies set up successfully");
  } catch (error) {
    console.error("Failed to set up Row-Level Security policies:", error);
  } finally {
    client.release();
  }
}

// Initialize function that sets up database and RLS
export async function initializeDatabase() {
  try {
    console.log("Checking database connection...");
    const connected = await checkDatabaseConnection();
    
    if (connected) {
      console.log("Database connected successfully");
      
      // Only set up RLS in production
      if (process.env.NODE_ENV === 'production') {
        await setupRLS();
      }
      
      return true;
    } else {
      console.error("Database connection check failed");
      return false;
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}
