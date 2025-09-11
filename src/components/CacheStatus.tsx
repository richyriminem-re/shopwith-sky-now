/**
 * Cache Status Component
 * 
 * Shows cache performance and provides manual cache controls for debugging
 */

import { useState, useEffect } from 'react';
import { useCacheOptimization } from '@/hooks/useCacheOptimization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CacheStats {
  react: number;
  custom: {
    memoryUsage: number;
    localStorageUsage: number;
    hitRate: number;
    missRate: number;
    compressionRatio: number;
    totalEntries: number;
    performanceGain: number;
  };
}

const CacheStatus = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const { getCacheStats, invalidateAllCache, warmCache } = useCacheOptimization();

  useEffect(() => {
    // Show cache status only with debug flag
    const hasDebugFlag = new URLSearchParams(window.location.search).has('debug');
    setIsVisible(hasDebugFlag);

    if (hasDebugFlag) {
      const updateStats = () => {
        const cacheStats = getCacheStats();
        setStats(cacheStats);
      };

      updateStats();
      const interval = setInterval(updateStats, 5000);
      return () => clearInterval(interval);
    }
  }, [getCacheStats]);

  const handleWarmUp = () => {
    warmCache({ action: 'manual_warmup' });
    setTimeout(() => {
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    }, 1000);
  };

  if (!isVisible || !stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Cache Status
            <Badge variant="outline" className="text-xs">Debug</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>React Queries:</span>
              <span className="font-mono">{stats.react}</span>
            </div>
            <div className="flex justify-between">
              <span>Hit Rate:</span>
              <span className="font-mono text-green-600">{stats.custom.hitRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className="font-mono">{stats.custom.memoryUsage.toFixed(1)}MB</span>
            </div>
            <div className="flex justify-between">
              <span>Performance:</span>
              <span className="font-mono">{stats.custom.performanceGain.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="flex gap-1 pt-2">
            <Button size="sm" variant="outline" onClick={handleWarmUp} className="text-xs flex-1">
              Warm Up
            </Button>
            <Button size="sm" variant="outline" onClick={invalidateAllCache} className="text-xs flex-1">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheStatus;