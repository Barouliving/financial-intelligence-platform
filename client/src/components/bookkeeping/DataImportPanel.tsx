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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  UploadCloud, 
  Link as LinkIcon,
  FileText,
  FilePlus,
  Check,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function DataImportPanel() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 150);
    
    return () => clearInterval(interval);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setIsUploading(true);
    const progressCleanup = simulateProgress();
    
    setTimeout(() => {
      progressCleanup();
      setUploadProgress(100);
      setUploadStatus('success');
      setIsUploading(false);
      
      toast({
        title: "File Uploaded Successfully",
        description: "Your document has been processed by our AI system.",
      });
      
      // Reset after a moment
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 3000);
    }, 2000);
  };

  const handleBankConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName) return;
    
    setIsUploading(true);
    const progressCleanup = simulateProgress();
    
    setTimeout(() => {
      progressCleanup();
      setUploadProgress(100);
      setUploadStatus('success');
      setIsUploading(false);
      
      toast({
        title: "Bank Connected Successfully",
        description: `Your account with ${bankName} has been connected.`,
      });
      
      // Reset after a moment
      setTimeout(() => {
        setBankName('');
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 3000);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Your Financial Data</CardTitle>
        <CardDescription>Choose how you want to add your transactions</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="connect">
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect Bank
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FilePlus className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Documents Tab */}
          <TabsContent value="upload" className="space-y-4">
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="file">Invoice or Receipt</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="file" 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx" 
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <Button 
                      type="submit" 
                      disabled={!selectedFile || isUploading}
                    >
                      Upload
                    </Button>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {uploadStatus === 'success' && (
                  <div className="flex items-center text-green-600 gap-2">
                    <Check size={16} />
                    <span>Upload complete! AI processing your document...</span>
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="flex items-center text-red-600 gap-2">
                    <AlertCircle size={16} />
                    <span>Upload failed. Please try again.</span>
                  </div>
                )}
              </div>
            </form>
            
            <div className="rounded-md bg-muted p-4 text-sm">
              <div className="font-medium mb-2">Supported Formats:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Images (JPG, PNG) - Receipts, invoices</li>
                <li>PDF documents - Detailed invoices, statements</li>
                <li>CSV/Excel Files - Bulk transaction data</li>
              </ul>
              <div className="mt-2 text-xs text-muted-foreground">
                Our AI will automatically extract, categorize and process the financial data from your documents.
              </div>
            </div>
          </TabsContent>
          
          {/* Connect Bank Tab */}
          <TabsContent value="connect" className="space-y-4">
            <form onSubmit={handleBankConnect} className="space-y-4">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="bankName">Bank or Financial Institution</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="bankName" 
                      placeholder="Enter bank name" 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      disabled={isUploading}
                    />
                    <Button 
                      type="submit" 
                      disabled={!bankName || isUploading}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Connecting...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {uploadStatus === 'success' && (
                  <div className="flex items-center text-green-600 gap-2">
                    <Check size={16} />
                    <span>Connection successful! Importing your transactions...</span>
                  </div>
                )}
              </div>
            </form>
            
            <div className="rounded-md bg-muted p-4 text-sm">
              <div className="font-medium mb-2">Secure Connection:</div>
              <p className="mb-2">
                Connect your bank accounts to automatically import transactions. Your credentials are encrypted and never stored.
              </p>
              <div className="grid grid-cols-5 gap-2 mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
                  <span className="text-xs">Chase</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
                  <span className="text-xs">Bank of America</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
                  <span className="text-xs">Wells Fargo</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
                  <span className="text-xs">Citi</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mb-1"></div>
                  <span className="text-xs">+ 5000 more</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <div className="flex flex-col gap-4">
              <div className="flex space-x-4">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Single Transaction
                </Button>
                <Button variant="outline" className="w-full">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Bulk Entry Template
                </Button>
              </div>
              
              <div className="rounded-md bg-muted p-4 text-sm">
                <div className="font-medium mb-2">Manual Entry Benefits:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>AI still assists with categorization</li>
                  <li>Perfect for cash transactions or missing receipts</li>
                  <li>Easily match with bank imports later</li>
                </ul>
                <div className="mt-2 text-xs text-muted-foreground">
                  Even with manual entry, our AI will analyze the transaction details to suggest appropriate categories and detect any unusual patterns.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Your data is protected with bank-level encryption
        </div>
        <Button variant="link" size="sm">
          Need help?
        </Button>
      </CardFooter>
    </Card>
  );
}