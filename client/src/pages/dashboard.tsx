import { useState } from 'react';
import { motion } from 'framer-motion';
import Dashboard from '@/components/dashboard/Dashboard';
import AiAssistant from '@/components/ai/AiAssistant';
import { Button } from '@/components/ui/button';
import { Sparkles, LayoutDashboard, ChevronRight, Users, BarChart } from 'lucide-react';
import { Link } from 'wouter';

export default function DashboardPage() {
  const [showIntro, setShowIntro] = useState(true);
  
  const handleGetStarted = () => {
    setShowIntro(false);
  };
  
  if (!showIntro) {
    return <Dashboard />;
  }
  
  return (
    <div>
      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Interactive Dashboard Demo</h1>
                <p className="text-lg opacity-90 mb-8">
                  Experience the power of Pigment's business planning platform with our interactive dashboard demo. Explore financial data, visualizations, and AI-powered insights.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="font-semibold"
                  onClick={handleGetStarted}
                >
                  Launch Dashboard Demo
                </Button>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white/10 p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <LayoutDashboard className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-semibold mb-1">Interactive Dashboards</h3>
                      <p className="text-sm opacity-80">Explore financial data visualizations and metrics</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <Sparkles className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-semibold mb-1">AI Assistant</h3>
                      <p className="text-sm opacity-80">Ask questions and get instant insights</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <BarChart className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-semibold mb-1">Data Visualization</h3>
                      <p className="text-sm opacity-80">Interactive charts and forecasting tools</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <Users className="h-8 w-8 mb-2" />
                      <h3 className="text-lg font-semibold mb-1">Collaboration</h3>
                      <p className="text-sm opacity-80">Tools for team planning and analysis</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What you can do in the demo</h2>
              <p className="text-gray-600 text-lg">
                Our interactive demo showcases the key features of Pigment's platform.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <LayoutDashboard className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Explore Financial Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Navigate through the financial dashboard to see revenue forecasts, expenses, and key metrics.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-500 flex items-center gap-1"
                  onClick={handleGetStarted}
                >
                  Try it
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-accent-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Use AI Assistant</h3>
                <p className="text-gray-600 mb-4">
                  Ask questions about the data in natural language and get instant, AI-powered insights.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-accent-500 flex items-center gap-1"
                  onClick={handleGetStarted}
                >
                  Try it
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                  <BarChart className="h-6 w-6 text-secondary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">View Interactive Charts</h3>
                <p className="text-gray-600 mb-4">
                  Interact with charts to visualize revenue trends, regional breakdowns, and forecasts.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-secondary-500 flex items-center gap-1"
                  onClick={handleGetStarted}
                >
                  Try it
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Try our AI business assistant</h2>
                <p className="text-gray-600 mb-6">
                  Experience the power of our AI business assistant. Ask questions in plain English and get instant insights.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-accent-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">"What's our revenue forecast for Q3?"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-accent-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">"Why is EMEA underperforming?"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-accent-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">"Compare our performance to last year"</p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleGetStarted} className="flex items-center gap-2">
                  Try AI Assistant
                  <Sparkles className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AiAssistant />
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to explore?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Launch the interactive dashboard demo to experience the full power of Pigment's business planning platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="font-semibold"
                  onClick={handleGetStarted}
                >
                  Launch Dashboard
                </Button>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                    Request a demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
