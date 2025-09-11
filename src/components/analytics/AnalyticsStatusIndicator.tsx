import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

interface AnalyticsStatusIndicatorProps {
  isOnline: boolean;
  isLoading: boolean;
  isStale: boolean;
  lastRefresh: number;
  error?: { message: string };
  refreshCountdown?: number;
}

const AnalyticsStatusIndicator: React.FC<AnalyticsStatusIndicatorProps> = ({
  isOnline,
  isLoading,
  isStale,
  lastRefresh,
  error,
  refreshCountdown
}) => {
  const getConnectionStatus = () => {
    if (error) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Error
        </Badge>
      );
    }
    
    if (isStale) {
      return (
        <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning">
          <Clock className="h-3 w-3" />
          Stale
        </Badge>
      );
    }
    
    if (isLoading) {
      return (
        <Badge variant="secondary" className="gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Updating
        </Badge>
      );
    }
    
    return isOnline ? (
      <Badge variant="secondary" className="gap-1 bg-success/10 text-success">
        <Wifi className="h-3 w-3" />
        Live
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  };

  const getStatusText = () => {
    if (error) return `Error: ${error.message}`;
    if (isLoading) return 'Refreshing data...';
    if (isStale) return `Data is stale - last updated ${new Date(lastRefresh).toLocaleTimeString()}`;
    if (refreshCountdown && refreshCountdown > 0) return `Next refresh in ${refreshCountdown}s`;
    if (lastRefresh > 0) return `Last updated at ${new Date(lastRefresh).toLocaleTimeString()}`;
    return 'Real-time analytics dashboard';
  };

  return (
    <div className="flex items-center gap-3">
      {getConnectionStatus()}
      <span className="text-xs text-muted-foreground">
        {getStatusText()}
      </span>
    </div>
  );
};

export default AnalyticsStatusIndicator;