/**
 * Smart Preloading Hook
 * Intelligent resource preloading based on user behavior and device capabilities
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PreloadConfig {
  enableHoverPreload?: boolean;
  enableIntersectionPreload?: boolean;
  enablePredictivePreload?: boolean;
  hoverDelay?: number;
  intersectionThreshold?: number;
  maxConcurrentPreloads?: number;
  respectDataSaver?: boolean;
}

interface UserBehaviorPattern {
  route: string;
  frequency: number;
  lastVisited: number;
  timeSpent: number;
  nextRoutes: { route: string; probability: number }[];
}

interface DeviceCapabilities {
  memory: number;
  connection: string;
  dataSaver: boolean;
  battery: number | null;
}

export const useSmartPreloading = (config: PreloadConfig = {}) => {
  const {
    enableHoverPreload = true,
    enableIntersectionPreload = true,
    enablePredictivePreload = true,
    hoverDelay = 100,
    intersectionThreshold = 0.1,
    maxConcurrentPreloads = 3,
    respectDataSaver = true
  } = config;

  const location = useLocation();
  const preloadQueue = useRef<string[]>([]);
  const activePreloads = useRef<Set<string>>(new Set());
  const hoverTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const behaviorPatterns = useRef<UserBehaviorPattern[]>([]);
  const deviceCapabilities = useRef<DeviceCapabilities | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Initialize device capabilities detection
  useEffect(() => {
    detectDeviceCapabilities();
  }, []);

  // Track user behavior patterns
  useEffect(() => {
    trackUserBehavior(location.pathname);
  }, [location.pathname]);

  // Setup preloading strategies
  useEffect(() => {
    if (shouldEnablePreloading()) {
      setupHoverPreloading();
      setupIntersectionPreloading();
      setupPredictivePreloading();
    }

    return () => {
      cleanup();
    };
  }, [enableHoverPreload, enableIntersectionPreload, enablePredictivePreload]);

  const detectDeviceCapabilities = useCallback(() => {
    const memory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection;
    const dataSaver = connection?.saveData || false;
    
    // Get battery level if available
    let battery = null;
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batteryManager: any) => {
        battery = batteryManager.level;
      });
    }

    deviceCapabilities.current = {
      memory,
      connection: connection?.effectiveType || '4g',
      dataSaver: dataSaver,
      battery
    };
  }, []);

  const shouldEnablePreloading = useCallback((): boolean => {
    const capabilities = deviceCapabilities.current;
    if (!capabilities) return true;

    // Respect data saver mode
    if (respectDataSaver && capabilities.dataSaver) {
      return false;
    }

    // Disable on slow connections or low memory devices
    if (capabilities.connection === 'slow-2g' || capabilities.memory < 2) {
      return false;
    }

    // Disable on very low battery
    if (capabilities.battery !== null && capabilities.battery < 0.15) {
      return false;
    }

    return true;
  }, [respectDataSaver]);

  const trackUserBehavior = useCallback((currentRoute: string) => {
    const now = Date.now();
    const storedPatterns = JSON.parse(localStorage.getItem('user-behavior-patterns') || '[]');
    behaviorPatterns.current = storedPatterns;

    // Update current route pattern
    const existingPattern = behaviorPatterns.current.find(p => p.route === currentRoute);
    
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.lastVisited = now;
    } else {
      behaviorPatterns.current.push({
        route: currentRoute,
        frequency: 1,
        lastVisited: now,
        timeSpent: 0,
        nextRoutes: []
      });
    }

    // Update navigation transitions for predictive preloading
    updateNavigationTransitions(currentRoute);
    
    // Save updated patterns
    localStorage.setItem('user-behavior-patterns', JSON.stringify(behaviorPatterns.current));
  }, []);

  const updateNavigationTransitions = useCallback((currentRoute: string) => {
    const lastRoute = sessionStorage.getItem('last-route');
    
    if (lastRoute && lastRoute !== currentRoute) {
      const pattern = behaviorPatterns.current.find(p => p.route === lastRoute);
      if (pattern) {
        const existingTransition = pattern.nextRoutes.find(nr => nr.route === currentRoute);
        if (existingTransition) {
          existingTransition.probability += 0.1;
        } else {
          pattern.nextRoutes.push({ route: currentRoute, probability: 0.1 });
        }
        
        // Normalize probabilities
        const totalProb = pattern.nextRoutes.reduce((sum, nr) => sum + nr.probability, 0);
        pattern.nextRoutes.forEach(nr => {
          nr.probability = nr.probability / totalProb;
        });
      }
    }
    
    sessionStorage.setItem('last-route', currentRoute);
  }, []);

  const setupHoverPreloading = useCallback(() => {
    if (!enableHoverPreload) return;

    const handleMouseOver = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a[href]');
      if (!link) return;

      const href = (link as HTMLAnchorElement).href;
      const route = new URL(href, window.location.origin).pathname;
      
      if (shouldPreloadRoute(route)) {
        const timer = setTimeout(() => {
          preloadRoute(route, 'hover');
        }, hoverDelay);
        
        hoverTimers.current.set(route, timer);
      }
    };

    const handleMouseOut = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a[href]');
      if (!link) return;

      const href = (link as HTMLAnchorElement).href;
      const route = new URL(href, window.location.origin).pathname;
      
      const timer = hoverTimers.current.get(route);
      if (timer) {
        clearTimeout(timer);
        hoverTimers.current.delete(route);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [enableHoverPreload, hoverDelay]);

  const setupIntersectionPreloading = useCallback(() => {
    if (!enableIntersectionPreload) return;

    intersectionObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target.closest('a[href]');
          if (link) {
            const href = (link as HTMLAnchorElement).href;
            const route = new URL(href, window.location.origin).pathname;
            
            if (shouldPreloadRoute(route)) {
              // Delay preload to avoid preloading everything on scroll
              setTimeout(() => {
                preloadRoute(route, 'intersection');
              }, 200);
            }
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: intersectionThreshold
    });

    // Observe all links
    document.querySelectorAll('a[href]').forEach((link) => {
      intersectionObserver.current?.observe(link);
    });

    return () => {
      intersectionObserver.current?.disconnect();
    };
  }, [enableIntersectionPreload, intersectionThreshold]);

  const setupPredictivePreloading = useCallback(() => {
    if (!enablePredictivePreload) return;

    // Preload likely next routes based on user behavior
    const currentRoute = location.pathname;
    const pattern = behaviorPatterns.current.find(p => p.route === currentRoute);
    
    if (pattern && pattern.nextRoutes.length > 0) {
      // Sort by probability and preload top candidates
      const topRoutes = pattern.nextRoutes
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 2)
        .filter(nr => nr.probability > 0.3); // Only preload if high probability
      
      topRoutes.forEach((nextRoute, index) => {
        // Stagger predictive preloads
        setTimeout(() => {
          preloadRoute(nextRoute.route, 'predictive');
        }, (index + 1) * 1000);
      });
    }
  }, [enablePredictivePreload, location.pathname]);

  const shouldPreloadRoute = useCallback((route: string): boolean => {
    // Don't preload current route
    if (route === location.pathname) return false;
    
    // Don't preload if already preloaded or in progress
    if (activePreloads.current.has(route) || preloadQueue.current.includes(route)) {
      return false;
    }
    
    // Respect max concurrent preloads
    if (activePreloads.current.size >= maxConcurrentPreloads) {
      return false;
    }
    
    // Don't preload external links
    const url = new URL(route, window.location.origin);
    if (url.origin !== window.location.origin) {
      return false;
    }
    
    return shouldEnablePreloading();
  }, [location.pathname, maxConcurrentPreloads]);

  const preloadRoute = useCallback(async (route: string, trigger: string) => {
    if (!shouldPreloadRoute(route)) return;

    activePreloads.current.add(route);
    
    try {
      // Preload the route
      const response = await fetch(route, {
        method: 'GET',
        headers: {
          'X-Preload': 'true'
        }
      });
      
      if (response.ok) {
        // Cache the response for offline use
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PRELOAD_ROUTES',
            data: { routes: [route], trigger, priority: 'low' }
          });
        }
        
        console.log(`Successfully preloaded ${route} via ${trigger}`);
      }
    } catch (error) {
      console.warn(`Failed to preload ${route}:`, error);
    } finally {
      activePreloads.current.delete(route);
    }
  }, []);

  const cleanup = useCallback(() => {
    // Clear all hover timers
    hoverTimers.current.forEach(timer => clearTimeout(timer));
    hoverTimers.current.clear();
    
    // Clear active preloads
    activePreloads.current.clear();
    
    // Disconnect intersection observer
    intersectionObserver.current?.disconnect();
    
    // Clear preload queue
    preloadQueue.current = [];
  }, []);

  const getPreloadStats = useCallback(() => {
    return {
      activePreloads: activePreloads.current.size,
      queuedPreloads: preloadQueue.current.length,
      behaviorPatterns: behaviorPatterns.current.length,
      deviceCapabilities: deviceCapabilities.current,
      preloadingEnabled: shouldEnablePreloading()
    };
  }, []);

  const manualPreload = useCallback((route: string) => {
    preloadRoute(route, 'manual');
  }, [preloadRoute]);

  return {
    manualPreload,
    getPreloadStats,
    isPreloadingEnabled: shouldEnablePreloading()
  };
};