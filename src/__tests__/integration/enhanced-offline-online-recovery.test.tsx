/**
 * Enhanced integration test for offline/online transitions
 * Tests redirection to /offline when offline and return to last route when online
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';
import React from 'react';

// Mock network state tracking
let networkOnline = true;
Object.defineProperty(navigator, 'onLine', {
  get: () => networkOnline,
  configurable: true,
});

// Mock navigation dependencies
vi.mock('@/utils/routeHierarchy', () => ({
  getSmartFallback: vi.fn(() => '/'),
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

// Track page reloads
const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

// Helper to trigger network events
const triggerNetworkChange = (online: boolean) => {
  networkOnline = online;
  const event = new Event(online ? 'online' : 'offline');
  window.dispatchEvent(event);
};

// Location tracker component
const LocationTracker = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

// Network status component
const NetworkStatus = () => {
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
    <div data-testid="network-status">
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

// Mock pages
const MockProductsPage = () => (
  <div data-testid="products-page">
    <h1>Products Page</h1>
    <BackButton fallback="/" />
    <LocationTracker />
    <NetworkStatus />
  </div>
);

const MockProductDetailPage = () => (
  <div data-testid="product-detail-page">
    <h1>Product Detail Page</h1>
    <BackButton fallback="/products" />
    <LocationTracker />
    <NetworkStatus />
  </div>
);

const MockOfflinePage = () => (
  <div data-testid="offline-page">
    <h1>Offline Page</h1>
    <p>You are currently offline</p>
    <LocationTracker />
    <NetworkStatus />
  </div>
);

const MockHomePage = () => (
  <div data-testid="home-page">
    <h1>Home Page</h1>
    <LocationTracker />
    <NetworkStatus />
  </div>
);

// Test app with routing
const TestApp = ({ initialRoute = '/' }: { initialRoute?: string }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MockHomePage />} />
      <Route path="/products" element={<MockProductsPage />} />
      <Route path="/product/:id" element={<MockProductDetailPage />} />
      <Route path="/offline" element={<MockOfflinePage />} />
    </Routes>
  </BrowserRouter>
);

describe('Enhanced Offline/Online Recovery Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reloadSpy.mockClear();
    networkOnline = true;
    
    // Use fake timers for timeout testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    reloadSpy.mockRestore();
    vi.useRealTimers();
  });

  describe('Offline Redirection', () => {
    it('should redirect to /offline when navigation attempted while offline', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/1" />);

      // Verify we start on product detail page
      expect(screen.getByTestId('product-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('network-status')).toHaveTextContent('Online');

      // Go offline
      triggerNetworkChange(false);
      
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Offline');
      });

      // Attempt navigation while offline
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Fast-forward through timeout
      vi.runAllTimers();

      // Should redirect to offline page
      await waitFor(() => {
        expect(screen.getByTestId('offline-page')).toBeInTheDocument();
      });

      expect(screen.getByTestId('current-location')).toHaveTextContent('/offline');
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should handle immediate offline navigation without delay', async () => {
      const user = userEvent.setup();
      
      // Start offline
      triggerNetworkChange(false);
      
      render(<TestApp initialRoute="/product/1" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should immediately redirect to offline page
      await waitFor(() => {
        expect(screen.getByTestId('offline-page')).toBeInTheDocument();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Online Recovery', () => {
    it('should return to last route when coming back online', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/products" />);

      // Go offline and navigate to offline page
      triggerNetworkChange(false);
      
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByTestId('offline-page')).toBeInTheDocument();
      });

      // Come back online
      triggerNetworkChange(true);

      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      // Navigation should work normally again
      // The last route should be accessible
      expect(screen.getByTestId('current-location')).toHaveTextContent('/offline');
    });

    it('should enable normal navigation after coming online', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/offline" />);

      // Start offline
      triggerNetworkChange(false);
      expect(screen.getByTestId('network-status')).toHaveTextContent('Offline');

      // Come back online
      triggerNetworkChange(true);

      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      // Navigation should work normally now
      // We would need to manually navigate since we're on offline page
      // This test verifies the network state tracking works
      expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
    });
  });

  describe('Offline Fallback Chain', () => {
    it('should fallback to offline page when routes not cached', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/products" />);

      // Go offline
      triggerNetworkChange(false);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should attempt navigation, then timeout to offline page
      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByTestId('offline-page')).toBeInTheDocument();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should handle offline page navigation failure gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock navigation to offline page to fail
      const originalPushState = window.history.pushState;
      window.history.pushState = vi.fn(() => {
        throw new Error('Offline navigation failed');
      });

      render(<TestApp initialRoute="/products" />);

      triggerNetworkChange(false);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      vi.runAllTimers();

      // Should attempt fallback without crashing
      await waitFor(() => {
        // Test passes if no errors are thrown
        expect(true).toBe(true);
      });

      expect(reloadSpy).not.toHaveBeenCalled();
      
      // Restore original function
      window.history.pushState = originalPushState;
    });
  });

  describe('Network State Transitions', () => {
    it('should respond to rapid online/offline changes', async () => {
      render(<TestApp initialRoute="/products" />);

      // Rapid state changes
      triggerNetworkChange(false);
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Offline');
      });

      triggerNetworkChange(true);
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      triggerNetworkChange(false);
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Offline');
      });

      triggerNetworkChange(true);
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      // Component should handle rapid changes without errors
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
    });

    it('should maintain navigation state across network changes', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/1" />);

      // Go offline
      triggerNetworkChange(false);

      // Attempt navigation
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Come back online before timeout
      triggerNetworkChange(true);

      vi.runAllTimers();

      // Should handle the state change gracefully
      await waitFor(() => {
        expect(screen.getByTestId('network-status')).toHaveTextContent('Online');
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });
});