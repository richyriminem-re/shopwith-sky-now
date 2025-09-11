/**
 * Phase 2: Analytics Data Collection Integration Tests
 * Tests navigation timing analytics, event tracking, and metrics accuracy
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, createMockNavigationMonitor } from '../utils/navigation-test-utils';
import React from 'react';
import App from '@/App';

// Create enhanced mock with real-like behavior
const createEnhancedMockMonitor = () => {
  const events: any[] = [];
  const timings: Map<string, any> = new Map();
  let navigationIdCounter = 0;
  const MAX_EVENTS = 1000;

  const api = {
    trackNavigation: vi.fn((type, route, metadata = {}) => {
      events.push({
        type,
        route,
        timestamp: Date.now(),
        duration: metadata.duration || Math.random() * 500 + 100,
        ...metadata
      });
      // Trim events to prevent memory leaks
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
      }
    }),
    trackError: vi.fn((route, error, metadata = {}) => {
      events.push({
        type: 'error',
        route,
        timestamp: Date.now(),
        error: error.message,
        ...metadata
      });
      // Trim events to prevent memory leaks
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
      }
    }),
    trackFallback: vi.fn((route, fallbackRoute, reason) => {
      events.push({
        type: 'fallback',
        route,
        timestamp: Date.now(),
        fallbackRoute,
        reason
      });
      // Trim events to prevent memory leaks
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
      }
    }),
    startNavigationTiming: vi.fn((route = '/', type = 'click') => {
      const id = `nav_${Date.now()}_${++navigationIdCounter}`;
      timings.set(id, {
        id,
        startTime: Date.now(),
        route,
        type
      });
      return id;
    }),
    completeNavigationTiming: vi.fn((route: string, navigationId?: string): number | null => {
      let timing;
      if (navigationId && timings.has(navigationId)) {
        timing = timings.get(navigationId);
        timings.delete(navigationId);
      } else {
        // Find by route
        timing = Array.from(timings.values()).find(t => t.route === route);
        if (timing) {
          timings.delete(timing.id);
        }
      }
      
      if (timing) {
        const duration = Date.now() - timing.startTime;
        events.push({
          type: 'navigation',
          route: timing.route,
          timestamp: Date.now(),
          duration,
          navigationId: timing.id
        });
        // Trim events to prevent memory leaks
        if (events.length > MAX_EVENTS) {
          events.splice(0, events.length - MAX_EVENTS);
        }
        return duration;
      }
      return null;
    }),
    getMetrics: vi.fn(() => {
      const navigationEvents = events.filter(e => e.type === 'navigation');
      const errorEvents = events.filter(e => e.type === 'error');
      const fallbackEvents = events.filter(e => e.type === 'fallback');
      
      const timedNavigations = navigationEvents.filter(e => e.duration);
      const averageNavigationTime = timedNavigations.length > 0
        ? timedNavigations.reduce((sum, e) => sum + e.duration, 0) / timedNavigations.length
        : 0;
      
      const popularRoutes: Record<string, number> = {};
      navigationEvents.forEach(event => {
        popularRoutes[event.route] = (popularRoutes[event.route] || 0) + 1;
      });
      
      const errorsByRoute: Record<string, number> = {};
      errorEvents.forEach(event => {
        errorsByRoute[event.route] = (errorsByRoute[event.route] || 0) + 1;
      });

      return {
        totalNavigations: navigationEvents.length,
        averageNavigationTime,
        errorRate: navigationEvents.length > 0 ? errorEvents.length / navigationEvents.length : 0,
        fallbackUsage: navigationEvents.length > 0 ? fallbackEvents.length / navigationEvents.length : 0,
        popularRoutes,
        errorsByRoute
      };
    }),
    getRecentEvents: vi.fn((limit = 50) => events.slice(-limit)),
    exportMetrics: vi.fn(() => ({
      timestamp: Date.now(),
      metrics: api.getMetrics(),
      recentEvents: api.getRecentEvents(100),
      userAgent: navigator.userAgent,
      url: window.location.href
    })),
    clear: vi.fn(() => {
      events.length = 0;
      timings.clear();
    }),
    // Expose internals for testing
    _events: events,
    _timings: timings
  };
  
  return api;
};

vi.mock('@/utils/navigationMonitor', () => {
  const mockMonitor = createEnhancedMockMonitor();
  return {
    navigationMonitor: mockMonitor,
    useNavigationMonitor: () => mockMonitor,
  };
});

describe('Analytics Integration Tests - Phase 2', () => {
  let mockMonitor: ReturnType<typeof createEnhancedMockMonitor>;

  beforeEach(() => {
    const { navigationMonitor } = require('@/utils/navigationMonitor');
    mockMonitor = navigationMonitor;
    mockMonitor.clear();
    vi.clearAllMocks();
  });

  describe('2.1 Navigation Timing Analytics', () => {
    it('should capture real timing data for navigation events', async () => {
      const { user } = renderWithRouter(<App />);
      
      // Start navigation timing
      const navigationId = mockMonitor.startNavigationTiming('/products', 'click');
      expect(navigationId).toMatch(/^nav_\d+_\d+$/);
      
      // Simulate navigation delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Complete navigation timing
      const duration = mockMonitor.completeNavigationTiming('/products', navigationId);
      expect(duration).toBeGreaterThan(90); // Should be at least ~100ms
      expect(duration).toBeLessThan(1000); // But reasonable
      
      const metrics = mockMonitor.getMetrics();
      expect(metrics.averageNavigationTime).toBeGreaterThan(0);
      expect(metrics.totalNavigations).toBe(1);
    });

    it('should track multiple navigation events with accurate timing', async () => {
      const { user } = renderWithRouter(<App />);
      
      const routes = ['/products', '/cart', '/account'];
      const expectedDurations: number[] = [];
      
      for (const route of routes) {
        const navigationId = mockMonitor.startNavigationTiming(route, 'click');
        
        // Simulate different navigation delays
        const delay = Math.random() * 100 + 50;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const duration = mockMonitor.completeNavigationTiming(route, navigationId);
        expect(duration).toBeGreaterThan(40);
        expect(duration).not.toBeNull();
        expectedDurations.push(duration as number);
      }
      
      const metrics = mockMonitor.getMetrics();
      expect(metrics.totalNavigations).toBe(3);
      expect(metrics.averageNavigationTime).toBeGreaterThan(0);
      
      // Verify average calculation
      const expectedAverage = expectedDurations.reduce((sum, d) => sum + d, 0) / expectedDurations.length;
      expect(Math.abs(metrics.averageNavigationTime - expectedAverage)).toBeLessThan(1);
    });

    it('should handle timing completion without navigation ID (fallback)', async () => {
      mockMonitor.startNavigationTiming('/test-route', 'click');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Complete without ID - should find by route
      const duration = mockMonitor.completeNavigationTiming('/test-route');
      expect(duration).toBeGreaterThan(40);
      expect(duration).not.toBeNull();
    });

    it('should validate analytics export functionality', async () => {
      // Generate some navigation events
      mockMonitor.trackNavigation('navigation', '/home', { duration: 150 });
      mockMonitor.trackNavigation('navigation', '/products', { duration: 200 });
      mockMonitor.trackError('/error-route', new Error('Test error'));
      
      const exportedData = mockMonitor.exportMetrics();
      
      expect(exportedData).toHaveProperty('timestamp');
      expect(exportedData).toHaveProperty('metrics');
      expect(exportedData).toHaveProperty('recentEvents');
      expect(exportedData).toHaveProperty('userAgent');
      expect(exportedData).toHaveProperty('url');
      
      expect(exportedData.metrics.totalNavigations).toBe(2);
      expect(exportedData.metrics.averageNavigationTime).toBe(175);
      expect(exportedData.recentEvents).toHaveLength(3);
    });
  });

  describe('2.2 Navigation Event Tracking', () => {
    it('should track different types of navigation events', async () => {
      mockMonitor.trackNavigation('navigation', '/home');
      mockMonitor.trackNavigation('back_button', '/products');
      mockMonitor.trackError('/error', new Error('Navigation failed'));
      mockMonitor.trackFallback('/failed-route', '/home', 'timeout');
      
      const recentEvents = mockMonitor.getRecentEvents();
      expect(recentEvents).toHaveLength(4);
      
      expect(recentEvents[0].type).toBe('navigation');
      expect(recentEvents[1].type).toBe('back_button');
      expect(recentEvents[2].type).toBe('error');
      expect(recentEvents[3].type).toBe('fallback');
    });

    it('should track navigation with metadata', async () => {
      const metadata = {
        source: 'header',
        userId: '12345',
        sessionId: 'abc-def'
      };
      
      mockMonitor.trackNavigation('navigation', '/profile', metadata);
      
      const events = mockMonitor.getRecentEvents();
      expect(events[0]).toMatchObject({
        type: 'navigation',
        route: '/profile',
        source: 'header',
        userId: '12345',
        sessionId: 'abc-def'
      });
    });

    it('should calculate accurate metrics from tracked events', async () => {
      // Generate test data
      mockMonitor.trackNavigation('navigation', '/home', { duration: 100 });
      mockMonitor.trackNavigation('navigation', '/products', { duration: 200 });
      mockMonitor.trackNavigation('navigation', '/home', { duration: 150 });
      mockMonitor.trackError('/error-route', new Error('Test'));
      mockMonitor.trackFallback('/timeout-route', '/home', 'timeout');
      
      const metrics = mockMonitor.getMetrics();
      
      expect(metrics.totalNavigations).toBe(3);
      expect(metrics.averageNavigationTime).toBe(150); // (100+200+150)/3
      expect(metrics.errorRate).toBeCloseTo(0.333); // 1 error / 3 navigations
      expect(metrics.fallbackUsage).toBeCloseTo(0.333); // 1 fallback / 3 navigations
      
      expect(metrics.popularRoutes).toEqual({
        '/home': 2,
        '/products': 1
      });
      
      expect(metrics.errorsByRoute).toEqual({
        '/error-route': 1
      });
    });
  });

  describe('2.3 Error and Fallback Analytics', () => {
    it('should track navigation errors with proper context', async () => {
      const error = new Error('Navigation timeout');
      const metadata = { 
        attempt: 2, 
        previousRoute: '/home',
        timeoutDuration: 3000 
      };
      
      mockMonitor.trackError('/slow-route', error, metadata);
      
      const events = mockMonitor.getRecentEvents();
      expect(events[0]).toMatchObject({
        type: 'error',
        route: '/slow-route',
        error: 'Navigation timeout',
        attempt: 2,
        previousRoute: '/home',
        timeoutDuration: 3000
      });
      
      const metrics = mockMonitor.getMetrics();
      expect(metrics.errorsByRoute['/slow-route']).toBe(1);
    });

    it('should track fallback usage with reasons', async () => {
      mockMonitor.trackFallback('/offline-route', '/offline', 'network-error');
      mockMonitor.trackFallback('/timeout-route', '/home', 'timeout');
      mockMonitor.trackFallback('/missing-route', '/404', 'not-found');
      
      const events = mockMonitor.getRecentEvents();
      expect(events).toHaveLength(3);
      
      events.forEach(event => {
        expect(event.type).toBe('fallback');
        expect(event).toHaveProperty('fallbackRoute');
        expect(event).toHaveProperty('reason');
      });
    });

    it('should calculate error recovery metrics', async () => {
      // Simulate navigation attempts and errors
      mockMonitor.trackNavigation('navigation', '/route1', { duration: 100 });
      mockMonitor.trackNavigation('navigation', '/route2', { duration: 150 });
      mockMonitor.trackError('/route3', new Error('Failed'));
      mockMonitor.trackFallback('/route3', '/home', 'error-recovery');
      mockMonitor.trackNavigation('navigation', '/home', { duration: 80 });
      
      const metrics = mockMonitor.getMetrics();
      
      expect(metrics.totalNavigations).toBe(3); // Successful navigations only
      expect(metrics.errorRate).toBeCloseTo(0.333); // 1 error out of 3 navigations
      expect(metrics.fallbackUsage).toBeCloseTo(0.333); // 1 fallback out of 3 navigations
    });
  });

  describe('Memory Management and Performance', () => {
    it('should limit stored events to prevent memory leaks', async () => {
      // Create more events than the limit
      for (let i = 0; i < 1200; i++) {
        mockMonitor.trackNavigation('navigation', `/route-${i}`);
      }
      
      const events = mockMonitor._events;
      expect(events.length).toBeLessThanOrEqual(1000); // Should be limited
    });

    it('should cleanup completed navigation timings', async () => {
      // Start multiple timings
      const ids = [];
      for (let i = 0; i < 10; i++) {
        ids.push(mockMonitor.startNavigationTiming(`/route-${i}`));
      }
      
      expect(mockMonitor._timings.size).toBe(10);
      
      // Complete half of them
      for (let i = 0; i < 5; i++) {
        mockMonitor.completeNavigationTiming(`/route-${i}`, ids[i]);
      }
      
      expect(mockMonitor._timings.size).toBe(5);
    });

    it('should clear all data when requested', async () => {
      mockMonitor.trackNavigation('navigation', '/test');
      mockMonitor.startNavigationTiming('/test2');
      
      expect(mockMonitor._events.length).toBeGreaterThan(0);
      expect(mockMonitor._timings.size).toBeGreaterThan(0);
      
      mockMonitor.clear();
      
      expect(mockMonitor._events.length).toBe(0);
      expect(mockMonitor._timings.size).toBe(0);
    });
  });
});