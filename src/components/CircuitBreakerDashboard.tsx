/**
 * Circuit Breaker Dashboard Component
 * 
 * Visual monitoring dashboard for circuit breaker status and health metrics.
 * Shows in development mode when services are degraded.
 */

import React from 'react';
import { useCircuitBreakerDashboard } from '@/hooks/useCircuitBreakerStatus';
import { CircuitState } from '@/utils/circuitBreaker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

const CircuitBreakerDashboard: React.FC = () => {
  const {
    services,
    healthScore,
    isAnyServiceDegraded,
    isDegradedMode,
    forceRefresh,
    resetAllCircuits,
    isVisible,
    toggleVisibility,
  } = useCircuitBreakerDashboard();

  // Don't render if not in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const getStateIcon = (state: CircuitState) => {
    switch (state) {
      case CircuitState.CLOSED:
        return <CheckCircle className="h-4 w-4 text-success" />;
      case CircuitState.OPEN:
        return <XCircle className="h-4 w-4 text-destructive" />;
      case CircuitState.HALF_OPEN:
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStateBadgeVariant = (state: CircuitState) => {
    switch (state) {
      case CircuitState.CLOSED:
        return 'default';
      case CircuitState.OPEN:
        return 'destructive';
      case CircuitState.HALF_OPEN:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {/* Toggle Button */}
      <Button
        onClick={toggleVisibility}
        variant="outline"
        size="sm"
        className="mb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <Activity className="h-4 w-4 mr-1" />
        Circuit Breaker Status
        {isVisible ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
      </Button>

      {/* Dashboard Panel */}
      <Collapsible open={isVisible} onOpenChange={toggleVisibility}>
        <CollapsibleContent>
          <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    API Health Monitor
                  </CardTitle>
                  <CardDescription>
                    Circuit Breaker Status Dashboard
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Health Score</div>
                </div>
              </div>

              {/* Overall Status Indicators */}
              <div className="flex gap-2 mt-3">
                {isDegradedMode && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Degraded Mode
                  </Badge>
                )}
                {isAnyServiceDegraded && !isDegradedMode && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Service Issues
                  </Badge>
                )}
                {!isAnyServiceDegraded && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    All Systems Normal
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Health Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>System Health</span>
                  <span className={getHealthScoreColor(healthScore)}>
                    {healthScore}%
                  </span>
                </div>
                <Progress 
                  value={healthScore} 
                  className="h-2"
                />
              </div>

              {/* Services List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {services.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No services monitored yet
                  </div>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between p-2 rounded-lg border bg-card/50"
                    >
                      <div className="flex items-center gap-2">
                        {getStateIcon(service.state)}
                        <div>
                          <div className="font-medium text-sm capitalize">
                            {service.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Success Rate: {Math.round(service.metrics.successRate * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge 
                          variant={getStateBadgeVariant(service.state)}
                          className="text-xs mb-1"
                        >
                          {service.state}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {service.metrics.failures > 0 && (
                            <span className="text-destructive">
                              {service.metrics.failures} failures
                            </span>
                          )}
                          {service.metrics.failures === 0 && (
                            <span className="text-success">
                              {service.metrics.totalRequests} requests
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button 
                  onClick={forceRefresh} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button 
                  onClick={resetAllCircuits} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  Reset All
                </Button>
              </div>

              {/* Dev Notice */}
              <div className="mt-3 text-xs text-muted-foreground text-center border-t pt-2">
                Development Mode Only
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CircuitBreakerDashboard;