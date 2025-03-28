import { runMigrations } from "../server/migrations";

// Run migrations when this script is executed directly
async function main() {
  console.log("Starting database migration...");
  
  try {
    await runMigrations();
    console.log("Database migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  }
}

// Only run the migration if this script is executed directly
if (require.main === module) {
  main();
}