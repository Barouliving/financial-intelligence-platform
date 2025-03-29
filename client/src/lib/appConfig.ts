/**
 * Application Configuration
 * Centralizes configurable settings for the application
 */
const config = {
  /**
   * API-related configuration
   */
  api: {
    /**
     * Base URL for API requests
     */
    baseUrl: '/api',
    
    /**
     * Default timeout for API requests in milliseconds
     */
    timeout: 30000,
    
    /**
     * Maximum retries for failed API requests
     */
    maxRetries: 3
  },
  
  /**
   * AI-related configuration
   */
  ai: {
    /**
     * Default model to use for AI features
     */
    model: 'mistralai/Mistral-7B-v0.1',
    
    /**
     * Confidence threshold (0-1) below which AI suggestions
     * should be flagged for human review
     */
    confidenceThreshold: 0.7,
    
    /**
     * Maximum number of similar transactions to return
     * in AI analysis
     */
    maxSimilarTransactions: 5,
    
    /**
     * Timeout for AI requests in milliseconds
     */
    requestTimeout: 25000,
    
    /**
     * Cache duration for AI responses in seconds
     */
    cacheDuration: 3600,

    /**
     * Maximum cache size in items
     */
    maxCacheSize: 100,

    /**
     * Maximum cache size in bytes (10 MB)
     */
    maxCacheSizeBytes: 10 * 1024 * 1024,

    /**
     * Cache TTL in milliseconds
     */
    cacheTtl: 3600 * 1000
  },
  
  /**
   * Authentication-related configuration
   */
  auth: {
    /**
     * Token expiration time in seconds
     */
    tokenExpiration: 86400,
    
    /**
     * Whether to use secure cookies
     */
    secureCookies: process.env.NODE_ENV === 'production'
  },
  
  /**
   * UI-related configuration
   */
  ui: {
    /**
     * Default theme (light, dark, or system)
     */
    defaultTheme: 'system',
    
    /**
     * Default items per page
     */
    pageSize: 20,
    
    /**
     * Animation speed in milliseconds
     */
    animationSpeed: 300,
    
    /**
     * Global toast notification duration in milliseconds
     */
    toastDuration: 5000
  },
  
  /**
   * Date formatting settings
   */
  dates: {
    /**
     * Default date format for display
     */
    defaultFormat: 'MMM d, yyyy',
    
    /**
     * Default date-time format for display
     */
    defaultDateTimeFormat: 'MMM d, yyyy h:mm a',
    
    /**
     * Default fiscal year start month (1 = January)
     */
    fiscalYearStartMonth: 1
  }
};

export default config;