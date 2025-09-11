/**
 * Comprehensive PWA Testing Suite
 * Tests offline navigation, service worker communication, and performance monitoring
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { backgroundSync } from '@/utils/backgroundSync';
import { offlineAnalytics } from '@/utils/offlineAnalytics';
import { serviceWorkerComm } from '@/utils/serviceWorkerCommunication';

// Mock service worker
const mockServiceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({
    active: {
      postMessage: vi.fn()
    }
  }),
  addEventListener: vi.fn(),
  controller: {
    postMessage: vi.fn()
  }
};

// Mock navigator
Object.defineProperty(global.navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true
});

Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('PWA Background Sync', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should queue actions for background sync', () => {
    const actionId = backgroundSync.queueAction('form_submit', {
      formId: 'contact',
      data: { name: 'John', email: 'john@example.com' }
    });

    expect(actionId).toBeDefined();
    expect(typeof actionId).toBe('string');

    const status = backgroundSync.getQueueStatus();
    expect(status.totalItems).toBe(1);
    expect(status.byType.form_submit).toBe(1);
  });

  it('should register sync handlers', () => {
    const handler = vi.fn().mockResolvedValue(true);
    backgroundSync.registerSyncHandler('user_action', handler);

    // Queue an action of the registered type
    backgroundSync.queueAction('user_action', { test: 'data' });
    
    expect(backgroundSync.getQueueStatus().byType.user_action).toBe(1);
  });

  it('should process queue when online', async () => {
    const handler = vi.fn().mockResolvedValue(true);
    backgroundSync.registerSyncHandler('form_submit', handler);

    // Queue multiple actions
    backgroundSync.queueAction('form_submit', { form: 'contact' });
    backgroundSync.queueAction('form_submit', { form: 'newsletter' });

    expect(backgroundSync.getQueueStatus().totalItems).toBe(2);

    // Process queue
    await backgroundSync.processQueue();

    // Handlers should have been called
    expect(handler).toHaveBeenCalledTimes(2);
    
    // Queue should be empty after successful processing
    expect(backgroundSync.getQueueStatus().totalItems).toBe(0);
  });

  it('should retry failed actions', async () => {
    const handler = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(true);

    backgroundSync.registerSyncHandler('user_action', handler);
    
    // Queue action
    backgroundSync.queueAction('user_action', { test: 'retry' }, 2);
    
    // First attempt should fail, action stays in queue
    await backgroundSync.processQueue();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(backgroundSync.getQueueStatus().totalItems).toBe(1);

    // Second attempt should succeed, queue should be empty
    await backgroundSync.processQueue();
    expect(handler).toHaveBeenCalledTimes(2);
    expect(backgroundSync.getQueueStatus().totalItems).toBe(0);
  });

  it('should remove actions after max retries', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Persistent error'));
    backgroundSync.registerSyncHandler('user_action', handler);
    
    // Queue action with 1 max retry
    backgroundSync.queueAction('user_action', { test: 'fail' }, 1);
    
    // First attempt fails, still in queue
    await backgroundSync.processQueue();
    expect(backgroundSync.getQueueStatus().totalItems).toBe(1);
    
    // Second attempt fails, removed from queue (max retries reached)
    await backgroundSync.processQueue();
    expect(backgroundSync.getQueueStatus().totalItems).toBe(0);
  });
});

describe('PWA Offline Analytics', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should track offline events', () => {
    offlineAnalytics.trackEvent('test_event', { 
      action: 'click',
      element: 'button' 
    });

    const summary = offlineAnalytics.getAnalyticsSummary();
    expect(summary.queuedEvents).toBe(1);
  });

  it('should track offline navigation', () => {
    offlineAnalytics.trackOfflineNavigation('/home', '/products', true);
    
    const metrics = offlineAnalytics.getOfflineMetrics();
    expect(metrics.offlineNavigations).toBe(1);
    
    const summary = offlineAnalytics.getAnalyticsSummary();
    expect(summary.queuedEvents).toBe(1);
  });

  it('should track cache performance', () => {
    offlineAnalytics.trackCachePerformance('hit', '/api/products', 150);
    offlineAnalytics.trackCachePerformance('miss', '/api/user', 300);
    
    const metrics = offlineAnalytics.getOfflineMetrics();
    expect(metrics.cacheHits).toBe(1);
    expect(metrics.cacheMisses).toBe(1);
    
    const summary = offlineAnalytics.getAnalyticsSummary();
    expect(summary.cacheHitRate).toBe(0.5); // 1 hit out of 2 total
  });

  it('should track network transitions', () => {
    offlineAnalytics.trackNetworkTransition('online', 'offline');
    offlineAnalytics.trackNetworkTransition('offline', 'online');
    
    const summary = offlineAnalytics.getAnalyticsSummary();
    expect(summary.queuedEvents).toBe(2);
  });

  it('should sync events with callback', async () => {
    const syncCallback = vi.fn().mockResolvedValue(undefined);
    offlineAnalytics.onSync(syncCallback);

    // Add some events
    offlineAnalytics.trackEvent('event1', { data: 1 });
    offlineAnalytics.trackEvent('event2', { data: 2 });

    expect(offlineAnalytics.getAnalyticsSummary().queuedEvents).toBe(2);

    // Sync events
    const success = await offlineAnalytics.syncEvents();
    
    expect(success).toBe(true);
    expect(syncCallback).toHaveBeenCalledTimes(1);
    expect(offlineAnalytics.getAnalyticsSummary().queuedEvents).toBe(0);
  });

  it('should handle sync failures', async () => {
    const syncCallback = vi.fn().mockRejectedValue(new Error('Sync failed'));
    offlineAnalytics.onSync(syncCallback);

    offlineAnalytics.trackEvent('test_event', { data: 'test' });
    
    const success = await offlineAnalytics.syncEvents();
    
    expect(success).toBe(false);
    expect(offlineAnalytics.getAnalyticsSummary().queuedEvents).toBe(1); // Event still in queue
  });
});

describe('PWA Service Worker Communication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect service worker readiness', () => {
    const status = serviceWorkerComm.getStatus();
    expect(status).toHaveProperty('isServiceWorkerReady');
    expect(status).toHaveProperty('queuedMessages');
    expect(status).toHaveProperty('isOnline');
  });

  it('should notify navigation attempts', async () => {
    const result = await serviceWorkerComm.notifyNavigationAttempt('/products', false);
    
    // Should attempt to send message (mock returns false since SW not ready in test)
    expect(typeof result).toBe('boolean');
  });

  it('should determine if service worker should handle offline navigation', () => {
    // Mock offline state
    Object.defineProperty(global.navigator, 'onLine', { value: false, writable: true });
    
    const shouldHandle = serviceWorkerComm.shouldServiceWorkerHandleOffline('/products');
    
    // Should not handle since SW not ready in test environment
    expect(shouldHandle).toBe(false);
    
    // Reset online state
    Object.defineProperty(global.navigator, 'onLine', { value: true, writable: true });
  });
});

describe('PWA Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should handle complete offline user journey', async () => {
    // Simulate user going offline
    Object.defineProperty(global.navigator, 'onLine', { value: false, writable: true });

    // Track offline navigation
    offlineAnalytics.trackOfflineNavigation('/home', '/products', false);
    
    // Queue form submission
    const formHandler = vi.fn().mockResolvedValue(true);
    backgroundSync.registerSyncHandler('form_submit', formHandler);
    backgroundSync.queueAction('form_submit', {
      formId: 'contact',
      data: { name: 'John', email: 'john@test.com' }
    });

    // Track cache miss
    offlineAnalytics.trackCachePerformance('miss', '/api/products', 500);

    // Verify offline state
    const metrics = offlineAnalytics.getOfflineMetrics();
    expect(metrics.offlineNavigations).toBe(1);
    expect(metrics.cacheMisses).toBe(1);
    expect(backgroundSync.getQueueStatus().totalItems).toBe(1);

    // Simulate coming back online
    Object.defineProperty(global.navigator, 'onLine', { value: true, writable: true });
    
    offlineAnalytics.trackNetworkTransition('offline', 'online');
    
    // Process queued actions
    await backgroundSync.processQueue();
    
    // Verify sync
    expect(formHandler).toHaveBeenCalledTimes(1);
    expect(backgroundSync.getQueueStatus().totalItems).toBe(0);
  });

  it('should handle performance monitoring workflow', () => {
    // Track various performance metrics
    offlineAnalytics.trackCachePerformance('hit', '/js/main.js', 50);
    offlineAnalytics.trackCachePerformance('hit', '/css/styles.css', 30);
    offlineAnalytics.trackCachePerformance('miss', '/api/user', 200);
    
    const summary = offlineAnalytics.getAnalyticsSummary();
    
    expect(summary.metrics.cacheHits).toBe(2);
    expect(summary.metrics.cacheMisses).toBe(1);
    expect(summary.cacheHitRate).toBeCloseTo(0.667, 2); // 2/3 = 0.667
    expect(summary.queuedEvents).toBe(3);
  });
});