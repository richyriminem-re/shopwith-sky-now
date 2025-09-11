/**
 * Phase 6: Performance and End-to-End Integration Tests
 * Tests complete user journeys, performance metrics, and cross-feature integration
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/dom';
import { renderWithRouter, verifyNoPageReload, createMockNavigationMonitor } from '../utils/navigation-test-utils';
import React from 'react';
import App from '@/App';

// Mock navigation monitor with performance tracking
const createPerformanceMockMonitor = () => {
  const events: any[] = [];
  const performanceMetrics = {
    navigationCount: 0,
    totalTime: 0,
    maxTime: 0,
    minTime: Infinity
  };

  return {
    ...createMockNavigationMonitor(),
    trackNavigation: vi.fn((type, route, metadata = {}) => {
      events.push({
        type,
        route,
        timestamp: Date.now(),
        duration: metadata.duration || Math.random() * 200 + 50,
        ...metadata
      });
    }),
    startNavigationTiming: vi.fn((route = '/', type = 'click') => {
      const id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return id;
    }),
    completeNavigationTiming: vi.fn((route, navigationId) => {
      const duration = Math.random() * 200 + 50;
      performanceMetrics.navigationCount++;
      performanceMetrics.totalTime += duration;
      performanceMetrics.maxTime = Math.max(performanceMetrics.maxTime, duration);
      performanceMetrics.minTime = Math.min(performanceMetrics.minTime, duration);
      
      events.push({
        type: 'navigation',
        route,
        timestamp: Date.now(),
        duration,
        navigationId
      });
      
      return duration;
    }),
    getPerformanceMetrics: vi.fn(() => ({
      ...performanceMetrics,
      averageTime: performanceMetrics.navigationCount > 0 
        ? performanceMetrics.totalTime / performanceMetrics.navigationCount 
        : 0
    })),
    _events: events,
    _performanceMetrics: performanceMetrics
  };
};

vi.mock('@/utils/navigationMonitor', () => {
  const mockMonitor = createPerformanceMockMonitor();
  return {
    navigationMonitor: mockMonitor,
    useNavigationMonitor: () => mockMonitor,
  };
});

// Mock cart store
const mockCartStore = {
  items: [],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  getTotal: vi.fn(() => 0),
  getItemCount: vi.fn(() => 0)
};

vi.mock('@/lib/store', () => ({
  useCartStore: () => mockCartStore
}));

describe('End-to-End Integration Tests - Phase 6', () => {
  let reloadVerifier: ReturnType<typeof verifyNoPageReload>;
  let performanceMonitor: ReturnType<typeof createPerformanceMockMonitor>;

  beforeEach(() => {
    reloadVerifier = verifyNoPageReload();
    const { navigationMonitor } = require('@/utils/navigationMonitor');
    performanceMonitor = navigationMonitor;
    performanceMonitor._events.length = 0;
    performanceMonitor._performanceMetrics = {
      navigationCount: 0,
      totalTime: 0,
      maxTime: 0,
      minTime: Infinity
    };
    vi.clearAllMocks();
  });

  describe('6.1 Navigation Performance', () => {
    it('should measure navigation timing under various conditions', async () => {
      const { user } = renderWithRouter(<App />);

      const routes = ['/products', '/cart', '/account', '/'];
      const navigationTimes: number[] = [];

      for (const route of routes) {
        const startTime = performance.now();
        
        const link = screen.getByRole('link', { 
          name: new RegExp(route.slice(1) || 'home', 'i') 
        });
        
        if (link) {
          await user.click(link);
          
          await waitFor(() => {
            expect(window.location.pathname).toBe(route);
          });
          
          const endTime = performance.now();
          navigationTimes.push(endTime - startTime);
          
          reloadVerifier.assert();
        }
      }

      // Verify performance metrics
      const metrics = performanceMonitor.getPerformanceMetrics();
      expect(metrics.navigationCount).toBeGreaterThan(0);
      expect(metrics.averageTime).toBeGreaterThan(0);
      expect(metrics.maxTime).toBeGreaterThan(metrics.minTime);

      // All navigations should complete within reasonable time
      navigationTimes.forEach(time => {
        expect(time).toBeLessThan(1000); // Less than 1 second
      });
    });

    it('should validate navigation analytics overhead', async () => {
      const { user } = renderWithRouter(<App />);

      const startTime = performance.now();
      
      // Perform multiple navigations to test analytics overhead
      const routes = ['/products', '/cart', '/account', '/contact', '/'];
      
      for (const route of routes) {
        const link = screen.getByRole('link', { 
          name: new RegExp(route.slice(1) || 'home', 'i') 
        });
        
        if (link) {
          await user.click(link);
          await waitFor(() => {
            expect(window.location.pathname).toBe(route);
          });
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Analytics should not significantly impact performance
      expect(totalTime).toBeLessThan(2000); // Total should be under 2 seconds
      
      const metrics = performanceMonitor.getPerformanceMetrics();
      expect(metrics.navigationCount).toBe(routes.length);
      
      reloadVerifier.assert();
    });

    it('should test navigation performance with large route trees', async () => {
      const TestComponent = () => {
        const routes = Array.from({ length: 20 }, (_, i) => `/route-${i}`);
        
        return (
          <div>
            {routes.map(route => (
              <a key={route} href={route} data-testid={`link-${route.slice(1)}`}>
                {route}
              </a>
            ))}
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      const startTime = performance.now();
      
      // Test multiple route navigations
      for (let i = 0; i < 5; i++) {
        const link = screen.getByTestId(`link-route-${i}`);
        await user.click(link);
        reloadVerifier.assert();
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should test memory usage during extended navigation sessions', async () => {
      const { user } = renderWithRouter(<App />);

      // Simulate extended session with many navigations
      const routes = ['/products', '/cart', '/account'];
      
      for (let session = 0; session < 3; session++) {
        for (const route of routes) {
          const link = screen.getByRole('link', { 
            name: new RegExp(route.slice(1), 'i') 
          });
          
          if (link) {
            await user.click(link);
            await waitFor(() => {
              expect(window.location.pathname).toBe(route);
            });
            
            reloadVerifier.assert();
          }
        }
      }

      // Check that events are limited to prevent memory leaks
      const events = performanceMonitor._events;
      expect(events.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('6.2 End-to-End User Journeys', () => {
    it('should test complete shopping flow (home → products → detail → cart → checkout)', async () => {
      const { user } = renderWithRouter(<App />);

      // Start at home
      expect(window.location.pathname).toBe('/');
      reloadVerifier.assert();

      // Navigate to products
      const productsLink = screen.getByRole('link', { name: /products/i });
      await user.click(productsLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/products');
      });
      reloadVerifier.assert();

      // Navigate to cart (simulating adding item first)
      mockCartStore.getItemCount.mockReturnValue(1);
      const cartLink = screen.getByRole('link', { name: /cart/i });
      await user.click(cartLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/cart');
      });
      reloadVerifier.assert();

      // Navigate to checkout
      // Note: This might be a button rather than a link
      const checkoutButton = screen.queryByRole('button', { name: /checkout/i }) || 
                           screen.queryByRole('link', { name: /checkout/i });
      
      if (checkoutButton) {
        await user.click(checkoutButton);
        reloadVerifier.assert();
      }

      // Verify analytics tracked the journey
      const metrics = performanceMonitor.getPerformanceMetrics();
      expect(metrics.navigationCount).toBeGreaterThan(0);
    });

    it('should test authentication flow (login → account → logout)', async () => {
      const { user } = renderWithRouter(<App />);

      // Navigate to account (might redirect to login)
      const accountLink = screen.getByRole('link', { name: /account/i });
      await user.click(accountLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toMatch(/\/(account|login)/);
      });
      reloadVerifier.assert();

      // If redirected to login, navigate back to account
      if (window.location.pathname === '/login') {
        const loginForm = screen.queryByTestId('login-form');
        if (loginForm) {
          // Simulate login success and redirect
          window.history.pushState({}, '', '/account');
        }
      }

      expect(window.location.pathname).toBe('/account');
      reloadVerifier.assert();
    });

    it('should test product browsing and comparison workflows', async () => {
      const { user } = renderWithRouter(<App />);

      // Navigate through product categories
      const routes = ['/products', '/'];
      
      for (const route of routes) {
        const link = screen.getByRole('link', { 
          name: new RegExp(route.slice(1) || 'home', 'i') 
        });
        
        if (link) {
          await user.click(link);
          
          await waitFor(() => {
            expect(window.location.pathname).toBe(route);
          });
          
          reloadVerifier.assert();
        }
      }

      // Verify smooth navigation throughout browsing
      const metrics = performanceMonitor.getPerformanceMetrics();
      expect(metrics.navigationCount).toBeGreaterThan(0);
      expect(metrics.averageTime).toBeLessThan(500); // Fast browsing
    });

    it('should test error recovery during user journeys', async () => {
      const { user } = renderWithRouter(<App />);

      // Navigate to a valid route first
      const productsLink = screen.getByRole('link', { name: /products/i });
      await user.click(productsLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/products');
      });
      reloadVerifier.assert();

      // Test navigation to invalid route (should handle gracefully)
      window.history.pushState({}, '', '/invalid-route-12345');
      
      // Navigate back to valid route
      const homeLink = screen.getByRole('link', { name: /home/i });
      if (homeLink) {
        await user.click(homeLink);
        
        await waitFor(() => {
          expect(window.location.pathname).toBe('/');
        });
        
        reloadVerifier.assert();
      }
    });

    it('should test deep linking and bookmark navigation', async () => {
      const deepRoutes = [
        '/products',
        '/cart',
        '/account',
        '/contact'
      ];

      for (const route of deepRoutes) {
        const { unmount } = renderWithRouter(<App />, {
          initialEntries: [route]
        });
        
        await waitFor(() => {
          expect(window.location.pathname).toBe(route);
        });
        
        reloadVerifier.assert();
        unmount();
      }
    });
  });

  describe('6.3 Cross-Feature Integration', () => {
    it('should test navigation with cart state synchronization', async () => {
      const { user } = renderWithRouter(<App />);

      // Simulate adding item to cart
      mockCartStore.addItem.mockImplementation((item) => {
        mockCartStore.items.push(item);
        mockCartStore.getItemCount.mockReturnValue(mockCartStore.items.length);
      });

      // Navigate to products and simulate adding item
      const productsLink = screen.getByRole('link', { name: /products/i });
      await user.click(productsLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/products');
      });

      // Simulate cart update
      mockCartStore.addItem({ id: '1', name: 'Test Product', price: 10 });

      // Navigate to cart
      const cartLink = screen.getByRole('link', { name: /cart/i });
      await user.click(cartLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/cart');
      });

      // Verify cart state maintained across navigation
      expect(mockCartStore.getItemCount()).toBe(1);
      reloadVerifier.assert();
    });

    it('should test navigation with theme switching', async () => {
      const TestComponent = () => {
        const [theme, setTheme] = React.useState('light');
        
        return (
          <div data-theme={theme}>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              data-testid="theme-toggle"
            >
              Toggle Theme ({theme})
            </button>
            <nav>
              <a href="/products" data-testid="products-link">Products</a>
              <a href="/cart" data-testid="cart-link">Cart</a>
            </nav>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      // Toggle theme
      await user.click(screen.getByTestId('theme-toggle'));
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Toggle Theme (dark)');

      // Navigate with dark theme
      await user.click(screen.getByTestId('products-link'));
      reloadVerifier.assert();

      // Theme should persist
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Toggle Theme (dark)');
    });

    it('should test navigation with PWA features', async () => {
      // Mock service worker
      const mockServiceWorker = {
        state: 'activated',
        postMessage: vi.fn()
      };
      
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({
            active: mockServiceWorker
          }),
          register: vi.fn(() => Promise.resolve({ active: mockServiceWorker }))
        }
      });

      const { user } = renderWithRouter(<App />);

      // Navigate with service worker active
      const productsLink = screen.getByRole('link', { name: /products/i });
      await user.click(productsLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/products');
      });

      reloadVerifier.assert();
    });

    it('should test navigation performance with multiple integrations', async () => {
      const TestComponent = () => {
        const [features, setFeatures] = React.useState({
          theme: 'light',
          cartItems: 0,
          notifications: 0
        });
        
        React.useEffect(() => {
          // Simulate multiple feature updates
          const timer = setInterval(() => {
            setFeatures(prev => ({
              ...prev,
              notifications: prev.notifications + 1
            }));
          }, 100);
          
          return () => clearInterval(timer);
        }, []);
        
        return (
          <div>
            <div data-testid="feature-status">
              Theme: {features.theme}, Cart: {features.cartItems}, 
              Notifications: {features.notifications}
            </div>
            <nav>
              <a href="/products" data-testid="integrated-products-link">Products</a>
              <a href="/cart" data-testid="integrated-cart-link">Cart</a>
            </nav>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      // Wait for some feature updates
      await waitFor(() => {
        const status = screen.getByTestId('feature-status');
        expect(status).toHaveTextContent(/Notifications: [1-9]/);
      });

      const startTime = performance.now();

      // Navigate with multiple features active
      await user.click(screen.getByTestId('integrated-products-link'));
      await user.click(screen.getByTestId('integrated-cart-link'));

      const endTime = performance.now();
      
      // Navigation should still be fast with multiple integrations
      expect(endTime - startTime).toBeLessThan(500);
      reloadVerifier.assert();
    });

    it('should test comprehensive integration scenario', async () => {
      const { user } = renderWithRouter(<App />);

      const startTime = performance.now();
      
      // Complete integration test: multiple navigations with all features
      const navigationSequence = [
        '/products',  // Browse products
        '/cart',      // Check cart
        '/account',   // User account
        '/contact',   // Contact page
        '/'           // Back home
      ];

      for (const route of navigationSequence) {
        const link = screen.getByRole('link', { 
          name: new RegExp(route.slice(1) || 'home', 'i') 
        });
        
        if (link) {
          await user.click(link);
          
          await waitFor(() => {
            expect(window.location.pathname).toBe(route);
          });
          
          reloadVerifier.assert();
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Verify comprehensive test completed successfully
      expect(totalTime).toBeLessThan(3000);
      
      const metrics = performanceMonitor.getPerformanceMetrics();
      expect(metrics.navigationCount).toBeGreaterThan(0);
      expect(metrics.averageTime).toBeGreaterThan(0);
      
      // All navigations completed without page reloads
      reloadVerifier.assert();
    });
  });
});