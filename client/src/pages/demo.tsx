import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DemoRequestForm from '@/components/forms/DemoRequestForm';
import { CheckCircle, Users, Clock, ChevronRight, Calendar, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';

export default function Demo() {
  const [location] = useLocation();
  
  // Get plan from URL params
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const planParam = searchParams.get('plan');
  const [selectedPlan, setSelectedPlan] = useState(planParam || 'business');
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const benefits = [
    {
      title: "Personalized Demo",
      description: "Get a walkthrough of Pigment tailored to your specific business needs.",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Expert Consultation",
      description: "Speak with our product experts to understand how Pigment can help your business.",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: "Quick Setup",
      description: "Learn how easy it is to get started with Pigment's business planning platform.",
      icon: <Clock className="h-5 w-5" />,
    },
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
                variants={fadeInUp}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Get a personalized demo</h1>
                <p className="text-lg opacity-90 mb-8">
                  See how Pigment can transform your business planning. Schedule a demo with our experts to explore our platform.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-white/20 rounded-full p-1">
                          {benefit.icon}
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold">{benefit.title}</h3>
                        <p className="text-white/80">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full lg:w-1/2 bg-white rounded-xl p-8 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Tabs defaultValue={selectedPlan} onValueChange={setSelectedPlan}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="starter">Starter</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="starter" className="mt-0">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Starter Demo</h3>
                      <p className="text-gray-600">Perfect for small teams getting started with business planning.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="business" className="mt-0">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Business Demo</h3>
                      <p className="text-gray-600">Advanced planning tools for growing organizations.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="enterprise" className="mt-0">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Enterprise Demo</h3>
                      <p className="text-gray-600">Comprehensive solution for large organizations.</p>
                    </div>
                  </TabsContent>
                  
                  <DemoRequestForm />
                </Tabs>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* What to Expect */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What to expect</h2>
              <p className="text-gray-600 text-lg">
                Here's what you can look forward to in your personalized demo session.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <Calendar className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Schedule a Time</h3>
                <p className="text-gray-600 mb-4">
                  After submitting your request, you'll receive a calendar invite to choose a time that works for you.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <Video className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Join the Demo</h3>
                <p className="text-gray-600 mb-4">
                  Our product expert will walk you through the platform, focusing on features relevant to your business.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Next Steps</h3>
                <p className="text-gray-600 mb-4">
                  After the demo, you'll receive a personalized plan to get started with Pigment, including pricing details.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* FAQs */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
              <p className="text-gray-600 text-lg">
                Find answers to common questions about our demo process.
              </p>
            </motion.div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {[
                  {
                    q: "How long does the demo usually last?",
                    a: "Our demos typically last 30-45 minutes, depending on your questions and specific areas of interest."
                  },
                  {
                    q: "Who should attend the demo?",
                    a: "We recommend including decision-makers and team members who will be using the platform, such as financial planners, sales leaders, or operations managers."
                  },
                  {
                    q: "Is there any preparation needed before the demo?",
                    a: "No preparation is required. However, having a list of your current challenges or specific requirements can help us tailor the demo to your needs."
                  },
                  {
                    q: "Will we discuss pricing during the demo?",
                    a: "Yes, our product expert will provide an overview of our pricing plans and can discuss custom pricing options for enterprise needs if applicable."
                  },
                  {
                    q: "Can I get a recording of the demo?",
                    a: "Yes, upon request, we can provide a recording of your demo session for you to share with colleagues who couldn't attend."
                  }
                ].map((faq, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Alternative Contact Options */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              <motion.div 
                className="flex-1 bg-primary-50 p-8 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-bold text-primary-700 mb-4">Need to talk to sales?</h3>
                <p className="text-gray-600 mb-6">
                  Have questions about our platform or pricing? Our sales team is here to help.
                </p>
                <Button className="flex items-center gap-2">
                  Contact sales
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex-1 bg-accent-50 p-8 rounded-xl"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-bold text-accent-700 mb-4">Watch a product video</h3>
                <p className="text-gray-600 mb-6">
                  Not ready for a live demo? Watch our product video to see Pigment in action.
                </p>
                <Button variant="outline" className="flex items-center gap-2">
                  Watch video
                  <Video className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
