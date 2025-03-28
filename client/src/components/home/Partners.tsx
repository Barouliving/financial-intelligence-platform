import { motion } from 'framer-motion';

export default function Partners() {
  const partners = [
    { name: 'Acme Inc.', logo: 'ClientLogo' },
    { name: 'Global Tech', logo: 'ClientLogo' },
    { name: 'Innovate Co.', logo: 'ClientLogo' },
    { name: 'Enterprise X', logo: 'ClientLogo' },
    { name: 'Future Systems', logo: 'ClientLogo' }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p 
          className="text-gray-500 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Trusted by innovative teams worldwide
        </motion.p>
        
        <div className="flex flex-wrap justify-center md:justify-between items-center w-full gap-8">
          {partners.map((partner, index) => (
            <motion.div 
              key={index} 
              className="grayscale opacity-70 hover:opacity-100 transition-opacity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ opacity: 1 }}
            >
              <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
                <rect width="100" height="30" fill="currentColor" opacity="0.2" />
                <text x="50" y="20" textAnchor="middle" fill="#666">{partner.name}</text>
              </svg>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
