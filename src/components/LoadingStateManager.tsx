import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import FullPageSkeleton, { ContentType } from './skeletons/FullPageSkeleton';

interface LoadingStateManagerProps {
  isLoading: boolean;
  hasError?: boolean;
  loadingProgress?: number;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onRetry?: () => void;
  timeout?: number;
  showProgress?: boolean;
  // Full-page skeleton options
  useFullPageSkeleton?: boolean;
  includeHeader?: boolean;
  contentType?: ContentType;
  viewMode?: 'grid-2' | 'grid-3';
}

export const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  isLoading,
  hasError = false,
  loadingProgress = 0,
  children,
  skeleton,
  errorFallback,
  onRetry,
  timeout = 30000, // 30 seconds timeout
  showProgress = false,
  // Full-page skeleton options
  useFullPageSkeleton = false,
  includeHeader = true,
  contentType = 'generic',
  viewMode = 'grid-2',
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  // Handle offline state
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="text-sm">You're currently offline.</p>
              <p className="text-xs text-muted-foreground">
                Please check your internet connection and try again.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle error state
  if (hasError) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="text-sm">Failed to load content.</p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle timeout state
  if (isTimedOut && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="text-sm">Taking longer than expected...</p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    // Use full-page skeleton if specified
    if (useFullPageSkeleton) {
      return (
        <FullPageSkeleton 
          includeHeader={includeHeader}
          contentType={contentType}
          viewMode={viewMode}
        />
      );
    }

    if (skeleton) {
      return <>{skeleton}</>;
    }

    return (
      <div className="space-y-4 p-6">
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Loading...</span>
              <span className="text-muted-foreground">{Math.round(loadingProgress * 100)}%</span>
            </div>
            <Progress value={loadingProgress * 100} className="h-2" />
          </div>
        )}
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for managing loading states
export const useLoadingState = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setHasError(false);
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(100);
  };

  const setError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const reset = () => {
    setIsLoading(false);
    setHasError(false);
    setProgress(0);
  };

  return {
    isLoading,
    hasError,
    progress,
    startLoading,
    stopLoading,
    setError,
    setProgress,
    reset,
  };
};