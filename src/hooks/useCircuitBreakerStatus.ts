/**
 * React Hook for Circuit Breaker Status and UI Integration
 * 
 * Provides real-time circuit breaker status updates and UI state management
 * for displaying service availability and degraded functionality warnings.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  CircuitState, 
  CircuitBreakerMetrics, 
  CircuitBreakerEvent,
  circuitBreakerRegistry 
} from '@/utils/circuitBreaker';
import { useToast } from '@/hooks/use-toast';

export interface ServiceStatus {
  name: string;
  state: CircuitState;
  isHealthy: boolean;
  metrics: CircuitBreakerMetrics;
  lastUpdated: number;
}

export interface CircuitBreakerStatusHook {
  services: ServiceStatus[];
  isAnyServiceDegraded: boolean;
  isDegradedMode: boolean;
  getServiceStatus: (serviceName: string) => ServiceStatus | null;
  healthScore: number;
  forceRefresh: () => void;
  resetAllCircuits: () => void;
}

/**
 * Hook to monitor circuit breaker status across all services
 */
export const useCircuitBreakerStatus = (): CircuitBreakerStatusHook => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { toast } = useToast();
  const notificationCooldown = useRef<Map<string, number>>(new Map());
  const NOTIFICATION_COOLDOWN_MS = 30000; // 30 seconds

  /**
   * Convert circuit breaker metrics to service status
   */
  const createServiceStatus = useCallback((name: string, metrics: CircuitBreakerMetrics): ServiceStatus => {
    return {
      name,
      state: metrics.state,
      isHealthy: metrics.state === CircuitState.CLOSED && metrics.successRate > 0.8,
      metrics,
      lastUpdated: Date.now(),
    };
  }, []);

  /**
   * Update service statuses from circuit breaker registry
   */
  const updateServiceStatuses = useCallback(() => {
    const allMetrics = circuitBreakerRegistry.getAllMetrics();
    const updatedServices = Object.entries(allMetrics).map(([name, metrics]) =>
      createServiceStatus(name, metrics)
    );
    
    setServices(updatedServices);
    setLastUpdate(Date.now());
  }, [createServiceStatus]);

  /**
   * Handle circuit breaker events and show notifications
   */
  const handleCircuitBreakerEvent = useCallback((event: CircuitBreakerEvent) => {
    const now = Date.now();
    const lastNotification = notificationCooldown.current.get(event.endpoint) || 0;
    
    // Only show notifications if cooldown period has passed
    if (now - lastNotification < NOTIFICATION_COOLDOWN_MS) {
      return;
    }

    switch (event.type) {
      case 'state_change':
        const { from, to } = event.details;
        
        if (to === CircuitState.OPEN) {
          toast({
            title: "Service Temporarily Unavailable",
            description: `${event.endpoint} service is experiencing issues. Using cached data where possible.`,
            variant: "destructive",
            duration: 5000,
          });
          notificationCooldown.current.set(event.endpoint, now);
        } else if (from === CircuitState.OPEN && to === CircuitState.CLOSED) {
          toast({
            title: "Service Recovered",
            description: `${event.endpoint} service is back online and functioning normally.`,
            variant: "default",
            duration: 3000,
          });
          notificationCooldown.current.set(event.endpoint, now);
        } else if (to === CircuitState.HALF_OPEN) {
          toast({
            title: "Service Recovery Testing",
            description: `Testing ${event.endpoint} service recovery. Limited functionality may be available.`,
            variant: "default",
            duration: 4000,
          });
          notificationCooldown.current.set(event.endpoint, now);
        }
        break;
        
      case 'failure':
        // Only notify on repeated failures to avoid spam
        break;
    }
    
    // Update status after event
    updateServiceStatuses();
  }, [toast, updateServiceStatuses]);

  /**
   * Subscribe to all circuit breaker events
   */
  useEffect(() => {
    const circuits = circuitBreakerRegistry.getAllCircuitBreakers();
    
    // Add event listeners to all circuits
    circuits.forEach(circuit => {
      circuit.addEventListener(handleCircuitBreakerEvent);
    });

    // Initial update
    updateServiceStatuses();

    // Set up periodic updates
    const interval = setInterval(updateServiceStatuses, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
      // Remove event listeners
      circuits.forEach(circuit => {
        circuit.removeEventListener(handleCircuitBreakerEvent);
      });
    };
  }, [handleCircuitBreakerEvent, updateServiceStatuses]);

  /**
   * Get status for a specific service
   */
  const getServiceStatus = useCallback((serviceName: string): ServiceStatus | null => {
    return services.find(service => service.name === serviceName) || null;
  }, [services]);

  /**
   * Calculate overall health score (0-100)
   */
  const healthScore = useMemo(() => {
    if (services.length === 0) return 100;
    
    const healthyCount = services.filter(service => service.isHealthy).length;
    return Math.round((healthyCount / services.length) * 100);
  }, [services]);

  /**
   * Check if any service is degraded
   */
  const isAnyServiceDegraded = useMemo(() => {
    return services.some(service => 
      service.state === CircuitState.OPEN || service.state === CircuitState.HALF_OPEN
    );
  }, [services]);

  /**
   * Check if we're in degraded mode (multiple services down or critical service down)
   */
  const isDegradedMode = useMemo(() => {
    const criticalServices = ['auth', 'orders', 'cart'];
    const degradedCount = services.filter(service => 
      service.state === CircuitState.OPEN
    ).length;
    
    const criticalServiceDown = services.some(service =>
      criticalServices.includes(service.name) && service.state === CircuitState.OPEN
    );
    
    return degradedCount >= 2 || criticalServiceDown;
  }, [services]);

  /**
   * Force refresh all circuit breaker statuses
   */
  const forceRefresh = useCallback(() => {
    updateServiceStatuses();
  }, [updateServiceStatuses]);

  /**
   * Reset all circuit breakers (for admin/debug purposes)
   */
  const resetAllCircuits = useCallback(() => {
    circuitBreakerRegistry.resetAll();
    updateServiceStatuses();
    
    toast({
      title: "Circuit Breakers Reset",
      description: "All circuit breakers have been reset to CLOSED state.",
      variant: "default",
      duration: 3000,
    });
  }, [toast, updateServiceStatuses]);

  return {
    services,
    isAnyServiceDegraded,
    isDegradedMode,
    getServiceStatus,
    healthScore,
    forceRefresh,
    resetAllCircuits,
  };
};

/**
 * Hook to monitor specific service status
 */
export const useServiceStatus = (serviceName: string) => {
  const { getServiceStatus } = useCircuitBreakerStatus();
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  
  useEffect(() => {
    const updateStatus = () => {
      setStatus(getServiceStatus(serviceName));
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [serviceName, getServiceStatus]);
  
  return status;
};

/**
 * Hook for circuit breaker health dashboard
 */
export const useCircuitBreakerDashboard = () => {
  const circuitBreakerStatus = useCircuitBreakerStatus();
  const [isVisible, setIsVisible] = useState(false);
  
  // Show dashboard if any service is degraded and we're in development
  useEffect(() => {
    const shouldShow = import.meta.env.DEV && circuitBreakerStatus.isAnyServiceDegraded;
    setIsVisible(shouldShow);
  }, [circuitBreakerStatus.isAnyServiceDegraded]);
  
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);
  
  return {
    ...circuitBreakerStatus,
    isVisible,
    toggleVisibility,
  };
};

import { useMemo } from 'react';