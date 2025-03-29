import fetch from 'node-fetch';

// Try the ISO 8601 format directly as a string
const dateStr = '2025-03-29T00:00:00.000Z';

// Create transaction using proper format
async function createTransaction() {
  const transactionData = {
    organizationId: 1, 
    description: "Test transaction",
    amount: "100", 
    type: "expense",
    date: dateStr, // ISO string format
    debitAccountId: 3,
    creditAccountId: 2,
    reference: "TEST-001", 
    status: "completed",
    tags: ["test", "expense"]
  };

  try {
    console.log('Sending data:', JSON.stringify(transactionData, null, 2));
    const response = await fetch('http://localhost:5000/api/bookkeeping/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

createTransaction();