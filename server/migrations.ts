import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

const { Pool } = pg;

// Function to run database migrations
export async function runMigrations() {
  console.log('Starting database migrations...');
  
  // Create a dedicated connection for migrations
  const migrationPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Use a single connection for migrations
  });
  
  const db = drizzle(migrationPool, { schema });
  
  try {
    // 1. Create database schema
    console.log('Creating database schema...');
    
    // Check if any tables exist
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
      ) as has_tables
    `);
    
    const hasTables = result[0]?.has_tables === true;
    
    if (!hasTables) {
      console.log('No tables found. Creating schema...');
      
      // Create tables based on schema definitions
      const queries = [
        // Organizations table
        sql`CREATE TABLE IF NOT EXISTS organizations (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          plan TEXT NOT NULL DEFAULT 'free',
          status TEXT NOT NULL DEFAULT 'active',
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
        
        // Users table
        sql`CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          email TEXT NOT NULL,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          status TEXT NOT NULL DEFAULT 'active',
          last_login_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(organization_id, username),
          UNIQUE(organization_id, email)
        )`,
        
        // Demo requests table
        sql`CREATE TABLE IF NOT EXISTS demo_requests (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          company_size TEXT NOT NULL,
          interest TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          contacted BOOLEAN DEFAULT FALSE
        )`,
        
        // AI conversations table
        sql`CREATE TABLE IF NOT EXISTS ai_conversations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          query TEXT NOT NULL,
          response TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
        
        // Documents table
        sql`CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          user_id INTEGER NOT NULL REFERENCES users(id),
          file_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          storage_key TEXT NOT NULL,
          processing_status TEXT NOT NULL DEFAULT 'pending',
          text_content TEXT,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
        
        // Accounts table
        sql`CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance NUMERIC(15,2) NOT NULL DEFAULT 0,
          currency VARCHAR(3) NOT NULL DEFAULT 'USD',
          description TEXT,
          external_id TEXT,
          connection_details JSONB,
          last_synced_at TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(organization_id, name)
        )`,
        
        // Categories table
        sql`CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          name TEXT NOT NULL,
          description TEXT,
          parent_id INTEGER REFERENCES categories(id),
          color VARCHAR(7),
          icon TEXT,
          is_system BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(organization_id, name)
        )`,
        
        // Transactions table
        sql`CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          description TEXT NOT NULL,
          amount NUMERIC(15,2) NOT NULL,
          date TIMESTAMP NOT NULL,
          category_id INTEGER REFERENCES categories(id),
          debit_account_id INTEGER NOT NULL REFERENCES accounts(id),
          credit_account_id INTEGER NOT NULL REFERENCES accounts(id),
          document_id INTEGER REFERENCES documents(id),
          reference TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          tags TEXT[],
          metadata JSONB,
          ai_processed BOOLEAN DEFAULT FALSE,
          ai_confidence NUMERIC(5,4),
          ai_suggestions JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )`,
        
        // Anomalies table
        sql`CREATE TABLE IF NOT EXISTS anomalies (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          transaction_id INTEGER NOT NULL REFERENCES transactions(id),
          type TEXT NOT NULL,
          severity TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          assigned_to_user_id INTEGER REFERENCES users(id),
          ai_reasoning TEXT,
          resolution_notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMP
        )`,
        
        // Reports table
        sql`CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
          organization_id INTEGER NOT NULL REFERENCES organizations(id),
          created_by_user_id INTEGER NOT NULL REFERENCES users(id),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          date_range JSONB NOT NULL,
          parameters JSONB,
          filters JSONB,
          result JSONB,
          ai_insights JSONB,
          status TEXT NOT NULL DEFAULT 'draft',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP
        )`,
        
        // Create indexes
        sql`CREATE INDEX IF NOT EXISTS ai_user_id_idx ON ai_conversations(user_id)`,
        sql`CREATE INDEX IF NOT EXISTS doc_org_id_idx ON documents(organization_id)`,
        sql`CREATE INDEX IF NOT EXISTS doc_user_id_idx ON documents(user_id)`,
        sql`CREATE INDEX IF NOT EXISTS acc_org_id_idx ON accounts(organization_id)`,
        sql`CREATE INDEX IF NOT EXISTS cat_org_id_idx ON categories(organization_id)`,
        sql`CREATE INDEX IF NOT EXISTS cat_parent_id_idx ON categories(parent_id)`,
        sql`CREATE INDEX IF NOT EXISTS tx_org_id_idx ON transactions(organization_id)`,
        sql`CREATE INDEX IF NOT EXISTS tx_category_id_idx ON transactions(category_id)`,
        sql`CREATE INDEX IF NOT EXISTS tx_debit_acc_id_idx ON transactions(debit_account_id)`,
        sql`CREATE INDEX IF NOT EXISTS tx_credit_acc_id_idx ON transactions(credit_account_id)`,
        sql`CREATE INDEX IF NOT EXISTS tx_document_id_idx ON transactions(document_id)`,
        sql`CREATE INDEX IF NOT EXISTS tx_date_idx ON transactions(date)`,
        sql`CREATE INDEX IF NOT EXISTS anomaly_org_id_idx ON anomalies(organization_id)`,
        sql`CREATE INDEX IF NOT EXISTS anomaly_tx_id_idx ON anomalies(transaction_id)`,
        sql`CREATE INDEX IF NOT EXISTS anomaly_assigned_user_idx ON anomalies(assigned_to_user_id)`,
        sql`CREATE INDEX IF NOT EXISTS anomaly_status_idx ON anomalies(status)`,
        sql`CREATE INDEX IF NOT EXISTS report_org_id_idx ON reports(organization_id)`,
        sql`CREATE INDEX IF NOT EXISTS report_user_id_idx ON reports(created_by_user_id)`
      ];
      
      // Execute all creation queries
      for (const query of queries) {
        await db.execute(query);
      }
      
      console.log('Database schema created successfully');
    } else {
      console.log('Tables already exist, skipping schema creation');
    }
    
    // 2. Seed default data if needed
    await seedDefaultData(db, migrationPool);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw the error, just log it to allow the application to continue
  } finally {
    await migrationPool.end();
  }
}

// Seed default data
async function seedDefaultData(db: any, pool: pg.Pool) {
  console.log('Checking if default data needs to be seeded...');
  
  try {
    // Check if demo organization exists
    const demoOrgResult = await pool.query(
      `SELECT id FROM organizations WHERE slug = 'demo-org' LIMIT 1`
    );
    
    const demoOrgExists = demoOrgResult.rows && demoOrgResult.rows.length > 0;
    const demoOrgId = demoOrgExists ? Number(demoOrgResult.rows[0].id) : null;
    
    if (demoOrgExists) {
      console.log(`Demo organization already exists with ID: ${demoOrgId}`);
      return; // Exit early if demo organization already exists
    }
    console.log('No organizations found. Seeding default data...');
    
    // Get existing or create demo organization
    let orgId;
    
    // Simply use the ID we already fetched since we know it exists
    if (demoOrgId) {
      orgId = demoOrgId;
      console.log(`Using existing demo organization with id: ${orgId}`);
    } else {
      try {
        // Create new demo organization with a unique slug using timestamp
        const uniqueSlug = `demo-org-${Date.now()}`;
        // First, use pg.Pool directly for the insertion to get better result handling
        const insertResult = await pool.query(
          'INSERT INTO organizations (name, slug, plan, status, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          ['Demo Organization', uniqueSlug, 'free', 'active', JSON.stringify({ demo: true })]
        );
        
        // Extract the ID from the result
        orgId = insertResult.rows && insertResult.rows.length > 0 ? Number(insertResult.rows[0].id) : null;
        
        console.log("Insert result:", JSON.stringify(insertResult));
        
        // If we still don't have an orgId, make another query to get it
        if (!orgId) {
          const getOrgResult = await pool.query(
            'SELECT id FROM organizations WHERE slug = $1 LIMIT 1', 
            [uniqueSlug]
          );
          orgId = getOrgResult.rows && getOrgResult.rows.length > 0 ? Number(getOrgResult.rows[0].id) : null;
          console.log("Select result:", JSON.stringify(getOrgResult));
        }
        console.log(`Created new demo organization with id: ${orgId} and slug: ${uniqueSlug}`);
      } catch (error) {
        console.error("Error creating organization:", error);
        // Don't throw, allow to continue
        return; // Exit the function to prevent cascading errors
      }
    }
    
    // If we don't have an organization ID at this point, we can't continue
    if (!orgId) {
      console.log('No organization ID available, skipping further data seeding');
      return;
    }
    
    let adminId;
    try {
      // 2. Create admin user
      const existingAdminResult = await pool.query(
        `SELECT id FROM users 
        WHERE organization_id = $1 AND username = $2
        LIMIT 1`,
        [orgId, 'admin']
      );
      
      if (existingAdminResult.rows && existingAdminResult.rows.length > 0) {
        adminId = Number(existingAdminResult.rows[0].id);
        console.log(`Admin user already exists with ID: ${adminId}`);
      } else {
        const adminUserResult = await pool.query(
          `INSERT INTO users (
            organization_id, email, username, password, 
            first_name, last_name, role, status
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          RETURNING id`,
          [
            orgId, 'admin@example.com', 'admin', 
            '$2b$10$6QVrliX4SMLHt/m.OW5gF.kZL9vHgkAG2rOLXX0FxW9GQI7/2lBFi', 
            'Admin', 'User', 'admin', 'active'
          ]
        );
        
        adminId = adminUserResult.rows && adminUserResult.rows.length > 0 ? Number(adminUserResult.rows[0].id) : null;
        console.log(`Created admin user with ID: ${adminId}`);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      // Continue with other operations
    }
    
    try {
      // 3. Create default account categories
      const accountTypes = [
        { name: 'Assets', type: 'asset', description: 'Resources owned by the business' },
        { name: 'Liabilities', type: 'liability', description: 'Debts and obligations' },
        { name: 'Equity', type: 'equity', description: 'Ownership interest' },
        { name: 'Revenue', type: 'income', description: 'Income from operations' },
        { name: 'Expenses', type: 'expense', description: 'Costs of doing business' }
      ];
      
      for (const account of accountTypes) {
        try {
          await pool.query(
            `INSERT INTO accounts (
              organization_id, name, type, description, status
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (organization_id, name) DO NOTHING`,
            [orgId, account.name, account.type, account.description, 'active']
          );
        } catch (accountError) {
          console.error(`Error creating account ${account.name}:`, accountError);
          // Continue with next account
        }
      }
      console.log('Account categories created or already exist');
    } catch (error) {
      console.error('Error creating account categories:', error);
    }
    
    try {
      // 4. Create transaction categories
      const categories = [
        { name: 'Sales', description: 'Revenue from sales', icon: 'shopping-cart' },
        { name: 'Services', description: 'Revenue from services', icon: 'briefcase' },
        { name: 'Payroll', description: 'Employee salaries and wages', icon: 'users' },
        { name: 'Rent', description: 'Office space and facilities', icon: 'home' },
        { name: 'Utilities', description: 'Electricity, water, and other utilities', icon: 'zap' },
        { name: 'Marketing', description: 'Advertising and promotion', icon: 'trending-up' },
        { name: 'Software', description: 'Software subscriptions and licenses', icon: 'code' },
        { name: 'Office Supplies', description: 'Consumable office materials', icon: 'clipboard' },
        { name: 'Travel', description: 'Business travel expenses', icon: 'map' },
        { name: 'Uncategorized', description: 'Transactions pending categorization', icon: 'help-circle' }
      ];
      
      for (const category of categories) {
        try {
          await pool.query(
            `INSERT INTO categories (
              organization_id, name, description, 
              icon, is_system
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (organization_id, name) DO NOTHING`,
            [orgId, category.name, category.description, category.icon, true]
          );
        } catch (categoryError) {
          console.error(`Error creating category ${category.name}:`, categoryError);
          // Continue with next category
        }
      }
      console.log('Transaction categories created or already exist');
    } catch (error) {
      console.error('Error creating transaction categories:', error);
    }
    
    console.log('Default data seeded successfully');
  } catch (error) {
    console.error('Error in seedDefaultData:', error);
    // Don't throw the error, just log it to allow the application to continue
  }
}