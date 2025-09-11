/**
 * Unit tests for useSmartNavigation
 * Tests timeouts, offline fallback, and debouncing
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import React from 'react';

// Mock dependencies
vi.mock('@/utils/routeHierarchy', () => ({
  getSmartFallback: vi.fn((route) => route === '/product/1' ? '/products' : '/'),
}));

vi.mock('@/utils/navigationMonitor', () => ({
  useNavigationMonitor: () => ({
    trackNavigation: vi.fn(),
    trackError: vi.fn(),
    trackFallback: vi.fn(),
    startNavigationTiming: vi.fn(() => 'nav_123'),
    completeNavigationTiming: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/utils/offlineToastSystem', () => ({
  offlineToastSystem: {
    initialize: vi.fn(),
    show: vi.fn(),
  },
}));

vi.mock('@/utils/navigationStateManager', () => ({
  useNavigationState: () => ({
    updateRoute: vi.fn(),
    setNavigating: vi.fn(),
    hasNavigationHistory: vi.fn(() => true),
    getPreviousRoute: vi.fn(() => '/products'),
    popFromHistory: vi.fn(() => '/products'),
    trackFailedNavigation: vi.fn(),
    clearFailedNavigation: vi.fn(),
    hasRecentFailure: vi.fn(() => false),
  }),
}));

vi.mock('@/utils/serviceWorkerCommunication', () => ({
  useServiceWorkerComm: () => ({
    notifyNavigationAttempt: vi.fn().mockResolvedValue(undefined),
    shouldServiceWorkerHandleOffline: vi.fn(() => false),
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/product/1', key: 'test-key' }),
  };
});

// Mock navigator.onLine
let mockOnLine = true;
Object.defineProperty(navigator, 'onLine', {
  get: () => mockOnLine,
  set: (value: boolean) => { mockOnLine = value; },
  configurable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useSmartNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnLine = true;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Timeout Handling', () => {
    it('should use fallback after navigation timeout', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      act(() => {
        result.current.navigateBack();
      });

      // Fast-forward timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
      });
    });

    it('should clear timeout when navigation completes', async () => {
      const { result, rerender } = renderHook(() => useSmartNavigation(), { wrapper });

      act(() => {
        result.current.navigateBack();
      });

      expect(result.current.isNavigating).toBe(true);

      // Simulate location change (navigation completion)
      rerender();

      expect(result.current.isNavigating).toBe(false);
    });

    it('should use custom timeout for offline navigation', async () => {
      mockOnLine = false;

      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      act(() => {
        result.current.navigateBack();
      });

      // Advance by shorter offline timeout
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/offline', { replace: true });
      });
    });
  });

  describe('Offline Fallback', () => {
    beforeEach(() => {
      mockOnLine = false;
    });

    it('should navigate to /offline when offline and no history', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      await act(async () => {
        await result.current.navigateBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/offline', { replace: true });
    });

    it('should attempt back navigation when offline with history', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      await act(async () => {
        await result.current.navigateBack();
      });

      // Should try to navigate back first, then fallback to /offline on timeout
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });

    it('should handle offline navigation errors gracefully', async () => {
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed');
      });

      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      await act(async () => {
        await result.current.navigateBack();
      });

      // Should still attempt fallback navigation
      expect(mockNavigate).toHaveBeenCalledWith('/offline', { replace: true });
    });
  });

  describe('Debouncing', () => {
    it('should debounce rapid navigation calls', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      // Rapid calls within 250ms
      await act(async () => {
        await result.current.navigateBack();
      });
      
      await act(async () => {
        await result.current.navigateBack(); // Should be ignored
      });

      // Only one navigation call should be made
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should allow navigation after debounce period', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      await act(async () => {
        await result.current.navigateBack();
      });

      // Advance time past debounce period
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await act(async () => {
        await result.current.navigateBack();
      });

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors with fallback', async () => {
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed');
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useSmartNavigation({ onError }), { wrapper });

      await act(async () => {
        await result.current.navigateBack();
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });

    it('should fallback to home if all navigation fails', async () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('All navigation failed');
      });

      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      await act(async () => {
        await result.current.navigateBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('Keyboard Handling', () => {
    it('should handle Enter key navigation', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as any;

      await act(async () => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle Space key navigation', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      const event = {
        key: ' ',
        preventDefault: vi.fn(),
      } as any;

      await act(async () => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should ignore other keys', async () => {
      const { result } = renderHook(() => useSmartNavigation(), { wrapper });

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as any;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});