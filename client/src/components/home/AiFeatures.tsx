import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseAiResponse } from '@/lib/ai-helpers';
import { SimpleLineChart } from '@/components/ui/chart';

export default function AiFeatures() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'user',
      message: 'Show me our revenue forecast for Q3 broken down by region'
    },
    {
      sender: 'ai',
      message: "Here's your Q3 revenue forecast by region:",
      data: {
        type: 'chart',
        chartData: [
          { name: 'North America', value: 12, status: 'above' },
          { name: 'EMEA', value: -5, status: 'below' },
          { name: 'APAC', value: 8, status: 'above' },
          { name: 'LATAM', value: 3, status: 'on-track' }
        ],
        insight: 'North America is projected to exceed targets by 12%, while EMEA is 5% below forecast.'
      }
    },
    {
      sender: 'user',
      message: "What's causing the shortfall in EMEA?"
    },
    {
      sender: 'ai',
      message: "Based on the data, three key factors are contributing to the EMEA shortfall:",
      data: {
        type: 'list',
        items: [
          { factor: 'Delayed product launch', impact: -3.2 },
          { factor: 'Increased competitive pressure in UK market', impact: null },
          { factor: 'Currency exchange fluctuations', impact: -1.8 }
        ],
        additionalMessage: "Would you like me to suggest mitigation strategies?"
      }
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to conversation
    setConversation([
      ...conversation,
      { sender: 'user', message: query }
    ]);
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse;
      
      if (query.toLowerCase().includes('mitigation') || query.toLowerCase().includes('strategy')) {
        aiResponse = {
          sender: 'ai',
          message: "Here are some recommended mitigation strategies for EMEA:",
          data: {
            type: 'list',
            items: [
              { strategy: 'Accelerate product launch timeline', impact: '+1.5%' },
              { strategy: 'Increase marketing budget for UK market', impact: '+1.2%' },
              { strategy: 'Implement hedging strategy for EUR/GBP', impact: '+0.8%' }
            ]
          }
        };
      } else if (query.toLowerCase().includes('marketing') || query.toLowerCase().includes('budget')) {
        aiResponse = {
          sender: 'ai',
          message: "Here's the marketing budget breakdown and efficiency:",
          data: {
            type: 'chart',
            chartData: [
              { month: 'Jan', Digital: 120, Traditional: 80 },
              { month: 'Feb', Digital: 140, Traditional: 75 },
              { month: 'Mar', Digital: 160, Traditional: 70 },
              { month: 'Apr', Digital: 180, Traditional: 65 }
            ],
            insight: 'Digital channels are showing 24% higher ROI than traditional channels.'
          }
        };
      } else {
        aiResponse = {
          sender: 'ai',
          message: "I've analyzed your query and found the following insights:",
          data: {
            type: 'insights',
            items: [
              'Q3 overall performance is projected to be 8.2% above target',
              'Customer acquisition cost has decreased by 7.5% year-over-year',
              'Product mix has shifted 12% toward higher-margin offerings'
            ]
          }
        };
      }
      
      setConversation([...conversation, { sender: 'user', message: query }, aiResponse]);
      setQuery('');
    }, 1000);
  };

  return (
    <section id="ai" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block bg-accent-50 text-accent-600 font-semibold px-4 py-1 rounded-full text-sm mb-4">
            AI-Powered
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform planning with AI</h2>
          <p className="text-gray-600 text-lg">
            Ask questions in natural language, automate forecasting, and get strategic recommendations powered by advanced AI.
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="w-full lg:w-1/2 order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-accent-500" />
                </div>
                <h3 className="ml-3 text-xl font-semibold">AI Assistant</h3>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                {conversation.map((item, index) => (
                  <div key={index} className={`flex items-start ${item.sender === 'ai' ? 'justify-end' : ''}`}>
                    <div className={`rounded-lg p-3 max-w-xs sm:max-w-md ${
                      item.sender === 'ai' ? 'bg-accent-50 text-gray-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <p>{item.message}</p>
                      
                      {item.data && item.data.type === 'chart' && (
                        <div className="mt-3 bg-white rounded-lg p-3">
                          <div className="h-40">
                            <SimpleLineChart 
                              data={item.data.chartData} 
                              lines={[
                                { dataKey: 'value' },
                                { dataKey: 'Digital' },
                                { dataKey: 'Traditional' }
                              ]}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{item.data.insight}</p>
                        </div>
                      )}
                      
                      {item.data && item.data.type === 'list' && (
                        <div className="mt-2">
                          <ul className="list-disc pl-5 text-gray-700">
                            {item.data.items.map((listItem, i) => (
                              <li key={i}>
                                {listItem.factor || listItem.strategy} 
                                {listItem.impact && <span className="font-medium"> (impact: {listItem.impact})</span>}
                              </li>
                            ))}
                          </ul>
                          {item.data.additionalMessage && (
                            <p className="mt-2 text-gray-800">{item.data.additionalMessage}</p>
                          )}
                        </div>
                      )}
                      
                      {item.data && item.data.type === 'insights' && (
                        <div className="mt-2">
                          <ul className="list-disc pl-5 text-gray-700">
                            {item.data.items.map((insight, i) => (
                              <li key={i}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about your business data..."
                  className="w-full px-4 py-3 pr-10 rounded-lg"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-accent-500 hover:text-accent-600"
                  variant="ghost"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2 order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4">Ask questions in plain English</h3>
            <p className="text-gray-600 mb-6">
              No more complex queries or waiting for the data team. Just ask natural questions and get instant insights with visualizations.
            </p>
            
            <div className="space-y-6">
              {[
                {
                  title: "Natural language processing",
                  description: "Ask complex business questions in conversational language and get accurate answers."
                },
                {
                  title: "Anomaly detection",
                  description: "AI automatically identifies outliers and potential issues in your data."
                },
                {
                  title: "Predictive forecasting",
                  description: "Generate accurate forecasts based on historical data and market trends."
                },
                {
                  title: "Strategic recommendations",
                  description: "Get AI-powered suggestions for optimizing business performance."
                }
              ].map((feature, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Sparkles(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 3v18M5.636 5.636l12.728 12.728M3 12h18M5.636 18.364l12.728-12.728"/>
    </svg>
  );
}
