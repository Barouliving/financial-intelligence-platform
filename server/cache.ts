import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';
import config from '../client/src/lib/appConfig';

/**
 * LRU Cache for Mistral-7B responses to improve performance and reduce API costs
 * 
 * @remarks
 * This cache is particularly important for Replit environments to:
 * - Reduce cold starts by caching common responses
 * - Minimize API traffic to external services
 * - Improve overall response times
 */
const aiResponseCache = new LRUCache<string, string>({
  // Maximum number of cached responses
  max: config.ai.maxCacheSize,
  
  // Cache validity period (in milliseconds)
  ttl: config.ai.cacheTtl,
  
  // Allow LRU (Least Recently Used) eviction
  allowStale: false,
  
  // Update cache TTL when items are accessed
  updateAgeOnGet: true,
  
  // Optional function to determine size of stored items
  sizeCalculation: (value, key) => {
    // Count approx. bytes for storage accounting
    return key.length + (value ? value.length : 0);
  },
  
  // Maximum cache size in bytes
  maxSize: config.ai.maxCacheSizeBytes,
});

/**
 * Generate a consistent hash for a prompt to use as cache key
 * 
 * @param prompt - The prompt text to hash
 * @returns A hash string representing the prompt
 */
export function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex');
}

/**
 * Retrieve or generate an AI response with caching
 * 
 * @param prompt - The prompt text to send to Mistral
 * @param generateFn - The function that generates a response (usually calls Mistral)
 * @returns The cached or newly generated AI response
 */
export async function cachedInference<T>(
  prompt: string,
  generateFn: (prompt: string) => Promise<T>
): Promise<T> {
  const cacheEnabled = process.env.ENABLE_LRU_CACHE !== 'false';
  
  if (!cacheEnabled) {
    console.log('Cache disabled. Generating fresh response.');
    return generateFn(prompt);
  }
  
  // Generate a hash of the prompt to use as cache key
  const cacheKey = hashPrompt(prompt);
  
  // Check if we have a cached response
  const cachedResponse = aiResponseCache.get(cacheKey);
  
  if (cachedResponse) {
    console.log('Cache hit! Returning cached response.');
    return JSON.parse(cachedResponse) as T;
  }
  
  // Generate a new response
  console.log('Cache miss. Generating fresh response.');
  const freshResponse = await generateFn(prompt);
  
  // Store the new response in the cache
  aiResponseCache.set(cacheKey, JSON.stringify(freshResponse));
  
  return freshResponse;
}

/**
 * Clear the entire Mistral response cache
 */
export function clearCache(): void {
  aiResponseCache.clear();
  console.log('AI response cache cleared');
}

/**
 * Get statistics about the current cache usage
 * 
 * @returns Object containing cache statistics
 */
export function getCacheStats() {
  return {
    size: aiResponseCache.size,
    itemCount: aiResponseCache.size,
    remainingSize: aiResponseCache.calculatedSize ? 
      config.ai.maxCacheSizeBytes - aiResponseCache.calculatedSize : 
      'unknown',
    // LRU cache in newer versions doesn't expose hit rate directly
    hits: aiResponseCache.size > 0 ? 'Available' : 'No cache hits yet',
    maxSize: `${config.ai.maxCacheSizeBytes / (1024 * 1024)} MB`,
    maxItems: config.ai.maxCacheSize
  };
}

export default {
  cachedInference,
  clearCache,
  getCacheStats
};