/**
 * Navigation Verification Component
 * Shows real-time navigation metrics for development/testing
 */

import { useState, useEffect } from 'react';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

const NavigationVerification = () => {
  const { getMetrics, getRecentEvents } = useNavigationMonitor();
  const [metrics, setMetrics] = useState(() => getMetrics());
  const [recentEvents, setRecentEvents] = useState(() => getRecentEvents(10));

  // Update metrics every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
      setRecentEvents(getRecentEvents(10));
    }, 2000);

    return () => clearInterval(interval);
  }, [getMetrics, getRecentEvents]);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const hasValidTiming = metrics.totalNavigations > 0 && metrics.averageNavigationTime > 0;
  const hasLowErrorRate = metrics.errorRate < 0.1; // Less than 10%
  const hasFallbackUsage = metrics.fallbackUsage < 0.2; // Less than 20%

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Navigation System Status
        </CardTitle>
        <CardDescription>
          Real-time monitoring of navigation reliability and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {getStatusIcon(hasValidTiming)}
              <span className="text-sm font-medium">Timing</span>
            </div>
            <div className="text-lg font-bold">
              {metrics.averageNavigationTime > 0 ? `${metrics.averageNavigationTime.toFixed(0)}ms` : 'N/A'}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {getStatusIcon(hasLowErrorRate)}
              <span className="text-sm font-medium">Errors</span>
            </div>
            <div className="text-lg font-bold">
              {(metrics.errorRate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {getStatusIcon(hasFallbackUsage)}
              <span className="text-sm font-medium">Fallbacks</span>
            </div>
            <div className="text-lg font-bold">
              {(metrics.fallbackUsage * 100).toFixed(1)}%
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-lg font-bold">
              {metrics.totalNavigations}
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="text-center">
          <Badge variant={hasValidTiming && hasLowErrorRate && hasFallbackUsage ? "default" : "destructive"} className="text-sm">
            {hasValidTiming && hasLowErrorRate && hasFallbackUsage ? "✅ System Healthy" : "⚠️ Issues Detected"}
          </Badge>
        </div>

        {/* Recent Events */}
        <div>
          <h4 className="font-medium mb-3">Recent Navigation Events</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {event.type}
                    </Badge>
                    <span className="font-mono text-xs">{event.route}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.duration ? `${event.duration}ms` : ''}
                    {event.metadata?.reason && ` (${event.metadata.reason})`}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                No navigation events yet
              </div>
            )}
          </div>
        </div>

        {/* Popular Routes */}
        {Object.keys(metrics.popularRoutes).length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Popular Routes</h4>
            <div className="space-y-2">
              {Object.entries(metrics.popularRoutes)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([route, count]) => (
                  <div key={route} className="flex justify-between items-center text-sm">
                    <span className="font-mono text-xs">{route}</span>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationVerification;