import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client with API token
const hf = new HfInference(process.env.HF_API_TOKEN);

// Default model to use (Mistral-7B)
const DEFAULT_MODEL = 'mistralai/Mistral-7B-v0.1';

interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  model?: string;
}

/**
 * Generate text using Hugging Face's text generation models
 * 
 * @param prompt The input prompt for text generation
 * @param options Configuration options for generation
 * @returns The generated text response
 */
export async function generateText(
  prompt: string, 
  options: GenerationOptions = {}
): Promise<string> {
  try {
    const {
      maxTokens = 512,
      temperature = 0.7,
      topP = 0.95,
      model = DEFAULT_MODEL,
    } = options;

    console.log(`Generating text using model: ${model}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // Create a timeout promise that rejects after 25 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request to Hugging Face API timed out after 25 seconds'));
      }, 25000);
    });
    
    // Race between the HF request and the timeout
    const response = await Promise.race([
      hf.textGeneration({
        model: model,
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          top_p: topP,
          return_full_text: false,
        }
      }),
      timeoutPromise
    ]);

    console.log(`Generated response length: ${response.generated_text.length} characters`);
    return response.generated_text;
  } catch (error) {
    console.error('Error generating text with Hugging Face:', error);
    if (error.message?.includes('timed out')) {
      throw new Error('The AI model took too long to respond. Please try a simpler query.');
    } else if (error.message?.includes('401')) {
      throw new Error('Authentication error with AI provider. Please check your API token.');
    } else if (error.message?.includes('429')) {
      throw new Error('Too many requests to the AI service. Please try again in a moment.');
    } else {
      throw new Error('Failed to generate AI response: ' + (error.message || 'Unknown error'));
    }
  }
}

/**
 * Creates a business intelligence prompt based on user query
 * 
 * @param query The user's question or query
 * @returns A formatted prompt for the AI model
 */
export function createBusinessPrompt(query: string): string {
  const lowercaseQuery = query.toLowerCase();
  
  // Check if the query is related to bookkeeping
  if (lowercaseQuery.includes('transaction') || 
      lowercaseQuery.includes('categoriz') || 
      lowercaseQuery.includes('anomal') || 
      lowercaseQuery.includes('expense') || 
      lowercaseQuery.includes('tax') || 
      lowercaseQuery.includes('cash flow') || 
      lowercaseQuery.includes('bookkeep') ||
      lowercaseQuery.includes('account') ||
      lowercaseQuery.includes('reconcil') ||
      lowercaseQuery.includes('audit') ||
      lowercaseQuery.includes('financial')) {
    
    return `You are an AI bookkeeping assistant for Pigment, a business planning and financial management platform.
You have access to company transaction data, accounts, categories, and financial reports.
Analyze the following query related to bookkeeping or financial management and provide a detailed, accurate response.

Format your response as a JSON object with the following structure:
{
  "type": "anomaly" | "categorization" | "tax" | "cashflow" | "financial_health" | "general",
  "message": "A short summary message",
  "data": {
    // Response-specific structured data that includes:
    // For anomalies: detected unusual transactions with reasoning
    // For categorization: transaction categories with amounts and percentages
    // For tax analysis: deduction categories, eligibility, and insights
    // For cash flow: current position data, trends, and recommendations
    // For financial health: key ratios, performance metrics, and insights
    // For general: insights array with financial observations
  }
}

Today's date is March 28, 2025.

User query: ${query}

JSON response:`;
  } else {
    // Default business intelligence prompt
    return `You are an AI business intelligence assistant for Pigment, a business planning platform.
Analyze the following query and provide a detailed, data-driven response with business insights.
If the query relates to financial forecasting, revenue, or regional performance, include specific numbers and trends.
Format your response as a JSON object with the following structure:
{
  "type": "forecast" | "region" | "general",
  "message": "A short summary message",
  "data": {
    // For forecasts include 'trend' array with month/value pairs and 'insight' string
    // For regions include 'regions' array with region performance data
    // For general include 'insights' array with bullet points
  }
}

Today's date is March 28, 2025.

User query: ${query}

JSON response:`;
  }
}

/**
 * Process a user query about business data using Hugging Face
 * 
 * @param query The user's business query
 * @returns Structured JSON response with business insights
 */
export async function processBusinessQuery(query: string): Promise<string> {
  try {
    const prompt = createBusinessPrompt(query);
    const rawResponse = await generateText(prompt, {
      maxTokens: 800,
      temperature: 0.3, // Lower temperature for more focused, analytical responses
    });

    // Extract JSON response
    let jsonResponse = rawResponse.trim();
    
    // Try to extract JSON if the response isn't cleanly formatted
    try {
      // Find the first { and last } to extract just the JSON portion
      const startIndex = jsonResponse.indexOf('{');
      const endIndex = jsonResponse.lastIndexOf('}') + 1;
      
      if (startIndex >= 0 && endIndex > startIndex) {
        jsonResponse = jsonResponse.substring(startIndex, endIndex);
      }
      
      // Validate by parsing
      JSON.parse(jsonResponse);
      return jsonResponse;
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      
      // Fallback to a default response structure
      return JSON.stringify({
        type: 'general',
        message: 'Here are some insights based on your query:',
        data: {
          insights: [
            rawResponse.substring(0, 200) + (rawResponse.length > 200 ? '...' : '')
          ]
        }
      });
    }
  } catch (error) {
    console.error('Error processing business query:', error);
    throw error;
  }
}