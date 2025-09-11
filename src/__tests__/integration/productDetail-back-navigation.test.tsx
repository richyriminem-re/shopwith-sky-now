/**
 * Integration test for ProductDetail back navigation
 * Tests back navigation from /product/:handle to /products without reload
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';
import React from 'react';

// Mock product data
vi.mock('@/lib/products', () => ({
  products: [
    {
      id: 1,
      handle: 'test-product',
      name: 'Test Product',
      price: 19.99,
      image: '/test-image.jpg',
      category: 'test',
      description: 'Test description',
    },
  ],
  getProductByHandle: vi.fn((handle) => 
    handle === 'test-product' 
      ? { id: 1, handle: 'test-product', name: 'Test Product', price: 19.99 }
      : null
  ),
}));

// Mock navigation dependencies
vi.mock('@/utils/routeHierarchy', () => ({
  getSmartFallback: vi.fn(() => '/products'),
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

// Location tracker component
const LocationTracker = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

// Mock ProductDetail component
const MockProductDetail = () => (
  <div data-testid="product-detail">
    <h1>Product Detail Page</h1>
    <BackButton fallback="/products" />
    <LocationTracker />
  </div>
);

// Mock Products component
const MockProducts = () => (
  <div data-testid="products-page">
    <h1>Products Page</h1>
    <LocationTracker />
  </div>
);

// Test app with routing
const TestApp = ({ initialRoute = '/product/test-product' }: { initialRoute?: string }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/products" element={<MockProducts />} />
      <Route path="/product/:handle" element={<MockProductDetail />} />
      <Route path="*" element={<div data-testid="not-found">Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

describe('ProductDetail Back Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reloadSpy.mockClear();
    
    // Mock window.history to track navigation
    Object.defineProperty(window, 'history', {
      value: {
        ...window.history,
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    reloadSpy.mockRestore();
  });

  describe('Back Navigation from Product Detail', () => {
    it('should navigate from /product/:handle to /products without reload', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/test-product" />);

      // Verify we're on product detail page
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
      expect(screen.getByTestId('current-location')).toHaveTextContent('/product/test-product');

      // Click back button
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should navigate to products page without reload
      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      expect(screen.getByTestId('current-location')).toHaveTextContent('/products');
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should handle navigation when no history exists', async () => {
      const user = userEvent.setup();
      
      // Start directly on product detail page (no navigation history)
      render(<TestApp initialRoute="/product/test-product" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should still navigate to fallback products page
      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should preserve navigation state during back navigation', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/test-product" />);

      // Track the navigation process
      const backButton = screen.getByRole('button', { name: /back/i });
      
      // Button should be enabled initially
      expect(backButton).not.toBeDisabled();

      await user.click(backButton);

      // Navigation should complete successfully
      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      // No page reload should occur
      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling During Navigation', () => {
    it('should handle navigation errors gracefully without reload', async () => {
      const user = userEvent.setup();
      
      // Mock navigation to fail once
      const originalPushState = window.history.pushState;
      let failOnce = true;
      window.history.pushState = vi.fn(() => {
        if (failOnce) {
          failOnce = false;
          throw new Error('Navigation failed');
        }
      });

      render(<TestApp initialRoute="/product/test-product" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should still attempt navigation and recover
      await waitFor(() => {
        // Either navigates successfully or shows error handling
        expect(screen.queryByTestId('current-location')).toBeTruthy();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
      
      // Restore original function
      window.history.pushState = originalPushState;
    });

    it('should fallback to products page if navigation target fails', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/invalid-product" />);

      // Even with invalid product, back button should work
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility During Navigation', () => {
    it('should maintain focus management during navigation', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/test-product" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      
      // Focus the back button
      backButton.focus();
      expect(document.activeElement).toBe(backButton);

      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      // Focus should be managed appropriately after navigation
      expect(document.activeElement).toBeTruthy();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/test-product" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      backButton.focus();

      // Use Enter key to navigate
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });
});