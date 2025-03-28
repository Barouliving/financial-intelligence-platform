import { motion } from 'framer-motion';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  ChartPie, BarChart, LineChart, Users, Lock, 
  BarChart3, Database, Presentation, Clock, 
  CreditCard, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleLineChart, SimpleBarChart } from '@/components/ui/chart';

export default function Product() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const features = [
    {
      title: "Financial Planning",
      description: "Connect all your financial data sources for real-time insights and forecasting.",
      icon: <CreditCard className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Sales Forecasting",
      description: "Predict future sales with precision using historical data and AI-driven insights.",
      icon: <LineChart className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Resource Allocation",
      description: "Optimize your budget allocation across teams and projects to maximize ROI.",
      icon: <BarChart3 className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Scenario Planning",
      description: "Model different business scenarios to prepare for various market conditions.",
      icon: <ChartPie className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Team Collaboration",
      description: "Break down silos with real-time collaboration across departments.",
      icon: <Users className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Data Integration",
      description: "Connect with your existing tools and data sources for a unified view.",
      icon: <Database className="h-6 w-6 text-primary-500" />,
    },
  ];

  const integrations = [
    "Salesforce", "QuickBooks", "HubSpot", "Microsoft Dynamics", 
    "SAP", "NetSuite", "Workday", "Slack", "Google Workspace"
  ];

  const chartData = [
    { name: 'Jan', Actual: 4.2, Target: 4.0, Previous: 3.8 },
    { name: 'Feb', Actual: 4.5, Target: 4.2, Previous: 4.0 },
    { name: 'Mar', Actual: 4.8, Target: 4.4, Previous: 4.2 },
    { name: 'Apr', Actual: 5.1, Target: 4.6, Previous: 4.4 },
    { name: 'May', Actual: 5.4, Target: 4.8, Previous: 4.6 },
    { name: 'Jun', Actual: 5.7, Target: 5.0, Previous: 4.8 }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="w-full lg:w-1/2"
                initial="hidden"
                animate="show"
                variants={fadeIn}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful business planning platform</h1>
                <p className="text-lg opacity-90 mb-8">
                  From finance and sales to HR and marketing, empower your teams with powerful tools to plan, analyze, and collaborate.
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
                className="w-full lg:w-1/2 bg-white rounded-lg p-4 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="h-64">
                  <SimpleLineChart 
                    data={chartData} 
                    lines={[
                      { dataKey: 'Actual', stroke: 'hsl(var(--chart-1))' },
                      { dataKey: 'Target', stroke: 'hsl(var(--chart-4))', strokeWidth: 1.5 },
                      { dataKey: 'Previous', stroke: 'hsl(var(--chart-5))', strokeWidth: 1 }
                    ]}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Key Features */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Features designed for every team</h2>
              <p className="text-gray-600 text-lg">
                Powerful tools to help your organization plan, analyze, and make better decisions.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Platform Overview */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
                  <div className="p-2 bg-gray-100 border-b border-gray-200 rounded-t-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="ml-4 text-gray-700 font-medium">Sales Performance</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 font-medium">REVENUE</div>
                        <div className="text-xl font-bold">$5.7M</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 font-medium">GROWTH</div>
                        <div className="text-xl font-bold">+14.2%</div>
                      </div>
                    </div>
                    <div className="h-48">
                      <SimpleBarChart 
                        data={chartData} 
                        bars={[
                          { dataKey: 'Actual', fill: 'hsl(var(--chart-1))' },
                          { dataKey: 'Target', fill: 'hsl(var(--chart-5))' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">All your planning in one place</h2>
                <p className="text-gray-600 mb-6">
                  Pigment brings together your data, teams, and analytics into a unified platform, 
                  making it easy to plan, analyze, and make decisions.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <Presentation className="h-4 w-4 text-primary-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-semibold">Beautiful visualizations</h4>
                      <p className="text-gray-600">Create stunning charts and dashboards to visualize your data.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-semibold">Real-time updates</h4>
                      <p className="text-gray-600">See changes instantly as your team collaborates on plans.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-primary-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-semibold">Enterprise-grade security</h4>
                      <p className="text-gray-600">Your data is protected with the highest security standards.</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/demo">
                  <Button className="flex items-center gap-2">
                    Schedule a demo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Integrations */}
        <section id="integrations" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect with your favorite tools</h2>
              <p className="text-gray-600 text-lg">
                Pigment integrates with your existing tools to provide a seamless experience.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {integrations.map((integration, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Database className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="font-medium">{integration}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-primary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your planning?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join innovative companies using Pigment to make better business decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    Get a demo
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                    View pricing
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
