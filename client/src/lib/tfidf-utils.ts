import { TfIdf, PorterStemmer, WordTokenizer } from 'natural';
import { Transaction } from '@shared/schema';
import config from './appConfig';

/**
 * Represents a document in TF-IDF calculations with its source transaction
 */
interface TransactionDocument {
  /** The raw text content for TF-IDF analysis */
  text: string;
  /** The source transaction */
  transaction: Transaction;
}

/**
 * Represents a similarity match between transactions
 */
export interface SimilarityMatch {
  /** The matched transaction */
  transaction: Transaction;
  /** Similarity score (0-1) */
  score: number;
}

/**
 * Creates a normalized text representation of a transaction for TF-IDF processing
 * 
 * @param transaction - The transaction to process
 * @returns A string representation of the transaction
 */
export function transactionToText(transaction: Transaction): string {
  // Combine relevant fields into a single string for TF-IDF analysis
  const textParts = [
    transaction.description || '',
    transaction.reference || '',
    transaction.tags?.join(' ') || '',
  ];
  
  // Add category name if available
  if (transaction.category) {
    textParts.push(typeof transaction.category === 'object' ? 
      transaction.category.name : String(transaction.category));
  }
  
  // Combine and normalize text (lowercase, remove extra whitespace)
  return textParts
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find similar transactions using TF-IDF algorithm
 * 
 * @param targetTransaction - The transaction to find similarities for
 * @param transactionHistory - Array of historical transactions to compare against
 * @param maxResults - Maximum number of similar transactions to return
 * @returns Array of similarity matches with scores
 */
export function findSimilarTransactions(
  targetTransaction: Transaction,
  transactionHistory: Transaction[],
  maxResults: number = config.ai.maxSimilarTransactions
): SimilarityMatch[] {
  // Create corpus of transaction documents
  const documents: TransactionDocument[] = transactionHistory.map(tx => ({
    text: transactionToText(tx),
    transaction: tx
  }));
  
  // Add our target transaction to the corpus
  const targetText = transactionToText(targetTransaction);
  documents.push({
    text: targetText,
    transaction: targetTransaction
  });
  
  // Initialize TF-IDF with natural library
  const tfidf = new TfIdf();
  
  // Add all documents to the corpus
  documents.forEach(doc => {
    tfidf.addDocument(doc.text);
  });
  
  // The target is the last document we added
  const targetIndex = documents.length - 1;
  
  // Get similarity scores for all documents compared to the target
  const results: SimilarityMatch[] = [];
  
  // Calculate similarities with target document
  tfidf.tfidfs(targetText, (docIndex, similarity) => {
    // Skip the target document itself
    if (docIndex !== targetIndex && docIndex < documents.length) {
      results.push({
        transaction: documents[docIndex].transaction,
        score: similarity > 0 ? Math.min(similarity / 10, 1) : 0 // Normalize score to 0-1 range
      });
    }
  });
  
  // Sort by similarity score (highest first) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Find the most similar historical transaction
 * 
 * @param transaction - The transaction to find similarities for
 * @param history - Array of historical transactions to compare against
 * @returns Most similar transaction and similarity score or null if no match found
 */
export function findMostSimilarTransaction(
  transaction: Transaction,
  history: Transaction[]
): SimilarityMatch | null {
  const similar = findSimilarTransactions(transaction, history, 1);
  return similar.length > 0 ? similar[0] : null;
}

/**
 * Calculate confidence score for an AI-suggested category based on TF-IDF similarity
 * 
 * @param transaction - The transaction to evaluate
 * @param suggestedCategory - The category suggested by AI
 * @param history - Array of historical transactions for comparison
 * @returns Confidence score between 0 and 1
 */
export function calculateCategoryConfidence(
  transaction: Transaction,
  suggestedCategory: string,
  history: Transaction[]
): number {
  // Find similar transactions
  const similarTransactions = findSimilarTransactions(transaction, history, 5);
  
  if (similarTransactions.length === 0) {
    return 0.5; // No historical data for comparison, medium confidence
  }
  
  // Count how many similar transactions have the same category
  const matchingCategoryCount = similarTransactions.filter(match => {
    const categoryName = typeof match.transaction.category === 'object' 
      ? match.transaction.category.name 
      : String(match.transaction.category);
    
    return categoryName === suggestedCategory;
  }).length;
  
  // Weight by similarity scores
  const totalScore = similarTransactions.reduce((sum, match) => sum + match.score, 0);
  
  if (totalScore === 0) {
    return 0.5; // No meaningful similarity, medium confidence
  }
  
  const categoryMatchScore = similarTransactions
    .filter(match => {
      const categoryName = typeof match.transaction.category === 'object' 
        ? match.transaction.category.name 
        : String(match.transaction.category);
      
      return categoryName === suggestedCategory;
    })
    .reduce((sum, match) => sum + match.score, 0);
  
  // Calculate weighted confidence
  const baseConfidence = categoryMatchScore / totalScore;
  
  // Adjust confidence based on number of similar transactions (more data = more reliable)
  const dataFactorAdjustment = Math.min(similarTransactions.length / 10, 0.5);
  
  return Math.min(baseConfidence + dataFactorAdjustment, 1.0);
}

/**
 * Evaluate transaction anomaly probability using TF-IDF
 * 
 * @param transaction - The transaction to evaluate
 * @param history - Array of historical transactions for comparison
 * @returns Confidence score between 0 and 1 (higher = more likely to be anomalous)
 */
export function evaluateAnomalyProbability(
  transaction: Transaction,
  history: Transaction[]
): number {
  // Find similar transactions - low similarity could indicate anomaly
  const similarTransactions = findSimilarTransactions(transaction, history, 5);
  
  if (similarTransactions.length === 0) {
    return 0.8; // No similar transactions found - likely anomalous
  }
  
  // Calculate highest similarity score
  const maxSimilarity = Math.max(...similarTransactions.map(match => match.score));
  
  // Invert similarity to get anomaly probability (high similarity = low anomaly)
  return 1 - maxSimilarity;
}

export default {
  findSimilarTransactions,
  findMostSimilarTransaction,
  calculateCategoryConfidence,
  evaluateAnomalyProbability,
  transactionToText
};