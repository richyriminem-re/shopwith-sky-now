/**
 * Advanced Cache Analytics Dashboard
 * 
 * Comprehensive monitoring and visualization of cache performance
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCacheOptimization } from '@/hooks/useCacheOptimization';
import { useSoftRefresh } from '@/utils/softRefresh';
import { cn } from '@/lib/utils';

interface AnalyticsDashboardProps {
  className?: string;
  showInProduction?: boolean;
}

export function CacheAnalyticsDashboard({ className, showInProduction = false }: AnalyticsDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { analytics, getCacheStats, invalidateByPattern, smartRefresh, warmCache } = useCacheOptimization();

  // Only show in development unless explicitly enabled for production
  useEffect(() => {
    if (import.meta.env.DEV || showInProduction) {
      setIsVisible(true);
    }
  }, [showInProduction]);

  if (!isVisible || !analytics) {
    return null;
  }

  const { queryCacheStats, customCacheStats, behaviorPatterns, performanceImpact } = analytics;

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'success';
    if (value >= thresholds.warning) return 'warning';
    return 'destructive';
  };

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle>Cache Analytics Dashboard</CardTitle>
        <CardDescription>
          Real-time monitoring of cache performance and optimization insights
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{customCacheStats.hitRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
                  <Progress value={customCacheStats.hitRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{customCacheStats.totalEntries}</div>
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                  <div className="text-xs mt-1">
                    React: {queryCacheStats.size} | Custom: {customCacheStats.totalEntries - queryCacheStats.size}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{customCacheStats.memoryUsage.toFixed(1)}MB</div>
                  <p className="text-xs text-muted-foreground">Memory Usage</p>
                  <Progress value={customCacheStats.memoryUsage * 2} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{customCacheStats.performanceGain.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Performance Gain</p>
                  <Badge variant={getStatusColor(customCacheStats.performanceGain, { good: 5, warning: 2 }) as any}>
                    {customCacheStats.performanceGain > 5 ? 'Excellent' : customCacheStats.performanceGain > 2 ? 'Good' : 'Poor'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">React Query Cache</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Queries</span>
                    <span className="font-medium">{queryCacheStats.activeQueries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stale Queries</span>
                    <span className="font-medium">{queryCacheStats.staleQueries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Size</span>
                    <span className="font-medium">{queryCacheStats.size}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Custom Cache</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compression Ratio</span>
                    <span className="font-medium">{(customCacheStats.compressionRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Miss Rate</span>
                    <span className="font-medium">{customCacheStats.missRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span className="font-medium">{customCacheStats.localStorageUsage.toFixed(1)}MB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-xl font-bold">{performanceImpact.averageLoadTime.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">Average Load Time</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xl font-bold">{performanceImpact.cacheHitLatency.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">Cache Hit Latency</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xl font-bold">{performanceImpact.cacheMissLatency.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">Cache Miss Latency</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {customCacheStats.hitRate > 70 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Excellent cache hit rate - system is well optimized</span>
                    </div>
                  )}
                  {customCacheStats.compressionRatio > 0.3 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>High compression ratio - saving significant storage</span>
                    </div>
                  )}
                  {queryCacheStats.staleQueries > queryCacheStats.size * 0.3 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Many stale queries - consider background refresh</span>
                    </div>
                  )}
                  {customCacheStats.memoryUsage > 50 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>High memory usage - cleanup recommended</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Behavior Patterns</CardTitle>
                <CardDescription className="text-xs">
                  Most accessed cache patterns based on user behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(behaviorPatterns)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([pattern, count]) => (
                      <div key={pattern} className="flex justify-between items-center text-sm">
                        <span className="font-mono text-xs">{pattern}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => invalidateByPattern('products')}
              >
                Clear Products
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => invalidateByPattern('cart')}
              >
                Clear Cart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => invalidateByPattern('user')}
              >
                Clear User
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => smartRefresh()}
              >
                Smart Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="default"
                onClick={() => warmCache({ action: 'manual_warmup' })}
              >
                Warm Cache
              </Button>
               <Button
                 variant="destructive"
                 onClick={() => {
                   invalidateByPattern('');
                   // Use soft refresh instead of hard reload
                   const softRefresh = useSoftRefresh((path, options) => {
                     window.history.replaceState(null, '', path);
                   });
                   softRefresh({ clearCaches: true, reason: 'manual_clear_all' });
                 }}
               >
                 Clear All & Refresh
               </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}