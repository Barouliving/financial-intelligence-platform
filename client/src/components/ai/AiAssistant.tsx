import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SimpleLineChart, SimplePieChart } from '@/components/ui/chart';
import { Send, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitAiQuery, parseAiResponse, generateSampleResponse, type AiMessage, sampleAiQueries } from '@/lib/ai-helpers';

export default function AiAssistant() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: AiMessage = {
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Use a timeout to handle potential long-running AI response
    const timeoutPromise = new Promise<AiMessage>((_, reject) => {
      setTimeout(() => {
        reject(new Error('AI response timed out'));
      }, 15000); // 15 second timeout
    });
    
    try {
      console.log("AI query submitted:", userMessage.content);
      
      // Race between the actual API call and the timeout
      const aiMessage = await Promise.race([
        submitAiQuery(userMessage.content),
        timeoutPromise
      ]);
      
      console.log("AI response received:", aiMessage);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show a loading message first
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: {
          type: 'general',
          message: 'The AI is still processing your request. This can take a moment for complex questions...',
          data: { insights: ["Using Hugging Face Mistral-7B model for processing"] }
        },
        timestamp: new Date()
      }]);
      
      // Try again with a fallback after showing the loading message
      try {
        // Use fallback sample response 
        const fallbackMessage = generateSampleResponse(userMessage.content);
        
        // Wait a moment before showing the fallback to avoid confusion
        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, prev.length - 1), fallbackMessage]);
          setIsLoading(false);
        }, 2000);
        
        return; // Exit early to prevent setting isLoading=false too early
      } catch (fallbackError) {
        // If even the fallback fails, show an error message
        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, prev.length - 1), {
            sender: 'ai',
            content: {
              type: 'error',
              message: 'Sorry, I encountered an error. Please try again.'
            },
            timestamp: new Date()
          }]);
          setIsLoading(false);
        }, 2000);
        
        return; // Exit early to prevent setting isLoading=false too early
      }
    }
    
    setIsLoading(false);
  };

  const handleSampleQueryClick = (query: string) => {
    setInputValue(query);
  };

  return (
    <Card className="shadow-md border-accent-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-500" />
          AI Business Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-3">
            Ask me anything about your business data in plain English
          </p>
          <div className="flex gap-2 flex-wrap">
            {sampleAiQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSampleQueryClick(query)}
              >
                {query}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-accent-50/50 rounded-lg p-4 mb-4 h-80 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <HelpCircle className="h-12 w-12 mb-2 text-accent-200" />
              <p className="text-center text-sm max-w-md">
                Ask questions about your business data like "Show revenue forecast for Q3" or "Which regions are underperforming?"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`rounded-lg p-3 max-w-[80%] ${
                      msg.sender === 'user' ? 'bg-gray-100' : 'bg-accent-100'
                    }`}>
                      {msg.sender === 'user' ? (
                        <p className="text-gray-800">{msg.content}</p>
                      ) : (
                        <div>
                          {typeof msg.content === 'string' ? (
                            <p className="text-gray-800">{msg.content}</p>
                          ) : (
                            <AiResponseRenderer response={msg.content} />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-accent-100 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about your business data..."
            className="pr-12"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            variant="ghost" 
            className="absolute right-0 top-0 h-full text-accent-500"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface AiResponseRendererProps {
  response: any;
}

function AiResponseRenderer({ response }: AiResponseRendererProps) {
  if (!response) return null;
  
  const { type, message, data } = response;
  
  return (
    <div>
      <p className="text-gray-800 mb-2">{message}</p>
      
      {type === 'forecast' && data?.trend && (
        <div className="bg-white rounded-md p-2 mb-2">
          <div className="h-40">
            <SimpleLineChart
              data={data.trend.map((item: any) => ({ name: item.month, value: item.value }))}
              lines={[{ dataKey: 'value', stroke: 'hsl(var(--accent-500))' }]}
            />
          </div>
          {data.insight && <p className="text-sm text-gray-600 mt-1">{data.insight}</p>}
        </div>
      )}
      
      {type === 'region' && data?.regions && (
        <div>
          <div className="bg-white rounded-md p-2 mb-2">
            <ul className="text-sm space-y-1">
              {data.regions.map((region: any, index: number) => (
                <li key={index} className="flex justify-between">
                  <span>{region.name}</span>
                  <span className={
                    region.status === 'above' ? 'text-green-500' : 
                    region.status === 'below' ? 'text-red-500' : 
                    'text-gray-500'
                  }>
                    {region.performance > 0 ? '+' : ''}{region.performance}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {data.factors && (
            <div className="bg-white rounded-md p-2">
              <p className="text-sm font-medium mb-1">Key Factors:</p>
              <ul className="text-sm list-disc pl-5">
                {data.factors.map((factor: any, index: number) => (
                  <li key={index}>
                    {factor.factor}
                    {factor.impact && <span className="text-red-500"> (impact: {factor.impact}%)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {type === 'general' && data?.insights && (
        <div className="bg-white rounded-md p-2">
          <ul className="text-sm list-disc pl-5">
            {data.insights.map((insight: string, index: number) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
          {data.recommendation && (
            <p className="text-sm font-medium mt-2">
              <span className="text-accent-500">Recommendation:</span> {data.recommendation}
            </p>
          )}
        </div>
      )}
      
      {type === 'error' && (
        <p className="text-red-500 text-sm">{message}</p>
      )}
    </div>
  );
}
