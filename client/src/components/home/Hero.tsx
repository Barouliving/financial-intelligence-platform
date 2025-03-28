import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const partners = [
    { name: 'Acme Inc.', logo: 'ClientLogo' },
    { name: 'Global Tech', logo: 'ClientLogo' },
    { name: 'Innovate Co.', logo: 'ClientLogo' },
    { name: 'Enterprise X', logo: 'ClientLogo' },
    { name: 'Future Systems', logo: 'ClientLogo' }
  ];

  const heroAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      }
    }
  };

  const imageAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.2
      }
    }
  };

  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-15% right-5% w-[300px] h-[300px] rounded-[82%_18%_32%_68%/64%_36%_64%_36%] bg-secondary-100/10 z-[-1]"></div>
      <div className="absolute bottom-10% left-8% w-[200px] h-[200px] rounded-[32%_68%_64%_36%/32%_38%_62%_68%] bg-primary-100/10 z-[-1]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="w-full lg:w-1/2 mb-12 lg:mb-0"
            initial="hidden"
            animate="show"
            variants={heroAnimation}
          >
            <span className="inline-block bg-primary-50 text-primary-600 font-semibold px-4 py-1 rounded-full text-sm mb-6">
              Future of Business Planning
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform how you plan, report and analyze
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-xl">
              Your complete business planning platform with AI-powered insights to drive better decisions and foster collaboration across your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo">
                <Button size="lg" className="text-base">Get a demo</Button>
              </Link>
              <Link href="/product">
                <Button variant="outline" size="lg" className="text-base">
                  Learn more
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="w-full lg:w-1/2"
            initial="hidden"
            animate="show"
            variants={imageAnimation}
          >
            <div className="w-full rounded-lg shadow-xl overflow-hidden bg-gradient-to-r from-primary-50 to-secondary-50 aspect-video">
              <div className="p-4 bg-white/90 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-gray-700 font-medium">Financial Dashboard</div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">REVENUE</div>
                    <div className="text-xl font-bold flex items-baseline">
                      $4.2M
                      <span className="ml-2 text-green-500 text-xs">+12.5%</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">GROWTH</div>
                    <div className="text-xl font-bold flex items-baseline">
                      18.2%
                      <span className="ml-2 text-green-500 text-xs">+3.1%</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">USERS</div>
                    <div className="text-xl font-bold flex items-baseline">
                      8,642
                      <span className="ml-2 text-green-500 text-xs">+15.7%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="h-32 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-md opacity-75"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-20">
          <p className="text-gray-500 mb-6 w-full">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-between items-center w-full gap-8">
            {partners.map((partner, index) => (
              <div 
                key={index} 
                className="grayscale opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
                  <rect width="100" height="30" fill="currentColor" opacity="0.2" />
                  <text x="50" y="20" textAnchor="middle" fill="#666">{partner.name}</text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
