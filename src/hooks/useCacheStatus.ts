/**
 * Cache Status Hook for UI Components
 * 
 * Provides cache status and management utilities for components
 */

import { useState, useEffect, useCallback } from 'react';
import { useCacheOptimization } from './useCacheOptimization';
import { globalCacheManager } from '@/utils/cacheManager';

export interface CacheStats {
  react: number;
  custom: {
    memoryUsage: number;
    localStorageUsage: number;
    hitRate: number;
    missRate: number;
    compressionRatio: number;
    totalEntries: number;
    performanceGain: number;
  };
}

export interface CacheStatusHook {
  cacheStats: CacheStats;
  isLoading: boolean;
  actions: {
    clearCache: () => void;
    warmUpCache: () => void;
    invalidateByPattern: (pattern: string) => void;
    refreshStats: () => void;
  };
}

export const useCacheStatus = (): CacheStatusHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    react: 0,
    custom: {
      memoryUsage: 0,
      localStorageUsage: 0,
      hitRate: 0,
      missRate: 0,
      compressionRatio: 0,
      totalEntries: 0,
      performanceGain: 0,
    },
  });

  const {
    invalidateByPattern,
    invalidateAllCache,
    warmCache,
    getCacheStats,
  } = useCacheOptimization();

  const refreshStats = useCallback(() => {
    setIsLoading(true);
    try {
      const stats = getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.warn('Failed to refresh cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCacheStats]);

  const clearCache = useCallback(() => {
    setIsLoading(true);
    try {
      invalidateAllCache();
      refreshStats();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, [invalidateAllCache, refreshStats]);

  const warmUpCache = useCallback(() => {
    setIsLoading(true);
    try {
      warmCache({ action: 'manual_warmup' });
      setTimeout(refreshStats, 1000); // Allow time for warming
    } catch (error) {
      console.warn('Failed to warm up cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, [warmCache, refreshStats]);

  const invalidatePattern = useCallback((pattern: string) => {
    setIsLoading(true);
    try {
      invalidateByPattern(pattern);
      setTimeout(refreshStats, 500); // Allow time for invalidation
    } catch (error) {
      console.warn('Failed to invalidate pattern:', error);
    } finally {
      setIsLoading(false);
    }
  }, [invalidateByPattern, refreshStats]);

  // Auto-refresh stats periodically
  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    cacheStats,
    isLoading,
    actions: {
      clearCache,
      warmUpCache,
      invalidateByPattern: invalidatePattern,
      refreshStats,
    },
  };
};