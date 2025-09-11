import { useEffect } from 'react';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { useOfflineAnalytics } from '@/utils/offlineAnalytics';
import { useNavigationState } from '@/utils/navigationStateManager';

/**
 * Global navigation intent tracker that captures clicks on navigation elements
 * This component should be placed at the app level to capture all navigation intents
 */
const NavigationIntentTracker = () => {
  const { startNavigationTiming } = useNavigationMonitor();
  const { trackOfflineNavigation } = useOfflineAnalytics();
  const navState = useNavigationState();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip non-navigational clicks
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) {
        return; // Middle click, ctrl+click, cmd+click, shift+click
      }
      
      // Check if this is a navigation element
      const isNavigationElement = (
        target.tagName === 'A' ||
        target.closest('a') ||
        target.hasAttribute('data-navigation') ||
        target.closest('[data-navigation]')
      );

      if (isNavigationElement) {
        // Skip external links and target="_blank" links
        const linkElement = target.tagName === 'A' ? target : target.closest('a');
        if (linkElement) {
          const href = linkElement.getAttribute('href');
          const targetAttr = linkElement.getAttribute('target');
          
          // Skip external links or target="_blank"
          if (targetAttr === '_blank' || 
              (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')))) {
            return;
          }
        }
        
        // Extract route information if available
        let route = window.location.pathname;
        if (linkElement) {
          const href = linkElement.getAttribute('href');
          if (href && href.startsWith('/')) {
            route = href;
          }
        }

        // Start timing for this navigation intent
        const navigationId = startNavigationTiming(route, 'click');
        
        // Store navigation ID in state manager for correlation
        navState.updateRoute(window.location.pathname, navigationId);
        
        // Track offline navigation if offline
        if (!navigator.onLine && route !== window.location.pathname) {
          trackOfflineNavigation(window.location.pathname, route, false);
        }
        
        // Store navigation ID on the element for potential later use
        if (linkElement) {
          linkElement.setAttribute('data-nav-id', navigationId);
        }
        
        if (import.meta.env.DEV) {
          console.log('Navigation timing started for click:', { target, route, navigationId });
        }
      }
    };

    // Attach to document to catch all clicks
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [startNavigationTiming, trackOfflineNavigation, navState]);

  return null; // This component only tracks, no UI
};

export default NavigationIntentTracker;