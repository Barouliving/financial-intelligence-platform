import React, { useState, useRef } from 'react';
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { parseExcelFile, generateExcelTemplate, importTransactions, ImportResult, ExcelTransaction } from '@/lib/excel-import';
import { Transaction } from '@shared/schema';

interface ExcelImportProps {
  organizationId: number;
  onImportComplete?: (result: ImportResult) => void;
}

export default function ExcelImport({ organizationId, onImportComplete }: ExcelImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedTransactions, setProcessedTransactions] = useState<ExcelTransaction[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isResultSheetOpen, setIsResultSheetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const downloadTemplate = () => {
    try {
      const excelBlob = generateExcelTemplate();
      const url = URL.createObjectURL(excelBlob);
      
      // Create temporary link element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transaction_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Template Downloaded",
        description: "Excel template has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate the Excel template. Please try again.",
        variant: "destructive",
      });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setErrorMessage(null);
    const progressCleanup = simulateProgress();
    
    try {
      // Parse Excel file
      const transactions = await parseExcelFile(selectedFile);
      setProcessedTransactions(transactions);
      
      // Complete progress animation
      progressCleanup();
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        
        toast({
          title: "File Processed Successfully",
          description: `Found ${transactions.length} transactions ready for import.`,
        });
      }, 500);
    } catch (error) {
      progressCleanup();
      setUploadProgress(0);
      setIsUploading(false);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      
      toast({
        title: "Upload Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (processedTransactions.length === 0) return;
    
    setIsUploading(true);
    setErrorMessage(null);
    const progressCleanup = simulateProgress();
    
    try {
      // Import transactions to database
      const result = await importTransactions(processedTransactions, organizationId);
      setImportResult(result);
      
      // Complete progress animation
      progressCleanup();
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setIsResultSheetOpen(true);
        
        toast({
          title: "Import Complete",
          description: `Successfully imported ${result.successful.length} of ${result.total} transactions.`,
          variant: result.failed.length === 0 ? "default" : "destructive",
        });
        
        if (onImportComplete) {
          onImportComplete(result);
        }
      }, 500);
    } catch (error) {
      progressCleanup();
      setUploadProgress(0);
      setIsUploading(false);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMsg);
      
      toast({
        title: "Import Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setProcessedTransactions([]);
    setImportResult(null);
    setErrorMessage(null);
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Download Template */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-6 h-6 text-sm mr-2">1</span>
              Download Excel Template
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by downloading our Excel template with the correct format for importing transactions.
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="flex gap-2">
              <Download size={16} />
              Download Template
            </Button>
          </div>
          
          {/* Step 2: Fill and Upload */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-6 h-6 text-sm mr-2">2</span>
              Upload Your Excel File
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fill in your transaction data and upload the Excel file for processing.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  className="flex-1"
                  disabled={isUploading || processedTransactions.length > 0}
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading || processedTransactions.length > 0}
                  className="flex gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              {selectedFile && processedTransactions.length > 0 && (
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>File Processed Successfully</AlertTitle>
                  <AlertDescription>
                    Found {processedTransactions.length} transactions ready for import.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          {/* Step 3: Import */}
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-6 h-6 text-sm mr-2">3</span>
              Import Transactions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Review the processed transactions and import them into your financial records.
            </p>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleImport}
                disabled={isUploading || processedTransactions.length === 0 || importResult !== null}
                className="flex gap-2"
                variant="default"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={16} />
                    Import {processedTransactions.length} Transactions
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetImport}
                variant="outline"
                className="flex gap-2"
                disabled={isUploading}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Sheet */}
      <Sheet open={isResultSheetOpen} onOpenChange={setIsResultSheetOpen}>
        <SheetContent className="sm:max-w-3xl w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Import Results</SheetTitle>
            <SheetDescription>
              {importResult && (
                <>
                  Successfully imported {importResult.successful.length} of {importResult.total} transactions.
                  {importResult.failed.length > 0 && ` ${importResult.failed.length} transactions failed.`}
                </>
              )}
            </SheetDescription>
          </SheetHeader>
          
          {importResult && (
            <div className="mt-6">
              {/* Successful Transactions */}
              {importResult.successful.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Successful Imports ({importResult.successful.length})
                  </h3>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.successful.slice(0, 5).map((tx: Transaction) => (
                          <TableRow key={tx.id}>
                            <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell>${Number(tx.amount as any).toFixed(2)}</TableCell>
                            <TableCell>{tx.type}</TableCell>
                            <TableCell>{tx.categoryId || 'None'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      {importResult.successful.length > 5 && (
                        <TableCaption>
                          Showing 5 of {importResult.successful.length} successful transactions
                        </TableCaption>
                      )}
                    </Table>
                  </div>
                </div>
              )}
              
              {/* Failed Transactions */}
              {importResult.failed.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-red-600" />
                    Failed Imports ({importResult.failed.length})
                  </h3>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.failed.map((fail, i) => (
                          <TableRow key={i}>
                            <TableCell>{fail.rowData.description}</TableCell>
                            <TableCell>${typeof fail.rowData.amount === 'number' ? fail.rowData.amount.toFixed(2) : Number(fail.rowData.amount).toFixed(2)}</TableCell>
                            <TableCell className="text-red-600">{fail.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Button onClick={() => setIsResultSheetOpen(false)} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}