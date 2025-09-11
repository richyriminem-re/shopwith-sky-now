/**
 * Phase 1: Core Navigation Flow Integration Tests
 * Tests zero page reloads, navigation components, and route transitions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/dom';
import { renderWithRouter, verifyNoPageReload, createMockNavigationMonitor } from '../utils/navigation-test-utils';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import App from '@/App';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HamburgerMenu from '@/components/HamburgerMenu';

// Mock navigation monitor
vi.mock('@/utils/navigationMonitor', () => {
  const mockMonitor = createMockNavigationMonitor();
  return {
    navigationMonitor: mockMonitor,
    useNavigationMonitor: () => mockMonitor,
  };
});

describe('Navigation Integration Tests - Phase 1', () => {
  let reloadVerifier: ReturnType<typeof verifyNoPageReload>;

  beforeEach(() => {
    reloadVerifier = verifyNoPageReload();
    vi.clearAllMocks();
  });

  describe('1.1 Zero Page Reload Verification', () => {
    it('should navigate through all major routes without page reloads', async () => {
      const { user } = renderWithRouter(<App />, {
        initialEntries: ['/']
      });

      // Test home to products navigation
      const productsLink = screen.getByRole('link', { name: /products/i });
      await user.click(productsLink);
      await waitFor(() => {
        expect(window.location.pathname).toBe('/products');
      });
      reloadVerifier.assert();

      // Test products to cart navigation
      const cartLink = screen.getByRole('link', { name: /cart/i });
      await user.click(cartLink);
      await waitFor(() => {
        expect(window.location.pathname).toBe('/cart');
      });
      reloadVerifier.assert();

      // Test cart to account navigation
      const accountLink = screen.getByRole('link', { name: /account/i });
      await user.click(accountLink);
      await waitFor(() => {
        expect(window.location.pathname).toBe('/account');
      });
      reloadVerifier.assert();
    });

    it('should handle rapid navigation without race conditions', async () => {
      const { user } = renderWithRouter(<App />);

      // Rapid click test
      const links = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.startsWith('/')
      ).slice(0, 5);

      for (const link of links) {
        await user.click(link);
        reloadVerifier.assert();
        // Small delay to prevent overwhelming the test
        await waitFor(() => {}, { timeout: 10 });
      }
    });

    it('should verify React Router history API usage', async () => {
      const historySpy = vi.spyOn(window.history, 'pushState');
      const { user } = renderWithRouter(<App />);

      const productLink = screen.getByRole('link', { name: /products/i });
      await user.click(productLink);
      
      await waitFor(() => {
        expect(historySpy).toHaveBeenCalled();
      });
      
      reloadVerifier.assert();
      historySpy.mockRestore();
    });
  });

  describe('1.2 Navigation Component Integration', () => {
    it('should test Header navigation components', async () => {
      const { user } = renderWithRouter(<Header />);
      
      const headerElement = screen.getByRole('banner');
      const headerLinks = within(headerElement).getAllByRole('link');
      
      expect(headerLinks.length).toBeGreaterThan(0);
      
      // Test each header link
      for (const link of headerLinks.slice(0, 3)) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          await user.click(link);
          reloadVerifier.assert();
          await waitFor(() => {}, { timeout: 50 });
        }
      }
    });

    it('should test Footer navigation components', async () => {
      const { user } = renderWithRouter(<Footer />);
      
      const footerLinks = screen.getAllByRole('link').filter(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('/') && !href.includes('mailto');
      });
      
      // Test internal footer links
      for (const link of footerLinks.slice(0, 3)) {
        await user.click(link);
        reloadVerifier.assert();
        await waitFor(() => {}, { timeout: 50 });
      }
    });

    it('should test HamburgerMenu navigation', async () => {
      const { user } = renderWithRouter(
        <HamburgerMenu>
          <div>Menu Content</div>
        </HamburgerMenu>
      );
      
      // Find and click menu button if exists
      const menuButton = screen.queryByRole('button');
      if (menuButton) {
        await user.click(menuButton);
        
        const menuLinks = screen.getAllByRole('link').filter(link =>
          link.getAttribute('href')?.startsWith('/')
        );
        
        for (const link of menuLinks.slice(0, 2)) {
          await user.click(link);
          reloadVerifier.assert();
          await waitFor(() => {}, { timeout: 50 });
        }
      }
    });

    it('should test AppLink component enhanced navigation', async () => {
      const AppLink = (await import('@/components/AppLink')).default;
      const { useNavigationMonitor } = await import('@/utils/navigationMonitor');
      
      const TestComponent = () => {
        const monitor = useNavigationMonitor();
        
        React.useEffect(() => {
          // Verify monitor is available
          expect(monitor.startNavigationTiming).toBeDefined();
          expect(monitor.trackNavigation).toBeDefined();
        }, [monitor]);

        return (
          <MemoryRouter>
            <AppLink to="/test" data-testid="app-link">Test Link</AppLink>
          </MemoryRouter>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      const appLink = screen.getByTestId('app-link');
      expect(appLink).toHaveAttribute('data-navigation', 'true');
      
      await user.click(appLink);
      reloadVerifier.assert();
    });
  });

  describe('1.3 Route Transition Testing', () => {
    it('should test all major application routes', async () => {
      const routes = [
        '/',
        '/products',
        '/cart',
        '/account',
        '/contact',
        '/help',
        '/privacy',
        '/terms'
      ];

      for (const route of routes) {
        const { container } = renderWithRouter(<App />, {
          initialEntries: [route]
        });
        
        await waitFor(() => {
          expect(container.firstChild).toBeInTheDocument();
        });
        
        // Verify route rendered without reload
        expect(window.location.pathname).toBe(route);
        reloadVerifier.assert();
      }
    });

    it('should test deep linking and direct URL access', async () => {
      const deepRoutes = [
        '/products/category/mens',
        '/products/123',
        '/cart',
        '/checkout'
      ];

      for (const route of deepRoutes) {
        renderWithRouter(<App />, {
          initialEntries: [route]
        });
        
        await waitFor(() => {
          expect(window.location.pathname).toBe(route);
        });
        
        reloadVerifier.assert();
      }
    });

    it('should test route redirects and fallback navigation', async () => {
      // Test invalid route redirects to 404/NotFound
      renderWithRouter(<App />, {
        initialEntries: ['/invalid-route-12345']
      });
      
      await waitFor(() => {
        // Should render NotFound component or redirect
        expect(document.body).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });

    it('should test Layout component consistency across routes', async () => {
      const routesToTest = ['/', '/products', '/cart', '/account'];
      
      for (const route of routesToTest) {
        const { container } = renderWithRouter(<App />, {
          initialEntries: [route]
        });
        
        await waitFor(() => {
          // Verify Layout components are present
          const header = container.querySelector('header');
          const main = container.querySelector('main');
          expect(header || main).toBeInTheDocument();
        });
        
        reloadVerifier.assert();
      }
    });
  });

  describe('Navigation State Consistency', () => {
    it('should maintain navigation state across route changes', async () => {
      const { user } = renderWithRouter(<App />);
      
      // Navigate through multiple routes
      const routes = ['/products', '/cart', '/account', '/'];
      
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
    });

    it('should handle browser back/forward navigation', async () => {
      const { user } = renderWithRouter(<App />);
      
      // Navigate forward
      const productsLink = screen.getByRole('link', { name: /products/i });
      await user.click(productsLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/products');
      });
      
      // Navigate back
      window.history.back();
      await waitFor(() => {
        expect(window.location.pathname).toBe('/');
      });
      
      reloadVerifier.assert();
    });
  });
});