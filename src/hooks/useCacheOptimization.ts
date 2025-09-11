/**
 * Enhanced Cache Optimization Hook
 * 
 * Advanced caching strategies with intelligent invalidation, predictive warming,
 * and multi-level cache coordination
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useRef } from 'react';
import { queryKeys } from './useApiWithAbort';
import { requestIdleCallbackPolyfill } from '@/utils/compatibility';
import { globalCacheManager, type CacheMetrics } from '@/utils/cacheManager';

interface AdvancedCacheConfig {
  prefetchProducts?: boolean;
  prefetchCategories?: boolean;
  backgroundRefetch?: boolean;
  persistCache?: boolean;
  predictiveWarming?: boolean;
  enableAnalytics?: boolean;
  networkAware?: boolean;
  crossTabSync?: boolean;
}

interface CacheAnalytics {
  queryCacheStats: {
    size: number;
    activeQueries: number;
    staleQueries: number;
  };
  customCacheStats: CacheMetrics;
  behaviorPatterns: Record<string, number>;
  performanceImpact: {
    averageLoadTime: number;
    cacheHitLatency: number;
    cacheMissLatency: number;
  };
}

export const useCacheOptimization = (config: AdvancedCacheConfig = {}) => {
  const queryClient = useQueryClient();
  const [analytics, setAnalytics] = useState<CacheAnalytics | null>(null);
  const behaviorPatternRef = useRef(new Map<string, number>());
  const performanceMetricsRef = useRef({
    loadTimes: [] as number[],
    hitLatencies: [] as number[],
    missLatencies: [] as number[],
  });

  const {
    prefetchProducts: shouldPrefetchProducts = true,
    prefetchCategories: shouldPrefetchCategories = true,
    backgroundRefetch = true,
    persistCache = true,
    predictiveWarming = true,
    enableAnalytics = true,
    networkAware = true,
    crossTabSync = true,
  } = config;

  const prefetchFeaturedProducts = useCallback(() => {
    if (!shouldPrefetchProducts) return;

    requestIdleCallbackPolyfill(() => {
      const startTime = performance.now();
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.featuredProducts,
        staleTime: 15 * 60 * 1000,
      }).then(() => {
        const loadTime = performance.now() - startTime;
        performanceMetricsRef.current.hitLatencies.push(loadTime);
        
        // Cache in custom cache manager
        globalCacheManager.set('featured:products', 'prefetched', {
          ttl: 15 * 60 * 1000,
          tags: ['featured', 'products'],
          priority: 'high',
        });
      });
    });
  }, [queryClient, shouldPrefetchProducts]);

  const prefetchCategoriesCallback = useCallback(() => {
    if (!shouldPrefetchCategories) return;

    const popularCategories = ['mens', 'womens', 'shoes', 'bags'];
    const userPatterns = behaviorPatternRef.current;
    
    // Sort categories by user behavior patterns
    const sortedCategories = popularCategories.sort((a, b) => {
      const aScore = userPatterns.get(`category:${a}`) || 0;
      const bScore = userPatterns.get(`category:${b}`) || 0;
      return bScore - aScore;
    });

    requestIdleCallbackPolyfill(() => {
      sortedCategories.forEach((category, index) => {
        setTimeout(() => {
          const priority = index < 2 ? 'high' : 'normal';
          
          queryClient.prefetchQuery({
            queryKey: [...queryKeys.products, { category }],
            staleTime: 10 * 60 * 1000,
          }).then(() => {
            globalCacheManager.set(`category:${category}`, 'prefetched', {
              ttl: 10 * 60 * 1000,
              tags: ['category', 'products'],
              priority,
            });
          });
        }, index * 500);
      });
    });
  }, [queryClient, shouldPrefetchCategories]);

  // Enhanced background refetching with staleness awareness
  const setupBackgroundRefetch = useCallback(() => {
    if (!backgroundRefetch) return;

    const performIntelligentRefresh = () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) return;

      const cache = queryClient.getQueryCache();
      const staleQueries = cache.findAll({
        stale: true,
        predicate: (query) => {
          const lastUpdate = query.state.dataUpdatedAt;
          const age = Date.now() - lastUpdate;
          
          // Only refresh recently accessed stale data
          return age < 30 * 60 * 1000; // 30 minutes
        },
      });

      // Prioritize critical queries
      const prioritizedQueries = staleQueries.sort((a, b) => {
        const keyA = JSON.stringify(a.queryKey);
        const keyB = JSON.stringify(b.queryKey);
        
        if (keyA.includes('featured') || keyA.includes('cart')) return -1;
        if (keyB.includes('featured') || keyB.includes('cart')) return 1;
        return 0;
      });

      // Refresh top 3 stale queries
      prioritizedQueries.slice(0, 3).forEach((query, index) => {
        setTimeout(() => {
          queryClient.refetchQueries({
            queryKey: query.queryKey,
            type: 'active',
          });
        }, index * 1000);
      });
    };

    const interval = setInterval(performIntelligentRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [queryClient, backgroundRefetch]);

  // Advanced cache persistence with compression
  const setupAdvancedPersistence = useCallback(() => {
    if (!persistCache || typeof window === 'undefined') return;

    const saveAdvancedCache = () => {
      try {
        const cache = queryClient.getQueryCache();
        const criticalQueries = cache.findAll({
          predicate: (query) => {
            const key = JSON.stringify(query.queryKey);
            return key.includes('featured') || key.includes('cart') || key.includes('user');
          },
        });

        const cacheData = criticalQueries.map(query => ({
          queryKey: query.queryKey,
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
          priority: 'high' as const,
        }));

        globalCacheManager.set('app:critical-cache', cacheData, {
          ttl: 60 * 60 * 1000, // 1 hour
          priority: 'critical',
          tags: ['persistence'],
        });

      } catch (error) {
        console.warn('Failed to save advanced cache:', error);
      }
    };

    const restoreAdvancedCache = () => {
      try {
        const cached = globalCacheManager.get<any[]>('app:critical-cache');
        
        if (cached && Array.isArray(cached)) {
          cached.forEach((item) => {
            if (Date.now() - item.dataUpdatedAt < 30 * 60 * 1000) { // 30 minutes
              queryClient.setQueryData(item.queryKey, item.data);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to restore advanced cache:', error);
      }
    };

    restoreAdvancedCache();

    const saveInterval = setInterval(saveAdvancedCache, 3 * 60 * 1000); // Every 3 minutes
    window.addEventListener('beforeunload', saveAdvancedCache);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', saveAdvancedCache);
    };
  }, [queryClient, persistCache]);

  // Predictive cache warming based on user patterns
  const setupPredictiveWarming = useCallback(() => {
    if (!predictiveWarming) return;

    const handleCachePrediction = (event: CustomEvent) => {
      const { key, confidence } = event.detail;
      
      if (confidence > 0.7) {
        // High confidence prediction - prefetch immediately
        requestIdleCallbackPolyfill(() => {
          if (key.startsWith('product:')) {
            const productId = key.split(':')[1];
            queryClient.prefetchQuery({
              queryKey: queryKeys.product(productId),
              staleTime: 5 * 60 * 1000,
            });
          } else if (key.startsWith('category:')) {
            const category = key.split(':')[1];
            queryClient.prefetchQuery({
              queryKey: [...queryKeys.products, { category }],
              staleTime: 5 * 60 * 1000,
            });
          }
        });
      }
    };

    window.addEventListener('cache:prediction', handleCachePrediction as EventListener);
    
    return () => {
      window.removeEventListener('cache:prediction', handleCachePrediction as EventListener);
    };
  }, [queryClient, predictiveWarming]);

  // Cross-tab cache synchronization
  const setupCrossTabSync = useCallback(() => {
    if (!crossTabSync || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('cache:sync:')) {
        const action = event.key.split(':')[2];
        const data = event.newValue ? JSON.parse(event.newValue) : null;

        switch (action) {
          case 'invalidate':
            if (data?.pattern) {
              queryClient.invalidateQueries({
                predicate: (query) => JSON.stringify(query.queryKey).includes(data.pattern),
              });
            }
            break;
          case 'update':
            if (data?.queryKey && data?.data) {
              queryClient.setQueryData(data.queryKey, data.data);
            }
            break;
          case 'clear':
            queryClient.clear();
            globalCacheManager.clear();
            break;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient, crossTabSync]);

  // Analytics collection
  const updateAnalytics = useCallback(() => {
    if (!enableAnalytics) return;

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const queryCacheStats = {
      size: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
    };

    const customCacheStats = globalCacheManager.getMetrics();
    
    const behaviorPatterns = Object.fromEntries(behaviorPatternRef.current);
    
    const performanceImpact = {
      averageLoadTime: performanceMetricsRef.current.loadTimes.reduce((a, b) => a + b, 0) / 
                      Math.max(performanceMetricsRef.current.loadTimes.length, 1),
      cacheHitLatency: performanceMetricsRef.current.hitLatencies.reduce((a, b) => a + b, 0) / 
                      Math.max(performanceMetricsRef.current.hitLatencies.length, 1),
      cacheMissLatency: performanceMetricsRef.current.missLatencies.reduce((a, b) => a + b, 0) / 
                       Math.max(performanceMetricsRef.current.missLatencies.length, 1),
    };

    setAnalytics({
      queryCacheStats,
      customCacheStats,
      behaviorPatterns,
      performanceImpact,
    });
  }, [queryClient, enableAnalytics]);

  // Initialize all optimizations
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Start prefetching
    prefetchFeaturedProducts();
    prefetchCategoriesCallback();

    // Setup advanced features
    const backgroundCleanup = setupBackgroundRefetch();
    const persistenceCleanup = setupAdvancedPersistence();
    const predictiveCleanup = setupPredictiveWarming();
    const crossTabCleanup = setupCrossTabSync();

    if (backgroundCleanup) cleanupFunctions.push(backgroundCleanup);
    if (persistenceCleanup) cleanupFunctions.push(persistenceCleanup);
    if (predictiveCleanup) cleanupFunctions.push(predictiveCleanup);
    if (crossTabCleanup) cleanupFunctions.push(crossTabCleanup);

    // Start analytics
    if (enableAnalytics) {
      const analyticsInterval = setInterval(updateAnalytics, 10000); // Every 10 seconds
      cleanupFunctions.push(() => clearInterval(analyticsInterval));
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [
    prefetchFeaturedProducts,
    prefetchCategoriesCallback,
    setupBackgroundRefetch,
    setupAdvancedPersistence,
    setupPredictiveWarming,
    setupCrossTabSync,
    updateAnalytics,
    enableAnalytics,
  ]);

  // Manual cache management with intelligence
  const invalidateByPattern = useCallback((pattern: string, strategy: 'immediate' | 'background' = 'immediate') => {
    // Invalidate in React Query
    queryClient.invalidateQueries({
      predicate: (query) => JSON.stringify(query.queryKey).includes(pattern),
    });

    // Invalidate in custom cache
    globalCacheManager.invalidate(`pattern:${pattern}`);

    // Sync across tabs
    if (crossTabSync) {
      localStorage.setItem('cache:sync:invalidate', JSON.stringify({ pattern, timestamp: Date.now() }));
    }
  }, [queryClient, crossTabSync]);

  const smartRefresh = useCallback((targets: string[] = []) => {
    if (targets.length === 0) {
      // Refresh all stale data
      queryClient.refetchQueries({ stale: true });
      return;
    }

    // Selective refresh
    targets.forEach(target => {
      queryClient.refetchQueries({
        predicate: (query) => JSON.stringify(query.queryKey).includes(target),
      });
    });
  }, [queryClient]);

  const warmCache = useCallback((context: { action?: string; data?: any } = {}) => {
    globalCacheManager.warmCache({
      userAction: context.action,
      currentKey: context.data?.key,
    });

    if (context.action === 'view_product') {
      prefetchFeaturedProducts();
    } else if (context.action === 'browse_category') {
      prefetchCategoriesCallback();
    }
  }, [prefetchFeaturedProducts, prefetchCategoriesCallback]);

  // Track user behavior
  const trackBehavior = useCallback((action: string, context?: any) => {
    const pattern = `${action}:${context?.category || context?.type || 'general'}`;
    const current = behaviorPatternRef.current.get(pattern) || 0;
    behaviorPatternRef.current.set(pattern, current + 1);

    // Trigger predictive warming
    warmCache({ action, data: context });
  }, [warmCache]);

  return {
    // Enhanced cache management
    invalidateByPattern,
    smartRefresh,
    warmCache,
    trackBehavior,
    
    // Legacy compatibility
    invalidateAllCache: () => {
      queryClient.clear();
      globalCacheManager.clear();
    },
    prefetchFeaturedProducts,
    prefetchCategories: prefetchCategoriesCallback,
    
    // Analytics and monitoring
    analytics,
    getCacheStats: () => ({
      react: queryClient.getQueryCache().getAll().length,
      custom: globalCacheManager.getMetrics(),
    }),
  };
};