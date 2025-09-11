/**
 * Performance Monitor Component
 * 
 * Real-time performance monitoring and optimization suggestions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemoryManager } from '@/hooks/useMemoryManager';
import { usePerformanceOptimizer } from '@/hooks/usePerformanceOptimizer';
import { useOfflineAnalytics } from '@/utils/offlineAnalytics';
import { Separator } from '@/components/ui/separator';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible = false,
  onToggle,
}) => {
  const { getMemoryMetrics, performMemoryCleanup, currentMetrics } = useMemoryManager();
  const { getMetrics, getOptimizationSuggestions } = usePerformanceOptimizer();
  const { getAnalyticsSummary } = useOfflineAnalytics();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [offlineMetrics, setOfflineMetrics] = useState<any>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const memoryMetrics = getMemoryMetrics();
      const perfMetrics = getMetrics();
      const optimizationSuggestions = getOptimizationSuggestions();
      const analyticsSummary = getAnalyticsSummary();

      setPerformanceData({
        memory: memoryMetrics,
        performance: perfMetrics,
      });
      setOfflineMetrics(analyticsSummary);
      setSuggestions(optimizationSuggestions);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible, getMemoryMetrics, getMetrics, getOptimizationSuggestions]);

  const handleCleanup = () => {
    performMemoryCleanup(true);
    // Refresh metrics after cleanup
    setTimeout(() => {
      const memoryMetrics = getMemoryMetrics();
      const perfMetrics = getMetrics();
      setPerformanceData({
        memory: memoryMetrics,
        performance: perfMetrics,
      });
    }, 1000);
  };

  if (!isVisible || import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-3">
        {/* Memory Metrics */}
        {performanceData?.memory && (
          <div>
            <h4 className="font-medium mb-1">Memory Usage</h4>
            <div className="space-y-1">
              {performanceData.memory.usagePercentage && (
                <div className="flex justify-between">
                  <span>Heap Usage:</span>
                  <Badge 
                    variant={performanceData.memory.usagePercentage > 80 ? 'destructive' : 'secondary'}
                  >
                    {performanceData.memory.usagePercentage.toFixed(1)}%
                  </Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cache Size:</span>
                <span>{performanceData.memory.cacheSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Query Count:</span>
                <span>{performanceData.memory.queryCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performanceData?.performance && (
          <div>
            <h4 className="font-medium mb-1">Performance</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Page Load:</span>
                <span>{performanceData.performance.pageLoadTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Render Time:</span>
                <span>{performanceData.performance.renderTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Hit Rate:</span>
                <span>{(performanceData.performance.cacheHitRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Offline Performance */}
        {offlineMetrics && (
          <div>
            <h4 className="font-medium mb-1">Offline Performance</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Cache Hit Rate:</span>
                <Badge variant={offlineMetrics.cacheHitRate > 0.8 ? 'default' : 'secondary'}>
                  {(offlineMetrics.cacheHitRate * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Queued Events:</span>
                <span>{offlineMetrics.queuedEvents}</span>
              </div>
              <div className="flex justify-between">
                <span>Offline Navigations:</span>
                <span>{offlineMetrics.metrics?.offlineNavigations || 0}</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Optimization Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-1">Suggestions</h4>
            <ul className="space-y-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-muted-foreground">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t">
          <Button size="sm" onClick={handleCleanup} className="w-full">
            Clean Up Memory
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};