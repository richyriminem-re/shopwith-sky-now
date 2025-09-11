/**
 * Offline Analytics Manager
 * Collects and manages analytics data when offline, syncing when back online
 */

interface AnalyticsEvent {
  event: string;
  data: any;
  timestamp: number;
  route?: string;
  userId?: string;
}

interface OfflineMetrics {
  offlineNavigations: number;
  cacheHits: number;
  cacheMisses: number;
  networkFailures: number;
  successfulOfflineActions: number;
  totalOfflineTime: number;
  lastSyncTime: number;
}

class OfflineAnalyticsManager {
  private storageKey = 'offline-analytics';
  private metricsKey = 'offline-metrics';
  private maxQueueSize = 1000;
  private syncCallbacks: Array<(events: AnalyticsEvent[]) => Promise<void>> = [];

  /**
   * Track an analytics event
   */
  trackEvent(event: string, data: any, route?: string) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now(),
      route: route || window.location.pathname,
      userId: this.getUserId()
    };

    this.addToQueue(analyticsEvent);
    
    // Try to sync if online
    if (navigator.onLine) {
      this.syncEvents();
    }
  }

  /**
   * Track offline navigation attempt
   */
  trackOfflineNavigation(from: string, to: string, success: boolean) {
    this.trackEvent('offline_navigation', {
      from,
      to,
      success,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });

    // Update offline metrics
    const metrics = this.getOfflineMetrics();
    metrics.offlineNavigations++;
    this.updateOfflineMetrics(metrics);
  }

  /**
   * Track cache performance
   */
  trackCachePerformance(type: 'hit' | 'miss', url: string, responseTime: number) {
    this.trackEvent('cache_performance', {
      type,
      url,
      responseTime,
      timestamp: Date.now()
    });

    // Update offline metrics
    const metrics = this.getOfflineMetrics();
    if (type === 'hit') {
      metrics.cacheHits++;
    } else {
      metrics.cacheMisses++;
    }
    this.updateOfflineMetrics(metrics);
  }

  /**
   * Track network transition
   */
  trackNetworkTransition(from: 'online' | 'offline', to: 'online' | 'offline') {
    this.trackEvent('network_transition', {
      from,
      to,
      timestamp: Date.now(),
      batteryLevel: this.getBatteryLevel()
    });

    if (to === 'online') {
      // Calculate offline time
      const metrics = this.getOfflineMetrics();
      const offlineTime = Date.now() - (metrics.lastSyncTime || Date.now());
      metrics.totalOfflineTime += offlineTime;
      this.updateOfflineMetrics(metrics);
      
      // Sync when back online
      this.syncEvents();
    }
  }

  /**
   * Track successful offline action (like form submission queue)
   */
  trackOfflineAction(action: string, data: any) {
    this.trackEvent('offline_action', {
      action,
      data,
      timestamp: Date.now()
    });

    const metrics = this.getOfflineMetrics();
    metrics.successfulOfflineActions++;
    this.updateOfflineMetrics(metrics);
  }

  /**
   * Get current offline metrics
   */
  getOfflineMetrics(): OfflineMetrics {
    try {
      const stored = localStorage.getItem(this.metricsKey);
      return stored ? JSON.parse(stored) : this.getDefaultMetrics();
    } catch {
      return this.getDefaultMetrics();
    }
  }

  /**
   * Get analytics summary for performance monitoring
   */
  getAnalyticsSummary() {
    const queue = this.getQueuedEvents();
    const metrics = this.getOfflineMetrics();
    
    return {
      queuedEvents: queue.length,
      metrics,
      cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0,
      averageOfflineTime: metrics.totalOfflineTime / Math.max(1, metrics.offlineNavigations),
      lastSyncAgo: Date.now() - metrics.lastSyncTime
    };
  }

  /**
   * Add sync callback for when events are synchronized
   */
  onSync(callback: (events: AnalyticsEvent[]) => Promise<void>) {
    this.syncCallbacks.push(callback);
  }

  /**
   * Force sync all queued events
   */
  async syncEvents(): Promise<boolean> {
    const events = this.getQueuedEvents();
    if (events.length === 0) return true;

    try {
      // Call all sync callbacks
      await Promise.all(
        this.syncCallbacks.map(callback => callback(events))
      );

      // Clear queue after successful sync
      this.clearQueue();
      
      // Update sync time
      const metrics = this.getOfflineMetrics();
      metrics.lastSyncTime = Date.now();
      this.updateOfflineMetrics(metrics);

      return true;
    } catch (error) {
      console.warn('Analytics sync failed:', error);
      return false;
    }
  }

  /**
   * Clear analytics data (for privacy/storage management)
   */
  clearAnalyticsData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.metricsKey);
  }

  private addToQueue(event: AnalyticsEvent) {
    try {
      const queue = this.getQueuedEvents();
      queue.push(event);
      
      // Limit queue size
      if (queue.length > this.maxQueueSize) {
        queue.splice(0, queue.length - this.maxQueueSize);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to queue analytics event:', error);
    }
  }

  private getQueuedEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private clearQueue() {
    localStorage.removeItem(this.storageKey);
  }

  private updateOfflineMetrics(metrics: OfflineMetrics) {
    try {
      localStorage.setItem(this.metricsKey, JSON.stringify(metrics));
    } catch (error) {
      console.warn('Failed to update offline metrics:', error);
    }
  }

  private getDefaultMetrics(): OfflineMetrics {
    return {
      offlineNavigations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      networkFailures: 0,
      successfulOfflineActions: 0,
      totalOfflineTime: 0,
      lastSyncTime: Date.now()
    };
  }

  private getUserId(): string | undefined {
    // In a real app, get from auth system
    return localStorage.getItem('userId') || undefined;
  }

  private getBatteryLevel(): number | undefined {
    // @ts-ignore - Battery API is experimental
    return navigator.battery?.level;
  }
}

// Singleton instance
export const offlineAnalytics = new OfflineAnalyticsManager();

// React hook for offline analytics
export const useOfflineAnalytics = () => {
  return {
    trackEvent: offlineAnalytics.trackEvent.bind(offlineAnalytics),
    trackOfflineNavigation: offlineAnalytics.trackOfflineNavigation.bind(offlineAnalytics),
    trackCachePerformance: offlineAnalytics.trackCachePerformance.bind(offlineAnalytics),
    trackNetworkTransition: offlineAnalytics.trackNetworkTransition.bind(offlineAnalytics),
    trackOfflineAction: offlineAnalytics.trackOfflineAction.bind(offlineAnalytics),
    getAnalyticsSummary: offlineAnalytics.getAnalyticsSummary.bind(offlineAnalytics),
    syncEvents: offlineAnalytics.syncEvents.bind(offlineAnalytics),
    onSync: offlineAnalytics.onSync.bind(offlineAnalytics)
  };
};