/**
 * Enhanced Service Worker Management with Smart Caching and Performance Optimization
 */

interface CacheStrategy {
  name: string;
  patterns: RegExp[];
  maxAge?: number;
  maxEntries?: number;
}

interface SmartCacheConfig {
  deviceMemory: number;
  connection: string;
  storageQuota: number;
  userBehavior: {
    frequentRoutes: string[];
    averageSessionTime: number;
    preferredFeatures: string[];
  };
}

class EnhancedServiceWorkerManager {
  private registration: ServiceWorkerRegistration | undefined;
  private cacheConfig: SmartCacheConfig | undefined;
  private preloadQueue: string[] = [];
  private analyticsQueue: any[] = [];

  /**
   * Initialize enhanced service worker with adaptive configuration
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
      return;
    }

    try {
      // Detect device capabilities
      this.cacheConfig = await this.detectDeviceCapabilities();
      
      // Register enhanced service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      console.log('Enhanced SW: Service worker registered successfully');

      // Setup advanced message handling
      this.setupAdvancedMessageHandling();
      
      // Initialize smart preloading
      this.initializeSmartPreloading();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();

    } catch (error) {
      console.error('Enhanced SW: Registration failed:', error);
    }
  }

  /**
   * Detect device capabilities for adaptive caching
   */
  private async detectDeviceCapabilities(): Promise<SmartCacheConfig> {
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection?.effectiveType || '4g';
    
    let storageQuota = 50 * 1024 * 1024; // 50MB default
    try {
      const estimate = await navigator.storage?.estimate();
      storageQuota = estimate?.quota ? estimate.quota * 0.1 : storageQuota; // Use 10% of available
    } catch (e) {
      console.warn('Storage estimate not available');
    }

    return {
      deviceMemory,
      connection,
      storageQuota,
      userBehavior: this.getUserBehaviorPatterns()
    };
  }

  /**
   * Analyze user behavior for predictive preloading
   */
  private getUserBehaviorPatterns() {
    const navigationHistory = JSON.parse(localStorage.getItem('navigation-patterns') || '[]');
    const sessionData = JSON.parse(localStorage.getItem('session-analytics') || '{}');
    
    return {
      frequentRoutes: this.getFrequentRoutes(navigationHistory),
      averageSessionTime: sessionData.averageSessionTime || 300000, // 5 minutes
      preferredFeatures: sessionData.preferredFeatures || []
    };
  }

  /**
   * Get frequently visited routes for preloading
   */
  private getFrequentRoutes(history: any[]): string[] {
    const routeCount = history.reduce((acc, entry) => {
      acc[entry.route] = (acc[entry.route] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(routeCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([route]) => route);
  }

  /**
   * Setup advanced message handling with service worker
   */
  private setupAdvancedMessageHandling(): void {
    if (!this.registration) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'CACHE_PERFORMANCE':
          this.handleCachePerformance(data);
          break;
        
        case 'PRELOAD_COMPLETE':
          this.handlePreloadComplete(data);
          break;
        
        case 'ANALYTICS_BATCH':
          this.handleAnalyticsBatch(data);
          break;
        
        case 'STORAGE_PRESSURE':
          this.handleStoragePressure(data);
          break;
      }
    });
  }

  /**
   * Initialize smart preloading based on user behavior
   */
  private initializeSmartPreloading(): void {
    if (!this.cacheConfig) return;

    // Preload frequent routes during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadFrequentRoutes();
      });
    }

    // Preload on hover (for desktop)
    this.setupHoverPreloading();
    
    // Preload on intersection (for mobile scroll)
    this.setupIntersectionPreloading();
  }

  /**
   * Preload frequently visited routes
   */
  private async preloadFrequentRoutes(): Promise<void> {
    if (!this.cacheConfig || !this.registration?.active) return;

    const routes = this.cacheConfig.userBehavior.frequentRoutes;
    
    this.registration.active.postMessage({
      type: 'PRELOAD_ROUTES',
      data: { 
        routes, 
        priority: 'low',
        strategy: 'idle'
      }
    });
  }

  /**
   * Setup hover-based preloading for links
   */
  private setupHoverPreloading(): void {
    let hoverTimer: NodeJS.Timeout;

    document.addEventListener('mouseover', (event) => {
      const link = (event.target as Element).closest('a[href]');
      if (!link) return;

      const href = (link as HTMLAnchorElement).href;
      if (this.shouldPreload(href)) {
        hoverTimer = setTimeout(() => {
          this.preloadRoute(href, 'hover');
        }, 100);
      }
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimer);
    });
  }

  /**
   * Setup intersection-based preloading
   */
  private setupIntersectionPreloading(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target.closest('a[href]');
          if (link) {
            const href = (link as HTMLAnchorElement).href;
            if (this.shouldPreload(href)) {
              this.preloadRoute(href, 'intersection');
            }
          }
        }
      });
    }, {
      rootMargin: '100px'
    });

    // Observe all links
    document.querySelectorAll('a[href]').forEach((link) => {
      observer.observe(link);
    });
  }

  /**
   * Check if route should be preloaded
   */
  private shouldPreload(url: string): boolean {
    const currentOrigin = window.location.origin;
    const linkUrl = new URL(url, currentOrigin);
    
    // Only preload same-origin links
    if (linkUrl.origin !== currentOrigin) return false;
    
    // Don't preload if already in queue
    if (this.preloadQueue.includes(linkUrl.pathname)) return false;
    
    // Check connection quality
    const connection = (navigator as any).connection;
    if (connection && connection.saveData) return false;
    
    return true;
  }

  /**
   * Preload a specific route
   */
  private preloadRoute(url: string, trigger: string): void {
    if (!this.registration?.active) return;

    const linkUrl = new URL(url);
    const route = linkUrl.pathname;

    this.preloadQueue.push(route);

    this.registration.active.postMessage({
      type: 'PRELOAD_ROUTES',
      data: {
        routes: [route],
        trigger,
        timestamp: Date.now(),
        priority: trigger === 'hover' ? 'high' : 'low'
      }
    });

    // Track preload analytics
    this.trackPreloadEvent(route, trigger);
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor navigation performance
    this.monitorNavigationPerformance();
    
    // Monitor cache efficiency  
    this.monitorCacheEfficiency();
    
    // Monitor resource loading
    this.monitorResourceLoading();
  }

  /**
   * Monitor navigation performance
   */
  private monitorNavigationPerformance(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          this.trackAnalytics('navigation_performance', {
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
            route: window.location.pathname,
            connectionType: (navigator as any).connection?.effectiveType
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  /**
   * Monitor cache efficiency
   */
  private monitorCacheEfficiency(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Check if resource was served from cache
          const fromCache = resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0;
          
          this.trackAnalytics('cache_efficiency', {
            url: resourceEntry.name,
            fromCache,
            loadTime: resourceEntry.responseEnd - resourceEntry.startTime,
            size: resourceEntry.decodedBodySize
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Monitor resource loading patterns
   */
  private monitorResourceLoading(): void {
    // Track resource loading failures
    window.addEventListener('error', (event) => {
      if (event.target && 'src' in event.target) {
        this.trackAnalytics('resource_error', {
          url: (event.target as any).src,
          type: (event.target as any).tagName,
          timestamp: Date.now()
        });
      }
    });

    // Track critical resource loading
    this.monitorCriticalResources();
  }

  /**
   * Monitor critical resources (fonts, images, etc.)
   */
  private monitorCriticalResources(): void {
    const criticalResources = [
      'link[rel="preload"]',
      'script[defer]',
      'link[rel="stylesheet"]'
    ];

    criticalResources.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const startTime = performance.now();
        
        element.addEventListener('load', () => {
          const loadTime = performance.now() - startTime;
          this.trackAnalytics('critical_resource_load', {
            selector,
            loadTime,
            url: (element as any).href || (element as any).src
          });
        });
      });
    });
  }

  /**
   * Handle cache performance updates from service worker
   */
  private handleCachePerformance(data: any): void {
    // Update local performance metrics
    const metrics = JSON.parse(localStorage.getItem('sw-performance') || '{}');
    Object.assign(metrics, data);
    localStorage.setItem('sw-performance', JSON.stringify(metrics));
    
    // Dispatch custom event for components
    window.dispatchEvent(new CustomEvent('sw-performance-update', { detail: data }));
  }

  /**
   * Handle preload completion
   */
  private handlePreloadComplete(data: any): void {
    const index = this.preloadQueue.indexOf(data.route);
    if (index > -1) {
      this.preloadQueue.splice(index, 1);
    }
    
    this.trackAnalytics('preload_complete', data);
  }

  /**
   * Handle analytics batch from service worker
   */
  private handleAnalyticsBatch(data: any): void {
    this.analyticsQueue.push(...data.events);
    
    // Process analytics if queue is getting full
    if (this.analyticsQueue.length > 100) {
      this.processAnalyticsQueue();
    }
  }

  /**
   * Handle storage pressure from service worker
   */
  private handleStoragePressure(data: any): void {
    console.warn('Storage pressure detected:', data);
    
    // Trigger cache cleanup
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CACHE_CLEANUP',
        data: { aggressive: data.pressure > 0.8 }
      });
    }
  }

  /**
   * Track preload events
   */
  private trackPreloadEvent(route: string, trigger: string): void {
    this.trackAnalytics('route_preload', {
      route,
      trigger,
      timestamp: Date.now(),
      connectionType: (navigator as any).connection?.effectiveType
    });
  }

  /**
   * Track analytics events
   */
  private trackAnalytics(event: string, data: any): void {
    this.analyticsQueue.push({
      event,
      data,
      timestamp: Date.now(),
      route: window.location.pathname
    });

    // Send to service worker periodically
    if (this.analyticsQueue.length % 10 === 0) {
      this.sendAnalyticsToServiceWorker();
    }
  }

  /**
   * Send analytics to service worker
   */
  private sendAnalyticsToServiceWorker(): void {
    if (!this.registration?.active || this.analyticsQueue.length === 0) return;

    this.registration.active.postMessage({
      type: 'ANALYTICS_EVENTS',
      data: { events: [...this.analyticsQueue] }
    });

    this.analyticsQueue = [];
  }

  /**
   * Process analytics queue
   */
  private processAnalyticsQueue(): void {
    // In a real app, send to your analytics service
    console.log('Processing analytics queue:', this.analyticsQueue.length, 'events');
    this.analyticsQueue = [];
  }

  /**
   * Get enhanced performance metrics
   */
  getPerformanceMetrics() {
    const swMetrics = JSON.parse(localStorage.getItem('sw-performance') || '{}');
    const navigationMetrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      serviceWorker: swMetrics,
      navigation: {
        loadTime: navigationMetrics?.loadEventEnd - navigationMetrics?.loadEventStart,
        domContentLoaded: navigationMetrics?.domContentLoadedEventEnd - navigationMetrics?.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime
      },
      preload: {
        queueSize: this.preloadQueue.length,
        analyticsQueue: this.analyticsQueue.length
      }
    };
  }

  /**
   * Force cache update
   */
  async updateCache(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'FORCE_UPDATE',
        data: { timestamp: Date.now() }
      });
    }
  }
}

// Singleton instance
export const enhancedServiceWorker = new EnhancedServiceWorkerManager();

// React hook for enhanced service worker
export const useEnhancedServiceWorker = () => {
  return {
    initialize: enhancedServiceWorker.initialize.bind(enhancedServiceWorker),
    getPerformanceMetrics: enhancedServiceWorker.getPerformanceMetrics.bind(enhancedServiceWorker),
    updateCache: enhancedServiceWorker.updateCache.bind(enhancedServiceWorker)
  };
};