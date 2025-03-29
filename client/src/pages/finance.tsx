import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, PieChart, TrendingUp, FileText, AlertTriangle } from "lucide-react";
import FinancialInsights from "@/components/finance/FinancialInsights";

export default function FinancePage() {
  const [selectedOrg, setSelectedOrg] = useState<number>(1); // Default to org ID 1 for demo
  
  // Fetch organizations
  const { data: orgsData, isLoading: orgsLoading } = useQuery<{ success: boolean; data: Array<{ id: number; name: string }> }>({
    queryKey: ['/api/organizations'],
    // This query is stubbed for now
    queryFn: async () => ({ 
      success: true, 
      data: [
        { id: 1, name: "Acme Corporation" },
        { id: 2, name: "Globex Industries" },
        { id: 3, name: "Initech LLC" }
      ] 
    })
  });
  
  // Get dashboard summary data
  const { data: summaryData, isLoading: summaryLoading } = useQuery<{
    success: boolean;
    data: {
      revenue: { value: number; change: number; trend: number[] };
      expenses: { value: number; change: number; trend: number[] };
      profitMargin: { value: number; change: number; trend: number[] };
    }
  }>({
    queryKey: ['/api/dashboard/key-metrics'],
  });

  const renderTrendArrow = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
    }
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Financial Planning & Analysis</h1>
        <p className="text-muted-foreground">AI-powered financial insights and forecasting</p>
      </div>
      
      {/* Organization selector */}
      <div className="mb-6">
        <Select 
          value={selectedOrg.toString()} 
          onValueChange={(value) => setSelectedOrg(parseInt(value))}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {orgsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              orgsData?.data.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Tabs for different finance sections */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            <span>Key Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-6">
          <FinancialInsights organizationId={selectedOrg} />
        </TabsContent>
        
        <TabsContent value="metrics" className="grid gap-6 md:grid-cols-3">
          {summaryLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <Skeleton className="h-9 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">${summaryData?.data.revenue.value}M</div>
                    <div className="flex items-center text-sm">
                      {renderTrendArrow(summaryData?.data.revenue.change ?? 0)}
                      <span className={summaryData?.data.revenue.change && summaryData.data.revenue.change > 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatChange(summaryData?.data.revenue.change ?? 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">${summaryData?.data.expenses.value}M</div>
                    <div className="flex items-center text-sm">
                      {renderTrendArrow(summaryData?.data.expenses.change ?? 0)}
                      <span className={summaryData?.data.expenses.change && summaryData.data.expenses.change > 0 ? 'text-red-500' : 'text-green-500'}>
                        {formatChange(summaryData?.data.expenses.change ?? 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">{summaryData?.data.profitMargin.value}%</div>
                    <div className="flex items-center text-sm">
                      {renderTrendArrow(summaryData?.data.profitMargin.change ?? 0)}
                      <span className={summaryData?.data.profitMargin.change && summaryData.data.profitMargin.change > 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatChange(summaryData?.data.profitMargin.change ?? 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and view financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Report generation will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}