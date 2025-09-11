import { useCallback } from 'react';

/**
 * Skip links component for improved keyboard navigation accessibility
 * Provides shortcuts to main content areas and common actions
 */
const SkipLinks = () => {
  const handleSkipToContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('#main-content');
    if (mainContent && mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSkipToNavigation = useCallback(() => {
    const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (navigation && navigation instanceof HTMLElement) {
      const focusableElement = navigation.querySelector('button, a, [tabindex]') as HTMLElement;
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, []);

  const handleSkipToSearch = useCallback(() => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="skip-links sr-only focus-within:not-sr-only">
      <button
        onClick={handleSkipToContent}
        onFocus={(e) => {
          e.currentTarget.classList.remove('sr-only');
          e.currentTarget.parentElement?.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.currentTarget.classList.add('sr-only');
          if (!e.currentTarget.parentElement?.querySelector(':focus')) {
            e.currentTarget.parentElement?.classList.add('sr-only');
          }
        }}
        className="absolute top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 sr-only focus:not-sr-only"
      >
        Skip to main content
      </button>
      <button
        onClick={handleSkipToNavigation}
        onFocus={(e) => {
          e.currentTarget.classList.remove('sr-only');
          e.currentTarget.parentElement?.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.currentTarget.classList.add('sr-only');
          if (!e.currentTarget.parentElement?.querySelector(':focus')) {
            e.currentTarget.parentElement?.classList.add('sr-only');
          }
        }}
        className="absolute top-4 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 sr-only focus:not-sr-only ml-2"
      >
        Skip to navigation
      </button>
      <button
        onClick={handleSkipToSearch}
        onFocus={(e) => {
          e.currentTarget.classList.remove('sr-only');
          e.currentTarget.parentElement?.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.currentTarget.classList.add('sr-only');
          if (!e.currentTarget.parentElement?.querySelector(':focus')) {
            e.currentTarget.parentElement?.classList.add('sr-only');
          }
        }}
        className="absolute top-4 left-64 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 sr-only focus:not-sr-only ml-2"
      >
        Skip to search
      </button>
    </div>
  );
};

export default SkipLinks;