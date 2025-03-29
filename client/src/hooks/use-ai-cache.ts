import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export interface CacheStats {
  size: number;
  itemCount: number;
  remainingSize: string | number;
  hits: string;
  maxSize: string;
  maxItems: number;
}

/**
 * Hook to get AI cache statistics
 * @returns Query result with cache statistics
 */
export function useAiCacheStats() {
  return useQuery<{ success: boolean; data: CacheStats }>({
    queryKey: ['/api/ai/cache/stats'],
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to clear the AI cache
 * @returns Mutation to clear the AI cache
 */
export function useAiCacheClear() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/cache/clear');
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Cache cleared',
        description: 'The AI response cache has been successfully cleared.',
      });
      // Refresh cache stats
      queryClient.invalidateQueries({ queryKey: ['/api/ai/cache/stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to clear cache',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to create an AI conversation
 * @returns Mutation to create an AI conversation
 */
export function useAiConversation() {
  return useMutation({
    mutationFn: async ({ query, useCache = true }: { query: string; useCache?: boolean }) => {
      const response = await apiRequest('POST', '/api/ai/conversation', {
        query,
        useCache,
      });
      return await response.json();
    },
    onError: (error) => {
      toast({
        title: 'AI conversation failed',
        description: error.message || 'An unexpected error occurred while processing your query.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to get AI conversations
 * @param userId Optional user ID to filter conversations
 * @returns Query result with conversations
 */
export function useAiConversations(userId?: number) {
  return useQuery({
    queryKey: ['/api/ai/conversations', userId ? `?userId=${userId}` : ''],
  });
}