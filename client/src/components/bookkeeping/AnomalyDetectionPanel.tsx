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
  AlertCircle, 
  Check,
  X,
  MessageSquare,
  ExternalLink,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Sample anomaly data (would come from API in production)
const sampleAnomalies = [
  {
    id: 1,
    transactionId: 42,
    date: new Date('2025-03-24'),
    description: 'Potential duplicate payment to "Digital Marketing Solutions"',
    type: 'duplicate',
    severity: 'high',
    status: 'open',
    amount: 1200.00,
    aiReasoning: 'Detected two payments of $1,200.00 to the same vendor within 48 hours. The second transaction appears to be a duplicate of invoice #DMS-2025-104.',
    details: {
      relatedTransactions: [
        { id: 41, date: new Date('2025-03-22'), description: 'Digital Marketing Solutions', amount: 1200.00 },
        { id: 42, date: new Date('2025-03-24'), description: 'Digital Marketing Solutions', amount: 1200.00 }
      ]
    }
  },
  {
    id: 2,
    transactionId: 53,
    date: new Date('2025-03-20'),
    description: 'Unusually large transaction to "Office Supplies Plus"',
    type: 'amount',
    severity: 'medium',
    status: 'open',
    amount: 5487.35,
    aiReasoning: 'This transaction is 432% higher than your average transaction with "Office Supplies Plus" over the past 12 months ($1,030.50 average).',
    details: {
      averageAmount: 1030.50,
      percentIncrease: 432
    }
  },
  {
    id: 3,
    transactionId: 61,
    date: new Date('2025-03-18'),
    description: 'Unknown vendor "XYZ Global Services"',
    type: 'vendor',
    severity: 'low',
    status: 'open',
    amount: 750.00,
    aiReasoning: 'This is the first transaction with this vendor. No matching vendors found in your payment history.',
    details: {
      suggestedCategories: ['Consulting', 'Professional Services', 'Other']
    }
  },
  {
    id: 4,
    transactionId: 38,
    date: new Date('2025-03-15'),
    description: 'Missing receipt for "Business Travel - London"',
    type: 'documentation',
    severity: 'medium',
    status: 'open',
    amount: 2350.00,
    aiReasoning: 'Tax-deductible business expense requires receipt documentation. No receipt has been attached to this transaction.',
    details: {
      taxRelevant: true,
      requiredFor: 'Tax Deduction'
    }
  },
  {
    id: 5,
    transactionId: 29,
    date: new Date('2025-03-10'),
    description: 'Potentially miscategorized transaction "Annual Team Subscription"',
    type: 'category',
    severity: 'low',
    status: 'resolved',
    amount: 899.00,
    aiReasoning: 'Based on the description and vendor, this transaction might be better categorized as "Software Subscription" rather than "Office Supplies".',
    details: {
      currentCategory: 'Office Supplies',
      suggestedCategory: 'Software Subscription',
      confidence: 0.89
    },
    resolution: {
      action: 'recategorized',
      notes: 'Confirmed this is an annual software subscription for the team.'
    }
  }
];

export default function AnomalyDetectionPanel() {
  const [anomalies, setAnomalies] = useState(sampleAnomalies);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const { toast } = useToast();
  
  const handleResolveClick = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
    setResolutionNote('');
    setResolveDialogOpen(true);
  };
  
  const handleResolve = () => {
    if (!selectedAnomaly) return;
    
    // Update anomaly list
    setAnomalies(prev => 
      prev.map(a => {
        if (a.id === selectedAnomaly.id) {
          return { 
            ...a, 
            status: 'resolved',
            resolution: {
              action: 'resolved',
              notes: resolutionNote || 'Marked as resolved'
            }
          };
        }
        return a;
      })
    );
    
    setResolveDialogOpen(false);
    
    toast({
      title: "Anomaly Resolved",
      description: "The anomaly has been marked as resolved",
    });
  };
  
  const handleDismiss = (id: number) => {
    setAnomalies(prev => 
      prev.map(a => {
        if (a.id === id) {
          return { 
            ...a, 
            status: 'dismissed',
            resolution: {
              action: 'dismissed',
              notes: 'Marked as false positive'
            }
          };
        }
        return a;
      })
    );
    
    toast({
      title: "Anomaly Dismissed",
      description: "The anomaly has been marked as a false positive",
    });
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return "bg-red-100 text-red-800";
      case 'medium': return "bg-yellow-100 text-yellow-800";
      case 'low': return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate': 
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Duplicate</Badge>;
      case 'amount': 
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Unusual Amount</Badge>;
      case 'vendor': 
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Unknown Vendor</Badge>;
      case 'documentation': 
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Missing Document</Badge>;
      case 'category': 
        return <Badge variant="outline" className="bg-green-100 text-green-800">Category Issue</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const openAnomalies = anomalies.filter(a => a.status === 'open');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          AI Anomaly Detection
        </CardTitle>
        <CardDescription>
          Our AI has identified these potential issues requiring your attention
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {openAnomalies.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <ShieldCheck className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1">All Clear!</h3>
            <p className="text-muted-foreground">
              No anomalies detected in your recent transactions.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {openAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${anomaly.severity === 'high' ? 'text-red-500' : anomaly.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
                    <span className="font-medium">{anomaly.description}</span>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)} Priority
                  </Badge>
                </div>
                
                <div className="pl-6 space-y-2">
                  <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Transaction:</span>
                      <span className="font-medium">${anomaly.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{formatDate(anomaly.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Type:</span>
                      {getTypeIcon(anomaly.type)}
                    </div>
                  </div>
                  
                  <div className="text-sm bg-muted p-3 rounded-md">
                    <div className="font-medium mb-1">AI Analysis:</div>
                    <p>{anomaly.aiReasoning}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleResolveClick(anomaly)}>
                      <Check className="mr-1 h-4 w-4" /> 
                      Resolve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDismiss(anomaly.id)}>
                      <X className="mr-1 h-4 w-4" /> 
                      Dismiss
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="mr-1 h-4 w-4" /> 
                            View Transaction
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View the full transaction details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {openAnomalies.length > 0 
              ? `Showing ${openAnomalies.length} anomalies requiring attention` 
              : "No anomalies need your attention"}
          </div>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            View AI Insights
          </Button>
        </div>
      </CardFooter>
      
      {/* Resolution Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Anomaly</DialogTitle>
            <DialogDescription>
              Add a note about how this issue was resolved
            </DialogDescription>
          </DialogHeader>
          
          {selectedAnomaly && (
            <div className="py-2">
              <div className="mb-3">
                <h4 className="text-sm font-semibold mb-1">Anomaly:</h4>
                <p className="text-sm">{selectedAnomaly.description}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Resolution Note:</h4>
                <Textarea
                  placeholder="Explain how you resolved this issue..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResolve}>Mark as Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}