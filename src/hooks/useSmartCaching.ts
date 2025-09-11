/**
 * Smart Caching Hook
 * 
 * Orchestrates intelligent cache management using specialized modules
 */

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import requestDeduplicator from '@/utils/requestDeduplicator';
import { usePreloadingStrategy } from './usePreloadingStrategy';
import { useCacheCleanup } from './useCacheCleanup';
import { useMemoryManager } from './useMemoryManager';

interface SmartCachingConfig {
  /** Enable predictive preloading */
  predictivePreloading?: boolean;
  /** Enable cache warming on idle */
  idleCacheWarming?: boolean;
  /** Enable memory pressure monitoring */
  memoryPressureMonitoring?: boolean;
  /** Maximum cache age before refresh (ms) */
  maxCacheAge?: number;
  /** Enable aggressive cleanup for mobile */
  mobileOptimization?: boolean;
}

export const useSmartCaching = (config: SmartCachingConfig = {}) => {
  const queryClient = useQueryClient();
  const lastInteractionRef = useRef<{ type: string; data: any; timestamp: number } | null>(null);

  const {
    predictivePreloading = true,
    idleCacheWarming = true,
    memoryPressureMonitoring = true,
    maxCacheAge = 30 * 60 * 1000, // 30 minutes
    mobileOptimization = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  } = config;

  // Initialize specialized hooks
  const { predictivePreload } = usePreloadingStrategy({
    predictivePreloading,
    maxPreloadOperations: 5,
  });

  const { warmCacheOnIdle } = useCacheCleanup({
    maxCacheAge,
    cleanupInterval: 60000,
    memoryPressureThreshold: 30,
    mobileOptimization,
  });

  const { getMemoryMetrics, performMemoryCleanup } = useMemoryManager({
    memoryThreshold: 80,
    monitoringEnabled: memoryPressureMonitoring,
    aggressiveCleanup: mobileOptimization,
  });

  // Track user interactions for predictive preloading
  const trackInteraction = useCallback((type: string, data: any) => {
    const interaction = { type, data, timestamp: Date.now() };
    lastInteractionRef.current = interaction;
    predictivePreload(interaction);
  }, [predictivePreload]);

  // Cache invalidation with smart refresh
  const smartInvalidate = useCallback((pattern: string, refreshStrategy: 'immediate' | 'background' | 'on-demand' = 'background') => {
    requestDeduplicator.invalidateByPattern(pattern);

    if (refreshStrategy === 'immediate') {
      queryClient.refetchQueries({
        predicate: (query) => JSON.stringify(query.queryKey).includes(pattern),
      });
    } else if (refreshStrategy === 'background') {
      // Refresh in background after a delay
      setTimeout(() => {
        queryClient.refetchQueries({
          predicate: (query) => JSON.stringify(query.queryKey).includes(pattern),
          type: 'active',
        });
      }, 1000);
    }
  }, [queryClient]);

  return {
    trackInteraction,
    smartInvalidate,
    warmCacheOnIdle,
    getCacheStats: () => ({
      react: queryClient.getQueryCache().getAll().length,
      deduplication: requestDeduplicator.getMetrics(),
      memory: getMemoryMetrics(),
    }),
    performMemoryCleanup,
  };
};
