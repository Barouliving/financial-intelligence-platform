import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleLineChart, SimpleBarChart, SimplePieChart, MiniLineChart } from '@/components/ui/chart';
import { useRevenueForecastData, useRevenueByRegionData, useKeyMetricsData } from '@/lib/charts';
import { Button } from '@/components/ui/button';
import AiAssistant from '@/components/ai/AiAssistant';
import { Sparkles, MoreHorizontal, ChevronsUpDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('12m');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  const { chartData: revenueData, isLoading: isLoadingRevenue } = useRevenueForecastData();
  const { chartData: regionData, isLoading: isLoadingRegion } = useRevenueByRegionData();
  const { metrics, isLoading: isLoadingMetrics } = useKeyMetricsData();
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Financial Dashboard</h1>
              <p className="text-gray-500">Get insights into your business performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowAiAssistant(!showAiAssistant)}
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Assistant</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showAiAssistant && (
          <div className="mb-8">
            <AiAssistant />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="REVENUE"
            value={metrics?.revenue.value || 4.2}
            change={metrics?.revenue.change || 12.5}
            positive={true}
            trendData={metrics?.revenue.trend || [4.0, 4.1, 4.15, 4.2, 4.25, 4.3]}
            isLoading={isLoadingMetrics}
          />
          
          <MetricCard
            title="EXPENSES"
            value={metrics?.expenses.value || 2.8}
            change={metrics?.expenses.change || 3.2}
            positive={false}
            trendData={metrics?.expenses.trend || [2.6, 2.65, 2.7, 2.75, 2.8, 2.85]}
            isLoading={isLoadingMetrics}
          />
          
          <MetricCard
            title="PROFIT MARGIN"
            value={metrics?.profitMargin.value || 33.4}
            change={metrics?.profitMargin.change || 5.3}
            positive={true}
            trendData={metrics?.profitMargin.trend || [30.1, 31.2, 32.0, 32.8, 33.4, 33.5]}
            isLoading={isLoadingMetrics}
            valueSymbol="%"
          />
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">Revenue Forecast</CardTitle>
                  <Select defaultValue="lastYear">
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Compare to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastYear">vs. Last Year</SelectItem>
                      <SelectItem value="lastQuarter">vs. Last Quarter</SelectItem>
                      <SelectItem value="budget">vs. Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingRevenue ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <p className="text-gray-400">Loading chart data...</p>
                      </div>
                    ) : (
                      <SimpleLineChart 
                        data={revenueData} 
                        lines={[
                          { dataKey: 'Actual', stroke: 'hsl(var(--chart-1))' },
                          { dataKey: 'Forecast', stroke: 'hsl(var(--chart-1))', strokeWidth: 1.5, connectNulls: true },
                          { dataKey: 'Previous Year', stroke: 'hsl(var(--chart-4))', strokeWidth: 1 }
                        ]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">Revenue by Region</CardTitle>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingRegion ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <p className="text-gray-400">Loading chart data...</p>
                      </div>
                    ) : (
                      <SimplePieChart 
                        data={regionData} 
                        donut={true}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Monthly Performance</CardTitle>
                <Button variant="ghost" size="icon">
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <SimpleBarChart 
                    data={[
                      { name: 'Jan', Revenue: 4.2, Target: 4.0 },
                      { name: 'Feb', Revenue: 4.5, Target: 4.2 },
                      { name: 'Mar', Revenue: 4.8, Target: 4.4 },
                      { name: 'Apr', Revenue: 5.1, Target: 4.6 },
                      { name: 'May', Revenue: 5.4, Target: 4.8 },
                      { name: 'Jun', Revenue: 5.7, Target: 5.0 }
                    ]} 
                    bars={[
                      { dataKey: 'Revenue', fill: 'hsl(var(--chart-1))' },
                      { dataKey: 'Target', fill: 'hsl(var(--chart-5))' }
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue">
            <Card>
              <CardContent className="pt-6">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-400">Revenue details will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses">
            <Card>
              <CardContent className="pt-6">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-400">Expense details will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profitability">
            <Card>
              <CardContent className="pt-6">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-400">Profitability details will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  positive: boolean;
  trendData: number[];
  isLoading: boolean;
  valueSymbol?: string;
}

function MetricCard({ title, value, change, positive, trendData, isLoading, valueSymbol = "M" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600 font-medium text-sm">{title}</p>
          <div className={`flex items-center ${positive ? 'text-green-500' : 'text-red-500'} text-sm font-semibold`}>
            {positive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {change}%
          </div>
        </div>
        <p className="text-2xl font-bold">
          {valueSymbol === "M" ? `$${value}${valueSymbol}` : `${value}${valueSymbol}`}
        </p>
        <div className="h-10 mt-2">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-400 text-xs">Loading trend...</p>
            </div>
          ) : (
            <MiniLineChart 
              data={trendData} 
              color={positive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
