import xlsx from 'xlsx';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Excel file
const filePath = path.join(__dirname, 'attached_assets', 'SAAS_Transactions_March_Complete.xlsx');

// Organization ID (from the demo organization that gets created on database init)
const organizationId = 1;

async function apiRequest(method, endpoint, body = null) {
  const url = `http://localhost:5000${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  return response.json();
}

// Helper function to find or create categories
async function findOrCreateCategory(categoryName, type) {
  // Check if category exists
  const categoryResponse = await apiRequest('GET', '/api/bookkeeping/categories');
  const categoryData = categoryResponse.data || [];
  
  const existingCategory = categoryData.find(
    cat => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  
  if (existingCategory) {
    return existingCategory.id;
  }
  
  // Create new category
  console.log(`Creating new category: ${categoryName} (${type})`);
  const newCategoryResponse = await apiRequest('POST', '/api/bookkeeping/categories', {
    name: categoryName,
    organizationId,
    type: type === 'income' ? 'income' : 'expense'
  });
  
  if (newCategoryResponse.success) {
    return newCategoryResponse.data.id;
  }
  
  throw new Error(`Failed to create category ${categoryName}: ${newCategoryResponse.error || 'Unknown error'}`);
}

// Helper function to find or create accounts
async function findOrCreateAccount(accountName) {
  // Check if account exists
  const accountResponse = await apiRequest('GET', '/api/bookkeeping/accounts');
  const accountData = accountResponse.data || [];
  
  const existingAccount = accountData.find(
    acc => acc.name.toLowerCase() === accountName.toLowerCase()
  );
  
  if (existingAccount) {
    return existingAccount.id;
  }
  
  // Create new account
  console.log(`Creating new account: ${accountName}`);
  const newAccountResponse = await apiRequest('POST', '/api/bookkeeping/accounts', {
    name: accountName,
    organizationId,
    type: 'asset', // Asset account type for bank accounts
    description: `Created from Excel import`,
    balance: "0"
  });
  
  if (newAccountResponse.success) {
    return newAccountResponse.data.id;
  }
  
  throw new Error(`Failed to create account ${accountName}: ${newAccountResponse.error || 'Unknown error'}`);
}

// Get default expense account
async function getDefaultExpenseAccount() {
  // Check for existing Expenses account
  const expensesResponse = await apiRequest('GET', '/api/bookkeeping/accounts');
  const accountData = expensesResponse.data || [];
  
  const expensesAccount = accountData.find(
    acc => acc.name.toLowerCase() === 'expenses'
  );
  
  if (expensesAccount) {
    return expensesAccount.id;
  }
  
  // Create default expenses account
  console.log('Creating default Expenses account');
  const newExpenseResponse = await apiRequest('POST', '/api/bookkeeping/accounts', {
    name: 'Expenses',
    organizationId,
    type: 'expense',
    description: 'General expenses account',
    balance: "0"
  });
  
  if (newExpenseResponse.success) {
    return newExpenseResponse.data.id;
  }
  
  throw new Error(`Failed to create default Expenses account: ${newExpenseResponse.error || 'Unknown error'}`);
}

// Get default income account
async function getDefaultIncomeAccount() {
  // Check for existing Income account
  const incomeResponse = await apiRequest('GET', '/api/bookkeeping/accounts');
  const accountData = incomeResponse.data || [];
  
  const incomeAccount = accountData.find(
    acc => acc.name.toLowerCase() === 'income'
  );
  
  if (incomeAccount) {
    return incomeAccount.id;
  }
  
  // Create default income account
  console.log('Creating default Income account');
  const newIncomeResponse = await apiRequest('POST', '/api/bookkeeping/accounts', {
    name: 'Income',
    organizationId,
    type: 'revenue',
    description: 'General income account',
    balance: "0"
  });
  
  if (newIncomeResponse.success) {
    return newIncomeResponse.data.id;
  }
  
  throw new Error(`Failed to create default Income account: ${newIncomeResponse.error || 'Unknown error'}`);
}

// Import transactions from Excel
async function importTransactions() {
  try {
    // First reset the database to ensure clean state
    console.log('Resetting database...');
    await apiRequest('POST', '/api/system/reset-database');
    console.log('Database reset complete');
    
    // Read the Excel file
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const transactions = xlsx.utils.sheet_to_json(sheet);
    console.log(`Found ${transactions.length} transactions in Excel file`);
    
    // Get default accounts
    const defaultExpenseAccount = await getDefaultExpenseAccount();
    const defaultIncomeAccount = await getDefaultIncomeAccount();
    
    // Process each transaction
    const importResults = {
      successful: [],
      failed: []
    };
    
    for (const tx of transactions) {
      try {
        // Find or create category
        let categoryId = null;
        if (tx.Category) {
          categoryId = await findOrCreateCategory(tx.Category, tx.Type);
        }
        
        // Find or create account
        let accountId = null;
        if (tx.Account) {
          accountId = await findOrCreateAccount(tx.Account);
        }
        
        // Determine debit and credit accounts based on transaction type
        let debitAccountId, creditAccountId;
        
        if (tx.Type === 'expense') {
          // For expenses: debit expenses account, credit cash/bank account
          debitAccountId = defaultExpenseAccount;
          creditAccountId = accountId || await findOrCreateAccount('Cash'); // Default to Cash if no account
        } else {
          // For income: debit cash/bank account, credit income account
          debitAccountId = accountId || await findOrCreateAccount('Cash'); // Default to Cash if no account
          creditAccountId = defaultIncomeAccount;
        }
        
        // Format date as ISO string
        const txDate = new Date(tx.Date);
        const formattedDate = txDate.toISOString();
        
        // Add region tags for better dashboard visualization
        const regionsMap = {
          'North America': ['subscription', 'monthly', 'service'],
          'Europe': ['software', 'license', 'tools'],
          'Asia Pacific': ['cloud', 'hosting', 'data'],
          'Latin America': ['consulting', 'freelancer', 'service'],
          'Middle East & Africa': ['marketing', 'ads', 'campaign']
        };
        
        // Generate region tag based on description keywords
        let regionTag = null;
        const lowerDesc = tx.Description.toLowerCase();
        for (const [region, keywords] of Object.entries(regionsMap)) {
          if (keywords.some(keyword => lowerDesc.includes(keyword.toLowerCase()))) {
            regionTag = region;
            break;
          }
        }
        
        // Use default region if none matched
        if (!regionTag) {
          const regions = Object.keys(regionsMap);
          regionTag = regions[Math.floor(Math.random() * regions.length)];
        }
        
        // Format tags if present and add region tag
        let tags = tx.Tags ? tx.Tags.split(',').map(tag => tag.trim()) : [];
        if (regionTag && !tags.includes(regionTag)) {
          tags.push(regionTag);
        }
        
        // Create transaction
        const txData = {
          date: formattedDate,
          description: tx.Description,
          amount: String(tx.Amount), // Convert to string for API
          type: tx.Type,
          categoryId: categoryId,
          debitAccountId,
          creditAccountId,
          reference: tx.Reference || '',
          metadata: tx.Notes ? { notes: tx.Notes } : {},
          tags,
          organizationId,
          status: 'completed'
        };
        
        console.log(`Creating transaction: ${tx.Description} ($${tx.Amount})`);
        const response = await apiRequest('POST', '/api/bookkeeping/transactions', txData);
        
        if (response.success) {
          importResults.successful.push(response.data);
          console.log(`Transaction created successfully: ID ${response.data.id}`);
        } else {
          importResults.failed.push({
            data: tx,
            error: response.error || 'Unknown error'
          });
          console.error(`Failed to create transaction: ${response.error}`);
        }
      } catch (error) {
        importResults.failed.push({
          data: tx,
          error: error.message
        });
        console.error(`Error processing transaction: ${error.message}`);
      }
    }
    
    // Print import results
    console.log('\nImport complete!');
    console.log(`Successfully imported: ${importResults.successful.length}`);
    console.log(`Failed imports: ${importResults.failed.length}`);
    
    if (importResults.failed.length > 0) {
      console.log('\nFailed transactions:');
      importResults.failed.forEach((fail, index) => {
        console.log(`${index + 1}. ${fail.data.Description}: ${fail.error}`);
      });
    }
    
    return importResults;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Execute the import
importTransactions()
  .then(results => {
    console.log('Import process completed');
  })
  .catch(error => {
    console.error('Import process failed:', error);
  });