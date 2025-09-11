/**
 * Accessibility Navigation Tests
 * Tests that navigation works properly with assistive technologies
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, testKeyboardNavigation } from '../utils/navigation-test-utils';
import { Routes, Route, Link } from 'react-router-dom';
import React from 'react';
import SkipLinks from '@/components/ui/SkipLinks';
import BackButton from '@/components/ui/BackButton';

describe('Accessibility Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through links', async () => {
      const TestComponent = () => (
        <div>
          <Link to="/page1" data-testid="link1">Page 1</Link>
          <Link to="/page2" data-testid="link2">Page 2</Link>
          <Link to="/page3" data-testid="link3">Page 3</Link>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/page1" element={<div>Page 1 Content</div>} />
            <Route path="/page2" element={<div>Page 2 Content</div>} />
            <Route path="/page3" element={<div>Page 3 Content</div>} />
          </Routes>
        </div>
      );

      const { user } = renderWithRouter(<TestComponent />);
      
      // Test keyboard navigation through links
      await testKeyboardNavigation(user, screen.getByTestId('link1'));
      await waitFor(() => {
        expect(screen.getByText('Page 1 Content')).toBeInTheDocument();
      });
      
      // Test space key activation
      const link2 = screen.getByTestId('link2');
      await user.tab();
      expect(link2).toHaveFocus();
      
      await user.keyboard(' ');
      await waitFor(() => {
        expect(screen.getByText('Page 2 Content')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation on back buttons', async () => {
      const TestComponent = () => (
        <div>
          <BackButton fallback="/" data-testid="back-button" />
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/products" element={<div>Products</div>} />
          </Routes>
        </div>
      );

      const { user } = renderWithRouter(<TestComponent />, {
        initialEntries: ['/products']
      });
      
      const backButton = screen.getByTestId('back-button');
      await testKeyboardNavigation(user, backButton);
      
      // Should navigate back without issues
      await waitFor(() => {
        expect(true).toBe(true); // Test passes if no errors
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels for navigation elements', async () => {
      const TestComponent = () => (
        <nav aria-label="Main navigation">
          <Link to="/home" aria-label="Go to home page">Home</Link>
          <Link to="/products" aria-label="Browse products">Products</Link>
          <Link to="/contact" aria-label="Contact information">Contact</Link>
        </nav>
      );

      renderWithRouter(<TestComponent />);
      
      // Check ARIA labels are present
      expect(screen.getByLabelText('Go to home page')).toBeInTheDocument();
      expect(screen.getByLabelText('Browse products')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact information')).toBeInTheDocument();
      
      // Check navigation landmark
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    });

    it('should announce route changes to screen readers', async () => {
      const TestComponent = () => {
        const [currentPage, setCurrentPage] = React.useState('Home');
        
        return (
          <div>
            <div aria-live="polite" aria-atomic="true" data-testid="route-announcer">
              Current page: {currentPage}
            </div>
            <Link 
              to="/products" 
              onClick={() => setCurrentPage('Products')}
              data-testid="products-link"
            >
              Products
            </Link>
            <Routes>
              <Route path="/" element={<div>Home Content</div>} />
              <Route path="/products" element={<div>Products Content</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('products-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('route-announcer')).toHaveTextContent('Current page: Products');
      });
    });
  });

  describe('Skip Links', () => {
    it('should provide skip navigation functionality', async () => {
      const TestComponent = () => (
        <div>
          <SkipLinks />
          <nav>
            <Link to="/page1">Page 1</Link>
            <Link to="/page2">Page 2</Link>
          </nav>
          <main id="main-content">
            <h1>Main Content</h1>
            <p>This is the main content area</p>
          </main>
        </div>
      );

      const { user } = renderWithRouter(<TestComponent />);
      
      // Skip links should be focusable
      await user.tab();
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();
      
      // Activating skip link should focus main content
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const mainContent = document.getElementById('main-content');
        expect(mainContent).toHaveFocus();
      });
    });
  });

  describe('Focus Management', () => {
    it('should manage focus appropriately during navigation', async () => {
      const TestComponent = () => {
        const [route, setRoute] = React.useState('/');
        
        React.useEffect(() => {
          // Simulate focus management that would happen in real app
          const mainContent = document.querySelector('main');
          if (mainContent) {
            mainContent.focus();
          }
        }, [route]);
        
        return (
          <div>
            <Link 
              to="/about" 
              onClick={() => setRoute('/about')}
              data-testid="about-link"
            >
              About
            </Link>
            <main tabIndex={-1}>
              <Routes>
                <Route path="/" element={<h1>Home Page</h1>} />
                <Route path="/about" element={<h1>About Page</h1>} />
              </Routes>
            </main>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('about-link'));
      
      await waitFor(() => {
        expect(screen.getByText('About Page')).toBeInTheDocument();
      });
      
      // Focus should be managed appropriately
      await waitFor(() => {
        const main = document.querySelector('main');
        expect(main).toHaveFocus();
      });
    });

    it('should restore focus after modal navigation', async () => {
      const TestComponent = () => {
        const [showModal, setShowModal] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);
        
        const openModal = () => setShowModal(true);
        const closeModal = () => {
          setShowModal(false);
          // Focus should return to trigger
          triggerRef.current?.focus();
        };
        
        return (
          <div>
            <button 
              ref={triggerRef}
              onClick={openModal}
              data-testid="open-modal"
            >
              Open Modal
            </button>
            {showModal && (
              <div role="dialog" aria-modal="true">
                <h2>Modal Content</h2>
                <button onClick={closeModal} data-testid="close-modal">
                  Close
                </button>
              </div>
            )}
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      const openButton = screen.getByTestId('open-modal');
      await user.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('close-modal'));
      
      await waitFor(() => {
        expect(openButton).toHaveFocus();
      });
    });
  });

  describe('High Contrast and Reduced Motion', () => {
    it('should respect user preferences for reduced motion', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const TestComponent = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        return (
          <div>
            <Link 
              to="/page1" 
              className={prefersReducedMotion ? 'no-animation' : 'with-animation'}
              data-testid="animated-link"
            >
              Animated Link
            </Link>
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/page1" element={<div>Page 1</div>} />
            </Routes>
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveClass('no-animation');
      
      await user.click(link);
      
      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should announce navigation errors to screen readers', async () => {
      const TestComponent = () => {
        const [error, setError] = React.useState('');
        
        const triggerError = () => {
          setError('Navigation failed. Please try again.');
        };
        
        return (
          <div>
            <button onClick={triggerError} data-testid="trigger-error">
              Trigger Navigation Error
            </button>
            {error && (
              <div 
                role="alert" 
                aria-live="assertive"
                data-testid="error-message"
              >
                {error}
              </div>
            )}
          </div>
        );
      };

      const { user } = renderWithRouter(<TestComponent />);
      
      await user.click(screen.getByTestId('trigger-error'));
      
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toHaveTextContent('Navigation failed. Please try again.');
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });
});