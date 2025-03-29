import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAiCacheStats, useAiCacheClear } from '@/hooks/use-ai-cache';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart2, Database, RefreshCw, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import config from '@/lib/appConfig';

/**
 * AiCacheManager component for viewing and managing the AI response cache
 */
export function AiCacheManager() {
  const { data: cacheStatsResponse, isLoading, isError, refetch } = useAiCacheStats();
  const { mutate: clearCache, isPending: isClearing } = useAiCacheClear();
  
  const stats = cacheStatsResponse?.data;
  
  // Calculate cache usage percentage
  const calculateUsagePercentage = () => {
    if (!stats) return 0;
    
    // If remainingSize is a string, we can't calculate the percentage
    if (typeof stats.remainingSize === 'string') return 50; // Default to 50%
    
    const maxSize = parseInt(stats.maxSize);
    if (isNaN(maxSize) || maxSize === 0) return 0;
    
    const usedSize = stats.remainingSize > 0 ? (1 - (stats.remainingSize / config.ai.maxCacheSizeBytes)) * 100 : 0;
    return Math.min(Math.max(usedSize, 0), 100); // Clamp between 0 and 100
  };
  
  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the AI response cache? This action cannot be undone.')) {
      clearCache();
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">AI Cache Manager</CardTitle>
            <CardDescription>Manage Mistral-7B response caching</CardDescription>
          </div>
          <Badge 
            variant={isError ? "destructive" : isLoading ? "outline" : stats?.itemCount ? "default" : "secondary"}
            className="px-2 py-1"
          >
            {isError ? "Error" : isLoading ? "Loading..." : stats?.itemCount ? "Active" : "Empty"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isError ? (
          <div className="py-4 text-center text-destructive">
            <p>Failed to load cache statistics.</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cached Items:</span>
                <span className="font-medium">{stats?.itemCount || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Max Items:</span>
                <span className="font-medium">{stats?.maxItems || 0}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Cache Usage</span>
                <span className="font-medium">{stats?.maxSize || '10 MB'}</span>
              </div>
              <Progress
                value={calculateUsagePercentage()}
                className="h-2"
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearCache}
          disabled={isClearing || isLoading || (stats?.itemCount === 0)}
        >
          {isClearing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Trash2 className="h-4 w-4 mr-1" />
          )}
          Clear Cache
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AiCacheManager;