/**
 * Route Bundle Prefetcher
 * Handles intelligent preloading of route bundles and resources
 */

interface RouteConfig {
  component: () => Promise<any>;
  preloadPriority: 'low' | 'medium' | 'high';
}

// Route mapping for dynamic imports
const ROUTE_BUNDLES: Record<string, RouteConfig> = {
  '/': {
    component: () => import('@/pages/Home'),
    preloadPriority: 'high'
  },
  '/product': {
    component: () => import('@/pages/Products'),
    preloadPriority: 'high'
  },
  '/cart': {
    component: () => import('@/pages/Cart'),
    preloadPriority: 'medium'
  },
  '/checkout': {
    component: () => import('@/pages/Checkout'),
    preloadPriority: 'high'
  },
  '/checkout-enhanced': {
    component: () => import('@/pages/CheckoutEnhanced'),
    preloadPriority: 'high'
  },
  '/checkout-hybrid': {
    component: () => import('@/pages/CheckoutHybrid'),
    preloadPriority: 'high'
  },
  '/account': {
    component: () => import('@/pages/Account'),
    preloadPriority: 'medium'
  },
  '/orders': {
    component: () => import('@/pages/Orders'),
    preloadPriority: 'medium'
  },
  '/wishlist': {
    component: () => import('@/pages/Wishlist'),
    preloadPriority: 'medium'
  },
  '/login': {
    component: () => import('@/pages/Login'),
    preloadPriority: 'medium'
  },
  '/help': {
    component: () => import('@/pages/Help'),
    preloadPriority: 'low'
  },
  '/contact': {
    component: () => import('@/pages/Contact'),
    preloadPriority: 'low'
  },
  '/order-confirmation': {
    component: () => import('@/pages/OrderConfirmation'),
    preloadPriority: 'high'
  },
  '/notifications': {
    component: () => import('@/pages/Notifications'),
    preloadPriority: 'low'
  }
};

const preloadedBundles = new Set<string>();
const preloadingPromises = new Map<string, Promise<any>>();

/**
 * Prefetch JavaScript bundle for a route
 */
export const prefetchBundle = async (route: string): Promise<void> => {
  // Normalize route (remove query params and hash)
  const normalizedRoute = route.split('?')[0].split('#')[0];
  
  // Handle dynamic routes like /product/:handle
  let routeConfig = ROUTE_BUNDLES[normalizedRoute];
  if (!routeConfig && normalizedRoute.startsWith('/product/')) {
    routeConfig = ROUTE_BUNDLES['/product'];
  }
  
  if (!routeConfig) {
    if (import.meta.env.DEV) {
      console.warn(`No bundle config found for route: ${normalizedRoute}`);
    }
    return;
  }
  
  if (preloadedBundles.has(normalizedRoute)) {
    return; // Already preloaded
  }
  
  // Check if already preloading
  if (preloadingPromises.has(normalizedRoute)) {
    await preloadingPromises.get(normalizedRoute);
    return;
  }
  
  // Check device capabilities
  if (!shouldPreloadBundle()) {
    return;
  }
  
  const preloadPromise = routeConfig.component()
    .then(() => {
      preloadedBundles.add(normalizedRoute);
      preloadingPromises.delete(normalizedRoute);
      
      if (import.meta.env.DEV) {
        console.log(`Bundle preloaded: ${normalizedRoute}`);
      }
    })
    .catch((error) => {
      preloadingPromises.delete(normalizedRoute);
      console.warn(`Failed to preload bundle for ${normalizedRoute}:`, error);
    });
  
  preloadingPromises.set(normalizedRoute, preloadPromise);
  await preloadPromise;
};

/**
 * Notify service worker to preload route
 */
export const prefetchRouteInSW = async (route: string): Promise<void> => {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return;
  }
  
  try {
    navigator.serviceWorker.controller.postMessage({
      type: 'PRELOAD_ROUTES',
      data: { 
        routes: [route],
        priority: 'low',
        trigger: 'prefetch'
      }
    });
  } catch (error) {
    console.warn('Failed to notify service worker for route preload:', error);
  }
};

/**
 * Combined route resource prefetching (both bundle and SW cache)
 */
export const prefetchRouteResources = async (route: string): Promise<void> => {
  // Run both in parallel for maximum efficiency
  await Promise.allSettled([
    prefetchBundle(route),
    prefetchRouteInSW(route)
  ]);
};

/**
 * Check if bundle preloading should be enabled based on device capabilities
 */
const shouldPreloadBundle = (): boolean => {
  // Respect data saver mode
  const connection = (navigator as any).connection;
  if (connection?.saveData) {
    return false;
  }
  
  // Disable on slow connections
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    return false;
  }
  
  // Check memory constraints
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 2) {
    return false;
  }
  
  // Check battery level if available
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      return battery.level > 0.2; // Don't preload if battery is very low
    });
  }
  
  return true;
};

/**
 * Get prefetch statistics
 */
export const getPrefetchStats = () => ({
  preloadedBundles: preloadedBundles.size,
  activePrefetches: preloadingPromises.size,
  preloadedRoutes: Array.from(preloadedBundles),
  shouldPreload: shouldPreloadBundle()
});

/**
 * Clear prefetch cache (useful for development)
 */
export const clearPrefetchCache = () => {
  preloadedBundles.clear();
  preloadingPromises.clear();
};