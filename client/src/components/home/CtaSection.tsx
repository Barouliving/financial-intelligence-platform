import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DemoRequestForm from '@/components/forms/DemoRequestForm';

export default function CtaSection() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get started with Pigment today</h2>
            <p className="text-lg opacity-90 mb-8">
              Transform your business planning with AI-powered insights. Schedule a personalized demo to see how Pigment can help your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Schedule a demo
                </Button>
              </Link>
              <Link href="/resources/product-video">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                  Watch video
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Request a demo</h3>
            <DemoRequestForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
