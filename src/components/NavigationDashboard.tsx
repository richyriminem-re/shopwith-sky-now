import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, BarChart3, Clock, Home, RefreshCw, TrendingUp } from 'lucide-react';

/**
 * Navigation analytics dashboard component for development and debugging
 */
const NavigationDashboard = () => {
  const { getMetrics, getRecentEvents, exportMetrics } = useNavigationMonitor();
  
  const metrics = getMetrics();
  const recentEvents = getRecentEvents(20);

  const handleExportMetrics = () => {
    const data = exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navigation-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'navigation': return 'bg-blue-100 text-blue-800';
      case 'back_button': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'fallback': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Navigation Analytics</h2>
          <p className="text-muted-foreground">
            Monitor navigation performance, errors, and user patterns
          </p>
        </div>
        <Button onClick={handleExportMetrics} variant="outline">
          Export Metrics
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="routes">Route Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Navigations</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalNavigations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Navigation Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(metrics.averageNavigationTime)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(Number(metrics.errorRate) * 100).toFixed(1)}%
                </div>
                <Progress value={Number(metrics.errorRate) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fallback Usage</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(Number(metrics.fallbackUsage) * 100).toFixed(1)}%
                </div>
                <Progress value={Number(metrics.fallbackUsage) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Navigation Events</CardTitle>
              <CardDescription>
                Last {recentEvents.length} navigation events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentEvents.length === 0 ? (
                  <p className="text-muted-foreground">No navigation events recorded yet.</p>
                ) : (
                  recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <span className="font-mono text-sm">{event.route}</span>
                        {event.duration && (
                          <span className="text-muted-foreground text-sm">
                            {formatDuration(event.duration)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Routes</CardTitle>
                <CardDescription>Most visited navigation destinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.popularRoutes)
                    .sort(([,a], [,b]) => (Number(b) - Number(a)))
                    .slice(0, 10)
                    .map(([route, count]) => (
                      <div key={route} className="flex items-center justify-between">
                        <span className="font-mono text-sm">{route}</span>
                        <Badge variant="secondary">{String(count)}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Routes</CardTitle>
                <CardDescription>Routes with navigation errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.errorsByRoute).length === 0 ? (
                    <p className="text-muted-foreground">No navigation errors recorded.</p>
                  ) : (
                    Object.entries(metrics.errorsByRoute)
                      .sort(([,a], [,b]) => (Number(b) - Number(a)))
                      .map(([route, count]) => (
                        <div key={route} className="flex items-center justify-between">
                          <span className="font-mono text-sm">{route}</span>
                          <Badge variant="destructive">{String(count)}</Badge>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NavigationDashboard;