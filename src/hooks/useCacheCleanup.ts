/**
 * Cache Cleanup Management Hook
 * 
 * Handles intelligent cache cleanup and memory management
 */

import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import requestDeduplicator from '@/utils/requestDeduplicator';
import { requestIdleCallbackPolyfill } from '@/utils/compatibility';

interface CacheCleanupConfig {
  maxCacheAge?: number;
  cleanupInterval?: number;
  memoryPressureThreshold?: number;
  mobileOptimization?: boolean;
}

export const useCacheCleanup = (config: CacheCleanupConfig = {}) => {
  const queryClient = useQueryClient();
  const {
    maxCacheAge = 30 * 60 * 1000, // 30 minutes
    cleanupInterval = 60000, // 1 minute
    memoryPressureThreshold = 30,
    mobileOptimization = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  } = config;

  // Cache warming during idle time
  const warmCacheOnIdle = useCallback(() => {
    requestIdleCallbackPolyfill(() => {
      const now = Date.now();
      const cache = queryClient.getQueryCache();
      
      // Find stale but recently accessed queries
      const staleQueries = cache.findAll({
        stale: true,
        predicate: (query) => {
          const lastAccess = (query as any).state.dataUpdatedAt;
          return lastAccess && (now - lastAccess) < maxCacheAge;
        },
      });

      // Refresh a few stale queries
      staleQueries.slice(0, 3).forEach((query) => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: query.queryKey,
            type: 'active',
          });
        }, Math.random() * 2000); // Stagger requests
      });
    }, { timeout: 5000 });
  }, [queryClient, maxCacheAge]);

  // Memory pressure cleanup
  const performMemoryCleanup = useCallback(() => {
    const metrics = requestDeduplicator.getMetrics();
    
    // Clean up if memory usage is high
    if (metrics.memoryUsage > memoryPressureThreshold || metrics.cacheSize > 500) {
      // Remove old cache entries
      const cache = queryClient.getQueryCache();
      const oldQueries = cache.findAll({
        predicate: (query) => {
          const age = Date.now() - (query as any).state.dataUpdatedAt;
          return age > maxCacheAge;
        },
      });

      oldQueries.forEach((query) => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });

      // Clear deduplication cache
      requestDeduplicator.clearCache();
    }
  }, [queryClient, maxCacheAge, memoryPressureThreshold]);

  // Mobile-specific optimization
  const optimizeForMobile = useCallback(() => {
    if (!mobileOptimization) return;

    // More aggressive cleanup on mobile
    const cleanup = () => {
      const cache = queryClient.getQueryCache();
      
      // Keep only essential queries on mobile
      const essentialPatterns = [
        'featured',
        'products', // Current page
        'cart',
        'user',
      ];

      cache.findAll().forEach((query) => {
        const isEssential = essentialPatterns.some(pattern => 
          JSON.stringify(query.queryKey).includes(pattern)
        );

        if (!isEssential) {
          const age = Date.now() - (query as any).state.dataUpdatedAt;
          if (age > 5 * 60 * 1000) { // 5 minutes on mobile
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        }
      });
    };

    // Listen for memory warnings on mobile
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        if (memInfo && memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.8) {
          cleanup();
        }
      };

      const interval = setInterval(checkMemory, 30000);
      return () => clearInterval(interval);
    }

    // Fallback cleanup for mobile
    const interval = setInterval(cleanup, 2 * 60 * 1000); // Every 2 minutes
    return () => clearInterval(interval);
  }, [queryClient, mobileOptimization]);

  // Automatic cleanup monitoring
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Start monitoring
    const memoryInterval = setInterval(performMemoryCleanup, cleanupInterval);
    cleanupFunctions.push(() => clearInterval(memoryInterval));

    const mobileCleanup = optimizeForMobile();
    if (mobileCleanup) cleanupFunctions.push(mobileCleanup);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [performMemoryCleanup, optimizeForMobile, cleanupInterval]);

  return {
    warmCacheOnIdle,
    performMemoryCleanup,
    optimizeForMobile,
  };
};
