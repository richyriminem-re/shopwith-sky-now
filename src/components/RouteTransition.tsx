/**
 * Route Transition Component for Smooth Page Navigation
 */

import React, { Suspense } from 'react';
import { LoadingStateManager } from './LoadingStateManager';
import ProductCardSkeleton from './ProductCardSkeleton';

interface RouteTransitionProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  loadingText?: string;
  showProgress?: boolean;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  fallback: FallbackComponent,
  loadingText = "Loading page...",
  showProgress = false
}) => {
  const fallback = FallbackComponent ? (
    <FallbackComponent />
  ) : (
    <LoadingStateManager
      isLoading={true}
      showProgress={showProgress}
      skeleton={<ProductCardSkeleton variant="default" />}
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-neu-muted text-sm">{loadingText}</p>
        </div>
      </div>
    </LoadingStateManager>
  );

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default RouteTransition;