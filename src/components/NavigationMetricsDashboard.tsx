/**
 * Navigation Metrics Dashboard Component
 * Displays real-time navigation performance metrics and success indicators
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigationMonitor } from '@/utils/navigationMonitor';
import { CheckCircle, AlertTriangle, XCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface MetricThresholds {
  errorRate: {
    good: number;
    warning: number;
  };
  fallbackUsage: {
    good: number;
    warning: number;
  };
  avgNavigationTime: {
    good: number;
    warning: number;
  };
}

const THRESHOLDS: MetricThresholds = {
  errorRate: { good: 0.005, warning: 0.01 }, // 0.5% good, 1% warning
  fallbackUsage: { good: 0.05, warning: 0.1 }, // 5% good, 10% warning
  avgNavigationTime: { good: 1000, warning: 2000 }, // 1s good, 2s warning
};

const NavigationMetricsDashboard: React.FC = () => {
  const { getMetrics, getRecentEvents } = useNavigationMonitor();
  const [metrics, setMetrics] = useState(getMetrics());
  const [recentEvents, setRecentEvents] = useState(getRecentEvents(20));
  const [previousMetrics, setPreviousMetrics] = useState(metrics);

  // Update metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousMetrics(metrics);
      const newMetrics = getMetrics();
      setMetrics(newMetrics);
      setRecentEvents(getRecentEvents(20));
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics, getRecentEvents, metrics]);

  const getMetricStatus = (value: number, type: keyof MetricThresholds) => {
    const threshold = THRESHOLDS[type];
    
    if (type === 'avgNavigationTime') {
      if (value <= threshold.good) return 'good';
      if (value <= threshold.warning) return 'warning';
      return 'critical';
    } else {
      if (value <= threshold.good) return 'good';
      if (value <= threshold.warning) return 'warning';
      return 'critical';
    }
  };

  const getTrend = (current: number, previous: number) => {
    if (current === previous) return 'stable';
    return current < previous ? 'improving' : 'declining';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const errorRateStatus = getMetricStatus(metrics.errorRate, 'errorRate');
  const fallbackStatus = getMetricStatus(metrics.fallbackUsage, 'fallbackUsage');
  const avgTimeStatus = getMetricStatus(metrics.averageNavigationTime, 'avgNavigationTime');

  const errorRateTrend = getTrend(metrics.errorRate, previousMetrics.errorRate);
  const fallbackTrend = getTrend(metrics.fallbackUsage, previousMetrics.fallbackUsage);
  const avgTimeTrend = getTrend(metrics.averageNavigationTime, previousMetrics.averageNavigationTime);

  const overallStatus = [errorRateStatus, fallbackStatus, avgTimeStatus].includes('critical') 
    ? 'critical' 
    : [errorRateStatus, fallbackStatus, avgTimeStatus].includes('warning')
    ? 'warning'
    : 'good';

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Alert variant={overallStatus === 'critical' ? 'destructive' : 'default'}>
        <div className="flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          <AlertDescription>
            {overallStatus === 'good' && 'Navigation performance is healthy'}
            {overallStatus === 'warning' && 'Navigation performance needs attention'}
            {overallStatus === 'critical' && 'Navigation performance requires immediate attention'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Error Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <div className="flex items-center gap-1">
              {getStatusIcon(errorRateStatus)}
              {getTrendIcon(errorRateTrend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.errorRate)}</div>
            <CardDescription>
              Target: &lt; {formatPercentage(THRESHOLDS.errorRate.good)}
            </CardDescription>
            <Progress 
              value={Math.min((metrics.errorRate / THRESHOLDS.errorRate.warning) * 100, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Fallback Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback Usage</CardTitle>
            <div className="flex items-center gap-1">
              {getStatusIcon(fallbackStatus)}
              {getTrendIcon(fallbackTrend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.fallbackUsage)}</div>
            <CardDescription>
              Target: &lt; {formatPercentage(THRESHOLDS.fallbackUsage.good)}
            </CardDescription>
            <Progress 
              value={Math.min((metrics.fallbackUsage / THRESHOLDS.fallbackUsage.warning) * 100, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Average Navigation Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Navigation Time</CardTitle>
            <div className="flex items-center gap-1">
              {getStatusIcon(avgTimeStatus)}
              {getTrendIcon(avgTimeTrend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.averageNavigationTime)}</div>
            <CardDescription>
              Target: &lt; {formatDuration(THRESHOLDS.avgNavigationTime.good)}
            </CardDescription>
            <Progress 
              value={Math.min((metrics.averageNavigationTime / THRESHOLDS.avgNavigationTime.warning) * 100, 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Navigation Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Navigations:</span>
              <Badge variant="secondary">{metrics.totalNavigations}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Error Count:</span>
              <Badge variant={errorRateStatus === 'good' ? 'secondary' : 'destructive'}>
                {Math.round(metrics.errorRate * metrics.totalNavigations)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Fallback Count:</span>
              <Badge variant={fallbackStatus === 'good' ? 'secondary' : 'outline'}>
                {Math.round(metrics.fallbackUsage * metrics.totalNavigations)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.popularRoutes)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([route, count]) => (
                  <div key={route} className="flex justify-between items-center">
                    <span className="text-sm font-mono">{route}</span>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Navigation Events</CardTitle>
          <CardDescription>Last 20 navigation events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      event.type === 'error' ? 'destructive' :
                      event.type === 'fallback' ? 'outline' : 'secondary'
                    }
                  >
                    {event.type}
                  </Badge>
                  <span className="font-mono">{event.route}</span>
                </div>
                <div className="flex items-center gap-2">
                  {event.duration && (
                    <span className="text-muted-foreground">
                      {formatDuration(event.duration)}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationMetricsDashboard;