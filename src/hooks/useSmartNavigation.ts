import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSmartFallback } from '@/utils/routeHierarchy';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { useToast } from '@/hooks/use-toast';
import { offlineToastSystem } from '@/utils/offlineToastSystem';
import { useNavigationState } from '@/utils/navigationStateManager';
import { useServiceWorkerComm } from '@/utils/serviceWorkerCommunication';

interface SmartNavigationOptions {
  fallback?: string;
  preventMultiple?: boolean;
  onError?: (error: Error) => void;
  breadcrumbHints?: string[];
}

interface SmartNavigationReturn {
  navigateBack: () => Promise<void>;
  isNavigating: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Smart navigation hook that provides safe back navigation with error handling and fallbacks
 */
export const useSmartNavigation = (options: SmartNavigationOptions = {}): SmartNavigationReturn => {
  const {
    fallback,  // Don't set default here, let getSmartFallback handle it
    preventMultiple = true,
    onError,
    breadcrumbHints
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickRef = useRef<number>(0);
  const { trackNavigation, trackError, trackFallback, startNavigationTiming, completeNavigationTiming } = useNavigationMonitor();
  const navState = useNavigationState();
  const swComm = useServiceWorkerComm();

  // Initialize offline toast system
  useEffect(() => {
    offlineToastSystem.initialize(toast);
  }, [toast]);

  // Clear any existing timeout and reset navigation state
  const clearNavigationState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsNavigating(false);
  }, []);

  // Update navigation state and clear timeout when location changes
  useEffect(() => {
    navState.updateRoute(location.pathname);
    clearNavigationState();
    
    if (import.meta.env.DEV) {
      console.log('Navigation completed, state cleared');
    }
  }, [location.key, location.pathname, clearNavigationState, navState]);

  // Enhanced history detection with navigation state manager
  const hasNavigationHistory = useCallback(() => {
    return navState.hasNavigationHistory();
  }, [navState]);

  const navigateBack = useCallback(async () => {
    const now = Date.now();
    
    // Debounce rapid clicks (250ms window)
    if (now - lastClickRef.current < 250) {
      return;
    }
    lastClickRef.current = now;
    
    if (preventMultiple && isNavigating) return;
    
    setIsNavigating(true);
    navState.setNavigating(true);
    
    // Start navigation timing for analytics
    const navigationId = startNavigationTiming(location.pathname, 'back_button');
    
    // Store navigation ID in state for later completion correlation
    navState.updateRoute(location.pathname, navigationId);
    
    trackNavigation('back_button', location.pathname, { navigationId });
    
    // Handle offline navigation with service worker coordination
    if (!navigator.onLine) {
      console.warn('Navigation attempted while offline');
      
      // Notify service worker about offline navigation attempt
      await swComm.notifyNavigationAttempt(location.pathname, true);
      
      // Check if service worker should handle this
      if (swComm.shouldServiceWorkerHandleOffline(location.pathname)) {
        clearNavigationState();
        return;
      }
      
      const canGoBack = hasNavigationHistory();
      if (canGoBack) {
        // Try to go back even when offline
        try {
          const previousRoute = navState.popFromHistory();
          if (previousRoute) {
            navigate(previousRoute, { replace: true });
          } else {
            navigate(-1);
          }
          
          clearNavigationState();
          
          // Set a shorter timeout for offline navigation
          timeoutRef.current = setTimeout(() => {
            trackFallback(location.pathname, '/offline', 'offline-timeout');
            navState.trackFailedNavigation(location.pathname);
            
            try {
              navigate('/offline', { replace: true });
            } catch (offlineNavError) {
              console.error('Failed to navigate to offline page:', offlineNavError);
              trackError(location.pathname, offlineNavError as Error);
            } finally {
              clearNavigationState();
            }
          }, 1500);
          
          return;
        } catch (error) {
          console.warn('Offline back navigation failed:', error);
          trackError(location.pathname, error as Error);
          navState.trackFailedNavigation(location.pathname);
        }
      }
      
      trackFallback(location.pathname, '/offline', 'offline-no-history');
      
      // Use offline-aware toast system
      offlineToastSystem.show({
        title: "You're offline",
        description: "Taking you to offline page",
        variant: "destructive"
      });
      
      // Navigate to offline page with enhanced error handling
      try {
        navigate('/offline', { replace: true });
      } catch (offlineNavError) {
        console.error('Failed to navigate to offline page:', offlineNavError);
        trackError(location.pathname, offlineNavError as Error);
        navState.trackFailedNavigation('/offline');
        
        // Final fallback to home if offline page fails
        try {
          navigate('/', { replace: true });
        } catch (homeNavError) {
          console.error('Critical: All navigation failed while offline:', homeNavError);
        }
      } finally {
        clearNavigationState();
      }
      return;
    }
    
    // Clear any existing timeout before setting new one
    clearNavigationState();
    
    // Set timeout as safety net - only cleared by location.key change
    timeoutRef.current = setTimeout(() => {
      console.warn('Navigation timeout reached, using fallback');
      const timeoutFallback = fallback || getSmartFallback(location.pathname, breadcrumbHints);
      trackFallback(location.pathname, timeoutFallback, 'timeout');
      try {
        navigate(timeoutFallback, { replace: true });
      } catch (timeoutNavError) {
        console.error('Timeout fallback navigation failed:', timeoutNavError);
        trackError(location.pathname, timeoutNavError as Error);
        // Final fallback to home
        try {
          navigate('/', { replace: true });
        } catch (homeNavError) {
          console.error('Critical: Home navigation failed:', homeNavError);
        }
      } finally {
        clearNavigationState();
      }
    }, 3000);
    
    try {
      // Notify service worker about navigation attempt
      await swComm.notifyNavigationAttempt(location.pathname, false);
      
      const canGoBack = hasNavigationHistory();
      
      if (canGoBack) {
        // Enhanced back navigation with state management
        const previousRoute = navState.popFromHistory();
        if (previousRoute && !navState.hasRecentFailure(previousRoute)) {
          navigate(previousRoute, { replace: true });
        } else {
          // Fallback to React Router's back
          navigate(-1);
        }
      } else {
        // Use smart fallback based on route hierarchy
        const smartFallback = fallback || getSmartFallback(location.pathname, breadcrumbHints);
        trackFallback(location.pathname, smartFallback, 'no-history');
        navigate(smartFallback, { replace: true });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      trackError(location.pathname, error as Error);
      navState.trackFailedNavigation(location.pathname);
      
      // Call error handler if provided
      if (onError) {
        try {
          onError(error as Error);
        } catch (handlerError) {
          console.warn('Error handler failed:', handlerError);
        }
      }
      
      // Enhanced error recovery with offline-aware toast
      const finalFallback = fallback || getSmartFallback(location.pathname, breadcrumbHints);
      
      try {
        trackFallback(location.pathname, finalFallback, 'error-recovery');
        navigate(finalFallback, { replace: true });
        
        // Clear the failure tracking since we recovered
        navState.clearFailedNavigation(location.pathname);
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
        trackError(location.pathname, fallbackError as Error);
        navState.trackFailedNavigation(finalFallback);
        
        // Show error toast using offline system
        offlineToastSystem.show({
          title: "Navigation Error",
          description: "Returning to home page",
          variant: "destructive"
        });
        
        // Final fallback to home
        try {
          navigate('/', { replace: true });
        } catch (homeNavError) {
          console.error('Critical: Home navigation failed:', homeNavError);
        }
      } finally {
        clearNavigationState();
      }
    }
  }, [navigate, location.pathname, location.key, fallback, isNavigating, preventMultiple, onError, hasNavigationHistory, trackNavigation, trackError, trackFallback, startNavigationTiming, clearNavigationState, navState, swComm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isNavigating) {
      e.preventDefault();
      navigateBack();
    }
  }, [navigateBack, isNavigating]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    navigateBack,
    isNavigating,
    handleKeyDown
  };
};

/**
 * Pre-configured hook for common navigation patterns
 */
export const useBackToHome = () => useSmartNavigation({ fallback: '/' });
export const useBackToProducts = () => useSmartNavigation({ fallback: '/product' });
export const useBackToCart = () => useSmartNavigation({ fallback: '/cart' });