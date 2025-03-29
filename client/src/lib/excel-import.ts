import * as XLSX from 'xlsx';
import { Transaction } from '@shared/schema';
import { apiRequest } from './queryClient';

/**
 * Excel transaction data structure
 * Represents the expected columns in the Excel template
 */
export interface ExcelTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  reference?: string;
  notes?: string;
  account?: string;
  tags?: string;
}

/**
 * Import result with successful imports and errors
 */
export interface ImportResult {
  successful: Transaction[];
  failed: Array<{
    rowData: ExcelTransaction;
    error: string;
  }>;
  total: number;
}

/**
 * Parse Excel file data into transaction objects
 * 
 * @param file - The Excel file to parse
 * @returns Promise containing the parsed transactions
 */
export const parseExcelFile = async (file: File): Promise<ExcelTransaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON - header: 1 means use first row as headers
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);
        
        // Map raw data to our transaction format
        const transactions: ExcelTransaction[] = rawRows.map((row: any) => {
          // Handle date - could be a string, date object, or serial number
          let date = row.Date || row.date;
          if (date instanceof Date) {
            date = date.toISOString().split('T')[0];
          } else if (typeof date === 'number') {
            // Excel stores dates as serial numbers - convert to JS date
            const excelDateValue = new Date(Math.round((date - 25569) * 86400 * 1000));
            date = excelDateValue.toISOString().split('T')[0];
          } else if (typeof date === 'string') {
            // Try to parse the date string
            try {
              const parsedDate = new Date(date);
              if (!isNaN(parsedDate.getTime())) {
                date = parsedDate.toISOString().split('T')[0];
              }
            } catch (e) {
              // Keep original string if parsing fails
            }
          }
          
          // Determine transaction type based on amount or explicit type column
          let type = row.Type || row.type;
          const amount = Math.abs(Number(row.Amount || row.amount || 0));
          
          if (!type) {
            // Try to infer type if not specified
            const rawAmount = Number(row.Amount || row.amount || 0);
            type = rawAmount < 0 ? 'expense' : 'income';
          }
          
          // Convert tags from comma-separated string to array
          let tags = row.Tags || row.tags;
          if (typeof tags === 'string') {
            tags = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).join(',');
          }
          
          return {
            date,
            description: row.Description || row.description || '',
            amount,
            type: type === 'expense' || type === 'Expense' ? 'expense' : 'income',
            category: row.Category || row.category || '',
            reference: row.Reference || row.reference || '',
            notes: row.Notes || row.notes || '',
            account: row.Account || row.account || '',
            tags: tags || ''
          };
        });
        
        resolve(transactions);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Import transactions from Excel data
 * 
 * @param transactions - Array of transactions from Excel
 * @param organizationId - Organization ID to associate transactions with
 * @returns Promise with import results
 */
export const importTransactions = async (
  transactions: ExcelTransaction[], 
  organizationId: number
): Promise<ImportResult> => {
  const result: ImportResult = {
    successful: [],
    failed: [],
    total: transactions.length
  };
  
  // Process each transaction
  for (const tx of transactions) {
    try {
      // Find or create category if needed
      let categoryId: number | null = null;
      
      if (tx.category) {
        // Check if category exists
        const categoryResponse = await apiRequest('GET', `/api/bookkeeping/categories?name=${encodeURIComponent(tx.category)}`);
        const categoryData = await categoryResponse.json();
        
        if (categoryData.success && categoryData.data.length > 0) {
          // Use existing category
          categoryId = categoryData.data[0].id;
        } else {
          // Create new category
          const newCategoryResponse = await apiRequest('POST', '/api/bookkeeping/categories', {
            name: tx.category,
            organizationId,
            type: tx.type === 'income' ? 'income' : 'expense'
          });
          const newCategoryData = await newCategoryResponse.json();
          
          if (newCategoryData.success) {
            categoryId = newCategoryData.data.id;
          }
        }
      }
      
      // Find or create account if needed
      let accountId: number | null = null;
      
      if (tx.account) {
        // Check if account exists
        const accountResponse = await apiRequest('GET', `/api/bookkeeping/accounts?name=${encodeURIComponent(tx.account)}`);
        const accountData = await accountResponse.json();
        
        if (accountData.success && accountData.data.length > 0) {
          // Use existing account
          accountId = accountData.data[0].id;
        } else {
          // Create new account
          const newAccountResponse = await apiRequest('POST', '/api/bookkeeping/accounts', {
            name: tx.account,
            organizationId,
            type: 'bank' // Default to bank account
          });
          const newAccountData = await newAccountResponse.json();
          
          if (newAccountData.success) {
            accountId = newAccountData.data.id;
          }
        }
      }
      
      // Create transaction
      const response = await apiRequest('POST', '/api/bookkeeping/transactions', {
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        categoryId,
        accountId,
        reference: tx.reference || '',
        notes: tx.notes || '',
        tags: tx.tags ? tx.tags.split(',').map(tag => tag.trim()) : [],
        organizationId,
        status: 'completed'
      });
      
      const data = await response.json();
      
      if (data.success) {
        result.successful.push(data.data);
      } else {
        result.failed.push({
          rowData: tx,
          error: data.error || 'Failed to create transaction'
        });
      }
    } catch (error) {
      result.failed.push({
        rowData: tx,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return result;
};

/**
 * Generate Excel template file for transactions
 * 
 * @returns Blob containing Excel template
 */
export const generateExcelTemplate = (): Blob => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Date', 'Description', 'Amount', 'Type', 'Category', 'Reference', 'Account', 'Notes', 'Tags'],
    ['2025-03-28', 'Sample Income', '1000', 'income', 'Sales', 'INV-001', 'Business Checking', 'Monthly revenue', 'income,sales'],
    ['2025-03-29', 'Sample Expense', '500', 'expense', 'Office Supplies', 'RECEIPT-001', 'Business Credit Card', 'Printer cartridges', 'office,supplies']
  ]);
  
  // Set column widths
  const wscols = [
    { wch: 12 }, // Date
    { wch: 30 }, // Description
    { wch: 10 }, // Amount
    { wch: 10 }, // Type
    { wch: 15 }, // Category
    { wch: 15 }, // Reference
    { wch: 20 }, // Account
    { wch: 30 }, // Notes
    { wch: 20 }  // Tags
  ];
  
  worksheet['!cols'] = wscols;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  // Generate Excel file
  const excelData = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  
  return new Blob([excelData as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export default {
  parseExcelFile,
  importTransactions,
  generateExcelTemplate
};