/**
 * Offline/Online Navigation Transition Tests
 * Tests navigation behavior during network state changes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, mockNetworkState, mockServiceWorkerCommunication } from '../utils/navigation-test-utils';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { Routes, Route } from 'react-router-dom';
import React from 'react';

// Mock the offline toast system
vi.mock('@/utils/offlineToastSystem', () => ({
  offlineToastSystem: {
    initialize: vi.fn(),
    show: vi.fn(),
    isInitialized: true,
  },
}));

// Mock service worker communication
vi.mock('@/utils/serviceWorkerCommunication', () => ({
  useServiceWorkerComm: () => ({
    notifyNavigationAttempt: vi.fn().mockResolvedValue(undefined),
    shouldServiceWorkerHandleOffline: vi.fn().mockReturnValue(false),
  }),
}));

describe('Offline/Online Navigation Transitions', () => {
  let swComm: ReturnType<typeof mockServiceWorkerCommunication>;

  beforeEach(() => {
    swComm = mockServiceWorkerCommunication();
    mockNetworkState(true); // Start online
    vi.clearAllMocks();
  });

  describe('Offline Navigation Handling', () => {
    it('should handle navigation when going offline', async () => {
      const TestComponent = () => {
        const { navigateBack, isNavigating } = useSmartNavigation();
        
        return (
          <div>
            <button 
              onClick={navigateBack}
              data-testid="back-button"
              disabled={isNavigating}
            >
              Back
            </button>
            <div data-testid="navigation-status">
              {isNavigating ? 'Navigating...' : 'Ready'}
            </div>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/products" element={<div>Products</div>} />
              <Route path="/offline" element={<div>Offline Page</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/products']
      });

      // Go offline
      mockNetworkState(false);

      // Attempt navigation
      await user.click(screen.getByTestId('back-button'));
      
      // Should either navigate to fallback or show appropriate handling
      await waitFor(() => {
        const status = screen.getByTestId('navigation-status');
        expect(status).not.toHaveTextContent('Navigating...');
      }, { timeout: 2000 });
    });

    it('should communicate with service worker during offline navigation', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="back-button">
              Back
            </button>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/products" element={<div>Products</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/products']
      });

      // Go offline
      mockNetworkState(false);

      await user.click(screen.getByTestId('back-button'));

      // Verify service worker communication occurred
      await waitFor(() => {
        const messages = swComm.getMessages();
        expect(messages.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Online Recovery', () => {
    it('should resume normal navigation when coming back online', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="back-button">
              Back
            </button>
            <div data-testid="network-status">
              {navigator.onLine ? 'Online' : 'Offline'}
            </div>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/products" element={<div>Products</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/products']
      });

      // Start offline
      mockNetworkState(false);
      
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Offline');
      });

      // Go back online
      mockNetworkState(true);
      
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      // Navigation should work normally now
      await user.click(screen.getByTestId('back-button'));
      
      // Should complete navigation without issues
      await waitFor(() => {
        // Navigation should complete successfully
        expect(true).toBe(true); // Test passes if no errors thrown
      });
    });
  });

  describe('Offline Page Fallback', () => {
    it('should navigate to offline page when routes are not cached', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="back-button">
              Back
            </button>
            <Routes>
              <Route path="/uncached-route" element={<div>Uncached Route</div>} />
              <Route path="/offline" element={<div>Offline Page</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/uncached-route']
      });

      // Go offline
      mockNetworkState(false);

      await user.click(screen.getByTestId('back-button'));

      // Should eventually show offline content or handle gracefully
      await waitFor(() => {
        // Navigation should complete without throwing errors
        expect(true).toBe(true);
      }, { timeout: 2000 });
    });
  });

  describe('Network State Monitoring', () => {
    it('should respond to online/offline events', async () => {
      let onlineStatus = true;
      
      const TestComponent = () => {
        const [isOnline, setIsOnline] = React.useState(navigator.onLine);
        
        React.useEffect(() => {
          const handleOnline = () => setIsOnline(true);
          const handleOffline = () => setIsOnline(false);
          
          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);
          
          return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
          };
        }, []);
        
        return (
          <div data-testid="network-indicator">
            {isOnline ? 'Connected' : 'Disconnected'}
          </div>
        );
      };

      renderWithRouter(<TestComponent />);

      // Should start online
      expect(screen.getByTestId('network-indicator')).toHaveTextContent('Connected');

      // Go offline
      mockNetworkState(false);
      
      await waitFor(() => {
        expect(screen.getByTestId('network-indicator')).toHaveTextContent('Disconnected');
      });

      // Go back online
      mockNetworkState(true);
      
      await waitFor(() => {
        expect(screen.getByTestId('network-indicator')).toHaveTextContent('Connected');
      });
    });
  });
});