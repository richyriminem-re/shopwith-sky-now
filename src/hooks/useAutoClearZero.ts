import { useCallback } from 'react';

interface UseAutoClearZeroOptions {
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook that provides auto-clear behavior for price inputs when they show zero values
 * Clears field on focus if value is "0", "0.0", "0.00", or parses to numeric 0
 */
export function useAutoClearZero(options: UseAutoClearZeroOptions = {}) {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);
    
    // Clear field if it shows any variation of zero
    if (
      value === '0' || 
      value === '0.0' || 
      value === '0.00' ||
      (numericValue === 0 && value !== '')
    ) {
      e.target.value = '';
      // Trigger change event to update component state
      const changeEvent = new Event('input', { bubbles: true });
      e.target.dispatchEvent(changeEvent);
    }
    
    // Call original onFocus handler if provided
    options.onFocus?.(e);
  }, [options.onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Call original onBlur handler if provided
    options.onBlur?.(e);
  }, [options.onBlur]);

  return {
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
}