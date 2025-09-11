import { useState, useEffect, useCallback, useRef } from 'react';

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState(() => ({
    isHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    enableKeyboardShortcuts: true,
    fontSize: 'medium' as 'small' | 'medium' | 'large',
  }));

  useEffect(() => {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, isHighContrast: e.matches }));
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, isReducedMotion: e.matches }));
    };

    highContrastQuery.addListener(handleHighContrastChange);
    reducedMotionQuery.addListener(handleReducedMotionChange);

    return () => {
      highContrastQuery.removeListener(handleHighContrastChange);
      reducedMotionQuery.removeListener(handleReducedMotionChange);
    };
  }, []);

  const toggleHighContrast = useCallback(() => {
    setPreferences(prev => ({ ...prev, isHighContrast: !prev.isHighContrast }));
  }, []);

  const toggleKeyboardShortcuts = useCallback(() => {
    setPreferences(prev => ({ ...prev, enableKeyboardShortcuts: !prev.enableKeyboardShortcuts }));
  }, []);

  const setFontSize = useCallback((fontSize: 'small' | 'medium' | 'large') => {
    setPreferences(prev => ({ ...prev, fontSize }));
  }, []);

  return {
    ...preferences,
    toggleHighContrast,
    toggleKeyboardShortcuts,
    setFontSize,
  };
};

// Legacy exports for compatibility
export const useFocusTrap = () => useRef<HTMLElement>(null);
export const useKeyboardNavigation = () => ({ containerRef: useRef<HTMLElement>(null), activeIndex: 0 });
export const useLiveAnnouncer = () => (message: string, priority?: 'polite' | 'assertive' | 'off') => {
  // Import announceToScreenReader dynamically to avoid circular dependency
  import('../utils/accessibility').then(({ announceToScreenReader }) => {
    announceToScreenReader(message, priority === 'assertive' ? 'assertive' : 'polite');
  }).catch(() => {
    console.log('Announce:', message, 'Priority:', priority || 'polite');
  });
};
export const useFormAnnouncements = () => ({ 
  announceErrors: (errors: any, priority?: 'polite' | 'assertive' | 'off') => {
    const errorMsg = typeof errors === 'string' ? errors : 'Form validation errors occurred';
    import('../utils/accessibility').then(({ announceToScreenReader }) => {
      announceToScreenReader(errorMsg, priority === 'assertive' ? 'assertive' : 'polite');
    }).catch(() => {
      console.log('Errors:', errorMsg, 'Priority:', priority || 'polite');
    });
  },
  announceSuccess: (msg: string, priority?: 'polite' | 'assertive' | 'off') => {
    import('../utils/accessibility').then(({ announceToScreenReader }) => {
      announceToScreenReader(msg, priority === 'assertive' ? 'assertive' : 'polite');
    }).catch(() => {
      console.log('Success:', msg, 'Priority:', priority || 'polite');
    });
  }
});