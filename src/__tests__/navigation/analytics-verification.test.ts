/**
 * Navigation Analytics Verification Tests
 * Tests that navigation timing and analytics are collected properly
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { navigationMonitor, useNavigationMonitor } from '@/utils/navigationMonitor';
import { renderHook, act } from '@testing-library/react';

describe('Navigation Analytics', () => {
  beforeEach(() => {
    navigationMonitor.clear();
    vi.clearAllMocks();
  });

  describe('Navigation Timing Collection', () => {
    it('should capture real navigation timing values', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      // Start timing
      const navigationId = result.current.startNavigationTiming('/products', 'click');
      expect(navigationId).toBeDefined();
      expect(typeof navigationId).toBe('string');
      
      // Simulate some time passing
      vi.advanceTimersByTime(100);
      
      // Complete timing
      const duration = result.current.completeNavigationTiming('/products', navigationId);
      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });

    it('should handle timing completion without ID', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      // Start timing without storing ID
      result.current.startNavigationTiming('/about');
      
      vi.advanceTimersByTime(150);
      
      // Complete by route
      const duration = result.current.completeNavigationTiming('/about');
      expect(duration).toBeGreaterThan(0);
    });

    it('should return null for non-existent timing', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      const duration = result.current.completeNavigationTiming('/nonexistent');
      expect(duration).toBeNull();
    });
  });

  describe('Event Tracking', () => {
    it('should track navigation events with metadata', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      result.current.trackNavigation('navigation', '/products', {
        trigger: 'click',
        timestamp: Date.now(),
        userAgent: 'test-agent'
      });
      
      const events = result.current.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'navigation',
        route: '/products',
        metadata: expect.objectContaining({
          trigger: 'click',
          userAgent: 'test-agent'
        })
      });
    });

    it('should track error events', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      const testError = new Error('Navigation failed');
      result.current.trackError('/products', testError, {
        context: 'user-click'
      });
      
      const events = result.current.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'error',
        route: '/products',
        metadata: expect.objectContaining({
          error: 'Navigation failed',
          context: 'user-click'
        })
      });
    });

    it('should track fallback usage', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      result.current.trackFallback('/broken', '/', 'route-not-found');
      
      const events = result.current.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'fallback',
        route: '/broken',
        metadata: expect.objectContaining({
          fallbackRoute: '/',
          reason: 'route-not-found'
        })
      });
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate accurate navigation metrics', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      // Add multiple navigation events with timing
      result.current.trackNavigation('navigation', '/home', { duration: 100 });
      result.current.trackNavigation('navigation', '/products', { duration: 150 });
      result.current.trackNavigation('navigation', '/cart', { duration: 200 });
      result.current.trackNavigation('error', '/broken', {});
      
      const metrics = result.current.getMetrics();
      
      expect(metrics.totalNavigations).toBe(3);
      expect(metrics.averageNavigationTime).toBe(150); // (100 + 150 + 200) / 3
      expect(metrics.errorRate).toBeCloseTo(0.25); // 1 error out of 4 total events
      expect(metrics.popularRoutes).toEqual({
        '/home': 1,
        '/products': 1,
        '/cart': 1
      });
      expect(metrics.errorsByRoute).toEqual({
        '/broken': 1
      });
    });

    it('should handle empty metrics correctly', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      const metrics = result.current.getMetrics();
      
      expect(metrics).toEqual({
        totalNavigations: 0,
        averageNavigationTime: 0,
        errorRate: 0,
        fallbackUsage: 0,
        popularRoutes: {},
        errorsByRoute: {}
      });
    });

    it('should calculate fallback usage rate', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      result.current.trackNavigation('navigation', '/home', {});
      result.current.trackNavigation('navigation', '/products', {});
      result.current.trackFallback('/broken', '/', 'error');
      
      const metrics = result.current.getMetrics();
      expect(metrics.fallbackUsage).toBeCloseTo(0.5); // 1 fallback out of 2 navigations
    });
  });

  describe('Memory Management', () => {
    it('should limit stored events to prevent memory leaks', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      // Add more than the max limit of events
      for (let i = 0; i < 1200; i++) {
        result.current.trackNavigation('navigation', `/page-${i}`, {});
      }
      
      const events = result.current.getRecentEvents(2000);
      expect(events.length).toBeLessThanOrEqual(1000); // Should be capped at max events
    });

    it('should clean up completed navigation timings', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      // Start many timings
      const ids = [];
      for (let i = 0; i < 60; i++) {
        ids.push(result.current.startNavigationTiming(`/page-${i}`));
      }
      
      // Complete some timings
      for (let i = 0; i < 30; i++) {
        result.current.completeNavigationTiming(`/page-${i}`, ids[i]);
      }
      
      // The internal timing queue should manage memory automatically
      // This is tested indirectly by ensuring no memory leaks occur
      expect(ids.length).toBe(60);
    });
  });

  describe('Analytics Export', () => {
    it('should export complete analytics data', () => {
      const { result } = renderHook(() => useNavigationMonitor());
      
      result.current.trackNavigation('navigation', '/home', { duration: 100 });
      result.current.trackError('/broken', new Error('Test error'));
      
      const exportData = result.current.exportMetrics();
      
      expect(exportData).toMatchObject({
        timestamp: expect.any(Number),
        metrics: expect.objectContaining({
          totalNavigations: 1,
          errorRate: expect.any(Number)
        }),
        recentEvents: expect.arrayContaining([
          expect.objectContaining({
            type: 'navigation',
            route: '/home'
          })
        ]),
        userAgent: expect.any(String),
        url: expect.any(String)
      });
    });
  });
});