import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Sparkles, Brain, MessageSquare, LineChart, Zap, 
  ChevronRight, BarChart, PieChart, Lightbulb, ArrowRight,
  Wand2, Database, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimpleLineChart } from '@/components/ui/chart';
import AiAssistant from '@/components/ai/AiAssistant';
import AiCacheManager from '@/components/ai/AiCacheManager';
import { Link } from 'wouter';

export default function AI() {
  const [aiQuery, setAiQuery] = useState('');
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const aiCapabilities = [
    {
      title: "Natural Language Processing",
      description: "Ask business questions in plain English and get instant insights from your data.",
      icon: <MessageSquare className="h-6 w-6 text-accent-500" />,
    },
    {
      title: "Anomaly Detection",
      description: "Automatically identify outliers and patterns that humans might miss.",
      icon: <Lightbulb className="h-6 w-6 text-accent-500" />,
    },
    {
      title: "Predictive Analytics",
      description: "Forecast future trends based on historical data and market conditions.",
      icon: <LineChart className="h-6 w-6 text-accent-500" />,
    },
    {
      title: "Automated Reporting",
      description: "Generate comprehensive reports in seconds with natural language summaries.",
      icon: <BarChart className="h-6 w-6 text-accent-500" />,
    },
    {
      title: "Strategic Recommendations",
      description: "Get AI-powered suggestions to optimize business performance.",
      icon: <Wand2 className="h-6 w-6 text-accent-500" />,
    },
    {
      title: "Real-time Analysis",
      description: "Process large datasets instantly for immediate decision-making.",
      icon: <Zap className="h-6 w-6 text-accent-500" />,
    },
  ];

  const demoData = [
    { month: 'Jan', value: 4.2 },
    { month: 'Feb', value: 4.5 },
    { month: 'Mar', value: 4.8 },
    { month: 'Apr', value: 5.1 },
    { month: 'May', value: 5.4 },
    { month: 'Jun', value: 5.7 }
  ];

  const mockAiConversation = [
    { role: 'user', content: "What's our revenue forecast for Q3?" },
    { role: 'ai', content: 'Based on the current data and market trends, your Q3 revenue is projected to be $5.7M, which is 8.5% above target. North America is the strongest region at 12% above forecasts, while EMEA is currently 5% below target.' },
    { role: 'user', content: 'Why is EMEA underperforming?' },
    { role: 'ai', content: 'The main factors affecting EMEA performance are:\n\n1. Delayed product launch (impact: -3.2%)\n2. Increased competitive pressure in UK market\n3. Currency exchange fluctuations (-1.8%)\n\nRecommended action: Consider accelerating the product launch timeline and implementing a hedging strategy for EUR/GBP.' }
  ];

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the query to the AI API
    console.log('AI query submitted:', aiQuery);
    setAiQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-accent-500 to-primary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="w-full lg:w-1/2"
                initial="hidden"
                animate="show"
                variants={fadeInUp}
              >
                <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-1 text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Powered Business Planning
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Transform your planning with AI</h1>
                <p className="text-lg opacity-90 mb-8">
                  Harness the power of artificial intelligence to gain insights, automate tasks, and make data-driven decisions faster than ever before.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/demo">
                    <Button size="lg" variant="secondary" className="font-semibold">
                      Get started
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                      View demo
                    </Button>
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-xl p-6 shadow-xl text-gray-800">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-accent-500" />
                    </div>
                    <h3 className="ml-3 text-xl font-semibold">AI Business Assistant</h3>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                    {mockAiConversation.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`rounded-lg p-3 max-w-xs sm:max-w-md ${
                          message.role === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-accent-100 text-gray-800'
                        }`}>
                          <p className="whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <form onSubmit={handleDemoSubmit} className="relative">
                    <Input
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask anything about your business data..."
                      className="pr-12"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      variant="ghost" 
                      className="absolute right-0 top-0 h-full text-accent-500"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* AI Capabilities Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-powered business intelligence</h2>
              <p className="text-gray-600 text-lg">
                Our advanced AI capabilities help you uncover insights, automate workflows, and make better decisions.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {aiCapabilities.map((capability, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  variants={fadeInUp}
                >
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                    {capability.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{capability.title}</h3>
                  <p className="text-gray-600 mb-4">{capability.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* AI Demo Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Natural language business intelligence</h2>
                <p className="text-gray-600 mb-6">
                  Ask questions in plain English and get instant insights. No more complex queries or waiting for the data team.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-500 font-semibold">1</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Ask a question</span> in natural language like "What's our revenue forecast for Q3?"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-500 font-semibold">2</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Get instant insights</span> with visualization and supporting details
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-500 font-semibold">3</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Ask follow-up questions</span> to drill deeper into the data
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link href="/dashboard">
                  <Button className="flex items-center gap-2">
                    Try the demo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="shadow-md border-accent-200">
                  <CardContent className="p-6">
                    <Tabs defaultValue="query" className="w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value="query" className="flex-1">Query</TabsTrigger>
                        <TabsTrigger value="visualization" className="flex-1">Visualization</TabsTrigger>
                        <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="query" className="mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="font-semibold mb-2">User Query:</p>
                          <p className="bg-white p-3 rounded border border-gray-200">
                            "What's our revenue trend for the last 6 months and the forecast for next quarter?"
                          </p>
                        </div>
                        
                        <div className="bg-accent-50 p-4 rounded-lg">
                          <p className="font-semibold mb-2">AI Response:</p>
                          <p className="mb-3">Here's the revenue trend for the past 6 months:</p>
                          <div className="bg-white p-3 rounded border border-gray-200 h-40 mb-3">
                            <SimpleLineChart 
                              data={demoData.map(d => ({ name: d.month, Revenue: d.value }))} 
                              lines={[{ dataKey: 'Revenue', stroke: 'hsl(var(--accent-500))' }]}
                            />
                          </div>
                          <p>Based on this trend, Q3 revenue is forecast at $6.9M, which is 8.5% above target. North America is driving the strongest growth at 12% above forecast.</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="visualization" className="mt-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 h-64">
                          <SimpleLineChart 
                            data={[
                              ...demoData.map(d => ({ name: d.month, Actual: d.value })),
                              { name: 'Jul', Forecast: 6.0 },
                              { name: 'Aug', Forecast: 6.3 },
                              { name: 'Sep', Forecast: 6.6 }
                            ]} 
                            lines={[
                              { dataKey: 'Actual', stroke: 'hsl(var(--chart-1))' },
                              { dataKey: 'Forecast', stroke: 'hsl(var(--accent-500))', strokeWidth: 1.5, connectNulls: true }
                            ]}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="insights" className="mt-4">
                        <div className="bg-accent-50 p-4 rounded-lg">
                          <p className="font-semibold mb-3">AI-Generated Insights:</p>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Lightbulb className="h-3 w-3 text-accent-500" />
                              </div>
                              <p className="ml-2 text-gray-700">Revenue is growing at a consistent rate of 7.2% month-over-month</p>
                            </li>
                            <li className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Lightbulb className="h-3 w-3 text-accent-500" />
                              </div>
                              <p className="ml-2 text-gray-700">Q3 forecast exceeds the annual target by 8.5%</p>
                            </li>
                            <li className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Lightbulb className="h-3 w-3 text-accent-500" />
                              </div>
                              <p className="ml-2 text-gray-700">North America is the strongest region, while EMEA is underperforming</p>
                            </li>
                            <li className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Lightbulb className="h-3 w-3 text-accent-500" />
                              </div>
                              <p className="ml-2 text-gray-700">New product line is contributing 23% to overall growth</p>
                            </li>
                          </ul>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Live AI Assistant Demo */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Try our AI assistant</h2>
              <p className="text-gray-600 text-lg">
                Experience the power of our AI business assistant with this interactive demo.
              </p>
            </motion.div>
            
            <AiAssistant />
          </div>
        </section>
        
        {/* AI Cache Management Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">AI Cache Management</h2>
              <p className="text-gray-600 text-lg">
                Optimize AI performance and response times with our intelligent caching system.
              </p>
            </motion.div>
            
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AiCacheManager />
              </motion.div>
              
              <motion.div 
                className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3">Benefits of AI Response Caching</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Zap className="h-5 w-5 text-accent-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 text-sm">Faster response times for common queries</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Database className="h-5 w-5 text-accent-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 text-sm">Reduced API costs and bandwidth usage</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <RefreshCw className="h-5 w-5 text-accent-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 text-sm">Efficient handling of repeated AI requests</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Brain className="h-5 w-5 text-accent-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700 text-sm">Enhanced AI model performance</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-accent-500 to-primary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to enhance your business with AI?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Get started with Pigment today and transform how you plan, analyze, and make decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    Request a demo
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                    Try AI assistant
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
