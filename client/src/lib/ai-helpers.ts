import { apiRequest } from "./queryClient";

// Interface for AI conversation message
export interface AiMessage {
  sender: 'user' | 'ai';
  content: string | any;
  timestamp: Date;
}

// Interface for parsed AI response
export interface ParsedAiResponse {
  type: 'forecast' | 'region' | 'general';
  message: string;
  data: any;
}

// Function to submit a query to the AI API
export async function submitAiQuery(query: string): Promise<AiMessage> {
  try {
    const response = await apiRequest('POST', '/api/ai/conversation', { query });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get AI response');
    }
    
    const aiResponse = JSON.parse(data.data.response);
    
    return {
      sender: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error submitting AI query:', error);
    throw error;
  }
}

// Function to parse AI responses
export function parseAiResponse(responseStr: string): ParsedAiResponse {
  try {
    if (typeof responseStr === 'string') {
      return JSON.parse(responseStr);
    }
    return responseStr;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      type: 'general',
      message: 'Sorry, I encountered an error processing your request.',
      data: { error: true }
    };
  }
}

// Sample AI conversation starter messages
export const sampleAiQueries = [
  "Show me our revenue forecast for Q3",
  "What regions are underperforming?",
  "Analyze our marketing spend efficiency",
  "Compare this quarter to last year",
  "What's our projected growth rate?"
];

// Generate AI response for demo purposes
export function generateSampleResponse(query: string): AiMessage {
  const response = {
    type: 'general',
    message: "Here's what I found in your data:",
    data: {
      insights: [
        "Your Q3 targets are on track to exceed by 7%",
        "Marketing spend efficiency has improved by 12% YoY",
        "Customer acquisition cost has decreased by 8.5%"
      ]
    }
  };

  if (query.toLowerCase().includes('revenue') || query.toLowerCase().includes('forecast')) {
    response.type = 'forecast';
    response.message = "Here's your revenue forecast:";
    response.data = {
      trend: [
        { month: 'Jan', value: 4.2 },
        { month: 'Feb', value: 4.5 },
        { month: 'Mar', value: 4.8 },
        { month: 'Apr', value: 5.1 },
        { month: 'May', value: 5.4 },
        { month: 'Jun', value: 5.7 }
      ],
      insight: "Revenue is projected to grow by 8.5% quarter-over-quarter."
    };
  }

  if (query.toLowerCase().includes('region') || query.toLowerCase().includes('area')) {
    response.type = 'region';
    response.message = "Here's the regional breakdown:";
    response.data = {
      regions: [
        { name: 'North America', performance: 12, status: 'above' },
        { name: 'EMEA', performance: -5, status: 'below' },
        { name: 'APAC', performance: 8, status: 'above' },
        { name: 'LATAM', performance: 3, status: 'on-track' }
      ]
    };
  }

  return {
    sender: 'ai',
    content: response,
    timestamp: new Date()
  };
}
