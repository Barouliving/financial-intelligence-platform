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

    const response = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: temperature,
        top_p: topP,
        return_full_text: false,
      }
    });

    return response.generated_text;
  } catch (error) {
    console.error('Error generating text with Hugging Face:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Creates a business intelligence prompt based on user query
 * 
 * @param query The user's question or query
 * @returns A formatted prompt for the AI model
 */
export function createBusinessPrompt(query: string): string {
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

User query: ${query}

JSON response:`;
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