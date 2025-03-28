import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Sparkles, Users, Copy, Wallet,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  colorClass: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, href, colorClass, index }: FeatureCardProps) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={href}>
        <a className={`text-primary-500 font-medium hover:text-primary-600 inline-flex items-center`}>
          Learn more
          <ChevronRight className="h-4 w-4 ml-1" />
        </a>
      </Link>
    </motion.div>
  );
};

export default function Features() {
  const features = [
    {
      icon: <BarChart3 className="h-6 w-6 text-primary-500" />,
      title: "Financial Planning",
      description: "Create detailed budgets, forecasts, and financial models with ease. Connect all your data sources for real-time insights.",
      href: "/product/financial-planning",
      colorClass: "bg-primary-100",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-secondary-500" />,
      title: "Sales Forecasting",
      description: "Predict future sales with precision using historical data, market trends, and AI-driven insights.",
      href: "/product/sales-forecasting",
      colorClass: "bg-secondary-100",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-accent-500" />,
      title: "AI-Powered Insights",
      description: "Leverage advanced machine learning to uncover hidden patterns, predict outcomes, and recommend strategic actions.",
      href: "/ai",
      colorClass: "bg-accent-100",
    },
    {
      icon: <Users className="h-6 w-6 text-primary-500" />,
      title: "Team Collaboration",
      description: "Break down silos with real-time collaboration. Share plans, comments, and insights across departments.",
      href: "/product/collaboration",
      colorClass: "bg-primary-100",
    },
    {
      icon: <Copy className="h-6 w-6 text-secondary-500" />,
      title: "Scenario Planning",
      description: "Model different business scenarios to prepare for various market conditions and make informed decisions.",
      href: "/product/scenario-planning",
      colorClass: "bg-secondary-100",
    },
    {
      icon: <Wallet className="h-6 w-6 text-accent-500" />,
      title: "Resource Allocation",
      description: "Optimize your budget allocation across teams, projects, and initiatives to maximize ROI.",
      href: "/product/resource-allocation",
      colorClass: "bg-accent-100",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">All-in-one business planning platform</h2>
          <p className="text-gray-600 text-lg">
            From finance and sales to HR and marketing, empower your teams with powerful tools to plan, analyze, and collaborate.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              href={feature.href}
              colorClass={feature.colorClass}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
