import { db } from './db';
import { users, organizations, documents, aiConversations, accounts, categories, transactions, anomalies, reports, demoRequests } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function resetDatabase() {
  console.log('Resetting database completely...');
  
  try {
    // Use SQL to bypass foreign key constraints temporarily
    await db.execute(sql`SET CONSTRAINTS ALL DEFERRED`);
    
    // Drop all data from tables in reverse order of dependencies
    await db.delete(anomalies);
    await db.delete(transactions);
    await db.delete(reports);
    await db.delete(accounts);
    await db.delete(categories);
    await db.delete(aiConversations);
    await db.delete(documents);
    await db.delete(demoRequests);
    await db.delete(users);
    await db.delete(organizations);
    
    // Reset sequences
    await db.execute(sql`ALTER SEQUENCE IF EXISTS anomalies_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS transactions_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS reports_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS accounts_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS ai_conversations_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS documents_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS demo_requests_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS organizations_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1`);
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    // Reset constraints mode
    await db.execute(sql`SET CONSTRAINTS ALL IMMEDIATE`);
  }
}