/**
 * Navigation testing utilities
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import { vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import React from 'react';
import { navigationMonitor } from '@/utils/navigationMonitor';

// Custom render function with router wrapper
export const renderWithRouter = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => 
    React.createElement(MemoryRouter, { initialEntries }, children);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Browser router wrapper for integration tests
export const renderWithBrowserRouter = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(BrowserRouter, {}, children);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper }),
  };
};

// Mock navigation monitor for testing
export const createMockNavigationMonitor = () => {
  const mockEvents: any[] = [];
  const mockTimings = new Map();

  return {
    trackNavigation: vi.fn((type, route, metadata) => {
      mockEvents.push({ type, route, metadata, timestamp: Date.now() });
    }),
    startNavigationTiming: vi.fn((route) => {
      const id = `nav_${Date.now()}_${Math.random()}`;
      mockTimings.set(id, { route, startTime: Date.now() });
      return id;
    }),
    completeNavigationTiming: vi.fn((route, id) => {
      if (id && mockTimings.has(id)) {
        const timing = mockTimings.get(id);
        const duration = Date.now() - timing.startTime;
        mockTimings.delete(id);
        return duration;
      }
      return null;
    }),
    trackError: vi.fn(),
    trackFallback: vi.fn(),
    getMetrics: vi.fn(() => ({
      totalNavigations: mockEvents.filter(e => e.type === 'navigation').length,
      averageNavigationTime: 150, // Mock realistic timing
      errorRate: 0,
      fallbackUsage: 0,
      popularRoutes: {},
      errorsByRoute: {},
    })),
    getRecentEvents: vi.fn(() => mockEvents.slice(-50)),
    clear: vi.fn(() => {
      mockEvents.length = 0;
      mockTimings.clear();
    }),
    events: mockEvents,
    timings: mockTimings,
  };
};

// Verify no page reload occurred during navigation
export const verifyNoPageReload = () => {
  // Check that window.location hasn't changed (would indicate full page reload)
  const originalLocation = window.location.href;
  
  return {
    assert: () => {
      expect(window.location.href).toBe(originalLocation);
    },
    getLocationChanges: () => {
      return window.location.href !== originalLocation;
    }
  };
};

// Simulate offline/online states
export const mockNetworkState = (isOnline: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    value: isOnline,
    writable: true,
  });

  // Dispatch online/offline events
  window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
};

// Mock service worker communication
export const mockServiceWorkerCommunication = () => {
  const messages: any[] = [];
  
  const mockSW = {
    postMessage: vi.fn((message) => {
      messages.push(message);
    }),
    addEventListener: vi.fn(),
  };

  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      ...navigator.serviceWorker,
      controller: mockSW,
      ready: Promise.resolve({ active: mockSW }),
    },
    writable: true,
  });

  return {
    getMessages: () => messages,
    clearMessages: () => { messages.length = 0; },
  };
};

// Toast testing utilities
export const mockToastSystem = () => {
  const toasts: any[] = [];
  
  return {
    toast: vi.fn((options) => {
      toasts.push({ ...options, timestamp: Date.now() });
    }),
    getToasts: () => toasts,
    clearToasts: () => { toasts.length = 0; },
    waitForToast: async (title: string, timeout = 1000) => {
      await waitFor(() => {
        expect(toasts.some(t => t.title === title)).toBe(true);
      }, { timeout });
    },
  };
};

// Analytics verification utilities
export const verifyAnalyticsData = (mockMonitor: any) => {
  return {
    hasNavigationEvents: () => {
      const events = mockMonitor.getRecentEvents();
      return events.some((e: any) => e.type === 'navigation');
    },
    hasTimingData: () => {
      const metrics = mockMonitor.getMetrics();
      return metrics.averageNavigationTime > 0;
    },
    getNavigationCount: () => {
      const events = mockMonitor.getRecentEvents();
      return events.filter((e: any) => e.type === 'navigation').length;
    },
    getErrorCount: () => {
      const events = mockMonitor.getRecentEvents();
      return events.filter((e: any) => e.type === 'error').length;
    },
  };
};

// Accessibility testing utilities
export const testKeyboardNavigation = async (user: any, element: HTMLElement) => {
  await user.tab();
  expect(element).toHaveFocus();
  
  await user.keyboard('{Enter}');
  // Allow for navigation to complete
  await waitFor(() => {}, { timeout: 100 });
};

// Performance testing utilities
export const measureNavigationPerformance = () => {
  const startTime = performance.now();
  
  return {
    end: () => performance.now() - startTime,
    expectFastNavigation: (maxTime = 100) => {
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(maxTime);
    },
  };
};

// Error simulation utilities
export const simulateNavigationError = (errorMessage: string = 'Navigation failed') => {
  const originalNavigate = window.history.pushState;
  
  window.history.pushState = vi.fn(() => {
    throw new Error(errorMessage);
  });
  
  return () => {
    window.history.pushState = originalNavigate;
  };
};