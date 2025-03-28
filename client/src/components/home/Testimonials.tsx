import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
  index: number;
}

const Testimonial = ({ quote, name, title, index }: TestimonialProps) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="mb-6 flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-6 w-6 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-gray-600 mb-6">{quote}</blockquote>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
        <div className="ml-3">
          <h4 className="font-semibold">{name}</h4>
          <p className="text-gray-500 text-sm">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Pigment has transformed our planning process. We can now model different scenarios in minutes instead of days, which has been crucial for navigating market uncertainties.",
      name: "Sarah Johnson",
      title: "CFO, Global Tech Inc."
    },
    {
      quote: "The AI capabilities have been a game-changer. Our finance team can now spend less time creating reports and more time on strategic decision-making.",
      name: "Michael Chen",
      title: "VP Finance, Retail Group"
    },
    {
      quote: "Implementation was seamless, and the collaborative features allow our global teams to work together efficiently despite being in different time zones.",
      name: "Emma Rodriguez",
      title: "COO, SaaS Solutions"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by leading companies</h2>
          <p className="text-gray-600 text-lg">
            See how innovative organizations use Pigment to transform their planning processes.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
