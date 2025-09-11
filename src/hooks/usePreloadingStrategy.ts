/**
 * Predictive Preloading Strategy Hook
 * 
 * Handles intelligent preloading based on user behavior patterns
 */

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './useApiWithAbort';
import { requestIdleCallbackPolyfill } from '@/utils/compatibility';

interface PreloadingConfig {
  predictivePreloading?: boolean;
  maxPreloadOperations?: number;
}

export const usePreloadingStrategy = (config: PreloadingConfig = {}) => {
  const queryClient = useQueryClient();
  const preloadingRef = useRef(new Set<string>());
  const {
    predictivePreloading = true,
    maxPreloadOperations = 5,
  } = config;

  // Predictive preloading based on user behavior
  const predictivePreload = useCallback((interaction: { type: string; data: any }) => {
    if (!predictivePreloading || preloadingRef.current.size >= maxPreloadOperations) return;

    requestIdleCallbackPolyfill(() => {
      const { type, data } = interaction;

      switch (type) {
        case 'product_view':
          // Preload related products in the same category
          if (data.category && !preloadingRef.current.has(`category_${data.category}`)) {
            preloadingRef.current.add(`category_${data.category}`);
            
            queryClient.prefetchQuery({
              queryKey: [...queryKeys.products, { category: data.category }],
              staleTime: 5 * 60 * 1000,
            });
          }
          break;

        case 'category_browse':
          // Preload featured products for quick navigation
          if (!preloadingRef.current.has('featured_products')) {
            preloadingRef.current.add('featured_products');
            
            queryClient.prefetchQuery({
              queryKey: queryKeys.featuredProducts,
              staleTime: 10 * 60 * 1000,
            });
          }
          break;

        case 'search_query':
          // Preload popular search results
          if (data.query && data.query.length > 2) {
            const popularQueries = ['shoes', 'bags', 'clothing'];
            const similarQuery = popularQueries.find(q => 
              q.toLowerCase().includes(data.query.toLowerCase()) ||
              data.query.toLowerCase().includes(q.toLowerCase())
            );

            if (similarQuery && !preloadingRef.current.has(`search_${similarQuery}`)) {
              preloadingRef.current.add(`search_${similarQuery}`);
              
              setTimeout(() => {
                queryClient.prefetchQuery({
                  queryKey: [...queryKeys.products, 'search', similarQuery],
                  staleTime: 2 * 60 * 1000,
                });
              }, 1000);
            }
          }
          break;

        case 'cart_interaction':
          // Preload checkout related data
          if (!preloadingRef.current.has('checkout_prep')) {
            preloadingRef.current.add('checkout_prep');
          }
          break;
      }
    });
  }, [queryClient, predictivePreloading, maxPreloadOperations]);

  // Clear preloading cache
  const clearPreloadingCache = useCallback(() => {
    preloadingRef.current.clear();
  }, []);

  // Get preloading statistics
  const getPreloadingStats = useCallback(() => ({
    activePreloads: preloadingRef.current.size,
    maxOperations: maxPreloadOperations,
    utilizationRate: (preloadingRef.current.size / maxPreloadOperations) * 100,
  }), [maxPreloadOperations]);

  return {
    predictivePreload,
    clearPreloadingCache,
    getPreloadingStats,
  };
};