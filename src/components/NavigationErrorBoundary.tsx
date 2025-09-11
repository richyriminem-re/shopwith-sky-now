import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getSmartFallback } from '@/utils/routeHierarchy';
import { navigationMonitor } from '@/utils/navigationMonitor';
import { toast } from '@/hooks/use-toast';

interface NavigationErrorBoundaryProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

interface NavigationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  autoRetryComplete: boolean;
}

/**
 * Error boundary specifically for navigation-related errors
 */
class NavigationErrorBoundary extends React.Component<
  NavigationErrorBoundaryProps,
  NavigationErrorBoundaryState
> {
  constructor(props: NavigationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      autoRetryComplete: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<NavigationErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Track error with navigation monitor
    navigationMonitor.trackError(window.location.pathname, error, {
      component: 'NavigationErrorBoundary',
      errorInfo,
    });

    // Start automatic retry sequence
    this.attemptAutoRetry(error);

    // Log to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError(error, {
        component: 'NavigationErrorBoundary',
        errorInfo,
      });
    }
  }

  attemptAutoRetry = async (error: Error) => {
    const maxRetries = 2;
    const delays = [250, 500]; // Progressive delays

    for (let i = 0; i < maxRetries; i++) {
      if (this.state.retryCount >= maxRetries) break;

      this.setState({ 
        isRetrying: true, 
        retryCount: this.state.retryCount + 1 
      });

      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delays[i]));

      try {
        // Track retry attempt
        navigationMonitor.trackNavigation('navigation', window.location.pathname, {
          type: 'auto-retry',
          attempt: this.state.retryCount,
          delay: delays[i]
        });

        // Reset error state to trigger re-render
        this.setState({ 
          hasError: false, 
          error: null, 
          errorInfo: null, 
          isRetrying: false 
        });

        // If we reach here, the retry succeeded
        toast({
          title: "Navigation Recovered",
          description: "Successfully recovered from navigation error.",
        });
        return;

      } catch (retryError) {
        console.warn(`Auto-retry attempt ${this.state.retryCount} failed:`, retryError);
        
        navigationMonitor.trackError(window.location.pathname, retryError as Error, {
          context: 'auto-retry-failed',
          attempt: this.state.retryCount,
          originalError: error.message
        });
      }
    }

    // All auto-retries failed
    this.setState({ 
      isRetrying: false, 
      autoRetryComplete: true 
    });

    toast({
      title: "Navigation Error",
      description: "Unable to recover automatically. Please try manual options.",
      variant: "destructive"
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <NavigationErrorFallback 
          error={this.state.error} 
          fallbackRoute={this.props.fallbackRoute}
          retryCount={this.state.retryCount}
          isRetrying={this.state.isRetrying}
          autoRetryComplete={this.state.autoRetryComplete}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback component for navigation errors
 */
const NavigationErrorFallback = ({ 
  error, 
  fallbackRoute, 
  retryCount = 0, 
  isRetrying = false, 
  autoRetryComplete = false 
}: { 
  error: Error | null; 
  fallbackRoute?: string;
  retryCount?: number;
  isRetrying?: boolean;
  autoRetryComplete?: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRetry = () => {
    // Track manual retry attempt
    navigationMonitor.trackNavigation('navigation', location.pathname, {
      type: 'manual-retry',
      retryCount: retryCount + 1
    });

    try {
      const currentPath = location.pathname;
      navigate(currentPath, { replace: true });
    } catch (error) {
      console.warn('Manual retry failed, attempting smart fallback:', error);
      handleSmartFallback();
    }
  };

  const handleSmartFallback = () => {
    try {
      const smartFallback = getSmartFallback(location.pathname);
      
      // Track smart fallback usage
      navigationMonitor.trackFallback(location.pathname, smartFallback, 'smart-fallback');
      
      navigate(smartFallback, { replace: true });
      
      toast({
        title: "Redirected",
        description: `Navigated to ${smartFallback === '/' ? 'home' : 'a safe page'}.`,
      });
    } catch (navError) {
      console.error('Smart fallback failed:', navError);
      handleGoHome();
    }
  };

  const handleGoHome = () => {
    try {
      const homeRoute = fallbackRoute || '/';
      
      // Track final fallback to home
      navigationMonitor.trackFallback(location.pathname, homeRoute, 'final-fallback');
      
      navigate(homeRoute, { replace: true });
    } catch (navError) {
      console.error('Failed to navigate to home:', navError);
      // Final fallback - use React Router only, no page reload
      try {
        navigate('/', { replace: true });
      } catch (finalError) {
        console.error('All navigation methods failed:', finalError);
        // If all navigation fails, component will remain in error state
        // No hard reload fallbacks - keep user in controlled error state
      }
    }
  };

  // Show retry progress during auto-retry
  if (isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary animate-spin" />
            </div>
            <CardTitle>Recovering...</CardTitle>
            <CardDescription>
              Attempting to recover from navigation error (Attempt {retryCount}/2)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(retryCount / 2) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we try to fix the navigation issue...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Navigation Error</CardTitle>
          <CardDescription>
            {autoRetryComplete 
              ? "Automatic recovery failed. Please choose an option below." 
              : "Something went wrong while navigating. Please try one of the options below."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {autoRetryComplete && retryCount > 0 && (
            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-medium mb-1">Recovery Attempts: {retryCount}/2</p>
              <p className="text-muted-foreground">
                Automatic recovery was attempted but failed. Manual options are available below.
              </p>
            </div>
          )}
          
          {error && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <code className="text-xs bg-muted p-2 rounded block overflow-auto">
                {error.message}
              </code>
            </details>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry} 
              variant="default" 
              className="w-full"
              disabled={isRetrying}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleSmartFallback} 
              variant="outline" 
              className="w-full"
              disabled={isRetrying}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Safe Page
            </Button>

            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="w-full"
              disabled={isRetrying}
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationErrorBoundary;