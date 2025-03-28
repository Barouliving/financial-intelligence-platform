import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Check, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'wouter';

export default function Pricing() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started with business planning.",
      price: "$29",
      period: "/user/month",
      features: [
        { name: "Up to 10 users", included: true },
        { name: "Basic forecasting", included: true },
        { name: "5 dashboards", included: true },
        { name: "Standard support", included: true },
        { name: "Basic data visualization", included: true },
        { name: "1 data source integration", included: true },
        { name: "Email support", included: true },
        { name: "Limited AI features", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Custom integrations", included: false },
      ],
      buttonText: "Get started",
      buttonLink: "/demo?plan=starter",
      popular: false,
      highlightColor: "bg-primary-100",
      textColor: "text-primary-500"
    },
    {
      name: "Business",
      description: "Advanced planning tools for growing organizations.",
      price: "$79",
      period: "/user/month",
      features: [
        { name: "Up to 50 users", included: true },
        { name: "Advanced forecasting", included: true },
        { name: "Unlimited dashboards", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced data visualization", included: true },
        { name: "5 data source integrations", included: true },
        { name: "Phone & email support", included: true },
        { name: "Basic AI features", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Limited custom integrations", included: true },
      ],
      buttonText: "Get started",
      buttonLink: "/demo?plan=business",
      popular: true,
      highlightColor: "bg-primary-100",
      textColor: "text-primary-500"
    },
    {
      name: "Enterprise",
      description: "Comprehensive solution for large organizations.",
      price: "Custom",
      period: "",
      features: [
        { name: "Unlimited users", included: true },
        { name: "Advanced forecasting", included: true },
        { name: "Unlimited dashboards", included: true },
        { name: "Dedicated support", included: true },
        { name: "Advanced data visualization", included: true },
        { name: "Unlimited data source integrations", included: true },
        { name: "24/7 phone & email support", included: true },
        { name: "Full AI features", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom integrations", included: true },
      ],
      buttonText: "Contact sales",
      buttonLink: "/demo?plan=enterprise",
      popular: false,
      highlightColor: "bg-accent-100",
      textColor: "text-accent-500"
    }
  ];

  const faqs = [
    {
      question: "How does the pricing work?",
      answer: "Pricing is based on a per-user, per-month model. We offer annual billing with a discount or monthly billing for more flexibility. Enterprise plans are custom-priced based on your specific needs."
    },
    {
      question: "Can I change plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, changes will take effect at the end of your current billing cycle."
    },
    {
      question: "Is there a free trial available?",
      answer: "We offer a 14-day free trial on our Business plan so you can experience the full power of Pigment before making a commitment. No credit card is required to start your trial."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) as well as ACH transfers for annual plans. Enterprise customers can also pay via invoice."
    },
    {
      question: "Are there any setup or implementation fees?",
      answer: "There are no setup fees for Starter or Business plans. Enterprise plans may include implementation and onboarding services that are quoted separately based on your specific needs."
    },
    {
      question: "Do you offer discounts for non-profits or educational institutions?",
      answer: "Yes, we offer special pricing for qualified non-profit organizations and educational institutions. Please contact our sales team for more information."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeIn}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h1>
              <p className="text-lg opacity-90 mb-8">
                Choose the plan that fits your business needs. All plans include core business planning features.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Pricing Tables */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div 
                  key={plan.name}
                  className={`bg-white rounded-xl overflow-hidden ${plan.popular ? 'shadow-md relative transform scale-105' : 'shadow-sm hover:shadow-md transition-shadow'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-primary-500 text-white text-center text-sm py-1 font-medium">
                      MOST POPULAR
                    </div>
                  )}
                  <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-gray-600">{plan.period}</span>}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <span className={`${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.buttonLink}>
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className="w-full"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                All plans include core planning features, security, and regular updates.
                <br />
                Need a custom solution? <Link href="/demo"><a className="text-primary-500 font-medium">Contact our sales team</a></Link>.
              </p>
            </div>
          </div>
        </section>
        
        {/* Feature Comparison Table */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare features</h2>
              <p className="text-gray-600 text-lg">
                Find the plan that includes all the features you need.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Feature</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold">Starter</th>
                      <th className="px-6 py-4 text-center text-primary-600 font-semibold">Business</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Users</td>
                      <td className="px-6 py-4 text-center text-gray-600">Up to 10</td>
                      <td className="px-6 py-4 text-center text-gray-600">Up to 50</td>
                      <td className="px-6 py-4 text-center text-gray-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Dashboards</td>
                      <td className="px-6 py-4 text-center text-gray-600">5</td>
                      <td className="px-6 py-4 text-center text-gray-600">Unlimited</td>
                      <td className="px-6 py-4 text-center text-gray-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Data Visualization</td>
                      <td className="px-6 py-4 text-center text-gray-600">Basic</td>
                      <td className="px-6 py-4 text-center text-gray-600">Advanced</td>
                      <td className="px-6 py-4 text-center text-gray-600">Advanced</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Forecasting</td>
                      <td className="px-6 py-4 text-center text-gray-600">Basic</td>
                      <td className="px-6 py-4 text-center text-gray-600">Advanced</td>
                      <td className="px-6 py-4 text-center text-gray-600">Advanced</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">AI Features</td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">Basic</td>
                      <td className="px-6 py-4 text-center text-gray-600">Full</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Data Sources</td>
                      <td className="px-6 py-4 text-center text-gray-600">1</td>
                      <td className="px-6 py-4 text-center text-gray-600">5</td>
                      <td className="px-6 py-4 text-center text-gray-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Support</td>
                      <td className="px-6 py-4 text-center text-gray-600">Email</td>
                      <td className="px-6 py-4 text-center text-gray-600">Phone & Email</td>
                      <td className="px-6 py-4 text-center text-gray-600">Dedicated</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-700 font-medium">Custom Integrations</td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">Limited</td>
                      <td className="px-6 py-4 text-center text-gray-600">Full</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* FAQs */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
              <p className="text-gray-600 text-lg">
                Find answers to common questions about our pricing and plans.
              </p>
            </motion.div>
            
            <motion.div 
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-lg font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-12 lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-bold mb-4">Need help choosing a plan?</h2>
                  <p className="opacity-90 mb-6">
                    Our team is ready to help you find the perfect plan for your business needs. Schedule a consultation with our experts.
                  </p>
                  <Link href="/demo">
                    <Button size="lg" variant="secondary" className="font-semibold">
                      Talk to sales
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <div className="lg:w-1/2 bg-white/10 p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-start mb-6">
                    <HelpCircle className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Not sure which plan is right for you?</h3>
                      <p className="opacity-90">We can help you evaluate your needs and recommend the best solution.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <HelpCircle className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Need custom features or enterprise integrations?</h3>
                      <p className="opacity-90">Our Enterprise plan can be customized to your specific requirements.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
