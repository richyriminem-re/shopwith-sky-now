import React, { useState, useEffect } from 'react';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  X,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetricsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  route?: string;
}

/**
 * Real-time performance metrics dashboard for navigation system
 */
export const PerformanceMetricsDashboard: React.FC<PerformanceMetricsDashboardProps> = ({
  isVisible,
  onClose
}) => {
  const { getMetrics, getRecentEvents, exportMetrics } = useNavigationMonitor();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastMetrics, setLastMetrics] = useState(getMetrics());

  // Auto-refresh and performance monitoring
  useEffect(() => {
    if (!isVisible || !import.meta.env.DEV) return;

    const interval = setInterval(() => {
      const currentMetrics = getMetrics();
      checkForPerformanceAlerts(currentMetrics);
      setLastMetrics(currentMetrics);
      setRefreshKey(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const checkForPerformanceAlerts = (metrics: any) => {
    const newAlerts: PerformanceAlert[] = [];

    // Check for slow navigation
    if (metrics.averageNavigationTime > 1000) {
      newAlerts.push({
        id: `slow-nav-${Date.now()}`,
        type: 'warning',
        message: `Slow navigation detected: ${metrics.averageNavigationTime.toFixed(0)}ms average`,
        timestamp: Date.now()
      });
    }

    // Check for high error rate
    if (metrics.errorRate > 0.1) {
      newAlerts.push({
        id: `high-error-${Date.now()}`,
        type: 'error',
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
        timestamp: Date.now()
      });
    }

    // Check for frequent fallbacks
    if (metrics.fallbackUsage > 0.2) {
      newAlerts.push({
        id: `high-fallback-${Date.now()}`,
        type: 'warning',
        message: `High fallback usage: ${(metrics.fallbackUsage * 100).toFixed(1)}%`,
        timestamp: Date.now()
      });
    }

    // Add alerts and keep only recent ones
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-10));
    }
  };

  const handleExportMetrics = () => {
    const data = exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `navigation-metrics-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible || !import.meta.env.DEV) return null;

  const metrics = getMetrics();
  const recentEvents = getRecentEvents(50);

  // Calculate performance scores
  const performanceScore = Math.max(0, Math.min(100, 
    100 - (metrics.errorRate * 50) - (metrics.fallbackUsage * 30) - 
    Math.max(0, (metrics.averageNavigationTime - 500) / 10)
  ));

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-4 top-4 bottom-4 w-80 bg-card border border-border shadow-elevation-4 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-h4">Performance</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExportMetrics}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-full pb-16">
          <div className="p-4 space-y-4">
            {/* Performance Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-h4">Performance Score</CardTitle>
                <CardDescription>Overall navigation system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${getPerformanceColor(performanceScore)}`}>
                    {performanceScore.toFixed(0)}
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={performanceScore} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-h4">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-body-sm">Avg Navigation Time</span>
                  </div>
                  <Badge variant={(metrics.averageNavigationTime || 0) > 1000 ? "destructive" : "secondary"}>
                    {(metrics.averageNavigationTime || 0) > 0 
                      ? `${(metrics.averageNavigationTime || 0).toFixed(0)}ms`
                      : 'N/A'
                    }
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-body-sm">Success Rate</span>
                  </div>
                  <Badge variant={(metrics.errorRate || 0) < 0.05 ? "secondary" : "destructive"}>
                    {((1 - (metrics.errorRate || 0)) * 100).toFixed(1)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-body-sm">Total Events</span>
                  </div>
                  <Badge variant="outline">
                    {recentEvents.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Alerts */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Performance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alerts.slice(-5).reverse().map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-2 rounded-lg border ${
                          alert.type === 'error' 
                            ? 'bg-destructive/10 border-destructive/20 text-destructive'
                            : alert.type === 'warning'
                            ? 'bg-warning/10 border-warning/20 text-warning'
                            : 'bg-info/10 border-info/20 text-info'
                        }`}
                      >
                        <p className="text-xs font-medium">{alert.message}</p>
                        <p className="text-xs opacity-70">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Route Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-h4">Route Performance</CardTitle>
                <CardDescription>Navigation frequency by route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.popularRoutes).length > 0 ? (
                    Object.entries(metrics.popularRoutes)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 6)
                      .map(([route, count]) => {
                        const percentage = ((count as number) / (metrics.totalNavigations || 1)) * 100;
                        return (
                          <div key={route} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <code className="bg-muted px-1 rounded">{route}</code>
                              <span className="text-muted-foreground">{count as number} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-1" />
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-body-sm text-muted-foreground">No route data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Routes */}
            {Object.keys(metrics.errorsByRoute).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-h4 text-destructive">Error Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(metrics.errorsByRoute).map(([route, count]) => (
                      <div key={route} className="flex items-center justify-between text-xs">
                        <code className="bg-destructive/10 text-destructive px-1 rounded">{route}</code>
                        <Badge variant="destructive" className="text-xs">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
