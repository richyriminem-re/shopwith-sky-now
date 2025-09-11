/**
 * Enhanced development verification utilities for navigation system
 * Comprehensive validation and real-time monitoring
 */

import { useNavigationMonitor } from './navigationMonitor';
import { useNavigationState } from './navigationStateManager';

/**
 * Enhanced hook to verify navigation metrics in development
 */
export const useDevVerification = () => {
  const { getMetrics, getRecentEvents } = useNavigationMonitor();
  const navState = useNavigationState();

  // Only run in development
  if (!import.meta.env.DEV) {
    return {};
  }

  // Verify navigation timing metrics
  const verifyNavigationTiming = () => {
    const metrics = getMetrics();
    
    if (metrics.totalNavigations > 3 && metrics.averageNavigationTime === 0) {
      console.warn('⚠️ Navigation timing not working - averageNavigationTime is 0 after', metrics.totalNavigations, 'navigations');
      console.warn('Check that GlobalNavigationTracker is completing timing and NavigationIntentTracker is starting timing');
    } else if (metrics.averageNavigationTime > 0) {
      console.log('✅ Navigation timing working -', metrics.averageNavigationTime.toFixed(1) + 'ms average');
    } else if (metrics.totalNavigations <= 3) {
      console.log('📊 Waiting for more navigations to verify timing (current:', metrics.totalNavigations, ')');
    }
  };

  // Verify timeout behavior
  const verifyTimeouts = () => {
    const metrics = getMetrics();
    const timeoutEvents = metrics.errorsByRoute;
    
    if (Object.keys(timeoutEvents).length > 0) {
      console.log('⚠️ Navigation timeouts detected:', timeoutEvents);
    }
  };

  // Verify timing is being started and completed
  const verifyTimingFlow = () => {
    const recentEvents = getRecentEvents(20);
    
    const eventsWithDuration = recentEvents.filter(e => e.duration !== undefined);
    const navigationEvents = recentEvents.filter(e => e.type === 'navigation');
    
    if (navigationEvents.length > 2 && eventsWithDuration.length === 0) {
      console.warn('⚠️ No navigation events have duration - timing completion may not be working');
    } else if (eventsWithDuration.length > 0) {
      console.log('✅ Navigation timing flow working - events with duration:', eventsWithDuration.length);
    }
  };

  // Verify browser back button integration
  const verifyBrowserBackButton = () => {
    const state = navState.getState();
    
    if (state.navigationHistory.length > 1) {
      const hasHistory = navState.hasNavigationHistory();
      const previousRoute = navState.getPreviousRoute();
      
      console.log('✅ Browser back button ready:', {
        hasHistory,
        previousRoute,
        historyLength: state.navigationHistory.length
      });
    } else {
      console.log('📊 Browser back button verification pending - need more navigation history');
    }
  };

  // Verify popstate sync
  const verifyPopstateSync = () => {
    const state = navState.getState();
    const currentPath = window.location.pathname;
    
    if (state.currentRoute === currentPath) {
      console.log('✅ Popstate sync working - state matches current location');
    } else {
      console.warn('⚠️ Popstate sync issue:', {
        stateRoute: state.currentRoute,
        actualPath: currentPath
      });
    }
  };

  // Comprehensive verification
  const runComprehensiveVerification = () => {
    console.group('🔍 Navigation System Verification');
    
    verifyNavigationTiming();
    verifyTimeouts();
    verifyTimingFlow();
    verifyBrowserBackButton();
    verifyPopstateSync();
    
    // Performance analysis
    const metrics = getMetrics();
    if (metrics.totalNavigations > 0) {
      console.log('📊 Performance Summary:', {
        totalNavigations: metrics.totalNavigations,
        averageTime: metrics.averageNavigationTime,
        errorRate: (metrics.errorRate * 100).toFixed(1) + '%',
        fallbackUsage: (metrics.fallbackUsage * 100).toFixed(1) + '%'
      });
    }
    
    console.groupEnd();
  };

  // Log periodic verification
  const runPeriodicVerification = () => {
    setTimeout(() => {
      verifyNavigationTiming();
      verifyTimeouts();
      verifyTimingFlow();
    }, 12000); // Run after 12 seconds to allow for navigation
  };

  return {
    verifyNavigationTiming,
    verifyTimeouts,
    verifyTimingFlow,
    verifyBrowserBackButton,
    verifyPopstateSync,
    runComprehensiveVerification,
    runPeriodicVerification
  };
};

/**
 * Initialize comprehensive dev verification if in development
 */
export const initDevVerification = () => {
  if (import.meta.env.DEV) {
    console.log('🚀 Navigation development verification initialized');
    
    // Run initial verification after navigation has had time to occur
    setTimeout(() => {
      const { runComprehensiveVerification } = useDevVerification();
      runComprehensiveVerification();
    }, 15000);

    // Run periodic verification every 30 seconds
    setInterval(() => {
      const { runComprehensiveVerification } = useDevVerification();
      runComprehensiveVerification();
    }, 30000);
  }
};