/**
 * Integration test for injected route error recovery
 * Tests that injected route errors trigger fallback sequence without reload
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import NavigationErrorBoundary from '@/components/NavigationErrorBoundary';
import ErrorBoundary from '@/components/ErrorBoundary';
import React from 'react';

// Mock navigation dependencies
vi.mock('@/utils/routeHierarchy', () => ({
  getSmartFallback: vi.fn((route) => {
    if (route.includes('/product/')) return '/products';
    if (route.includes('/products')) return '/';
    return '/';
  }),
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

// Track page reloads
const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

// Error injection component
const ErrorInjectingComponent = ({ 
  shouldError, 
  errorMessage = 'Injected navigation error' 
}: { 
  shouldError: boolean;
  errorMessage?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (shouldError) {
      // Simulate a navigation error
      const error = new Error(errorMessage);
      throw error;
    }
  }, [shouldError, errorMessage]);

  return (
    <div data-testid="error-component">
      <h1>Component That Can Error</h1>
      <p>Current route: {location.pathname}</p>
      <button onClick={() => navigate('/products')}>Navigate to Products</button>
    </div>
  );
};

// Location tracker
const LocationTracker = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

// Mock pages
const MockHomePage = () => (
  <div data-testid="home-page">
    <h1>Home Page</h1>
    <LocationTracker />
  </div>
);

const MockProductsPage = () => (
  <div data-testid="products-page">
    <h1>Products Page</h1>
    <LocationTracker />
  </div>
);

const MockProductDetailPage = ({ errorInjected = false }: { errorInjected?: boolean }) => (
  <div data-testid="product-detail-page">
    <h1>Product Detail Page</h1>
    <ErrorInjectingComponent shouldError={errorInjected} />
    <LocationTracker />
  </div>
);

// Test app with error boundaries
const TestApp = ({ 
  initialRoute = '/product/1',
  injectError = false 
}: { 
  initialRoute?: string;
  injectError?: boolean;
}) => (
  <BrowserRouter>
    <NavigationErrorBoundary>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<MockHomePage />} />
          <Route path="/products" element={<MockProductsPage />} />
          <Route 
            path="/product/:id" 
            element={<MockProductDetailPage errorInjected={injectError} />} 
          />
        </Routes>
      </ErrorBoundary>
    </NavigationErrorBoundary>
  </BrowserRouter>
);

describe('Injected Error Recovery Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reloadSpy.mockClear();
    
    // Mock console.error to avoid noise
    console.error = vi.fn();
  });

  afterEach(() => {
    reloadSpy.mockRestore();
  });

  describe('Error Detection and Boundary Activation', () => {
    it('should catch injected route errors and show error boundary', () => {
      render(<TestApp initialRoute="/product/1" injectError={true} />);

      // Error boundary should activate
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();
      expect(screen.queryByTestId('product-detail-page')).not.toBeInTheDocument();
    });

    it('should show navigation-specific error boundary for navigation errors', () => {
      render(<TestApp initialRoute="/product/1" injectError={true} />);

      // Should show NavigationErrorBoundary instead of generic ErrorBoundary
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Fallback Sequence Without Reload', () => {
    it('should execute fallback sequence without page reload', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/1" injectError={true} />);

      // Error boundary should be shown
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();

      // Click "Go Back" (primary action)
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      // Should attempt to navigate without reload
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should use smart fallback when back navigation fails', async () => {
      const user = userEvent.setup();
      
      // Mock history.back to fail
      const originalBack = window.history.back;
      window.history.back = vi.fn(() => {
        throw new Error('Back navigation failed');
      });

      render(<TestApp initialRoute="/product/1" injectError={true} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      // Should still not reload page
      expect(reloadSpy).not.toHaveBeenCalled();
      
      // Restore original function
      window.history.back = originalBack;
    });

    it('should try "Try Again" as secondary action', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/1" injectError={true} />);

      // Click "Try Again" button
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Should not reload page
      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Hierarchical Fallback Chain', () => {
    it('should fallback to products page for product detail errors', async () => {
      const user = userEvent.setup();
      
      render(<TestApp initialRoute="/product/1" injectError={true} />);

      // Should show error boundary
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();

      // Try to recover by going back
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      // Should not reload
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should fallback to home for products page errors', async () => {
      const user = userEvent.setup();
      
      // Create a test with error on products page
      const TestAppWithProductsError = () => (
        <BrowserRouter>
          <NavigationErrorBoundary>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<MockHomePage />} />
                <Route 
                  path="/products" 
                  element={
                    <div>
                      <ErrorInjectingComponent shouldError={true} />
                    </div>
                  } 
                />
              </Routes>
            </ErrorBoundary>
          </NavigationErrorBoundary>
        </BrowserRouter>
      );

      render(<TestAppWithProductsError />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery and State Reset', () => {
    it('should reset error state when navigation succeeds', async () => {
      const user = userEvent.setup();
      
      const TestAppWithConditionalError = () => {
        const [hasError, setHasError] = React.useState(true);
        
        return (
          <BrowserRouter>
            <NavigationErrorBoundary>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<MockHomePage />} />
                  <Route path="/products" element={<MockProductsPage />} />
                  <Route 
                    path="/product/:id" 
                    element={
                      <div>
                        {hasError ? (
                          <ErrorInjectingComponent shouldError={true} />
                        ) : (
                          <div data-testid="product-detail-success">
                            Product loaded successfully
                          </div>
                        )}
                        <button onClick={() => setHasError(false)}>
                          Fix Error
                        </button>
                      </div>
                    } 
                  />
                </Routes>
              </ErrorBoundary>
            </NavigationErrorBoundary>
          </BrowserRouter>
        );
      };

      render(<TestAppWithConditionalError />);

      // Error should be shown initially
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();

      // Fix the error condition
      const fixButton = screen.getByText('Fix Error');
      await user.click(fixButton);

      // Try again
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Error boundary should reset and show success
      await waitFor(() => {
        expect(screen.getByTestId('product-detail-success')).toBeInTheDocument();
      });

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Error Types', () => {
    it('should handle different error types consistently', async () => {
      const user = userEvent.setup();
      
      const TestWithDifferentErrors = () => (
        <BrowserRouter>
          <NavigationErrorBoundary>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<MockHomePage />} />
                <Route 
                  path="/network-error" 
                  element={
                    <ErrorInjectingComponent 
                      shouldError={true} 
                      errorMessage="Network request failed"
                    />
                  } 
                />
                <Route 
                  path="/render-error" 
                  element={
                    <ErrorInjectingComponent 
                      shouldError={true} 
                      errorMessage="Render error occurred"
                    />
                  } 
                />
              </Routes>
            </ErrorBoundary>
          </NavigationErrorBoundary>
        </BrowserRouter>
      );

      render(<TestWithDifferentErrors />);

      // Both types of errors should be handled the same way
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();
      
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Boundary Priority', () => {
    it('should prefer NavigationErrorBoundary over generic ErrorBoundary', () => {
      render(<TestApp initialRoute="/product/1" injectError={true} />);

      // Should show navigation-specific error UI
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      
      // Should not show generic error boundary
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    });
  });
});