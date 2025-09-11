/**
 * Unit tests for ErrorBoundary components
 * Tests fallback order and no-reload behavior
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import NavigationErrorBoundary from '@/components/NavigationErrorBoundary';
import React from 'react';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/test' }),
  };
});

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  vi.clearAllMocks();
});

afterEach(() => {
  console.error = originalError;
});

// Test component that throws errors
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ErrorBoundary', () => {
  describe('Fallback Order', () => {
    it('should show default error message first', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
    });

    it('should show "Try Again" button as primary action', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
      expect(tryAgainButton).toHaveClass('neu-button-enhanced'); // Primary styling
    });

    it('should show "Refresh Page" as secondary action', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toHaveClass('neu-button'); // Secondary styling
    });

    it('should show "Go to Home" as tertiary action', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const homeButton = screen.getByRole('button', { name: /go to home/i });
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('No Reload Behavior', () => {
    it('should not reload page on "Try Again"', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      expect(reloadSpy).not.toHaveBeenCalled();
      reloadSpy.mockRestore();
    });

    it('should navigate without reload on "Go to Home"', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const homeButton = screen.getByRole('button', { name: /go to home/i });
      await user.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(reloadSpy).not.toHaveBeenCalled();
      reloadSpy.mockRestore();
    });

    it('should navigate without reload for "Refresh Page" when navigate is available', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

      render(
        <ErrorBoundary navigate={mockNavigate}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
        { wrapper }
      );

      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      await user.click(refreshButton);

      expect(mockNavigate).toHaveBeenCalledWith('/test', { replace: true });
      expect(reloadSpy).not.toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });
});

describe('NavigationErrorBoundary', () => {
  describe('Navigation-Specific Fallbacks', () => {
    it('should show navigation-specific error message', () => {
      render(
        <NavigationErrorBoundary>
          <ThrowError shouldThrow={true} />
        </NavigationErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();
    });

    it('should show "Try Again" as primary action', () => {
      render(
        <NavigationErrorBoundary>
          <ThrowError shouldThrow={true} />
        </NavigationErrorBoundary>,
        { wrapper }
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
      expect(tryAgainButton).toHaveClass('bg-primary');
    });

    it('should show navigation options', () => {
      render(
        <NavigationErrorBoundary>
          <ThrowError shouldThrow={true} />
        </NavigationErrorBoundary>,
        { wrapper }
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to safe page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });

    it('should not reload on navigation actions', async () => {
      const user = userEvent.setup();
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

      render(
        <NavigationErrorBoundary>
          <ThrowError shouldThrow={true} />
        </NavigationErrorBoundary>,
        { wrapper }
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      expect(reloadSpy).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state on "Try Again"', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        
        return (
          <NavigationErrorBoundary>
            <ThrowError shouldThrow={shouldThrow} />
            <button onClick={() => setShouldThrow(false)}>Fix Error</button>
          </NavigationErrorBoundary>
        );
      };

      render(<TestComponent />, { wrapper });

      // Error should be shown
      expect(screen.getByText(/Navigation Error/i)).toBeInTheDocument();

      // Fix the error and try again
      const fixButton = screen.getByText('Fix Error');
      await user.click(fixButton);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Error boundary should reset and show normal content
      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });
  });
});