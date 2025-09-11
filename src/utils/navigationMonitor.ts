/**
 * Navigation monitoring and analytics system
 * Tracks navigation patterns, performance, and failure rates
 */

interface NavigationEvent {
  type: 'navigation' | 'back_button' | 'error' | 'fallback';
  route: string;
  timestamp: number;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
  navigationId?: string;
}

interface NavigationTiming {
  id: string;
  startTime: number;
  route: string;
  type: string;
}

interface NavigationMetrics {
  totalNavigations: number;
  averageNavigationTime: number;
  errorRate: number;
  fallbackUsage: number;
  popularRoutes: Record<string, number>;
  errorsByRoute: Record<string, number>;
}

class NavigationMonitor {
  private events: NavigationEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events
  private activeTimings: Map<string, NavigationTiming> = new Map();
  private timingQueue: NavigationTiming[] = [];

  /**
   * Generate unique navigation ID
   */
  private generateNavigationId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track navigation event
   */
  trackNavigation(type: NavigationEvent['type'], route: string, metadata: Record<string, any> = {}) {
    const event: NavigationEvent = {
      type,
      route,
      timestamp: Date.now(),
      metadata
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in dev mode
    if (import.meta.env.DEV) {
      console.log('Navigation tracked:', event);
    }
  }

  /**
   * Start navigation timing with unique ID
   */
  startNavigationTiming(route: string, type: string = 'click'): string {
    const id = this.generateNavigationId();
    const timing: NavigationTiming = {
      id,
      startTime: Date.now(),
      route,
      type
    };

    this.activeTimings.set(id, timing);
    this.timingQueue.push(timing);

    // Keep only recent timings to prevent memory leaks
    if (this.timingQueue.length > 50) {
      const oldTiming = this.timingQueue.shift();
      if (oldTiming) {
        this.activeTimings.delete(oldTiming.id);
      }
    }

    if (import.meta.env.DEV) {
      console.log('Navigation timing started:', { id, route, type });
    }

    return id;
  }

  /**
   * Complete navigation timing
   */
  completeNavigationTiming(route: string, navigationId?: string): number | null {
    // Try to find specific timing by ID first
    if (navigationId && this.activeTimings.has(navigationId)) {
      const timing = this.activeTimings.get(navigationId)!;
      const duration = Date.now() - timing.startTime;
      this.activeTimings.delete(navigationId);

      if (import.meta.env.DEV) {
        console.log('Navigation timing completed by ID:', { navigationId, duration, route });
      }

      return duration;
    }

    // Fallback: find most recent timing for this route
    const recentTiming = [...this.activeTimings.values()]
      .filter(t => t.route === route)
      .sort((a, b) => b.startTime - a.startTime)[0];

    if (recentTiming) {
      const duration = Date.now() - recentTiming.startTime;
      this.activeTimings.delete(recentTiming.id);

      if (import.meta.env.DEV) {
        console.log('Navigation timing completed by route:', { route, duration });
      }

      return duration;
    }

    // Final fallback: complete most recent timing regardless of route
    if (this.activeTimings.size > 0) {
      const mostRecent = [...this.activeTimings.values()]
        .sort((a, b) => b.startTime - a.startTime)[0];
      
      const duration = Date.now() - mostRecent.startTime;
      this.activeTimings.delete(mostRecent.id);

      if (import.meta.env.DEV) {
        console.log('Navigation timing completed (fallback):', { duration, route });
      }

      return duration;
    }

    // No warning for initial page loads - this is normal behavior
    if (import.meta.env.DEV) {
      console.log('📊 No active timing to complete (likely initial page load):', route);
    }

    return null;
  }

  /**
   * Track navigation error
   */
  trackError(route: string, error: Error, metadata: Record<string, any> = {}) {
    this.trackNavigation('error', route, {
      ...metadata,
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * Track fallback usage
   */
  trackFallback(route: string, fallbackRoute: string, reason: string) {
    this.trackNavigation('fallback', route, {
      fallbackRoute,
      reason
    });
  }

  /**
   * Get navigation metrics
   */
  getMetrics(): NavigationMetrics {
    const metrics: NavigationMetrics = {
      totalNavigations: 0,
      averageNavigationTime: 0,
      errorRate: 0,
      fallbackUsage: 0,
      popularRoutes: {},
      errorsByRoute: {}
    };

    if (this.events.length === 0) return metrics;

    // Count events by type
    const navigationEvents = this.events.filter(e => e.type === 'navigation');
    const errorEvents = this.events.filter(e => e.type === 'error');
    const fallbackEvents = this.events.filter(e => e.type === 'fallback');

    metrics.totalNavigations = navigationEvents.length;

    // Calculate average navigation time
    const timedNavigations = navigationEvents.filter(e => e.duration);
    if (timedNavigations.length > 0) {
      const totalTime = timedNavigations.reduce((sum, e) => sum + (e.duration || 0), 0);
      metrics.averageNavigationTime = totalTime / timedNavigations.length;
    }

    // Calculate error rate
    if (metrics.totalNavigations > 0) {
      metrics.errorRate = errorEvents.length / metrics.totalNavigations;
    }

    // Calculate fallback usage
    if (metrics.totalNavigations > 0) {
      metrics.fallbackUsage = fallbackEvents.length / metrics.totalNavigations;
    }

    // Popular routes
    navigationEvents.forEach(event => {
      metrics.popularRoutes[event.route] = (metrics.popularRoutes[event.route] || 0) + 1;
    });

    // Errors by route
    errorEvents.forEach(event => {
      metrics.errorsByRoute[event.route] = (metrics.errorsByRoute[event.route] || 0) + 1;
    });

    return metrics;
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(limit: number = 50): NavigationEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
    this.activeTimings.clear();
    this.timingQueue = [];
  }

  /**
   * Export metrics for external analytics
   */
  exportMetrics() {
    const metrics = this.getMetrics();
    const recentEvents = this.getRecentEvents(100);
    
    return {
      timestamp: Date.now(),
      metrics,
      recentEvents,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Singleton instance
export const navigationMonitor = new NavigationMonitor();

// React hook for using navigation monitor
export const useNavigationMonitor = () => {
  return {
    trackNavigation: navigationMonitor.trackNavigation.bind(navigationMonitor),
    trackError: navigationMonitor.trackError.bind(navigationMonitor),
    trackFallback: navigationMonitor.trackFallback.bind(navigationMonitor),
    startNavigationTiming: navigationMonitor.startNavigationTiming.bind(navigationMonitor),
    completeNavigationTiming: navigationMonitor.completeNavigationTiming.bind(navigationMonitor),
    getMetrics: navigationMonitor.getMetrics.bind(navigationMonitor),
    getRecentEvents: navigationMonitor.getRecentEvents.bind(navigationMonitor),
    exportMetrics: navigationMonitor.exportMetrics.bind(navigationMonitor)
  };
};

// Automatic error boundary integration
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message.includes('navigation')) {
      navigationMonitor.trackError(window.location.pathname, event.error);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('navigation')) {
      navigationMonitor.trackError(window.location.pathname, event.reason);
    }
  });
}
