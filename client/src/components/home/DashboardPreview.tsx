import { motion } from 'framer-motion';
import { SimpleLineChart, SimplePieChart, SimpleBarChart, MiniLineChart } from '@/components/ui/chart';
import { 
  generatePlaceholderRevenueData, 
  generatePlaceholderRegionData,
  generatePlaceholderMetricsData
} from '@/lib/charts';

export default function DashboardPreview() {
  const revenueData = generatePlaceholderRevenueData();
  const regionData = generatePlaceholderRegionData();
  const metrics = generatePlaceholderMetricsData();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful analytics at your fingertips</h2>
          <p className="text-gray-600 text-lg">
            Visualize your data, identify trends, and make data-driven decisions with our intuitive dashboards.
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-4 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-gray-700 font-medium">Financial Dashboard</div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-600 font-medium text-sm">REVENUE</h3>
                  <span className="text-green-500 text-sm font-semibold">+12.5%</span>
                </div>
                <p className="text-2xl font-bold">${metrics.revenue.value}M</p>
                <div className="h-10 mt-2">
                  <MiniLineChart data={metrics.revenue.trend} color="hsl(var(--chart-1))" />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-600 font-medium text-sm">EXPENSES</h3>
                  <span className="text-red-500 text-sm font-semibold">+{metrics.expenses.change}%</span>
                </div>
                <p className="text-2xl font-bold">${metrics.expenses.value}M</p>
                <div className="h-10 mt-2">
                  <MiniLineChart data={metrics.expenses.trend} color="hsl(var(--chart-2))" />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-600 font-medium text-sm">PROFIT MARGIN</h3>
                  <span className="text-green-500 text-sm font-semibold">+{metrics.profitMargin.change}%</span>
                </div>
                <p className="text-2xl font-bold">{metrics.profitMargin.value}%</p>
                <div className="h-10 mt-2">
                  <MiniLineChart data={metrics.profitMargin.trend} color="hsl(var(--chart-3))" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Revenue Forecast</h3>
                    <select className="text-sm bg-white border border-gray-300 rounded px-2 py-1">
                      <option>Last 12 months</option>
                      <option>YTD</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <SimpleLineChart 
                      data={revenueData} 
                      lines={[
                        { dataKey: 'Actual', stroke: 'hsl(var(--chart-1))' },
                        { dataKey: 'Forecast', stroke: 'hsl(var(--chart-1))', strokeWidth: 1.5, connectNulls: true },
                        { dataKey: 'Previous Year', stroke: 'hsl(var(--chart-4))', strokeWidth: 1 }
                      ]}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Revenue by Region</h3>
                    <button className="text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="h-64">
                    <SimplePieChart 
                      data={regionData} 
                      donut={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
