import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { useToast } from '@/hooks/use-toast';
import { useRef, useEffect, useId, useCallback } from 'react';
import { announceToScreenReader } from '@/utils/accessibility';
import { getSmartFallback } from '@/utils/routeHierarchy';
import { prefetchRouteResources } from '@/utils/routePrefetch';
import { useLocation } from 'react-router-dom';

interface BackButtonProps {
  fallback?: string;
  className?: string;
  hideText?: boolean;
  text?: string;
  onError?: (error: Error) => void;
  variant?: 'default' | 'compact' | 'icon-only';
  size?: 'sm' | 'default' | 'lg';
  breadcrumbHints?: string[];
}

const BackButton = ({ 
  fallback = '/', 
  className = '', 
  hideText = false, 
  text = 'Back',
  onError,
  variant = 'default',
  size = 'default',
  breadcrumbHints
}: BackButtonProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Generate unique IDs for ARIA relationships
  const buttonId = useId();
  const loadingId = useId();
  const liveRegionId = useId();
  
  // Enhanced error handler with toast notifications and announcements
  const handleNavigationError = (error: Error) => {
    const errorMessage = "Unable to go back. Redirecting to a safe location.";
    
    toast({
      title: "Navigation Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Announce error to screen readers
    announceToScreenReader(errorMessage, 'assertive');
    
    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }
  };
  
  const { navigateBack, isNavigating, handleKeyDown } = useSmartNavigation({ 
    fallback, 
    onError: handleNavigationError,
    breadcrumbHints
  });
  
  // Handle hover and focus preloading
  const handlePreloadTrigger = useCallback(async () => {
    if (isNavigating) return;
    
    try {
      const smartFallback = fallback || getSmartFallback(location.pathname, breadcrumbHints);
      await prefetchRouteResources(smartFallback);
      
      if (import.meta.env.DEV) {
        console.log(`Preloaded fallback route: ${smartFallback}`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to preload fallback route:', error);
      }
    }
  }, [fallback, location.pathname, breadcrumbHints, isNavigating]);

  // Generate smart aria-label based on context
  const getAriaLabel = (): string => {
    if (text && text !== 'Back' && text !== 'back') {
      return `Go back to ${text.toLowerCase()}`;
    }
    return 'Go back';
  };
  
  // Announce navigation state changes to screen readers
  useEffect(() => {
    if (isNavigating) {
      announceToScreenReader('Going back...', 'polite');
    }
  }, [isNavigating]);
  
  // Enhanced focus restoration with better element selection
  useEffect(() => {
    if (isNavigating) {
      // Store current focus for potential restoration
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement !== buttonRef.current) {
        try {
          const focusData = {
            tagName: activeElement.tagName,
            id: activeElement.id,
            className: activeElement.className,
            textContent: activeElement.textContent?.slice(0, 50),
            selector: activeElement.tagName.toLowerCase() + 
              (activeElement.id ? `#${activeElement.id}` : '') +
              (activeElement.className ? `.${activeElement.className.split(' ')[0]}` : '')
          };
          sessionStorage.setItem('pre-navigation-focus', JSON.stringify(focusData));
        } catch (error) {
          console.warn('Failed to store focus state:', error);
        }
      }
    } else {
      // Enhanced focus restoration with better fallback hierarchy
      try {
        const focusData = sessionStorage.getItem('pre-navigation-focus');
        if (focusData) {
          const parsed = JSON.parse(focusData);
          
          // Try multiple strategies to find the element to focus
          let elementToFocus: HTMLElement | null = null;
          
          // Strategy 1: Try by ID first (most reliable)
          if (parsed.id) {
            elementToFocus = document.getElementById(parsed.id);
          }
          
          // Strategy 2: Try by selector
          if (!elementToFocus && parsed.selector) {
            elementToFocus = document.querySelector(parsed.selector) as HTMLElement;
          }
          
          // Strategy 3: Try by tag and class
          if (!elementToFocus && parsed.className) {
            elementToFocus = document.querySelector(`${parsed.tagName.toLowerCase()}.${parsed.className.split(' ')[0]}`) as HTMLElement;
          }
          
          // Fallback hierarchy: main → skip to main → body (never the back button itself)
          if (!elementToFocus || elementToFocus === buttonRef.current) {
            elementToFocus = document.querySelector('main[tabindex="-1"]') as HTMLElement ||
              document.querySelector('main') as HTMLElement ||
              document.querySelector('a[href="#main-content"]') as HTMLElement ||
              document.body;
          }
          
          // Focus the element if it's focusable
          if (elementToFocus && elementToFocus !== buttonRef.current) {
            // Make main focusable if it's not already
            if (elementToFocus.tagName.toLowerCase() === 'main' && !elementToFocus.hasAttribute('tabindex')) {
              elementToFocus.setAttribute('tabindex', '-1');
            }
            
            elementToFocus.focus();
            
            // Announce the focus change for screen readers
            const announcement = elementToFocus.getAttribute('aria-label') || 
              elementToFocus.textContent?.trim().slice(0, 50) || 
              'Main content';
            announceToScreenReader(`Focused on ${announcement}`, 'polite');
          }
          
          sessionStorage.removeItem('pre-navigation-focus');
        }
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }
  }, [isNavigating]);

  // Map BackButton variants to Button variants and sizes
  const getButtonVariant = (): "default" | "link" | "destructive" | "outline" | "secondary" | "ghost" => {
    return 'ghost'; // All variants use ghost as base
  };

  const getButtonSize = (): "default" | "sm" | "lg" | "icon" => {
    if (variant === 'icon-only') return 'icon';
    if (variant === 'compact') return 'sm';
    return size === 'default' ? 'default' : size;
  };

  return (
    <>
      {/* ARIA live region for navigation announcements */}
      <div 
        id={liveRegionId}
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {isNavigating ? 'Going back...' : ''}
      </div>
      
      <Button 
        ref={buttonRef}
        id={buttonId}
        variant={getButtonVariant()}
        size={getButtonSize()}
        onClick={navigateBack}
        onKeyDown={handleKeyDown}
        onMouseEnter={handlePreloadTrigger}
        onFocus={handlePreloadTrigger}
        disabled={isNavigating}
        className={`group transition-all duration-200 ${className}`}
        aria-label={getAriaLabel()}
        aria-describedby={isNavigating ? loadingId : undefined}
        aria-busy={isNavigating}
      >
        <ArrowLeft 
          className={`flex-shrink-0 transition-transform duration-200 ${isNavigating ? 'animate-pulse' : 'group-hover:-translate-x-0.5'}`} 
          aria-hidden="true"
        />
        {!hideText && variant !== 'icon-only' && (
          <span className="truncate font-medium">
            {isNavigating ? 'Going back...' : text}
          </span>
        )}
        {isNavigating && (
          <span id={loadingId} className="sr-only">
            Navigating back, please wait
          </span>
        )}
      </Button>
    </>
  );
};

export default BackButton;