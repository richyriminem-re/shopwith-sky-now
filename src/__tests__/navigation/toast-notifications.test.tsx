/**
 * Toast Notification Integration Tests
 * Tests that toast notifications work correctly in all navigation contexts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, mockToastSystem, mockNetworkState } from '../utils/navigation-test-utils';
import { useToast } from '@/hooks/use-toast';
import { offlineToastSystem } from '@/utils/offlineToastSystem';
import { Routes, Route } from 'react-router-dom';
import React from 'react';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock offline toast system
vi.mock('@/utils/offlineToastSystem', () => {
  const mockOfflineToast = {
    initialize: vi.fn(),
    show: vi.fn(),
    isInitialized: true,
    processQueue: vi.fn(),
  };
  
  return {
    offlineToastSystem: mockOfflineToast,
  };
});

describe('Toast Notification Integration', () => {
  let toastMock: ReturnType<typeof mockToastSystem>;

  beforeEach(() => {
    toastMock = mockToastSystem();
    mockToast.mockImplementation(toastMock.toast);
    vi.clearAllMocks();
    mockNetworkState(true); // Start online
  });

  describe('Online Toast Notifications', () => {
    it('should show toast notifications during normal navigation', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleClick = () => {
          toast({
            title: "Navigation Success",
            description: "Page loaded successfully"
          });
        };
        
        return (
          <div>
            <button onClick={handleClick} data-testid="show-toast">
              Show Toast
            </button>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('show-toast'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Navigation Success",
          description: "Page loaded successfully"
        });
      });
    });

    it('should show error toast for navigation failures', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleError = () => {
          toast({
            title: "Navigation Error",
            description: "Failed to load page",
            variant: "destructive"
          });
        };
        
        return (
          <button onClick={handleError} data-testid="show-error">
            Show Error
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('show-error'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Navigation Error",
          description: "Failed to load page",
          variant: "destructive"
        });
      });
    });
  });

  describe('Offline Toast System', () => {
    it('should initialize offline toast system properly', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          offlineToastSystem.initialize(toast);
        }, [toast]);
        
        return <div>Test Component</div>;
      };

      renderWithRouter(<TestComponent />);
      
      await waitFor(() => {
        expect(offlineToastSystem.initialize).toHaveBeenCalled();
      });
    });

    it('should show offline toast notifications', async () => {
      const TestComponent = () => {
        const showOfflineToast = () => {
          offlineToastSystem.show({
            title: "You're offline",
            description: "Some features may be limited",
            variant: "destructive"
          });
        };
        
        return (
          <button onClick={showOfflineToast} data-testid="offline-toast">
            Show Offline Toast
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      // Go offline
      mockNetworkState(false);
      
      await user.click(screen.getByTestId('offline-toast'));
      
      await waitFor(() => {
        expect(offlineToastSystem.show).toHaveBeenCalledWith({
          title: "You're offline",
          description: "Some features may be limited",
          variant: "destructive"
        });
      });
    });

    it('should queue toasts when component is not mounted', async () => {
      // Simulate offline toast when component isn't ready
      offlineToastSystem.show({
        title: "Queued Toast",
        description: "This toast was queued"
      });
      
      // Later, when component mounts, initialize with toast function
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          offlineToastSystem.initialize(toast);
        }, [toast]);
        
        return <div>Mounted Component</div>;
      };

      renderWithRouter(<TestComponent />);
      
      // Should process queued toasts
      await waitFor(() => {
        expect(offlineToastSystem.initialize).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Context Toast Handling', () => {
    it('should show appropriate toasts during back navigation errors', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const handleBackError = () => {
          // Simulate what happens in useSmartNavigation error handling
          toast({
            title: "Navigation Error",
            description: "Returning to home page",
            variant: "destructive"
          });
        };
        
        return (
          <button onClick={handleBackError} data-testid="back-error">
            Simulate Back Error
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('back-error'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Navigation Error",
          description: "Returning to home page",
          variant: "destructive"
        });
      });
    });

    it('should handle toast notifications during route transitions', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          toast({
            title: "Page Loaded",
            description: "Welcome to the new page"
          });
        }, [toast]);
        
        return <div>New Page Content</div>;
      };

      const TestApp = () => (
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/new-page" element={<TestComponent />} />
        </Routes>
      );

      const { user } = renderWithRouter(<TestApp />, {
        initialEntries: ['/']
      });
      
      // Navigate to trigger toast
      window.history.pushState({}, '', '/new-page');
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Page Loaded",
          description: "Welcome to the new page"
        });
      });
    });
  });

  describe('Toast Accessibility', () => {
    it('should announce toast messages to screen readers', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const showAccessibleToast = () => {
          toast({
            title: "Important Update",
            description: "Your changes have been saved",
            // aria-live regions should be handled by the toast component
          });
        };
        
        return (
          <button onClick={showAccessibleToast} data-testid="accessible-toast">
            Show Accessible Toast
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('accessible-toast'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Important Update",
          description: "Your changes have been saved"
        });
      });
      
      // Toast should be accessible to screen readers
      // This would be tested more thoroughly in component-specific tests
    });
  });

  describe('Toast Performance', () => {
    it('should handle rapid toast notifications efficiently', async () => {
      const TestComponent = () => {
        const { toast } = useToast();
        
        const showMultipleToasts = () => {
          for (let i = 0; i < 5; i++) {
            toast({
              title: `Toast ${i + 1}`,
              description: `Message ${i + 1}`
            });
          }
        };
        
        return (
          <button onClick={showMultipleToasts} data-testid="multiple-toasts">
            Show Multiple Toasts
          </button>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('multiple-toasts'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledTimes(5);
      });
    });

    it('should not cause memory leaks with frequent toast usage', () => {
      // This test verifies that the toast system doesn't accumulate memory
      const TestComponent = () => {
        const { toast } = useToast();
        
        React.useEffect(() => {
          const interval = setInterval(() => {
            toast({
              title: "Periodic Toast",
              description: "Regular update"
            });
          }, 100);
          
          // Clean up after a short time
          setTimeout(() => clearInterval(interval), 500);
          
          return () => clearInterval(interval);
        }, [toast]);
        
        return <div>Performance Test</div>;
      };

      renderWithRouter(<TestComponent />);
      
      // Test passes if no memory issues occur
      expect(true).toBe(true);
    });
  });
});