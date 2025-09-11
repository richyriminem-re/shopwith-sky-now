/**
 * Memory Management Hook
 * 
 * Monitors and manages application memory usage
 */

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import requestDeduplicator from '@/utils/requestDeduplicator';

interface MemoryMetrics {
  heapUsed?: number;
  heapTotal?: number;
  heapLimit?: number;
  usagePercentage?: number;
  cacheSize: number;
  queryCount: number;
}

interface MemoryManagerConfig {
  memoryThreshold?: number;
  monitoringEnabled?: boolean;
  aggressiveCleanup?: boolean;
}

export const useMemoryManager = (config: MemoryManagerConfig = {}) => {
  const queryClient = useQueryClient();
  const metricsRef = useRef<MemoryMetrics>({ cacheSize: 0, queryCount: 0 });
  const {
    memoryThreshold = 80, // 80% of available memory
    monitoringEnabled = true,
    aggressiveCleanup = false,
  } = config;

  // Get current memory metrics
  const getMemoryMetrics = useCallback((): MemoryMetrics => {
    const cache = queryClient.getQueryCache();
    const deduplicationMetrics = requestDeduplicator.getMetrics();
    
    let memoryInfo: MemoryMetrics = {
      cacheSize: deduplicationMetrics.cacheSize,
      queryCount: cache.getAll().length,
    };

    // Get browser memory info if available
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory;
      memoryInfo = {
        ...memoryInfo,
        heapUsed: perfMemory.usedJSHeapSize,
        heapTotal: perfMemory.totalJSHeapSize,
        heapLimit: perfMemory.jsHeapSizeLimit,
        usagePercentage: (perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit) * 100,
      };
    }

    metricsRef.current = memoryInfo;
    return memoryInfo;
  }, [queryClient]);

  // Check if memory cleanup is needed
  const isMemoryPressureHigh = useCallback((): boolean => {
    const metrics = getMemoryMetrics();
    
    // Check multiple pressure indicators
    const conditions = [
      metrics.usagePercentage && metrics.usagePercentage > memoryThreshold,
      metrics.cacheSize > 1000,
      metrics.queryCount > 200,
    ];

    return conditions.some(Boolean);
  }, [getMemoryMetrics, memoryThreshold]);

  // Perform memory cleanup
  const performMemoryCleanup = useCallback((force = false) => {
    if (!force && !isMemoryPressureHigh()) return false;

    const cache = queryClient.getQueryCache();
    const now = Date.now();
    let cleanedUp = false;

    // Remove old inactive queries
    const oldQueries = cache.findAll({
      predicate: (query) => {
        const lastAccess = (query as any).state.dataUpdatedAt;
        const age = now - lastAccess;
        const isInactive = !(query as any).state.isFetching;
        
        if (aggressiveCleanup) {
          return age > 10 * 60 * 1000 && isInactive; // 10 minutes aggressive
        }
        return age > 30 * 60 * 1000 && isInactive; // 30 minutes normal
      },
    });

    if (oldQueries.length > 0) {
      oldQueries.forEach((query) => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
      cleanedUp = true;
    }

    // Clear deduplication cache
    requestDeduplicator.clearCache();

    // Force garbage collection if available (development only)
    if (import.meta.env.DEV && (window as any).gc) {
      (window as any).gc();
    }

    return cleanedUp;
  }, [queryClient, isMemoryPressureHigh, aggressiveCleanup]);

  // Monitor memory usage
  useEffect(() => {
    if (!monitoringEnabled) return;

    const monitorInterval = setInterval(() => {
      const metrics = getMemoryMetrics();
      
      // Log memory usage in development
      if (import.meta.env.DEV && metrics.usagePercentage) {
        console.log(`Memory usage: ${metrics.usagePercentage.toFixed(1)}%`);
      }

      // Perform cleanup if needed
      if (isMemoryPressureHigh()) {
        const cleaned = performMemoryCleanup();
        if (cleaned && import.meta.env.DEV) {
          console.log('Memory cleanup performed');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(monitorInterval);
  }, [getMemoryMetrics, isMemoryPressureHigh, performMemoryCleanup, monitoringEnabled]);

  return {
    getMemoryMetrics,
    isMemoryPressureHigh,
    performMemoryCleanup,
    currentMetrics: metricsRef.current,
  };
};