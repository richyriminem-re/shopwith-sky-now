/**
 * Core Navigation Flow Tests
 * Tests that all navigation works without page reloads
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, verifyNoPageReload, createMockNavigationMonitor } from '../utils/navigation-test-utils';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import React from 'react';
import App from '@/App';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HamburgerMenu from '@/components/HamburgerMenu';
import AppLink from '@/components/AppLink';

// Mock the navigation monitor
vi.mock('@/utils/navigationMonitor', () => {
  const mockMonitor = createMockNavigationMonitor();
  return {
    navigationMonitor: mockMonitor,
    useNavigationMonitor: () => mockMonitor,
  };
});

describe('Core Navigation Flows', () => {
  let reloadVerifier: ReturnType<typeof verifyNoPageReload>;

  beforeEach(() => {
    reloadVerifier = verifyNoPageReload();
    vi.clearAllMocks();
  });

  describe('Link Component Navigation', () => {
    it('should navigate using React Router Link without page reload', async () => {
      const TestComponent = () => (
        <div>
          <Link to="/products" data-testid="products-link">Products</Link>
          <Link to="/cart" data-testid="cart-link">Cart</Link>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/products" element={<div>Products Page</div>} />
            <Route path="/cart" element={<div>Cart Page</div>} />
          </Routes>
        </div>
      );

      const { user } = renderWithRouter(<TestComponent />);
      
      // Navigate to products
      await user.click(screen.getByTestId('products-link'));
      await waitFor(() => {
        expect(screen.getByText('Products Page')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
      
      // Navigate to cart
      await user.click(screen.getByTestId('cart-link'));
      await waitFor(() => {
        expect(screen.getByText('Cart Page')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });

    it('should use AppLink component for enhanced navigation', async () => {
      const TestComponent = () => (
        <div>
          <AppLink to="/about" data-testid="about-link">About</AppLink>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/about" element={<div>About Page</div>} />
          </Routes>
        </div>
      );

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('about-link'));
      await waitFor(() => {
        expect(screen.getByText('About Page')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });
  });

  describe('Header Navigation', () => {
    it('should navigate through header links without page reload', async () => {
      const { user } = renderWithRouter(<Header />);
      
      // Find and click navigation links
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Test first few links
      for (const link of links.slice(0, 3)) {
        if (link.getAttribute('href')?.startsWith('/')) {
          await user.click(link);
          reloadVerifier.assert();
          
          // Wait a bit between clicks
          await waitFor(() => {}, { timeout: 50 });
        }
      }
    });
  });

  describe('Footer Navigation', () => {
    it('should navigate through footer links without page reload', async () => {
      const { user } = renderWithRouter(<Footer />);
      
      const footerLinks = screen.getAllByRole('link');
      
      // Test internal footer links
      for (const link of footerLinks) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('mailto')) {
          await user.click(link);
          reloadVerifier.assert();
          
          await waitFor(() => {}, { timeout: 50 });
        }
      }
    });
  });

  describe('Hamburger Menu Navigation', () => {
    it('should navigate through mobile menu without page reload', async () => {
      const { user } = renderWithRouter(<HamburgerMenu><div>Menu Content</div></HamburgerMenu>);
      
      // Open hamburger menu if it exists
      const menuButton = screen.queryByRole('button');
      if (menuButton) {
        await user.click(menuButton);
        
        // Find navigation links in menu
        const menuLinks = screen.getAllByRole('link');
        
        for (const link of menuLinks.slice(0, 2)) {
          if (link.getAttribute('href')?.startsWith('/')) {
            await user.click(link);
            reloadVerifier.assert();
            
            await waitFor(() => {}, { timeout: 50 });
          }
        }
      }
    });
  });

  describe('Programmatic Navigation', () => {
    it('should handle useNavigate hook without page reload', async () => {
      const { useNavigate } = await import('react-router-dom');
      
      const TestComponent = () => {
        const navigate = useNavigate();
        
        return (
          <div>
            <button 
              onClick={() => navigate('/test')}
              data-testid="navigate-button"
            >
              Navigate
            </button>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/test" element={<div>Test Page</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('navigate-button'));
      await waitFor(() => {
        expect(screen.getByText('Test Page')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });
  });

  describe('Back Button Navigation', () => {
    it('should handle browser back button without page reload', async () => {
      const TestComponent = () => (
        <div>
          <Link to="/page1" data-testid="page1-link">Page 1</Link>
          <Link to="/page2" data-testid="page2-link">Page 2</Link>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/page1" element={<div>Page 1</div>} />
            <Route path="/page2" element={<div>Page 2</div>} />
          </Routes>
        </div>
      );

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/']
      });
      
      // Navigate forward
      await user.click(screen.getByTestId('page1-link'));
      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('page2-link'));
      await waitFor(() => {
        expect(screen.getByText('Page 2')).toBeInTheDocument();
      });
      
      // Simulate back button
      window.history.back();
      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });
  });
});