import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { 
  ArrowDown, 
  ArrowUp, 
  CreditCard, 
  DollarSign, 
  Search, 
  AlertCircle,
  BarChart,
  Tag,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// Import our bookkeeping components
import DataImportPanel from "@/components/bookkeeping/DataImportPanel";
import TransactionCategorizationPanel from "@/components/bookkeeping/TransactionCategorizationPanel";
import AnomalyDetectionPanel from "@/components/bookkeeping/AnomalyDetectionPanel";

export default function Bookkeeping() {
  const [aiQuery, setAiQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Fetch accounts
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['/api/bookkeeping/accounts'],
    queryFn: () => apiRequest('GET', '/api/bookkeeping/accounts', undefined, { on401: "returnNull" })
      .then(res => res.json())
  });
  
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/bookkeeping/categories'],
    queryFn: () => apiRequest('GET', '/api/bookkeeping/categories', undefined, { on401: "returnNull" })
      .then(res => res.json())
  });
  
  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/bookkeeping/transactions'],
    queryFn: () => apiRequest('GET', '/api/bookkeeping/transactions', undefined, { on401: "returnNull" })
      .then(res => res.json())
  });
  
  // Fetch anomalies
  const { data: anomalies, isLoading: isLoadingAnomalies } = useQuery({
    queryKey: ['/api/bookkeeping/anomalies'],
    queryFn: () => apiRequest('GET', '/api/bookkeeping/anomalies', undefined, { on401: "returnNull" })
      .then(res => res.json())
  });
  
  // Submit AI bookkeeping query
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/ai/conversation', { query: aiQuery }, { on401: "returnNull" });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        toast({
          title: "AI Response Generated",
          description: "The AI has processed your bookkeeping query."
        });
        
        // Parse the AI response
        try {
          const parsedResponse = JSON.parse(responseData.response);
          displayAiResponse(parsedResponse);
        } catch (error) {
          console.error("Error parsing AI response:", error);
          toast({
            title: "Processing Error",
            description: "Unable to parse the AI response.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error submitting AI query:", error);
      toast({
        title: "Request Failed",
        description: "There was an error processing your request.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display AI response in a more structured way
  const displayAiResponse = (response: any) => {
    // You could implement a modal or a dedicated section to display the response
    console.log("AI Response:", response);
    
    // Set state variable to display the response
    setAiResponse(response);
  };
  
  const [aiResponse, setAiResponse] = useState<any>(null);
  
  // Sample financial metrics for the dashboard (would come from API in real app)
  const financialMetrics = {
    accountsPayable: 12540.75,
    accountsReceivable: 28950.25,
    cashBalance: 42680.15,
    pendingTransactions: 15,
    unreconciledItems: 7,
    anomalies: 3
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">AI Bookkeeping</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">${financialMetrics.cashBalance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowDown className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-2xl font-bold">${financialMetrics.accountsReceivable.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4 text-orange-500" />
                  <span className="text-2xl font-bold">${financialMetrics.accountsPayable.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold">{financialMetrics.pendingTransactions}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unreconciled Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4 text-yellow-500" />
                  <span className="text-2xl font-bold">{financialMetrics.unreconciledItems}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Anomalies Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold">{financialMetrics.anomalies}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataImportPanel />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Insights</CardTitle>
                <CardDescription>AI-generated insights about your financial data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <BarChart className="h-5 w-5 text-blue-500 mt-0.5" />
                    <span>March expenses are 12% higher than February, primarily due to increased software subscription costs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Tag className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>7 transactions totaling $3,240 were automatically categorized this week based on pattern recognition.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <span>Potential duplicate payment detected: Two similar transactions to "Acme Services" within 48 hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                    <span>Based on current trends, Q2 tax liability is projected to be approximately $8,500.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <TransactionCategorizationPanel />
        </TabsContent>
        
        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Your financial accounts structure</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <div className="text-center py-4">Loading accounts...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Asset Accounts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span>Cash Operating</span>
                          <span className="font-medium">$42,680.15</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Accounts Receivable</span>
                          <span className="font-medium">$28,950.25</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Office Equipment</span>
                          <span className="font-medium">$15,750.00</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Liability Accounts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span>Accounts Payable</span>
                          <span className="font-medium">$12,540.75</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Credit Card</span>
                          <span className="font-medium">$4,250.00</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Business Loan</span>
                          <span className="font-medium">$35,000.00</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Income Accounts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span>Consulting Revenue</span>
                          <span className="font-medium">$78,500.00</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Product Sales</span>
                          <span className="font-medium">$42,300.00</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Interest Income</span>
                          <span className="font-medium">$320.45</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Expense Accounts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center">
                          <span>Payroll</span>
                          <span className="font-medium">$52,450.00</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Rent</span>
                          <span className="font-medium">$7,500.00</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Software & Subscriptions</span>
                          <span className="font-medium">$2,340.00</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span>Marketing</span>
                          <span className="font-medium">$5,280.00</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <AnomalyDetectionPanel />
        </TabsContent>
        
        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Bookkeeping Assistant</CardTitle>
              <CardDescription>
                Ask questions about your financial data, get transaction categorization help, 
                analyze spending patterns, prepare for taxes, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAiSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ai-query">How can I help with your bookkeeping?</Label>
                  <Input
                    id="ai-query"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="E.g., 'Show me unusual transactions this month' or 'Categorize my recent expenses'"
                    className="w-full"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Submit Query"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {aiResponse && (
            <Card>
              <CardHeader>
                <CardTitle>AI Response</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4">{aiResponse.message}</h3>
                
                {/* Display different content based on response type */}
                {aiResponse.type === 'anomaly' && aiResponse.data?.anomalies && (
                  <div className="space-y-4">
                    <ul className="space-y-3">
                      {aiResponse.data.anomalies.map((anomaly: any, index: number) => (
                        <li key={index} className="p-3 border rounded-md">
                          <div className="font-medium">{anomaly.description}</div>
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Transaction ID: </span>
                            <span>{anomaly.transactionId}</span>
                            <span className="mx-2">|</span>
                            <span className="text-muted-foreground">Amount: </span>
                            <span>${anomaly.amount.toLocaleString()}</span>
                            <span className="mx-2">|</span>
                            <span className="text-muted-foreground">Date: </span>
                            <span>{anomaly.date}</span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Reasoning: </span>
                            <span>{anomaly.reasoning}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {aiResponse.data.summary && (
                      <div className="text-sm bg-muted p-3 rounded-md mt-4">
                        {aiResponse.data.summary}
                      </div>
                    )}
                  </div>
                )}
                
                {aiResponse.type === 'categorization' && aiResponse.data?.categories && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {aiResponse.data.categories.map((category: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="text-lg font-medium">{category.name}</div>
                            <div className="text-2xl font-bold mt-1">${category.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground mt-1">{category.percentage}% of total</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {aiResponse.data.insights && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Insights:</h4>
                        <ul className="space-y-1">
                          {aiResponse.data.insights.map((insight: string, index: number) => (
                            <li key={index} className="text-sm">• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {aiResponse.data.uncategorized && aiResponse.data.uncategorized.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Uncategorized Transactions:</h4>
                        <ul className="space-y-1">
                          {aiResponse.data.uncategorized.map((tx: any, index: number) => (
                            <li key={index} className="text-sm">
                              • {tx.description}: ${tx.amount.toLocaleString()}
                              <Button size="sm" variant="link" className="h-auto p-0 ml-2">
                                Categorize
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display general responses for other types */}
                {!['anomaly', 'categorization'].includes(aiResponse.type) && (
                  <div className="prose max-w-none">
                    <pre className="text-sm p-4 bg-muted rounded-md overflow-auto">
                      {JSON.stringify(aiResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Sample Questions</CardTitle>
              <CardDescription>Try asking the AI assistant about:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-2"
                    onClick={() => setAiQuery("What anomalies have you detected in our transactions?")}
                  >
                    What anomalies have you detected in our transactions?
                  </Button>
                </li>
                <li className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-2"
                    onClick={() => setAiQuery("Categorize my spending for the last month")}
                  >
                    Categorize my spending for the last month
                  </Button>
                </li>
                <li className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-2"
                    onClick={() => setAiQuery("What tax deductions am I missing?")}
                  >
                    What tax deductions am I missing?
                  </Button>
                </li>
                <li className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-2"
                    onClick={() => setAiQuery("Analyze our cash flow for the last quarter")}
                  >
                    Analyze our cash flow for the last quarter
                  </Button>
                </li>
                <li className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-2"
                    onClick={() => setAiQuery("What is our current financial health?")}
                  >
                    What is our current financial health?
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}