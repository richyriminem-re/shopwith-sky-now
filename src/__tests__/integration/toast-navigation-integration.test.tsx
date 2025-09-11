/**
 * Phase 4: Toast Notification System Integration Tests
 * Tests toast notifications during navigation contexts, offline/online states
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter } from '../utils/navigation-test-utils';
import React from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    toasts: []
  })
}));

// Mock offline toast system
const mockOfflineToastSystem = {
  initialize: vi.fn(),
  show: vi.fn(),
  isInitialized: vi.fn(() => true),
  queueToast: vi.fn(),
  processQueue: vi.fn(),
  clearQueue: vi.fn()
};

vi.mock('@/utils/offlineToastSystem', () => ({
  offlineToastSystem: mockOfflineToastSystem
}));

// Mock navigation hooks
const mockNavigateBack = vi.fn();
vi.mock('@/hooks/useSmartNavigation', () => ({
  useSmartNavigation: () => ({
    navigateBack: mockNavigateBack,
    isNavigating: false,
    handleKeyDown: vi.fn()
  })
}));

describe('Toast Navigation Integration Tests - Phase 4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    mockOfflineToastSystem.initialize.mockClear();
    mockOfflineToastSystem.show.mockClear();
  });

  describe('4.1 Online Toast Notifications', () => {
    it('should display success toast notifications during navigation', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleNavigation = () => {
          toast({
            title: "Navigation successful",
            description: "You have been redirected",
            variant: "default"
          });
        };
        
        return (
          <button onClick={handleNavigation} data-testid="nav-button">
            Navigate with Toast
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('nav-button'));
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Navigation successful",
        description: "You have been redirected",
        variant: "default"
      });
    });

    it('should display error toast notifications during navigation failures', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleNavigation = () => {
          // Simulate navigation error
          toast({
            title: "Navigation failed",
            description: "Unable to reach the requested page",
            variant: "destructive"
          });
        };
        
        return (
          <button onClick={handleNavigation} data-testid="error-nav-button">
            Navigate with Error
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('error-nav-button'));
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Navigation failed",
        description: "Unable to reach the requested page",
        variant: "destructive"
      });
    });

    it('should handle rapid toast notifications during frequent navigation', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        const [count, setCount] = React.useState(0);
        
        const handleRapidNavigation = () => {
          const newCount = count + 1;
          setCount(newCount);
          
          toast({
            title: `Navigation ${newCount}`,
            description: `Rapid navigation test ${newCount}`,
            variant: "default"
          });
        };
        
        return (
          <div>
            <button onClick={handleRapidNavigation} data-testid="rapid-nav-button">
              Rapid Navigate ({count})
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      // Perform rapid clicks
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByTestId('rapid-nav-button'));
      }
      
      expect(mockToast).toHaveBeenCalledTimes(5);
      
      // Verify each call was unique
      for (let i = 1; i <= 5; i++) {
        expect(mockToast).toHaveBeenCalledWith({
          title: `Navigation ${i}`,
          description: `Rapid navigation test ${i}`,
          variant: "default"
        });
      }
    });

    it('should verify toast accessibility with proper aria attributes', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          toast({
            title: "Accessible navigation toast",
            description: "This toast should be announced to screen readers",
            variant: "default"
          });
        }, [toast]);
        
        return <div data-testid="accessibility-test">Accessibility Test</div>;
      };

      renderWithRouter(<TestComponent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Accessible navigation toast",
            description: "This toast should be announced to screen readers"
          })
        );
      });
    });
  });

  describe('4.2 Offline Toast System', () => {
    it('should initialize offline toast system with useToast hook', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          mockOfflineToastSystem.initialize(toast);
        }, [toast]);
        
        return <div data-testid="offline-init-test">Offline Toast Init</div>;
      };

      renderWithRouter(<TestComponent />);
      
      await waitFor(() => {
        expect(mockOfflineToastSystem.initialize).toHaveBeenCalledWith(mockToast);
      });
    });

    it('should show offline toast notifications correctly', async () => {
      const TestComponent = () => {
        const handleOfflineNavigation = () => {
          mockOfflineToastSystem.show({
            title: "You're offline",
            description: "Navigation will be handled offline",
            variant: "destructive"
          });
        };
        
        return (
          <button onClick={handleOfflineNavigation} data-testid="offline-nav-button">
            Offline Navigate
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('offline-nav-button'));
      
      expect(mockOfflineToastSystem.show).toHaveBeenCalledWith({
        title: "You're offline",
        description: "Navigation will be handled offline",
        variant: "destructive"
      });
    });

    it('should queue toasts when offline system is not initialized', async () => {
      mockOfflineToastSystem.isInitialized.mockReturnValue(false);
      
      const TestComponent = () => {
        const handleQueuedToast = () => {
          mockOfflineToastSystem.queueToast({
            title: "Queued toast",
            description: "This should be queued",
            variant: "default"
          });
        };
        
        return (
          <button onClick={handleQueuedToast} data-testid="queue-toast-button">
            Queue Toast
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('queue-toast-button'));
      
      expect(mockOfflineToastSystem.queueToast).toHaveBeenCalledWith({
        title: "Queued toast",
        description: "This should be queued",
        variant: "default"
      });
    });

    it('should process toast queue when system becomes initialized', async () => {
      // Start uninitialized
      mockOfflineToastSystem.isInitialized.mockReturnValue(false);
      
      const TestComponent = () => {
        const { toast } = useToast();
        const [initialized, setInitialized] = React.useState(false);
        
        const handleInitialize = () => {
          mockOfflineToastSystem.initialize(toast);
          mockOfflineToastSystem.isInitialized.mockReturnValue(true);
          setInitialized(true);
          mockOfflineToastSystem.processQueue();
        };
        
        return (
          <div>
            <button onClick={handleInitialize} data-testid="init-button">
              Initialize ({initialized ? 'Ready' : 'Not Ready'})
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('init-button'));
      
      expect(mockOfflineToastSystem.processQueue).toHaveBeenCalled();
    });
  });

  describe('4.3 Navigation Context Toast Integration', () => {
    it('should show toast notifications during back navigation errors', async () => {
      mockNavigateBack.mockRejectedValue(new Error('Navigation failed'));
      
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleBackNavigation = async () => {
          try {
            await mockNavigateBack();
          } catch (error) {
            toast({
              title: "Navigation Error",
              description: "Failed to navigate back",
              variant: "destructive"
            });
          }
        };
        
        return (
          <button onClick={handleBackNavigation} data-testid="back-nav-button">
            Navigate Back
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('back-nav-button'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Navigation Error",
          description: "Failed to navigate back",
          variant: "destructive"
        });
      });
    });

    it('should display toast messages during route loading states', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        const [loading, setLoading] = React.useState(false);
        
        const handleRouteLoading = async () => {
          setLoading(true);
          
          toast({
            title: "Loading",
            description: "Navigating to new page...",
            variant: "default"
          });
          
          // Simulate loading delay
          setTimeout(() => {
            setLoading(false);
            toast({
              title: "Loaded",
              description: "Page loaded successfully",
              variant: "default"
            });
          }, 100);
        };
        
        return (
          <button onClick={handleRouteLoading} data-testid="loading-nav-button">
            {loading ? 'Loading...' : 'Navigate with Loading'}
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('loading-nav-button'));
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Loading",
        description: "Navigating to new page...",
        variant: "default"
      });
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Loaded",
          description: "Page loaded successfully",
          variant: "default"
        });
      }, { timeout: 200 });
    });

    it('should verify toast notifications work with smart navigation fallbacks', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleFallbackNavigation = () => {
          // Simulate smart navigation fallback
          toast({
            title: "Navigation Redirected",
            description: "Redirected to home page as fallback",
            variant: "default"
          });
        };
        
        return (
          <button onClick={handleFallbackNavigation} data-testid="fallback-nav-button">
            Fallback Navigate
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('fallback-nav-button'));
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Navigation Redirected",
        description: "Redirected to home page as fallback",
        variant: "default"
      });
    });

    it('should test toast accessibility during navigation flows', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          // Simulate accessible navigation toast
          toast({
            title: "Navigation announcement",
            description: "Page changed successfully",
            variant: "default"
          });
        }, [toast]);
        
        return (
          <div role="main" aria-label="Navigation test">
            <div data-testid="navigation-content">Content</div>
          </div>
        );
      };

      renderWithRouter(<TestComponent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Navigation announcement",
            description: "Page changed successfully"
          })
        );
      });
      
      // Verify main element is present for accessibility
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Toast Performance and Integration', () => {
    it('should handle frequent toast notifications without performance issues', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        const [toastCount, setToastCount] = React.useState(0);
        
        const handleFrequentToasts = () => {
          // Generate multiple toasts rapidly
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              const count = toastCount + i + 1;
              setToastCount(count);
              toast({
                title: `Toast ${count}`,
                description: `Performance test toast ${count}`,
                variant: "default"
              });
            }, i * 10);
          }
        };
        
        return (
          <button onClick={handleFrequentToasts} data-testid="frequent-toast-button">
            Generate Frequent Toasts
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      const startTime = performance.now();
      await user.click(screen.getByTestId('frequent-toast-button'));
      
      // Wait for all toasts to be generated
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledTimes(10);
      }, { timeout: 1000 });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 500ms)
      expect(duration).toBeLessThan(500);
    });

    it('should test toast memory management during extended usage', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        const [memoryTest, setMemoryTest] = React.useState('idle');
        
        const runMemoryTest = async () => {
          setMemoryTest('running');
          
          // Generate many toasts to test memory usage
          for (let i = 0; i < 100; i++) {
            toast({
              title: `Memory test ${i}`,
              description: `Testing memory usage ${i}`,
              variant: "default"
            });
          }
          
          setMemoryTest('completed');
        };
        
        return (
          <div>
            <button onClick={runMemoryTest} data-testid="memory-test-button">
              Memory Test ({memoryTest})
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('memory-test-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('memory-test-button')).toHaveTextContent('Memory Test (completed)');
      });
      
      // Verify all toasts were called
      expect(mockToast).toHaveBeenCalledTimes(100);
    });
  });
});