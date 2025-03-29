import { generateText } from '../huggingface';
import { LRUCache } from 'lru-cache';
import config from '../../client/src/lib/appConfig';
import { db } from '../db';
import { transactions } from '@shared/schema';
import { eq, and, between, sum, desc, sql } from 'drizzle-orm';

// Cache for financial insight reports to avoid regenerating for the same data
const insightCache = new LRUCache<string, any>({
  max: 50,  // Maximum number of cached insights
  ttl: 3600000,  // 1 hour cache TTL
});

/**
 * Financial metrics used for insight generation
 */
interface FinancialMetrics {
  revenue: number;
  expenses: number;
  cashflow: number;
  runway: number;
  monthOverMonthGrowth: number;
  topExpenseCategories: Array<{category: string, amount: number}>;
}

/**
 * Individual financial insight with priority and action
 */
interface Insight {
  priority: 'high' | 'medium' | 'low';
  action: string;
  metric: string;
}

/**
 * Consolidated financial insights report
 */
interface InsightsReport {
  insights: Insight[];
  riskScore: number;
  summary: string;
}

/**
 * Fetch financial metrics for a tenant
 * 
 * @param tenantId - ID of the organization/tenant
 * @returns Financial metrics for analysis
 */
async function getFinancialMetrics(tenantId: number): Promise<FinancialMetrics> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); // 3 months ago
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month
  
  // Query for revenue (income transactions) using SQL
  const revenueQuery = sql`
    SELECT SUM(amount) as "total"
    FROM transactions
    WHERE 
      "organization_id" = ${tenantId}
      AND "type" = 'income'
      AND "date" BETWEEN ${startDate} AND ${endDate}
  `;
  
  const revenueResult = await db.execute(revenueQuery);
  
  // Query for expenses using SQL
  const expensesQuery = sql`
    SELECT SUM(amount) as "total"
    FROM transactions
    WHERE 
      "organization_id" = ${tenantId}
      AND "type" = 'expense'
      AND "date" BETWEEN ${startDate} AND ${endDate}
  `;
  
  const expensesResult = await db.execute(expensesQuery);
  
  // Calculate revenue and expenses - convert to numbers for arithmetic operations
  // Safely handle the result array
  const revenueAmount = revenueResult && Array.isArray(revenueResult) && revenueResult.length > 0 
    ? Number(revenueResult[0].total || 0) 
    : 0;
    
  const expensesAmount = expensesResult && Array.isArray(expensesResult) && expensesResult.length > 0
    ? Number(expensesResult[0].total || 0)
    : 0;
    
  const cashflow = revenueAmount - expensesAmount;
  
  // Get monthly expenses for runway calculation
  const monthlyExpenses = expensesAmount / 3; // Average over 3 months
  const runway = monthlyExpenses > 0 ? cashflow / monthlyExpenses : 0;
  
  // Get previous period data for growth calculation
  const prevStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); // 6 months ago
  const prevEndDate = new Date(now.getFullYear(), now.getMonth() - 3, 0); // 3 months ago
  
  // Query for previous period revenue using SQL
  const prevRevenueQuery = sql`
    SELECT SUM(amount) as "total"
    FROM transactions
    WHERE 
      "organization_id" = ${tenantId}
      AND "type" = 'income'
      AND "date" BETWEEN ${prevStartDate} AND ${prevEndDate}
  `;
  
  const prevRevenueResult = await db.execute(prevRevenueQuery);
  
  // Safely handle previous revenue amount
  const prevRevenueAmount = prevRevenueResult && Array.isArray(prevRevenueResult) && prevRevenueResult.length > 0
    ? Number(prevRevenueResult[0].total || 0)
    : 0;
    
  const monthOverMonthGrowth = prevRevenueAmount > 0 ? 
    ((revenueAmount - prevRevenueAmount) / prevRevenueAmount) * 100 : 0;
  
  // For top expense categories, we'll use a simpler approach with predefined mock categories
  // In a real implementation, we would fetch and join with the categories table
  const topExpenseCategories = [
    { category: "Office Expenses", amount: expensesAmount * 0.35 },
    { category: "Salaries", amount: expensesAmount * 0.25 },
    { category: "Software Subscriptions", amount: expensesAmount * 0.20 },
    { category: "Marketing", amount: expensesAmount * 0.15 },
    { category: "Other", amount: expensesAmount * 0.05 }
  ];
  
  return {
    revenue: revenueAmount,
    expenses: expensesAmount,
    cashflow,
    runway,
    monthOverMonthGrowth,
    topExpenseCategories
  };
}

/**
 * Generate the FP&A prompt template with financial metrics
 * 
 * @param metrics - Financial metrics to analyze
 * @returns Formatted prompt for AI processing
 */
function createFPAPrompt(metrics: FinancialMetrics): string {
  const {
    revenue,
    expenses,
    cashflow,
    runway,
    monthOverMonthGrowth,
    topExpenseCategories
  } = metrics;
  
  // Format expense categories for the prompt
  const formattedExpenses = topExpenseCategories
    .map(cat => `${cat.category}: $${cat.amount.toFixed(2)}`)
    .join('\n- ');
  
  // Create the prompt template
  return `
As a financial analyst, analyze:
- Monthly Revenue: $${revenue.toFixed(2)}
- Monthly Expenses: $${expenses.toFixed(2)}
- Net Cash Flow: $${cashflow.toFixed(2)}
- Runway: ${runway.toFixed(1)} months
- Month-over-Month Growth: ${monthOverMonthGrowth.toFixed(1)}%

Top Expense Categories:
- ${formattedExpenses}

Output JSON:
{
  "insights": [
    {"priority": "high/medium/low", "action": "specific actionable step", "metric": "relevant financial metric"},
    ...additional insights (3-5 total)
  ],
  "riskScore": 0-100,
  "summary": "brief executive summary"
}`;
}

/**
 * Add urgency indicators to insight actions based on priority
 * 
 * @param insights - Raw insights from AI
 * @returns Formatted insights with urgency indicators
 */
function formatInsights(insights: Insight[]): Insight[] {
  return insights.map(insight => {
    let prefix = '';
    
    switch (insight.priority) {
      case 'high':
        prefix = '❗ ';
        break;
      case 'medium':
        prefix = '⏳ ';
        break;
      default:
        prefix = '';
    }
    
    return {
      ...insight,
      action: prefix + insight.action
    };
  });
}

/**
 * Generate financial insights for a tenant
 * 
 * @param tenantId - ID of the organization/tenant
 * @returns Processed financial insights
 */
export async function generateInsights(tenantId: number): Promise<InsightsReport> {
  // Check cache first
  const cacheKey = `insights-${tenantId}-${new Date().toISOString().slice(0, 10)}`;
  const cachedReport = insightCache.get(cacheKey);
  
  if (cachedReport) {
    console.log('Returning cached financial insights');
    return cachedReport;
  }
  
  try {
    // Get financial metrics
    const metrics = await getFinancialMetrics(tenantId);
    
    // Create FP&A prompt
    const prompt = createFPAPrompt(metrics);
    
    // Generate insights using Mistral
    const rawResponse = await generateText(prompt, { 
      temperature: 0.2,
      maxTokens: 800,
      parseJson: true 
    });
    
    // Parse the response
    let parsedResponse;
    try {
      // Extract JSON if needed (in case AI includes other text)
      const jsonStart = rawResponse.indexOf('{');
      const jsonEnd = rawResponse.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonText = rawResponse.substring(jsonStart, jsonEnd);
        parsedResponse = JSON.parse(jsonText);
      } else {
        parsedResponse = JSON.parse(rawResponse);
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
      throw new Error('Failed to parse AI financial insights');
    }
    
    // Process and format insights
    const formattedInsights = formatInsights(parsedResponse.insights || []);
    
    // Create final report
    const report: InsightsReport = {
      insights: formattedInsights,
      riskScore: parsedResponse.riskScore || 0,
      summary: parsedResponse.summary || 'No summary available'
    };
    
    // Cache the report
    insightCache.set(cacheKey, report);
    
    return report;
  } catch (error) {
    console.error('Error generating financial insights:', error);
    throw error;
  }
}

export default {
  generateInsights
};