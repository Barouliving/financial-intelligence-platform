import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'attached_assets', 'SAAS_Transactions_March_Complete.xlsx');

try {
  // Read the Excel file
  const workbook = xlsx.readFile(filePath);
  
  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Print the headers (first row)
  console.log('Headers:');
  console.log(data[0]);
  
  // Print sample data (first 3 rows)
  console.log('\nSample data (first 3 rows):');
  for (let i = 1; i <= 3 && i < data.length; i++) {
    console.log(data[i]);
  }
  
  console.log(`\nTotal rows: ${data.length - 1}`); // Minus 1 for header row
} catch (error) {
  console.error('Error reading Excel file:', error);
}