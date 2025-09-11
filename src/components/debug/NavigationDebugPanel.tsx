import React, { useState, useEffect } from 'react';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { useNavigationState } from '@/utils/navigationStateManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Activity, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface NavigationDebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Debug panel for real-time navigation monitoring
 * Only available in development mode
 */
export const NavigationDebugPanel: React.FC<NavigationDebugPanelProps> = ({ 
  isVisible, 
  onClose 
}) => {
  const { getMetrics, getRecentEvents } = useNavigationMonitor();
  const navState = useNavigationState();
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || !import.meta.env.DEV) return null;

  const metrics = getMetrics();
  const recentEvents = getRecentEvents(20);
  const currentState = navState.getState();

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getEventStatusIcon = (event: any) => {
    switch (event.type) {
      case 'navigation':
        return <CheckCircle className="w-3 h-3 text-success" />;
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-destructive" />;
      case 'fallback':
        return <Activity className="w-3 h-3 text-warning" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-4 top-4 bottom-4 w-96 bg-card border border-border shadow-elevation-4 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-h4">Navigation Debug</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="metrics" className="h-full">
          <TabsList className="grid w-full grid-cols-3 m-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
          </TabsList>

          <div className="pb-16">
            <TabsContent value="metrics" className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h4">Performance Metrics</CardTitle>
                  <CardDescription>Real-time navigation performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-body-sm text-muted-foreground">Total Navigations</p>
                      <p className="text-metric-value text-primary">{metrics.totalNavigations}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-body-sm text-muted-foreground">Avg Time</p>
                      <p className="text-metric-value text-primary">
                        {metrics.averageNavigationTime > 0 
                          ? formatDuration(metrics.averageNavigationTime)
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-body-sm text-muted-foreground">Error Rate</p>
                      <p className="text-metric-value text-destructive">
                        {((metrics.errorRate || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-body-sm text-muted-foreground">Fallback Usage</p>
                      <p className="text-metric-value text-warning">
                        {((metrics.fallbackUsage || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h4">Popular Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.popularRoutes).length > 0 ? (
                      Object.entries(metrics.popularRoutes)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([route, count]) => (
                          <div key={route} className="flex items-center justify-between">
                            <code className="text-body-sm bg-muted px-2 py-1 rounded">
                              {route}
                            </code>
                            <Badge variant="secondary">{count as number}</Badge>
                          </div>
                        ))
                    ) : (
                      <p className="text-body-sm text-muted-foreground">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="p-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h4">Recent Events</CardTitle>
                  <CardDescription>Last 20 navigation events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {recentEvents.length > 0 ? (
                        recentEvents
                          .sort((a, b) => b.timestamp - a.timestamp)
                          .map((event, index) => (
                            <div key={index} className="p-2 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                {getEventStatusIcon(event)}
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                                <code className="text-xs bg-background px-1 rounded">
                                  {event.route}
                                </code>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleTimeString()}
                                {event.duration && (
                                  <span className="ml-2">• {formatDuration(event.duration)}</span>
                                )}
                              </div>
                              {event.error && (
                                <p className="text-xs text-destructive mt-1">{event.error}</p>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="text-body-sm text-muted-foreground">No events recorded</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="state" className="p-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h4">Navigation State</CardTitle>
                  <CardDescription>Current application navigation state</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">Current Route</span>
                      <code className="text-body-sm bg-muted px-2 py-1 rounded">
                        {currentState.currentRoute}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">Previous Route</span>
                      <code className="text-body-sm bg-muted px-2 py-1 rounded">
                        {currentState.previousRoute || 'None'}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">Is Navigating</span>
                            <Badge variant={currentState.isNavigating ? "destructive" : "secondary"}>
                        {currentState.isNavigating ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">Offline Mode</span>
                      <Badge variant={currentState.offlineMode ? "destructive" : "secondary"}>
                        {currentState.offlineMode ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-body-sm font-medium mb-2">Navigation History</p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {currentState.navigationHistory.map((route, index) => (
                          <div 
                            key={index} 
                            className={`text-xs p-1 rounded ${
                              index === currentState.navigationHistory.length - 1 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted'
                            }`}
                          >
                            <code>{route}</code>
                            {index === currentState.navigationHistory.length - 1 && (
                              <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {currentState.failedNavigations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-body-sm font-medium mb-2 text-destructive">Failed Navigations</p>
                        <div className="space-y-1">
                          {currentState.failedNavigations.map((route, index) => (
                            <code key={index} className="text-xs bg-destructive/10 text-destructive p-1 rounded block">
                              {route}
                            </code>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};