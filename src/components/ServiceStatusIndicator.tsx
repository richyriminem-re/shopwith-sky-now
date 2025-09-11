/**
 * Service Status Indicator Component
 * 
 * Shows service health status in the UI with visual indicators
 * for when services are degraded or experiencing issues.
 */

import React from 'react';
import { useCircuitBreakerStatus } from '@/hooks/useCircuitBreakerStatus';
import { CircuitState } from '@/utils/circuitBreaker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  Info,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface ServiceStatusIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const ServiceStatusIndicator: React.FC<ServiceStatusIndicatorProps> = ({
  showDetails = false,
  compact = false,
  className = ''
}) => {
  const { 
    isAnyServiceDegraded, 
    isDegradedMode, 
    services, 
    healthScore,
    forceRefresh
  } = useCircuitBreakerStatus();

  // Don't show anything if all services are healthy
  if (!isAnyServiceDegraded && !compact) {
    return null;
  }

  const degradedServices = services.filter(s => 
    s.state === CircuitState.OPEN || s.state === CircuitState.HALF_OPEN
  );

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {isAnyServiceDegraded ? (
            <WifiOff className="h-4 w-4 text-warning" />
          ) : (
            <Wifi className="h-4 w-4 text-success" />
          )}
          <span className="text-sm font-medium">
            {healthScore}%
          </span>
        </div>
        
        {isAnyServiceDegraded && (
          <Badge variant="outline" className="text-xs">
            {degradedServices.length} service{degradedServices.length !== 1 ? 's' : ''} degraded
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Degraded Mode Alert */}
      {isDegradedMode && (
        <Alert className="mb-4 border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Service Disruption:</strong> Some features may be limited due to service issues.
                We're using cached data where possible.
              </div>
              <Button 
                onClick={forceRefresh} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Partial Service Issues */}
      {isAnyServiceDegraded && !isDegradedMode && (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                Some services are experiencing delays. 
                {degradedServices.length === 1 
                  ? ` ${degradedServices[0].name.charAt(0).toUpperCase() + degradedServices[0].name.slice(1)} service` 
                  : ` ${degradedServices.length} services`
                } may be slower than usual.
              </div>
              <Button 
                onClick={forceRefresh} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Service Status */}
      {showDetails && degradedServices.length > 0 && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Service Status Details:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {degradedServices.map(service => (
                  <div key={service.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm capitalize">{service.name}</span>
                    <Badge 
                      variant={service.state === CircuitState.OPEN ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {service.state === CircuitState.OPEN ? 'Down' : 'Testing'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ServiceStatusIndicator;