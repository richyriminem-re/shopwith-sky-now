/**
 * Offline Performance Monitor Component
 * Enhanced performance monitoring specifically for offline navigation and PWA metrics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useOfflineAnalytics } from '@/utils/offlineAnalytics';
import { useServiceWorkerComm } from '@/utils/serviceWorkerCommunication';
import { Wifi, WifiOff, Activity, Clock, Database, RotateCcw } from 'lucide-react';

interface OfflinePerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const OfflinePerformanceMonitor: React.FC<OfflinePerformanceMonitorProps> = ({
  isVisible = false,
  onToggle
}) => {
  const { getAnalyticsSummary, syncEvents } = useOfflineAnalytics();
  const { getStatus } = useServiceWorkerComm();
  const [summary, setSummary] = useState<any>(null);
  const [swStatus, setSwStatus] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const analyticsSummary = getAnalyticsSummary();
      const serviceWorkerStatus = getStatus();
      
      setSummary(analyticsSummary);
      setSwStatus(serviceWorkerStatus);
    };

    // Update immediately and then every 3 seconds
    updateMetrics();
    const interval = setInterval(updateMetrics, 3000);

    // Listen for online/offline changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isVisible, getAnalyticsSummary, getStatus]);

  const handleSyncAnalytics = async () => {
    try {
      await syncEvents();
      // Refresh summary after sync
      setSummary(getAnalyticsSummary());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  if (!isVisible || import.meta.env.PROD) {
    return null;
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'default';
    if (value >= thresholds.warning) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="fixed bottom-4 left-4 w-96 z-50 bg-card/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            Offline Performance Monitor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-4">
        
        {/* Connection Status */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Activity className="h-3 w-3" />
            Connection Status
          </h4>
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Service Worker:</span>
            <Badge variant={swStatus?.isServiceWorkerReady ? 'default' : 'secondary'}>
              {swStatus?.isServiceWorkerReady ? 'Ready' : 'Not Ready'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Cache Performance */}
        {summary?.metrics && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Database className="h-3 w-3" />
              Cache Performance
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Hit Rate:</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={summary.cacheHitRate * 100} 
                    className="w-16 h-2" 
                  />
                  <Badge variant={getStatusColor(summary.cacheHitRate, { good: 0.8, warning: 0.6 })}>
                    {(summary.cacheHitRate * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cache Hits: {summary.metrics.cacheHits}</span>
                <span>Cache Misses: {summary.metrics.cacheMisses}</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Offline Navigation */}
        {summary?.metrics && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Offline Navigation
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total Navigations:</span>
                <span>{summary.metrics.offlineNavigations}</span>
              </div>
              <div className="flex justify-between">
                <span>Successful Actions:</span>
                <span>{summary.metrics.successfulOfflineActions}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Offline Time:</span>
                <span>{summary.averageOfflineTime ? `${(summary.averageOfflineTime / 1000 / 60).toFixed(1)}m` : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Analytics Queue */}
        {summary && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <RotateCcw className="h-3 w-3" />
              Analytics Queue
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Queued Events:</span>
                <Badge variant={summary.queuedEvents > 50 ? 'destructive' : 'secondary'}>
                  {summary.queuedEvents}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Sync:</span>
                <span>
                  {summary.lastSyncAgo < 60000 
                    ? 'Just now' 
                    : `${Math.floor(summary.lastSyncAgo / 60000)}m ago`
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t space-y-2">
          <Button 
            size="sm" 
            onClick={handleSyncAnalytics} 
            className="w-full"
            disabled={!isOnline || summary?.queuedEvents === 0}
          >
            Sync Analytics ({summary?.queuedEvents || 0})
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.controller?.postMessage({
                    type: 'PERFORMANCE_REQUEST'
                  });
                }
              }}
            >
              Refresh SW Metrics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Clear analytics data
                localStorage.removeItem('offline-analytics');
                localStorage.removeItem('offline-metrics');
                setSummary(getAnalyticsSummary());
              }}
            >
              Clear Data
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <details className="mt-4">
            <summary className="text-xs cursor-pointer text-muted-foreground">
              Debug Info
            </summary>
            <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
              {JSON.stringify({ summary, swStatus }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};