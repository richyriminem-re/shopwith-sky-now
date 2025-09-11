/**
 * Lazy Route Component with Simple Loading States
 */

import React from 'react';
import { RouteTransition } from './RouteTransition';

interface LazyRouteProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ComponentType;
  loadingText?: string;
  showProgress?: boolean;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
  component: Component,
  fallback,
  loadingText,
  showProgress = false
}) => {
  return (
    <RouteTransition
      fallback={fallback}
      loadingText={loadingText}
      showProgress={showProgress}
    >
      <Component />
    </RouteTransition>
  );
};

// HOC for creating lazy routes with preloading
export const createLazyRoute = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  options: Omit<LazyRouteProps, 'component'> = {}
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props: any) => (
    <LazyRoute {...options} component={LazyComponent} {...props} />
  );
};

export default LazyRoute;