/**
 * Deep Page Preloading Hook
 * Handles preloading of likely parent routes when entering deep pages
 */

import { useEffect } from 'react';
import { prefetchRouteResources } from '@/utils/routePrefetch';

interface DeepPagePreloadingConfig {
  parentRoutes?: string[];
  fallbackRoutes?: string[];
  enabled?: boolean;
  delay?: number;
}

export const useDeepPagePreloading = (config: DeepPagePreloadingConfig = {}) => {
  const {
    parentRoutes = [],
    fallbackRoutes = [],
    enabled = true,
    delay = 1000
  } = config;

  useEffect(() => {
    if (!enabled || (parentRoutes.length === 0 && fallbackRoutes.length === 0)) {
      return;
    }

    const preloadTimer = setTimeout(async () => {
      const routesToPreload = [...parentRoutes, ...fallbackRoutes];
      
      try {
        // Preload parent routes first (higher priority)
        for (const route of parentRoutes) {
          await prefetchRouteResources(route);
          if (import.meta.env.DEV) {
            console.log(`Deep page preloaded parent route: ${route}`);
          }
        }
        
        // Then preload fallback routes
        for (const route of fallbackRoutes) {
          await prefetchRouteResources(route);
          if (import.meta.env.DEV) {
            console.log(`Deep page preloaded fallback route: ${route}`);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Deep page preloading failed:', error);
        }
      }
    }, delay);

    return () => clearTimeout(preloadTimer);
  }, [parentRoutes, fallbackRoutes, enabled, delay]);
};

/**
 * Pre-configured hooks for common deep page patterns
 */

export const useProductDetailPreloading = () => {
  useDeepPagePreloading({
    parentRoutes: ['/product'],
    fallbackRoutes: ['/'],
    delay: 800
  });
};

export const useCheckoutPreloading = () => {
  useDeepPagePreloading({
    parentRoutes: ['/cart'],
    fallbackRoutes: ['/order-confirmation'],
    delay: 1200
  });
};

export const useAccountPagePreloading = () => {
  useDeepPagePreloading({
    parentRoutes: ['/account'],
    fallbackRoutes: ['/'],
    delay: 1000
  });
};

export const useAuthPagePreloading = () => {
  useDeepPagePreloading({
    parentRoutes: ['/login'],
    fallbackRoutes: ['/'],
    delay: 1500
  });
};