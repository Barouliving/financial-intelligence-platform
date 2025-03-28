import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Tag, 
  CheckSquare,
  Circle,
  RotateCw,
  FileText,
  Clock,
  Info,
  Edit
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Sample transaction data (would come from API in production)
const sampleTransactions = [
  {
    id: 1,
    date: new Date('2025-03-25'),
    description: 'Software Subscription - Adobe',
    amount: 59.99,
    aiSuggestion: { category: 'Software', confidence: 0.95 },
    status: 'needs_review',
    type: 'expense'
  },
  {
    id: 2,
    date: new Date('2025-03-24'),
    description: 'Office Supply Warehouse',
    amount: 124.50,
    aiSuggestion: { category: 'Office Supplies', confidence: 0.89 },
    status: 'needs_review',
    type: 'expense'
  },
  {
    id: 3,
    date: new Date('2025-03-23'),
    description: 'Client Payment - ABC Corp',
    amount: 2500.00,
    aiSuggestion: { category: 'Revenue', confidence: 0.97 },
    status: 'ai_categorized',
    type: 'income'
  },
  {
    id: 4,
    date: new Date('2025-03-21'),
    description: 'Airline Tickets for Conference',
    amount: 578.25,
    aiSuggestion: { category: 'Travel', confidence: 0.92 },
    status: 'needs_review',
    type: 'expense'
  },
  {
    id: 5,
    date: new Date('2025-03-20'),
    description: 'Coffee with Client - StartRight Cafe',
    amount: 32.75,
    aiSuggestion: { category: 'Meals & Entertainment', confidence: 0.76 },
    status: 'needs_review',
    type: 'expense'
  }
];

// Common categories (would be more extensive in production)
const categories = [
  "Software", "Office Supplies", "Revenue", "Travel", "Meals & Entertainment", 
  "Rent", "Utilities", "Marketing", "Legal & Professional", "Insurance",
  "Taxes", "Payroll", "Equipment", "Subscriptions", "Bank Fees", "Other"
];

export default function TransactionCategorizationPanel() {
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const { toast } = useToast();
  
  const handleApproveAll = () => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    // Simulate processing with progress
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Update all transactions to be categorized
          setTransactions(prevTransactions => 
            prevTransactions.map(t => ({ ...t, status: 'ai_categorized' }))
          );
          
          toast({
            title: "All Categories Approved",
            description: "AI categorization has been applied to all transactions",
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const handleEditCategory = (id: number, category: string) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.id === id 
          ? { ...t, aiSuggestion: { ...t.aiSuggestion, category }, status: 'ai_categorized' } 
          : t
      )
    );
    
    toast({
      title: "Category Updated",
      description: `Transaction has been categorized as ${category}`,
    });
  };
  
  const handleApproveTransaction = (id: number) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.id === id 
          ? { ...t, status: 'ai_categorized' } 
          : t
      )
    );
    
    toast({
      title: "Category Approved",
      description: "Transaction category has been approved",
      variant: "default",
    });
  };
  
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence > 0.9) return "bg-green-100 text-green-800";
    if (confidence > 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI Transaction Categorization</CardTitle>
            <CardDescription>Review and approve AI-suggested categories</CardDescription>
          </div>
          <Button 
            onClick={handleApproveAll}
            disabled={isProcessing || transactions.every(t => t.status === 'ai_categorized')}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Approve All
          </Button>
        </div>
        
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing transactions...</span>
              <span>{processProgress}%</span>
            </div>
            <Progress value={processProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Description</th>
                <th className="text-left py-3 px-2">Amount</th>
                <th className="text-left py-3 px-2">
                  <div className="flex items-center gap-1">
                    <span>AI Category</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={14} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-56">Categories suggested by AI based on transaction description, amount, and patterns.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </th>
                <th className="text-left py-3 px-2">Confidence</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2">{formatDate(transaction.date)}</td>
                  <td className="py-3 px-2 max-w-xs truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">{transaction.description}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{transaction.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className={`py-3 px-2 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    {transaction.status === 'ai_categorized' ? (
                      <div className="flex items-center gap-1">
                        <Tag size={14} className="text-primary" />
                        <span>{transaction.aiSuggestion.category}</span>
                      </div>
                    ) : (
                      <Select 
                        onValueChange={(value) => handleEditCategory(transaction.id, value)} 
                        defaultValue={transaction.aiSuggestion.category}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={transaction.aiSuggestion.category} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <Badge 
                      variant="outline" 
                      className={getConfidenceBadgeColor(transaction.aiSuggestion.confidence)}
                    >
                      {Math.round(transaction.aiSuggestion.confidence * 100)}%
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    {transaction.status === 'ai_categorized' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <CheckSquare size={12} className="mr-1" />
                        Categorized
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock size={12} className="mr-1" />
                        Needs Review
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {transaction.status === 'needs_review' ? (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleApproveTransaction(transaction.id)} 
                          size="sm" 
                          variant="outline"
                        >
                          <CheckSquare size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost">
                        <RotateCw size={14} className="mr-1" />
                        Change
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing 5 of 5 recent transactions
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-sm">Needs Review (4)</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              <span className="text-sm">Categorized (1)</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}