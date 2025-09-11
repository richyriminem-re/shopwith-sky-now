import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { useNavigationState } from '@/utils/navigationStateManager';

/**
 * Global navigation tracker that manages session history and analytics
 * This component should be placed at the app level
 */
const GlobalNavigationTracker = () => {
  const location = useLocation();
  const { trackNavigation, completeNavigationTiming } = useNavigationMonitor();
  const navState = useNavigationState();

  useEffect(() => {
    // Try to get navigation ID from state manager for better timing correlation
    const navigationId = navState.getLastNavigationId();
    
    // Complete any active navigation timing first (with ID if available)
    // For initial loads, there may be no timing to complete - this is normal
    const duration = completeNavigationTiming(location.pathname, navigationId);
    
    // Update navigation state manager with navigation ID for future correlation
    navState.updateRoute(location.pathname, navigationId);
    
    // Track navigation event with timing if available
    trackNavigation('navigation', location.pathname, {
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      duration: duration || undefined,
      navigationId: navigationId || undefined
    });
    
    if (import.meta.env.DEV && duration) {
      console.log(`✅ Navigation timing completed: ${duration}ms for ${location.pathname}`);
    }
  }, [location.pathname, trackNavigation, completeNavigationTiming, navState]);

  // Handle browser back/forward button navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        // Use navigation state manager instead of direct session storage
        navState.popFromHistory();
      } catch (error) {
        console.warn('Failed to handle popstate:', error);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navState]);

  // Cleanup on unmount - handled by navigation state manager
  // No additional cleanup needed as the manager handles it

  return null; // This component only tracks, no UI
};

export default GlobalNavigationTracker;
