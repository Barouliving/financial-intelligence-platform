import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlanProps {
  name: string;
  description: string;
  price: string;
  period?: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonLink: string;
  index: number;
}

const PricingPlan = ({
  name,
  description,
  price,
  period = "/user/month",
  features,
  popular = false,
  buttonText,
  buttonLink,
  index
}: PricingPlanProps) => {
  return (
    <motion.div 
      className={`bg-white rounded-xl overflow-hidden ${popular ? 'shadow-md relative transform scale-105' : 'shadow-sm hover:shadow-md transition-shadow'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {popular && (
        <div className="absolute top-0 inset-x-0 bg-primary-500 text-white text-center text-sm py-1 font-medium">
          MOST POPULAR
        </div>
      )}
      <div className={`p-8 ${popular ? 'pt-12' : ''}`}>
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-gray-600">{period}</span>}
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-600">{feature.name}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={popular ? "default" : "outline"}
          className="w-full"
          asChild
        >
          <a href={buttonLink}>{buttonText}</a>
        </Button>
      </div>
    </motion.div>
  );
};

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started with business planning.",
      price: "$29",
      features: [
        { name: "Up to 10 users", included: true },
        { name: "Basic forecasting", included: true },
        { name: "5 dashboards", included: true },
        { name: "Standard support", included: true }
      ],
      buttonText: "Get started",
      buttonLink: "/demo?plan=starter",
      popular: false
    },
    {
      name: "Business",
      description: "Advanced planning tools for growing organizations.",
      price: "$79",
      features: [
        { name: "Up to 50 users", included: true },
        { name: "Advanced forecasting", included: true },
        { name: "Unlimited dashboards", included: true },
        { name: "Basic AI features", included: true },
        { name: "Priority support", included: true }
      ],
      buttonText: "Get started",
      buttonLink: "/demo?plan=business",
      popular: true
    },
    {
      name: "Enterprise",
      description: "Comprehensive solution for large organizations.",
      price: "Custom",
      period: "",
      features: [
        { name: "Unlimited users", included: true },
        { name: "All AI features", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated support", included: true },
        { name: "Enterprise SLA", included: true }
      ],
      buttonText: "Contact sales",
      buttonLink: "/demo?plan=enterprise",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose the right plan for your team</h2>
          <p className="text-gray-600 text-lg">
            Flexible pricing options designed to scale with your business needs.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingPlan
              key={plan.name}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              popular={plan.popular}
              buttonText={plan.buttonText}
              buttonLink={plan.buttonLink}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
