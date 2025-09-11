import React from 'react';
import { WifiOff, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import PageWithNavigation from '@/components/PageWithNavigation';

const Offline = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/', { replace: true });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Offline - Shop With Sky"
        description="You're currently offline. Please check your connection and try again."
        type="website"
      />
      
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md mx-auto">
          <div className="neu-surface p-8 rounded-2xl">
            <div className="neu-elevation-2 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-muted-foreground" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              You're Offline
            </h1>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              It looks like you've lost your internet connection. Some features may be limited while offline.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleGoHome}
                className="w-full flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> When online, this app caches content for offline viewing. 
                Try browsing pages you've visited before.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWithNavigation>
  );
};

export default Offline;