import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

// Define the types for our financial insights
interface Insight {
  priority: 'high' | 'medium' | 'low';
  action: string;
  metric: string;
}

interface InsightsReport {
  insights: Insight[];
  riskScore: number;
  summary: string;
}

interface FinancialInsightsProps {
  organizationId: number;
}

export default function FinancialInsights({ organizationId }: FinancialInsightsProps) {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: InsightsReport }>({
    queryKey: ['/api/ai/financial-insights', organizationId],
    enabled: Boolean(organizationId),
  });

  if (isLoading) {
    return <FinancialInsightsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load financial insights. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const insightsReport = data?.data;

  if (!insightsReport) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No insights available</AlertTitle>
        <AlertDescription>
          No financial insights are available for this organization.
        </AlertDescription>
      </Alert>
    );
  }

  // Determine risk status based on risk score
  const getRiskStatus = (score: number) => {
    if (score < 30) return { status: 'low', color: 'bg-green-500' };
    if (score < 70) return { status: 'medium', color: 'bg-yellow-500' };
    return { status: 'high', color: 'bg-red-500' };
  };

  const riskStatus = getRiskStatus(insightsReport.riskScore);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Financial Insights</CardTitle>
              <CardDescription>AI-powered analysis of your financial data</CardDescription>
            </div>
            <Badge variant={riskStatus.status === 'high' ? 'destructive' : riskStatus.status === 'medium' ? 'default' : 'outline'}>
              {riskStatus.status.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Risk Score</span>
              <span className="text-sm font-medium">{insightsReport.riskScore}/100</span>
            </div>
            <Progress 
              value={insightsReport.riskScore} 
              className={`h-2 ${riskStatus.color}`}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
            <p className="text-sm text-muted-foreground">{insightsReport.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Key Actions</h3>
            <div className="space-y-3">
              {insightsReport.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {insight.priority === 'high' ? (
                    <TrendingUp className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : insight.priority === 'medium' ? (
                    <TrendingUp className="h-5 w-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{insight.metric}</h4>
                      <Badge variant={
                        insight.priority === 'high' ? 'destructive' : 
                        insight.priority === 'medium' ? 'default' : 
                        'outline'
                      }>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialInsightsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[50px]" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-6 w-[150px] mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
        
        <div>
          <Skeleton className="h-6 w-[120px] mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <Skeleton className="h-5 w-5 mt-0.5" />
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}