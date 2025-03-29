import { apiRequest } from "./queryClient";
import { Transaction, Category } from "@shared/schema";
import { findSimilarTransactions, calculateCategoryConfidence, evaluateAnomalyProbability } from "./tfidf-utils";
import config from "./appConfig";

/**
 * Result of AI transaction categorization
 */
export interface CategoryResult {
  /** The suggested category name */
  category: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Whether human review is recommended (confidence below threshold) */
  needsReview: boolean;
  /** Array of similar historical transactions */
  similarTransactions: Transaction[];
  /** Explanation from AI about categorization reasoning */
  explanation: string;
}

/**
 * Result of AI anomaly detection
 */
export interface AnomalyResult {
  /** Whether this transaction is flagged as anomalous */
  isAnomaly: boolean;
  /** Type of anomaly detected */
  type: string;
  /** Anomaly probability score (0-1) */
  probability: number;
  /** Detailed explanation of why this transaction is anomalous */
  explanation: string;
  /** Similar transactions that were used for comparison */
  referenceTransactions?: Transaction[];
}

/**
 * Categorize a transaction using AI with confidence scoring
 * 
 * @param transaction - The transaction to categorize
 * @param history - Array of historical transactions for context
 * @param availableCategories - List of available categories to choose from
 * @returns Promise containing categorization result
 */
export async function categorizeWithConfidence(
  transaction: Transaction,
  history: Transaction[],
  availableCategories: Category[]
): Promise<CategoryResult> {
  try {
    // Find similar historical transactions for context
    const similarTxs = findSimilarTransactions(transaction, history, 5);
    
    // Format similar transactions for AI prompt
    const formattedSimilar = similarTxs.map(match => ({
      description: match.transaction.description,
      amount: match.transaction.amount,
      category: typeof match.transaction.category === 'object' 
        ? match.transaction.category.name 
        : match.transaction.category,
      similarity: match.score.toFixed(2)
    }));
    
    // Build the AI prompt with transaction details and context
    const prompt = {
      query: `Categorize this transaction: "${transaction.description}" with amount ${transaction.amount}`,
      transactionDetails: {
        description: transaction.description,
        amount: transaction.amount,
        reference: transaction.reference,
        date: transaction.date
      },
      similarTransactions: formattedSimilar,
      availableCategories: availableCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || null
      }))
    };
    
    // Call API to get AI suggestion
    const response = await apiRequest('POST', '/api/ai/conversation', prompt);
    const result = await response.json();
    
    if (!result.success || !result.data || !result.data.response) {
      throw new Error('Failed to get AI categorization response');
    }
    
    // Parse JSON response from AI
    const aiResponse = JSON.parse(result.data.response);
    const suggestedCategory = aiResponse.data?.suggestedCategory || aiResponse.data?.category;
    
    if (!suggestedCategory) {
      throw new Error('AI response did not contain a category suggestion');
    }
    
    // Calculate confidence score using TF-IDF similarity
    const confidence = calculateCategoryConfidence(
      transaction, 
      suggestedCategory, 
      history
    );
    
    return {
      category: suggestedCategory,
      confidence,
      needsReview: confidence < config.ai.confidenceThreshold,
      similarTransactions: similarTxs.map(match => match.transaction),
      explanation: aiResponse.data?.reasoning || aiResponse.message || ''
    };
  } catch (error) {
    console.error('Error in AI categorization:', error);
    throw error;
  }
}

/**
 * Detect anomalies in a transaction using AI and TF-IDF similarity
 * 
 * @param transaction - The transaction to analyze
 * @param history - Array of historical transactions for comparison
 * @returns Promise containing anomaly detection result
 */
export async function detectAnomalies(
  transaction: Transaction,
  history: Transaction[]
): Promise<AnomalyResult> {
  try {
    // Find similar historical transactions for comparison
    const similarTxs = findSimilarTransactions(transaction, history, 10);
    
    // Calculate anomaly probability based on TF-IDF similarity scores
    const anomalyProbability = evaluateAnomalyProbability(transaction, history);
    
    // Format transaction data for the AI prompt
    const prompt = {
      query: `Detect anomalies in this transaction: "${transaction.description}" with amount ${transaction.amount}`,
      transactionDetails: {
        description: transaction.description,
        amount: transaction.amount,
        reference: transaction.reference,
        date: transaction.date,
        category: typeof transaction.category === 'object' 
          ? transaction.category.name 
          : transaction.category
      },
      historicalContext: {
        similarTransactionCount: similarTxs.length,
        avgSimilarity: similarTxs.length > 0 
          ? similarTxs.reduce((sum, match) => sum + match.score, 0) / similarTxs.length 
          : 0,
        unusualFactors: anomalyProbability > 0.7 ? 'High anomaly probability detected' : null
      }
    };
    
    // Call API for AI analysis
    const response = await apiRequest('POST', '/api/ai/conversation', prompt);
    const result = await response.json();
    
    if (!result.success || !result.data || !result.data.response) {
      throw new Error('Failed to get AI anomaly detection response');
    }
    
    // Parse AI response
    const aiResponse = JSON.parse(result.data.response);
    
    // Determine if this is an anomaly based on both TF-IDF and AI analysis
    const isAnomaly = 
      (anomalyProbability > 0.75) || // High TF-IDF anomaly score
      (aiResponse.data?.isAnomaly === true) || // AI flagged as anomaly
      (aiResponse.type === 'anomaly'); // Response type is anomaly
    
    return {
      isAnomaly,
      type: aiResponse.data?.anomalyType || aiResponse.data?.type || 'unusual_transaction',
      probability: Math.max(anomalyProbability, aiResponse.data?.probability || 0),
      explanation: aiResponse.data?.explanation || aiResponse.message || '',
      referenceTransactions: similarTxs.map(match => match.transaction)
    };
  } catch (error) {
    console.error('Error in AI anomaly detection:', error);
    throw error;
  }
}

export default {
  categorizeWithConfidence,
  detectAnomalies
};