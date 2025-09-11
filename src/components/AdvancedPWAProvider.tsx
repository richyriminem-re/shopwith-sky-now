/**
 * Advanced PWA Provider
 * Orchestrates all enhanced PWA features including smart caching, preloading, and performance monitoring
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { EnhancedPWAProvider } from '@/components/EnhancedPWAProvider';
import { PWAPerformanceDashboard } from '@/components/PWAPerformanceDashboard';
import { useEnhancedServiceWorker } from '@/utils/enhancedServiceWorker';
import { useSmartPreloading } from '@/hooks/useSmartPreloading';
import { useSmartCaching } from '@/hooks/useSmartCaching';

interface AdvancedPWAProviderProps {
  children: ReactNode;
  enableAll?: boolean;
  enableSmartCaching?: boolean;
  enableSmartPreloading?: boolean;
  enablePerformanceDashboard?: boolean;
  enableABTesting?: boolean;
  showDashboard?: boolean;
}

export const AdvancedPWAProvider: React.FC<AdvancedPWAProviderProps> = ({
  children,
  enableAll = true,
  enableSmartCaching = true,
  enableSmartPreloading = true,
  enablePerformanceDashboard = import.meta.env.DEV,
  enableABTesting = true,
  showDashboard = false
}) => {
  const [dashboardVisible, setDashboardVisible] = useState(showDashboard);
  const [isInitialized, setIsInitialized] = useState(false);

  const { initialize: initServiceWorker } = useEnhancedServiceWorker();
  
  const { isPreloadingEnabled } = useSmartPreloading({
    enableHoverPreload: enableAll && enableSmartPreloading,
    enableIntersectionPreload: enableAll && enableSmartPreloading,
    enablePredictivePreload: enableAll && enableSmartPreloading,
    hoverDelay: 100,
    maxConcurrentPreloads: 3,
    respectDataSaver: true
  });

  const { 
    trackInteraction, 
    smartInvalidate,
    getCacheStats 
  } = useSmartCaching({
    predictivePreloading: enableAll && enableSmartCaching,
    idleCacheWarming: enableAll && enableSmartCaching,
    memoryPressureMonitoring: enableAll && enableSmartCaching,
    mobileOptimization: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  });

  // Initialize enhanced PWA features
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Initialize enhanced service worker
        await initServiceWorker();
        
        // Setup global interaction tracking
        setupInteractionTracking();
        
        // Setup A/B testing if enabled
        if (enableABTesting) {
          setupABTesting();
        }
        
        // Setup performance dashboard keyboard shortcut
        if (enablePerformanceDashboard) {
          setupDashboardShortcut();
        }
        
        setIsInitialized(true);
        console.log('Advanced PWA features initialized successfully');
      } catch (error) {
        console.error('Failed to initialize advanced PWA features:', error);
      }
    };

    initializePWA();
  }, [initServiceWorker, enableABTesting, enablePerformanceDashboard]);

  const setupInteractionTracking = () => {
    // Track navigation interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = (link as HTMLAnchorElement).href;
        const route = new URL(href, window.location.origin).pathname;
        
        trackInteraction('navigation_click', {
          from: window.location.pathname,
          to: route,
          element: link.textContent?.trim() || 'Unknown',
          timestamp: Date.now()
        });
      }
    };

    // Track form interactions
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'anonymous';
      
      trackInteraction('form_submit', {
        formId,
        route: window.location.pathname,
        timestamp: Date.now()
      });
    };

    // Track search interactions
    const handleSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement;
      
      if (target.type === 'search' || target.name === 'search') {
        trackInteraction('search', {
          query: target.value,
          route: window.location.pathname,
          timestamp: Date.now()
        });
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('keydown', handleSearch);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('keydown', handleSearch);
    };
  };

  const setupABTesting = () => {
    // Initialize A/B test variants
    const testVariants = JSON.parse(localStorage.getItem('ab-test-variants') || '{}');
    
    // Assign user to test variants if not already assigned
    if (!testVariants['enhanced-offline-experience']) {
      testVariants['enhanced-offline-experience'] = Math.random() < 0.5 ? 'control' : 'variant';
    }
    
    if (!testVariants['smart-cache-strategy']) {
      testVariants['smart-cache-strategy'] = Math.random() < 0.25 ? 'variant' : 'control';
    }
    
    localStorage.setItem('ab-test-variants', JSON.stringify(testVariants));
    
    // Apply test-specific configurations
    applyABTestConfigurations(testVariants);
  };

  const applyABTestConfigurations = (variants: Record<string, string>) => {
    // Enhanced offline experience test
    if (variants['enhanced-offline-experience'] === 'variant') {
      // Enable enhanced offline features
      document.body.classList.add('ab-enhanced-offline');
    }
    
    // Smart cache strategy test
    if (variants['smart-cache-strategy'] === 'variant') {
      // Configure more aggressive caching
      smartInvalidate('products', 'background');
      document.body.classList.add('ab-smart-cache');
    }
  };

  const setupDashboardShortcut = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D to toggle dashboard
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setDashboardVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  // Monitor PWA health
  useEffect(() => {
    if (!isInitialized) return;

    const healthCheckInterval = setInterval(() => {
      const cacheStats = getCacheStats();
      
      // Log health metrics for debugging
      if (import.meta.env.DEV) {
        console.log('PWA Health Check:', {
          cacheStats,
          preloadingEnabled: isPreloadingEnabled,
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isInitialized, getCacheStats, isPreloadingEnabled]);

  return (
    <>
      {/* Base PWA Provider */}
      <EnhancedPWAProvider
        enablePerformanceMonitor={false} // Disable basic monitor, use advanced dashboard
        enableOfflineAnalytics={enableAll}
        enableBackgroundSync={enableAll}
      >
        {children}
      </EnhancedPWAProvider>

      {/* Advanced Performance Dashboard */}
      {enablePerformanceDashboard && (
        <PWAPerformanceDashboard
          isVisible={dashboardVisible}
          onToggle={() => setDashboardVisible(false)}
        />
      )}

      {/* Initialization Status (Dev only) */}
      {import.meta.env.DEV && !isInitialized && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded text-sm z-50">
          Initializing Advanced PWA Features...
        </div>
      )}
    </>
  );
};

// Hook for accessing advanced PWA features
export const useAdvancedPWA = () => {
  const { getCacheStats } = useSmartCaching();
  const { getPreloadStats } = useSmartPreloading();
  const { getPerformanceMetrics } = useEnhancedServiceWorker();

  return {
    getCacheStats,
    getPreloadStats,
    getPerformanceMetrics,
    isAdvancedPWAEnabled: true
  };
};