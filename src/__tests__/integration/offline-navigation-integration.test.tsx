/**
 * Phase 3: Offline/Online Transition Integration Tests
 * Tests offline navigation behavior, online recovery, and network state monitoring
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, createMockNavigationMonitor } from '../utils/navigation-test-utils';
import React from 'react';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

// Mock navigation monitor
vi.mock('@/utils/navigationMonitor', () => {
  const mockMonitor = createMockNavigationMonitor();
  return {
    navigationMonitor: mockMonitor,
    useNavigationMonitor: () => mockMonitor,
  };
});

// Mock service worker communication
const mockSwComm = {
  notifyNavigationAttempt: vi.fn(),
  shouldServiceWorkerHandleOffline: vi.fn(() => false),
  isOnline: vi.fn(() => navigator.onLine),
  getNetworkStatus: vi.fn(() => ({ online: navigator.onLine, effectiveType: '4g' }))
};

vi.mock('@/utils/serviceWorkerCommunication', () => ({
  useServiceWorkerComm: () => mockSwComm
}));

// Mock navigation state manager
const mockNavState = {
  hasNavigationHistory: vi.fn(() => true),
  updateRoute: vi.fn(),
  setNavigating: vi.fn(),
  popFromHistory: vi.fn(() => '/previous-route'),
  hasRecentFailure: vi.fn(() => false),
  trackFailedNavigation: vi.fn(),
  clearFailedNavigation: vi.fn()
};

vi.mock('@/utils/navigationStateManager', () => ({
  useNavigationState: () => mockNavState
}));

// Mock offline toast system
const mockOfflineToastSystem = {
  initialize: vi.fn(),
  show: vi.fn(),
  isInitialized: vi.fn(() => true)
};

vi.mock('@/utils/offlineToastSystem', () => ({
  offlineToastSystem: mockOfflineToastSystem
}));

describe('Offline Navigation Integration Tests - Phase 3', () => {
  let originalOnLine: boolean;
  let originalDispatchEvent: typeof window.dispatchEvent;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
    originalDispatchEvent = window.dispatchEvent;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine
    });
    window.dispatchEvent = originalDispatchEvent;
  });

  const setOnlineStatus = (online: boolean) => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: online
    });
    
    // Dispatch the event
    const event = new Event(online ? 'online' : 'offline');
    window.dispatchEvent(event);
  };

  describe('3.1 Offline Navigation Behavior', () => {
    it('should handle navigation when offline with service worker coordination', async () => {
      setOnlineStatus(false);
      
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="nav-button">
              Navigate Back
            </button>
            <div data-testid="current-route">{window.location.pathname}</div>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/current-page']
      });

      await user.click(screen.getByTestId('nav-button'));

      // Should notify service worker about offline navigation attempt
      await waitFor(() => {
        expect(mockSwComm.notifyNavigationAttempt).toHaveBeenCalledWith('/current-page', true);
      });
    });

    it('should fall back to offline page when service worker cannot handle offline navigation', async () => {
      setOnlineStatus(false);
      mockSwComm.shouldServiceWorkerHandleOffline.mockReturnValue(false);
      mockNavState.hasNavigationHistory.mockReturnValue(false);

      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="nav-button">
              Navigate Back
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/current-page']
      });

      await user.click(screen.getByTestId('nav-button'));

      // Should show offline toast
      await waitFor(() => {
        expect(mockOfflineToastSystem.show).toHaveBeenCalledWith({
          title: "You're offline",
          description: "Taking you to offline page",
          variant: "destructive"
        });
      });
    });

    it('should attempt back navigation when offline with history available', async () => {
      setOnlineStatus(false);
      mockNavState.hasNavigationHistory.mockReturnValue(true);
      mockNavState.popFromHistory.mockReturnValue('/previous-page');

      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="nav-button">
              Navigate Back
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/current-page']
      });

      await user.click(screen.getByTestId('nav-button'));

      await waitFor(() => {
        expect(mockNavState.popFromHistory).toHaveBeenCalled();
      });
    });

    it('should validate offline analytics data collection', async () => {
      setOnlineStatus(false);
      const { navigationMonitor } = await import('@/utils/navigationMonitor');

      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <button onClick={navigateBack} data-testid="nav-button">
            Navigate Back
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/offline-test']
      });

      await user.click(screen.getByTestId('nav-button'));

      await waitFor(() => {
        expect(navigationMonitor.trackNavigation).toHaveBeenCalledWith(
          'back_button',
          '/offline-test',
          expect.objectContaining({ navigationId: expect.any(String) })
        );
      });
    });
  });

  describe('3.2 Online Recovery', () => {
    it('should restore normal navigation when coming back online', async () => {
      // Start offline
      setOnlineStatus(false);
      
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        React.useEffect(() => {
          const handleOnline = () => {
            console.log('Back online');
          };
          
          window.addEventListener('online', handleOnline);
          return () => window.removeEventListener('online', handleOnline);
        }, []);
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="nav-button">
              Navigate Back
            </button>
            <div data-testid="network-status">
              {navigator.onLine ? 'Online' : 'Offline'}
            </div>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      // Verify offline state
      expect(screen.getByTestId('network-status')).toHaveTextContent('Offline');

      // Go back online
      setOnlineStatus(true);

      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      // Navigation should work normally now
      await user.click(screen.getByTestId('nav-button'));

      await waitFor(() => {
        expect(mockSwComm.notifyNavigationAttempt).toHaveBeenCalledWith(
          expect.any(String),
          false // not offline anymore
        );
      });
    });

    it('should handle network state transitions during navigation', async () => {
      const TestComponent = () => {
        const [networkState, setNetworkState] = React.useState(navigator.onLine);
        
        React.useEffect(() => {
          const handleOnline = () => setNetworkState(true);
          const handleOffline = () => setNetworkState(false);
          
          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);
          
          return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
          };
        }, []);
        
        return (
          <div data-testid="network-indicator">
            {networkState ? 'Connected' : 'Disconnected'}
          </div>
        );
      };

      renderWithRouter(<TestComponent />);

      // Test online -> offline transition
      setOnlineStatus(false);
      await waitFor(() => {
        expect(screen.getByTestId('network-indicator')).toHaveTextContent('Disconnected');
      });

      // Test offline -> online transition
      setOnlineStatus(true);
      await waitFor(() => {
        expect(screen.getByTestId('network-indicator')).toHaveTextContent('Connected');
      });
    });
  });

  describe('3.3 Network State Monitoring', () => {
    it('should respond to online/offline events correctly', async () => {
      const eventListeners: { [key: string]: EventListener[] } = {};
      
      // Mock addEventListener to capture listeners
      const mockAddEventListener = vi.fn((event: string, listener: EventListener) => {
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(listener);
      });

      const originalAddEventListener = window.addEventListener;
      window.addEventListener = mockAddEventListener;

      const TestComponent = () => {
        const [status, setStatus] = React.useState('unknown');
        
        React.useEffect(() => {
          const handleOnline = () => setStatus('online');
          const handleOffline = () => setStatus('offline');
          
          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);
          
          setStatus(navigator.onLine ? 'online' : 'offline');
          
          return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
          };
        }, []);
        
        return <div data-testid="status">{status}</div>;
      };

      renderWithRouter(<TestComponent />);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
        expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      });

      // Simulate offline event
      setOnlineStatus(false);
      if (eventListeners.offline) {
        eventListeners.offline.forEach(listener => {
          listener(new Event('offline'));
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('offline');
      });

      // Simulate online event
      setOnlineStatus(true);
      if (eventListeners.online) {
        eventListeners.online.forEach(listener => {
          listener(new Event('online'));
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('online');
      });

      window.addEventListener = originalAddEventListener;
    });

    it('should handle intermittent connectivity gracefully', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        const [attempts, setAttempts] = React.useState(0);
        
        const handleNavigation = () => {
          setAttempts(prev => prev + 1);
          navigateBack();
        };
        
        return (
          <div>
            <button onClick={handleNavigation} data-testid="nav-button">
              Navigate ({attempts} attempts)
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      // Simulate intermittent connectivity
      setOnlineStatus(false);
      await user.click(screen.getByTestId('nav-button'));

      setOnlineStatus(true);
      await user.click(screen.getByTestId('nav-button'));

      setOnlineStatus(false);
      await user.click(screen.getByTestId('nav-button'));

      // Should handle all attempts gracefully
      expect(screen.getByTestId('nav-button')).toHaveTextContent('Navigate (3 attempts)');
    });

    it('should track network-related navigation analytics', async () => {
      const { navigationMonitor } = await import('@/utils/navigationMonitor');
      
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <button onClick={navigateBack} data-testid="nav-button">
            Navigate
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/network-test']
      });

      // Test offline navigation tracking
      setOnlineStatus(false);
      await user.click(screen.getByTestId('nav-button'));

      await waitFor(() => {
        expect(navigationMonitor.trackNavigation).toHaveBeenCalledWith(
          'back_button',
          '/network-test',
          expect.any(Object)
        );
      });

      // Test online navigation tracking
      setOnlineStatus(true);
      vi.clearAllMocks();
      
      await user.click(screen.getByTestId('nav-button'));

      await waitFor(() => {
        expect(navigationMonitor.trackNavigation).toHaveBeenCalled();
      });
    });
  });

  describe('Service Worker Integration', () => {
    it('should coordinate with service worker for offline navigation', async () => {
      setOnlineStatus(false);
      mockSwComm.shouldServiceWorkerHandleOffline.mockReturnValue(true);

      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <button onClick={navigateBack} data-testid="nav-button">
            Navigate
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/sw-test']
      });

      await user.click(screen.getByTestId('nav-button'));

      await waitFor(() => {
        expect(mockSwComm.shouldServiceWorkerHandleOffline).toHaveBeenCalledWith('/sw-test');
      });
    });

    it('should handle service worker navigation failures', async () => {
      setOnlineStatus(false);
      mockSwComm.notifyNavigationAttempt.mockRejectedValue(new Error('SW communication failed'));

      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <button onClick={navigateBack} data-testid="nav-button">
            Navigate
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      // Should handle SW communication errors gracefully
      await user.click(screen.getByTestId('nav-button'));

      // Navigation should still attempt to proceed despite SW error
      await waitFor(() => {
        expect(mockSwComm.notifyNavigationAttempt).toHaveBeenCalled();
      });
    });
  });
});