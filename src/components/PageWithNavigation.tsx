import { ReactNode } from 'react';
import NavigationErrorBoundary from '@/components/NavigationErrorBoundary';
import SkipLinks from '@/components/ui/SkipLinks';

interface PageWithNavigationProps {
  children: ReactNode;
  fallbackRoute?: string;
}

/**
 * Wrapper component that provides navigation error handling for pages
 * This ensures that navigation failures are handled gracefully
 */
const PageWithNavigation = ({ 
  children, 
  fallbackRoute = '/' 
}: PageWithNavigationProps) => {
  return (
    <>
      <SkipLinks />
      <NavigationErrorBoundary fallbackRoute={fallbackRoute}>
        {children}
      </NavigationErrorBoundary>
    </>
  );
};

export default PageWithNavigation;