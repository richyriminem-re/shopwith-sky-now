/**
 * Request Deduplication Performance Monitor
 * 
 * Development tool for monitoring deduplication metrics and performance
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDeduplicationMetrics, useRequestQueue } from '@/hooks/useApiWithAbort';
import { cn } from '@/lib/utils';

interface MonitorProps {
  className?: string;
  showInProduction?: boolean;
}

export function RequestDeduplicationMonitor({ className, showInProduction = false }: MonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = useDeduplicationMetrics();
  const { clearCache, invalidateByPattern, warmUpCache } = useRequestQueue();

  // Only show in development unless explicitly enabled for production
  useEffect(() => {
    if (import.meta.env.DEV || showInProduction) {
      setIsVisible(true);
    }
  }, [showInProduction]);

  if (!isVisible) {
    return null;
  }

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 70) return 'success';
    if (hitRate >= 40) return 'warning';
    return 'destructive';
  };

  const getMemoryUsageColor = (usage: number) => {
    if (usage < 20) return 'success';
    if (usage < 40) return 'warning';
    return 'destructive';
  };

  return (
    <Card className={cn('fixed bottom-4 right-4 w-80 shadow-lg z-50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Request Deduplication</CardTitle>
        <CardDescription className="text-xs">
          Performance monitoring & cache management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hit Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">Hit Rate</span>
            <Badge variant={getHitRateColor(metrics.hitRate) as any} className="text-xs">
              {metrics.hitRate.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={metrics.hitRate} className="h-1" />
        </div>

        {/* Request Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Total</div>
            <div className="font-medium">{metrics.totalRequests}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Deduplicated</div>
            <div className="font-medium text-green-600">{metrics.deduplicatedRequests}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Cache Size</div>
            <div className="font-medium">{metrics.cacheSize}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Avg Response</div>
            <div className="font-medium">{metrics.averageResponseTime.toFixed(0)}ms</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">Memory Usage</span>
            <Badge variant={getMemoryUsageColor(metrics.memoryUsage) as any} className="text-xs">
              {metrics.memoryUsage.toFixed(1)} MB
            </Badge>
          </div>
          <Progress value={Math.min(metrics.memoryUsage * 2, 100)} className="h-1" />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={clearCache}
            className="text-xs flex-1"
          >
            Clear Cache
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={warmUpCache}
            className="text-xs flex-1"
          >
            Warm Up
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => invalidateByPattern('/api/products')}
              className="text-xs p-1 h-6"
            >
              Products
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => invalidateByPattern('/api/cart')}
              className="text-xs p-1 h-6"
            >
              Cart
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => invalidateByPattern('/api/user')}
              className="text-xs p-1 h-6"
            >
              User
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}