/**
 * Enhanced Analytics Hook
 * Integrates admin metrics, navigation analytics, and offline analytics
 */

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/lib/adminStore';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { useOfflineAnalytics } from '@/utils/offlineAnalytics';

export interface EnhancedMetrics {
  // Business Metrics
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  
  // Performance Metrics
  averageNavigationTime: number;
  errorRate: number;
  fallbackUsage: number;
  cacheHitRate: number;
  
  // User Behavior
  popularRoutes: Record<string, number>;
  offlineNavigations: number;
  totalOfflineTime: number;
  
  // Real-time Metrics
  lastUpdated: number;
  isLive: boolean;
}

export interface AnalyticsError {
  message: string;
  timestamp: number;
  retry: () => void;
}

export const useEnhancedAnalytics = (autoRefreshInterval = 30000) => {
  const adminStore = useAdminStore();
  const { getMetrics: getNavMetrics, getRecentEvents } = useNavigationMonitor();
  const { getAnalyticsSummary } = useOfflineAnalytics();

  const [enhancedMetrics, setEnhancedMetrics] = useState<EnhancedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AnalyticsError | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const loadEnhancedMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load admin metrics
      await adminStore.loadMetrics();
      
      // Get all metrics
      const adminMetrics = adminStore.metrics;
      const navMetrics = getNavMetrics();
      const offlineMetrics = getAnalyticsSummary();

      if (!adminMetrics) {
        throw new Error('Failed to load admin metrics');
      }

      // Combine all metrics
      const combined: EnhancedMetrics = {
        // Business metrics from admin store
        totalRevenue: adminMetrics.totalRevenue,
        totalOrders: adminMetrics.totalOrders,
        totalProducts: adminMetrics.totalProducts,
        totalCustomers: adminMetrics.totalCustomers,
        dailySales: adminMetrics.dailySales,

        // Performance metrics from navigation monitor
        averageNavigationTime: navMetrics.averageNavigationTime,
        errorRate: navMetrics.errorRate,
        fallbackUsage: navMetrics.fallbackUsage,
        cacheHitRate: offlineMetrics.cacheHitRate,

        // User behavior metrics
        popularRoutes: navMetrics.popularRoutes,
        offlineNavigations: offlineMetrics.metrics.offlineNavigations,
        totalOfflineTime: offlineMetrics.metrics.totalOfflineTime,

        // Meta information
        lastUpdated: Date.now(),
        isLive: navigator.onLine
      };

      setEnhancedMetrics(combined);
      setLastRefresh(Date.now());

    } catch (err) {
      const errorObj = {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        timestamp: Date.now(),
        retry: loadEnhancedMetrics
      };
      setError(errorObj);
      console.error('Enhanced analytics loading failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminStore, getNavMetrics, getAnalyticsSummary]);

  // Auto-refresh functionality
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefreshInterval > 0) {
      intervalId = setInterval(loadEnhancedMetrics, autoRefreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadEnhancedMetrics, autoRefreshInterval]);

  // Initial load
  useEffect(() => {
    loadEnhancedMetrics();
  }, [loadEnhancedMetrics]);

  // Calculate trends (comparing last 7 days vs previous 7 days)
  const getTrends = useCallback(() => {
    if (!enhancedMetrics?.dailySales) return null;

    const sales = enhancedMetrics.dailySales;
    const midPoint = Math.floor(sales.length / 2);
    
    const recent = sales.slice(midPoint);
    const previous = sales.slice(0, midPoint);

    const recentTotal = recent.reduce((sum, day) => sum + day.revenue, 0);
    const previousTotal = previous.reduce((sum, day) => sum + day.revenue, 0);

    const recentOrders = recent.reduce((sum, day) => sum + day.orders, 0);
    const previousOrders = previous.reduce((sum, day) => sum + day.orders, 0);

    return {
      revenue: {
        current: recentTotal,
        previous: previousTotal,
        change: previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0
      },
      orders: {
        current: recentOrders,
        previous: previousOrders,
        change: previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0
      }
    };
  }, [enhancedMetrics]);

  // Get top performing products
  const getTopProducts = useCallback(() => {
    const adminMetrics = adminStore.metrics;
    return adminMetrics?.topProducts || [];
  }, [adminStore.metrics]);

  // Get recent navigation events for activity feed
  const getRecentActivity = useCallback(() => {
    return getRecentEvents(10).map(event => ({
      id: `${event.timestamp}_${event.route}`,
      type: event.type,
      route: event.route,
      timestamp: event.timestamp,
      duration: event.duration,
      metadata: event.metadata
    }));
  }, [getRecentEvents]);

  return {
    metrics: enhancedMetrics,
    isLoading: isLoading && !enhancedMetrics, // Don't show loading if we have cached data
    error,
    lastRefresh,
    autoRefreshInterval,
    
    // Actions
    refresh: loadEnhancedMetrics,
    clearError: () => setError(null),
    
    // Computed data
    trends: getTrends(),
    topProducts: getTopProducts(),
    recentActivity: getRecentActivity(),
    
    // Status indicators
    isStale: lastRefresh > 0 && Date.now() - lastRefresh > autoRefreshInterval * 2
  };
};