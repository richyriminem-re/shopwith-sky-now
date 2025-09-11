import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { useNavigationState } from '@/utils/navigationStateManager';
import { toast } from '@/hooks/use-toast';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackRoute?: string;
  enableAutoRetry?: boolean;
}

interface ErrorRecoveryState {
  isRecovering: boolean;
  retryCount: number;
  lastError: Error | null;
  recoveryAttempts: number;
}

/**
 * Enhanced error recovery system with automatic retry mechanisms
 */
export const useEnhancedErrorRecovery = (options: ErrorRecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    fallbackRoute = '/',
    enableAutoRetry = true
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { trackError, trackFallback } = useNavigationMonitor();
  const navState = useNavigationState();

  const [recoveryState, setRecoveryState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    retryCount: 0,
    lastError: null,
    recoveryAttempts: 0
  });

  /**
   * Attempt to recover from navigation error
   */
  const attemptRecovery = useCallback(async (
    error: Error,
    targetRoute: string,
    context: string = 'navigation'
  ): Promise<boolean> => {
    console.log('🔄 Attempting error recovery:', { error: error.message, targetRoute, context });

    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      lastError: error,
      recoveryAttempts: prev.recoveryAttempts + 1
    }));

    // Track the error
    trackError(targetRoute, error, { context, recoveryAttempt: recoveryState.recoveryAttempts + 1 });

    try {
      // Strategy 1: Try the target route again with replace
      if (recoveryState.retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        setRecoveryState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
        
        navigate(targetRoute, { replace: true });
        
        // Wait a bit to see if navigation succeeds
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (location.pathname === targetRoute) {
          console.log('✅ Recovery successful - target route reached');
          resetRecoveryState();
          toast({
            title: "Navigation Recovered",
            description: "Successfully navigated to the requested page.",
          });
          return true;
        }
      }

      // Strategy 2: Try to go back if we have history
      if (navState.hasNavigationHistory()) {
        const previousRoute = navState.getPreviousRoute();
        if (previousRoute && previousRoute !== targetRoute) {
          console.log('🔄 Attempting recovery via previous route:', previousRoute);
          navigate(previousRoute, { replace: true });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (location.pathname === previousRoute) {
            console.log('✅ Recovery successful - returned to previous route');
            trackFallback(targetRoute, previousRoute, 'error-recovery-previous');
            resetRecoveryState();
            toast({
              title: "Navigation Recovered",
              description: "Returned to the previous page due to an error.",
              variant: "default"
            });
            return true;
          }
        }
      }

      // Strategy 3: Fallback to safe route
      console.log('🔄 Attempting recovery via fallback route:', fallbackRoute);
      navigate(fallbackRoute, { replace: true });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (location.pathname === fallbackRoute) {
        console.log('✅ Recovery successful - reached fallback route');
        trackFallback(targetRoute, fallbackRoute, 'error-recovery-fallback');
        resetRecoveryState();
        toast({
          title: "Navigation Error",
          description: "Redirected to home page due to a navigation error.",
          variant: "destructive"
        });
        return true;
      }

      // All strategies failed
      console.error('❌ All recovery strategies failed');
      setRecoveryState(prev => ({ ...prev, isRecovering: false }));
      return false;

    } catch (recoveryError) {
      console.error('❌ Recovery attempt failed:', recoveryError);
      trackError(targetRoute, recoveryError as Error, { 
        context: 'error-recovery-failed',
        originalError: error.message 
      });
      setRecoveryState(prev => ({ ...prev, isRecovering: false }));
      return false;
    }
  }, [navigate, location, trackError, trackFallback, navState, recoveryState.retryCount, maxRetries, retryDelay, fallbackRoute]);

  /**
   * Handle navigation errors with automatic recovery
   */
  const handleNavigationError = useCallback(async (
    error: Error,
    targetRoute: string,
    context: string = 'navigation'
  ) => {
    console.error('🚨 Navigation error detected:', error);

    // Clear any failed navigation tracking for this route if recovery succeeds
    navState.trackFailedNavigation(targetRoute);

    if (enableAutoRetry && recoveryState.retryCount < maxRetries) {
      const recovered = await attemptRecovery(error, targetRoute, context);
      
      if (recovered) {
        navState.clearFailedNavigation(targetRoute);
      }
    } else {
      // Manual recovery required
      toast({
        title: "Navigation Error",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    }
  }, [enableAutoRetry, maxRetries, attemptRecovery, navState, recoveryState.retryCount]);

  /**
   * Manual retry function
   */
  const manualRetry = useCallback((targetRoute: string) => {
    if (recoveryState.lastError) {
      attemptRecovery(recoveryState.lastError, targetRoute, 'manual-retry');
    }
  }, [attemptRecovery, recoveryState.lastError]);

  /**
   * Reset recovery state
   */
  const resetRecoveryState = useCallback(() => {
    setRecoveryState({
      isRecovering: false,
      retryCount: 0,
      lastError: null,
      recoveryAttempts: 0
    });
  }, []);

  /**
   * Check if a route has recent failures
   */
  const hasRecentFailure = useCallback((route: string) => {
    return navState.hasRecentFailure(route);
  }, [navState]);

  return {
    // State
    isRecovering: recoveryState.isRecovering,
    retryCount: recoveryState.retryCount,
    lastError: recoveryState.lastError,
    recoveryAttempts: recoveryState.recoveryAttempts,

    // Actions
    handleNavigationError,
    attemptRecovery,
    manualRetry,
    resetRecoveryState,
    hasRecentFailure
  };
};