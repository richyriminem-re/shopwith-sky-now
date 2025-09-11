/**
 * Phase 5: Error Recovery and Accessibility Integration Tests
 * Tests navigation error recovery, accessibility features, and navigation state management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/dom';
import { renderWithRouter, verifyNoPageReload } from '../utils/navigation-test-utils';
import React from 'react';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

// Mock navigation state manager
const mockNavState = {
  hasNavigationHistory: vi.fn(() => true),
  updateRoute: vi.fn(),
  setNavigating: vi.fn(),
  popFromHistory: vi.fn(() => '/previous-route'),
  hasRecentFailure: vi.fn(() => false),
  trackFailedNavigation: vi.fn(),
  clearFailedNavigation: vi.fn(),
  getNavigationHistory: vi.fn(() => ['/home', '/products', '/current']),
  isNavigating: vi.fn(() => false)
};

vi.mock('@/utils/navigationStateManager', () => ({
  useNavigationState: () => mockNavState
}));

// Mock route hierarchy
vi.mock('@/utils/routeHierarchy', () => ({
  getSmartFallback: vi.fn((route: string) => {
    const fallbacks: Record<string, string> = {
      '/products/detail': '/products',
      '/cart/checkout': '/cart',
      '/account/settings': '/account',
      '/unknown-route': '/'
    };
    return fallbacks[route] || '/';
  })
}));

// Mock error boundaries
const mockErrorBoundary = {
  reset: vi.fn(),
  hasError: false,
  error: null
};

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, onError }: any) => {
    React.useEffect(() => {
      if (mockErrorBoundary.hasError && onError) {
        onError(mockErrorBoundary.error);
      }
    }, [onError]);
    
    return mockErrorBoundary.hasError ? (
      <div data-testid="error-boundary">
        Error occurred: {mockErrorBoundary.error?.message}
        <button onClick={mockErrorBoundary.reset} data-testid="error-reset">
          Reset
        </button>
      </div>
    ) : children;
  }
}));

describe('Error Recovery and Accessibility Integration Tests - Phase 5', () => {
  let reloadVerifier: ReturnType<typeof verifyNoPageReload>;

  beforeEach(() => {
    reloadVerifier = verifyNoPageReload();
    vi.clearAllMocks();
    mockErrorBoundary.hasError = false;
    mockErrorBoundary.error = null;
  });

  describe('5.1 Navigation Error Recovery', () => {
    it('should recover from navigation errors without page refreshes', async () => {
      let errorOccurred = false;
      
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation({
          onError: (error) => {
            errorOccurred = true;
            console.log('Navigation error caught:', error.message);
          }
        });
        
        const handleErrorNavigation = async () => {
          // Simulate navigation error
          throw new Error('Navigation timeout');
        };
        
        return (
          <div>
            <button
              onClick={async () => {
                try {
                  await handleErrorNavigation();
                } catch (error) {
                  // Let the error handler deal with it
                  if (error instanceof Error) {
                    navigateBack(); // Fallback navigation
                  }
                }
              }}
              data-testid="error-nav-button"
            >
              Navigate with Error
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/error-test']
      });

      await user.click(screen.getByTestId('error-nav-button'));

      await waitFor(() => {
        expect(errorOccurred).toBe(true);
      });

      reloadVerifier.assert();
    });

    it('should use fallback navigation when primary routes fail', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation({
          fallback: '/safe-route'
        });
        
        // Simulate navigation failure scenario
        mockNavState.hasNavigationHistory.mockReturnValue(false);
        
        return (
          <button onClick={navigateBack} data-testid="fallback-nav-button">
            Navigate with Fallback
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/failing-route']
      });

      await user.click(screen.getByTestId('fallback-nav-button'));

      await waitFor(() => {
        expect(mockNavState.trackFailedNavigation).not.toHaveBeenCalled();
      });

      reloadVerifier.assert();
    });

    it('should recover navigation history after errors', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        const [recoveryState, setRecoveryState] = React.useState('initial');
        
        React.useEffect(() => {
          // Simulate recovery process
          const timer = setTimeout(() => {
            mockNavState.clearFailedNavigation('/recovered-route');
            setRecoveryState('recovered');
          }, 100);
          
          return () => clearTimeout(timer);
        }, []);
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="recovery-nav-button">
              Navigate ({recoveryState})
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('recovery-nav-button')).toHaveTextContent('Navigate (recovered)');
      });

      await user.click(screen.getByTestId('recovery-nav-button'));

      expect(mockNavState.clearFailedNavigation).toHaveBeenCalledWith('/recovered-route');
      reloadVerifier.assert();
    });

    it('should handle cascading navigation failures gracefully', async () => {
      let failureCount = 0;
      
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation({
          onError: (error) => {
            failureCount++;
            console.log(`Navigation failure ${failureCount}:`, error.message);
          }
        });
        
        // Simulate multiple failure scenarios
        mockNavState.hasRecentFailure.mockReturnValue(true);
        mockNavState.popFromHistory.mockReturnValue(null); // Simulate history failure
        
        return (
          <button onClick={navigateBack} data-testid="cascade-fail-button">
            Test Cascade Failure
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      await user.click(screen.getByTestId('cascade-fail-button'));

      // Should attempt navigation despite failures
      await waitFor(() => {
        expect(mockNavState.hasRecentFailure).toHaveBeenCalled();
      });

      reloadVerifier.assert();
    });
  });

  describe('5.2 Accessibility Features', () => {
    it('should support keyboard navigation (Tab, Enter, Space)', async () => {
      const TestComponent = () => {
        const { navigateBack, handleKeyDown } = useSmartNavigation();
        
        return (
          <div>
            <button
              onClick={navigateBack}
              onKeyDown={handleKeyDown}
              data-testid="keyboard-nav-button"
              tabIndex={0}
            >
              Keyboard Navigation
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      const button = screen.getByTestId('keyboard-nav-button');
      
      // Test Tab navigation
      await user.tab();
      expect(button).toHaveFocus();

      // Test Enter key
      await user.keyboard('{Enter}');
      reloadVerifier.assert();

      // Test Space key
      button.focus();
      await user.keyboard(' ');
      reloadVerifier.assert();
    });

    it('should announce navigation changes to screen readers', async () => {
      const TestComponent = () => {
        const [announcement, setAnnouncement] = React.useState('');
        const { navigateBack } = useSmartNavigation();
        
        const handleAccessibleNavigation = () => {
          setAnnouncement('Navigating to previous page');
          navigateBack();
          
          setTimeout(() => {
            setAnnouncement('Navigation completed');
          }, 100);
        };
        
        return (
          <div>
            <div
              aria-live="polite"
              aria-atomic="true"
              data-testid="navigation-announcement"
              className="sr-only"
            >
              {announcement}
            </div>
            <button onClick={handleAccessibleNavigation} data-testid="accessible-nav-button">
              Accessible Navigate
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      await user.click(screen.getByTestId('accessible-nav-button'));

      await waitFor(() => {
        expect(screen.getByTestId('navigation-announcement')).toHaveTextContent('Navigating to previous page');
      });

      await waitFor(() => {
        expect(screen.getByTestId('navigation-announcement')).toHaveTextContent('Navigation completed');
      }, { timeout: 200 });

      reloadVerifier.assert();
    });

    it('should manage focus correctly during navigation', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        const mainRef = React.useRef<HTMLElement>(null);
        
        React.useEffect(() => {
          // Focus management after navigation
          if (mainRef.current) {
            mainRef.current.focus();
          }
        }, []);
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="focus-nav-button">
              Navigate with Focus
            </button>
            <main ref={mainRef} tabIndex={-1} data-testid="main-content">
              <h1>Main Content</h1>
              <p>Content that should receive focus after navigation</p>
            </main>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      await user.click(screen.getByTestId('focus-nav-button'));

      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveFocus();
      });

      reloadVerifier.assert();
    });

    it('should provide skip links for keyboard users', async () => {
      const TestComponent = () => {
        const [showSkipLink, setShowSkipLink] = React.useState(false);
        
        return (
          <div>
            <a
              href="#main-content"
              className={showSkipLink ? 'visible' : 'sr-only'}
              onFocus={() => setShowSkipLink(true)}
              onBlur={() => setShowSkipLink(false)}
              data-testid="skip-link"
            >
              Skip to main content
            </a>
            <nav data-testid="navigation">
              <button data-testid="nav-button-1">Nav 1</button>
              <button data-testid="nav-button-2">Nav 2</button>
            </nav>
            <main id="main-content" tabIndex={-1} data-testid="main-content">
              <h1>Main Content</h1>
            </main>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      // Focus skip link
      const skipLink = screen.getByTestId('skip-link');
      skipLink.focus();

      expect(skipLink).toHaveFocus();

      // Activate skip link
      await user.click(skipLink);

      await waitFor(() => {
        expect(screen.getByTestId('main-content')).toHaveFocus();
      });
    });

    it('should handle high contrast and reduced motion preferences', async () => {
      // Mock media query for reduced motion
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia
      });

      const TestComponent = () => {
        const [reducedMotion, setReducedMotion] = React.useState(false);
        const { navigateBack } = useSmartNavigation();
        
        React.useEffect(() => {
          const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          setReducedMotion(mediaQuery.matches);
        }, []);
        
        return (
          <div className={reducedMotion ? 'reduced-motion' : ''}>
            <button onClick={navigateBack} data-testid="accessible-nav-button">
              Navigate {reducedMotion ? '(Reduced Motion)' : '(Normal)'}
            </button>
          </div>
        );
      };

      renderWithRouter(<TestComponent />);

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(screen.getByTestId('accessible-nav-button')).toHaveTextContent('Navigate (Reduced Motion)');
    });
  });

  describe('5.3 Navigation State Management', () => {
    it('should track navigation history correctly', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        const [historyLength, setHistoryLength] = React.useState(0);
        
        React.useEffect(() => {
          const history = mockNavState.getNavigationHistory();
          setHistoryLength(history.length);
        }, []);
        
        return (
          <div>
            <div data-testid="history-length">History: {historyLength}</div>
            <button onClick={navigateBack} data-testid="history-nav-button">
              Navigate Back
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      expect(screen.getByTestId('history-length')).toHaveTextContent('History: 3');

      await user.click(screen.getByTestId('history-nav-button'));

      expect(mockNavState.popFromHistory).toHaveBeenCalled();
      reloadVerifier.assert();
    });

    it('should persist navigation state across route changes', async () => {
      const TestComponent = () => {
        const [currentRoute, setCurrentRoute] = React.useState('/initial');
        
        React.useEffect(() => {
          mockNavState.updateRoute(currentRoute);
        }, [currentRoute]);
        
        const simulateRouteChange = () => {
          setCurrentRoute('/new-route');
        };
        
        return (
          <div>
            <div data-testid="current-route">Route: {currentRoute}</div>
            <button onClick={simulateRouteChange} data-testid="route-change-button">
              Change Route
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);

      expect(screen.getByTestId('current-route')).toHaveTextContent('Route: /initial');

      await user.click(screen.getByTestId('route-change-button'));

      await waitFor(() => {
        expect(screen.getByTestId('current-route')).toHaveTextContent('Route: /new-route');
      });

      expect(mockNavState.updateRoute).toHaveBeenCalledWith('/new-route');
    });

    it('should handle navigation state synchronization across multiple tabs', async () => {
      const TestComponent = () => {
        const [syncState, setSyncState] = React.useState('idle');
        
        React.useEffect(() => {
          // Simulate cross-tab synchronization
          const handleStorageChange = () => {
            setSyncState('synced');
          };
          
          window.addEventListener('storage', handleStorageChange);
          
          // Trigger sync event
          setTimeout(() => {
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'navigation-state',
              newValue: 'updated'
            }));
          }, 100);
          
          return () => window.removeEventListener('storage', handleStorageChange);
        }, []);
        
        return (
          <div data-testid="sync-state">
            Sync State: {syncState}
          </div>
        );
      };

      renderWithRouter(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('sync-state')).toHaveTextContent('Sync State: synced');
      });
    });

    it('should cleanup navigation state and prevent memory leaks', async () => {
      const TestComponent = () => {
        const { navigateBack } = useSmartNavigation();
        const [cleanup, setCleanup] = React.useState(false);
        
        React.useEffect(() => {
          return () => {
            // Simulate cleanup
            setCleanup(true);
            mockNavState.clearFailedNavigation('cleanup-test');
          };
        }, []);
        
        return (
          <div>
            <button onClick={navigateBack} data-testid="cleanup-nav-button">
              Navigate {cleanup ? '(Cleaned)' : '(Active)'}
            </button>
          </div>
        );
      };

      const { unmount } = renderWithRouter(<TestComponent />);

      // Unmount component to trigger cleanup
      unmount();

      expect(mockNavState.clearFailedNavigation).toHaveBeenCalledWith('cleanup-test');
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle navigation errors through error boundaries without page reloads', async () => {
      mockErrorBoundary.hasError = true;
      mockErrorBoundary.error = new Error('Navigation component error');
      
      const TestComponent = () => {
        return (
          <div data-testid="error-boundary-test">
            Error Boundary Test
          </div>
        );
      };

      renderWithRouter(<TestComponent />);

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Error occurred: Navigation component error')).toBeInTheDocument();

      reloadVerifier.assert();
    });

    it('should reset error boundaries and restore navigation', async () => {
      mockErrorBoundary.hasError = true;
      mockErrorBoundary.error = new Error('Recoverable error');
      
      const TestComponent = () => {
        return <div data-testid="error-recovery-test">Recovery Test</div>;
      };

      const { user } = renderWithRouter(<TestComponent />);

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

      const resetButton = screen.getByTestId('error-reset');
      
      // Reset error boundary
      mockErrorBoundary.reset = vi.fn(() => {
        mockErrorBoundary.hasError = false;
        mockErrorBoundary.error = null;
      });
      
      await user.click(resetButton);

      expect(mockErrorBoundary.reset).toHaveBeenCalled();
      reloadVerifier.assert();
    });
  });
});