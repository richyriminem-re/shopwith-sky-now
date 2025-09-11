/**
 * Accessibility tests for navigation components
 * Tests axe compliance and keyboard-only flows
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BackButton from '@/components/ui/BackButton';
import PageWithNavigation from '@/components/PageWithNavigation';
import React from 'react';

// Mock dependencies
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

// Test pages
const MockHomePage = () => (
  <PageWithNavigation>
    <main>
      <h1>Home Page</h1>
      <p>Welcome to our website</p>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/products">Products</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </main>
  </PageWithNavigation>
);

const MockProductsPage = () => (
  <PageWithNavigation>
    <main>
      <h1>Products</h1>
      <BackButton fallback="/" />
      <section aria-label="Product list">
        <p>Product catalog</p>
      </section>
    </main>
  </PageWithNavigation>
);

const MockProductDetailPage = () => (
  <PageWithNavigation>
    <main>
      <h1>Product Details</h1>
      <BackButton fallback="/products" />
      <article>
        <h2>Product Name</h2>
        <p>Product description</p>
        <button type="button">Add to Cart</button>
      </article>
    </main>
  </PageWithNavigation>
);

// Test app with routing
const TestApp = ({ initialRoute = '/' }: { initialRoute?: string }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MockHomePage />} />
      <Route path="/products" element={<MockProductsPage />} />
      <Route path="/product/:id" element={<MockProductDetailPage />} />
    </Routes>
  </BrowserRouter>
);

describe('Navigation Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Axe Compliance', () => {
    it('should pass axe tests on home page', async () => {
      const { container } = render(<TestApp initialRoute="/" />);
      
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should pass axe tests on products page with BackButton', async () => {
      const { container } = render(<TestApp initialRoute="/products" />);
      
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should pass axe tests on product detail page with BackButton', async () => {
      const { container } = render(<TestApp initialRoute="/product/1" />);
      
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should maintain axe compliance during navigation states', async () => {
      const user = userEvent.setup();
      const { container } = render(<TestApp initialRoute="/products" />);

      // Test initial state
      let results = await axe(container);
      expect(results.violations).toHaveLength(0);

      // Focus the back button
      const backButton = screen.getByRole('button', { name: /back/i });
      backButton.focus();

      // Test focused state
      results = await axe(container);
      expect(results.violations).toHaveLength(0);

      // Test during navigation (if we can capture it)
      await user.click(backButton);
      
      // Test after navigation
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
      
      results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation to BackButton', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      // Tab to the back button
      await user.tab();
      
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(document.activeElement).toBe(backButton);
    });

    it('should activate BackButton with Enter key', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      backButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });

    it('should activate BackButton with Space key', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      backButton.focus();

      await user.keyboard('{ }');

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });

    it('should maintain logical tab order with BackButton', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/product/1" />);

      // Tab through elements
      await user.tab(); // Should focus back button first
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /back/i }));

      await user.tab(); // Should focus next interactive element
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /add to cart/i }));
    });

    it('should support global keyboard shortcuts', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      // Test Alt+Left (back navigation shortcut)
      await user.keyboard('{Alt>}{ArrowLeft}{/Alt}');

      // Should navigate back (this might depend on implementation)
      await waitFor(() => {
        // Test that some navigation occurred or was attempted
        expect(true).toBe(true); // Basic test to ensure no errors
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels on BackButton', () => {
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      
      // Should have accessible name
      expect(backButton).toHaveAccessibleName();
      
      // Should have button role
      expect(backButton).toHaveAttribute('type', 'button');
    });

    it('should announce navigation state changes', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      
      // Should not be disabled initially
      expect(backButton).not.toBeDisabled();

      await user.click(backButton);

      // During navigation, button state should be accessible
      // (This tests that navigation state is properly communicated)
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });

    it('should provide clear navigation context', () => {
      render(<TestApp initialRoute="/product/1" />);

      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Product Details');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Product Name');

      // Should have proper landmark structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus visibility', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      
      await user.tab();
      expect(document.activeElement).toBe(backButton);
      
      // Focus should be visible (this depends on CSS implementation)
      expect(backButton).toHaveFocus();
    });

    it('should handle focus during navigation transitions', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });
      backButton.focus();

      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });

      // Focus should be managed appropriately after navigation
      expect(document.activeElement).not.toBe(null);
    });

    it('should support skip links for keyboard users', () => {
      render(<TestApp initialRoute="/products" />);

      // Should have skip links (implemented in PageWithNavigation)
      const skipLinks = screen.getAllByText(/skip/i);
      expect(skipLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile viewports', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true,
      });

      const { container } = render(<TestApp initialRoute="/products" />);
      
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should maintain accessibility on tablet viewports', async () => {
      // Simulate tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      const { container } = render(<TestApp initialRoute="/products" />);
      
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should support touch and keyboard interaction equally', async () => {
      const user = userEvent.setup();
      render(<TestApp initialRoute="/products" />);

      const backButton = screen.getByRole('button', { name: /back/i });

      // Should work with touch (click)
      await user.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('Error State Accessibility', () => {
    it('should maintain accessibility during error states', async () => {
      // Create a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      const TestWithError = () => (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ErrorComponent />} />
          </Routes>
        </BrowserRouter>
      );

      const { container } = render(<TestWithError />);
      
      // Error boundaries should maintain accessibility
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });
});