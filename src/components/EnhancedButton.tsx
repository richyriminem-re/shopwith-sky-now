/**
 * Enhanced Button with Double-Click Prevention
 * 
 * Automatic deduplication for critical actions like add-to-cart, login, etc.
 */

import { forwardRef, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useDoubleClickPrevention } from '@/hooks/useApiWithAbort';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  /** Prevent double clicks with this delay (ms) */
  preventDoubleClick?: number;
  /** Show visual feedback when click is prevented */
  showPreventionFeedback?: boolean;
  /** Custom loading state */
  isLoading?: boolean;
  /** Loading text override */
  loadingText?: string;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(({
  children,
  onClick,
  preventDoubleClick = 1000,
  showPreventionFeedback = true,
  isLoading = false,
  loadingText,
  disabled,
  className,
  ...props
}, ref) => {
  const [isClickPrevented, setIsClickPrevented] = useState(false);
  const preventDoubleClickHandler = useDoubleClickPrevention(preventDoubleClick);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || isLoading) return;

    preventDoubleClickHandler(() => {
      onClick(event);
    });

    // Show prevention feedback briefly
    if (showPreventionFeedback) {
      setIsClickPrevented(true);
      setTimeout(() => setIsClickPrevented(false), 200);
    }
  };

  const buttonText = (() => {
    if (isLoading) {
      return loadingText || 'Loading...';
    }
    if (isClickPrevented && showPreventionFeedback) {
      return 'Processing...';
    }
    return children;
  })();

  return (
    <Button
      ref={ref}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'transition-all duration-200',
        isClickPrevented && 'scale-95 opacity-80',
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {buttonText}
    </Button>
  );
});

EnhancedButton.displayName = 'EnhancedButton';