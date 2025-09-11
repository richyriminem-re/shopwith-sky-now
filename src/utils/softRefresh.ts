/**
 * Soft refresh utility that avoids full page reloads
 * Uses React Router navigation with cache busting and timing analytics
 */

import { useNavigationMonitor } from './navigationMonitor';

interface SoftRefreshOptions {
  clearCaches?: boolean;
  reason?: string;
}

/**
 * Creates a soft refresh function that uses React Router instead of hard reloads
 */
export const createSoftRefresh = (navigate: (path: string, options?: any) => void) => {
  const { startNavigationTiming, trackNavigation } = useNavigationMonitor();

  return (options: SoftRefreshOptions = {}) => {
    const { clearCaches = false, reason = 'manual' } = options;
    
    // Start navigation timing for analytics
    startNavigationTiming();
    
    // Track the refresh event
    trackNavigation('navigation', window.location.pathname, {
      type: 'soft_refresh',
      reason,
      clearCaches,
      timestamp: Date.now()
    });

    // Clear caches if requested
    if (clearCaches && typeof window !== 'undefined') {
      try {
        // Clear React Query cache if available
        if ((window as any).queryClient) {
          (window as any).queryClient.clear();
        }
        
        // Clear service worker cache if available  
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach(name => {
              if (name.includes('workbox') || name.includes('precache')) {
                caches.delete(name);
              }
            });
          });
        }
      } catch (error) {
        console.warn('Failed to clear caches during soft refresh:', error);
      }
    }

    // Navigate to current path with cache busting parameter
    const currentPath = window.location.pathname + window.location.search;
    const separator = currentPath.includes('?') ? '&' : '?';
    const cacheBuster = `${separator}_refresh=${Date.now()}`;
    
    // Use replace to avoid adding to history stack
    navigate(currentPath + cacheBuster, { replace: true });
    
    // Remove the cache buster from URL after a short delay
    setTimeout(() => {
      navigate(window.location.pathname + window.location.search, { replace: true });
    }, 100);
  };
};

/**
 * Hook-based soft refresh that can be used in components
 */
export const useSoftRefresh = (navigate: (path: string, options?: any) => void) => {
  return createSoftRefresh(navigate);
};