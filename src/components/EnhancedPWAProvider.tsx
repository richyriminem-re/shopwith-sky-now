/**
 * Enhanced PWA Provider
 * Integrates all PWA enhancements including offline analytics, performance monitoring, and background sync
 */

import React, { useEffect, ReactNode } from 'react';
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification';
import { OfflinePerformanceMonitor } from '@/components/OfflinePerformanceMonitor';
import { useOfflineAnalytics } from '@/utils/offlineAnalytics';
import { useServiceWorkerComm } from '@/utils/serviceWorkerCommunication';
import { useBackgroundSync } from '@/utils/backgroundSync';
import { pwaManager } from '@/utils/pwaManager';

interface EnhancedPWAProviderProps {
  children: ReactNode;
  enablePerformanceMonitor?: boolean;
  enableOfflineAnalytics?: boolean;
  enableBackgroundSync?: boolean;
}

export const EnhancedPWAProvider: React.FC<EnhancedPWAProviderProps> = ({
  children,
  enablePerformanceMonitor = import.meta.env.DEV,
  enableOfflineAnalytics = true,
  enableBackgroundSync = true
}) => {
  const { trackNetworkTransition, onSync } = useOfflineAnalytics();
  const { notifyNavigationAttempt } = useServiceWorkerComm();
  const { registerSyncHandler, processQueue } = useBackgroundSync();
  const [showPerformanceMonitor, setShowPerformanceMonitor] = React.useState(false);

  useEffect(() => {
    // Initialize PWA manager
    pwaManager.register();

    // Set up offline analytics sync
    if (enableOfflineAnalytics) {
      onSync(async (events) => {
        // In a real app, send to your analytics service
        console.log('Syncing analytics events:', events.length);
        
        // Simulate API call
        if (navigator.onLine) {
          try {
            // await fetch('/api/analytics', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ events })
            // });
            return true;
          } catch (error) {
            console.error('Analytics sync failed:', error);
            return false;
          }
        }
        return false;
      });
    }

    // Set up background sync handlers
    if (enableBackgroundSync) {
      // Form submission handler
      registerSyncHandler('form_submit', async (data) => {
        try {
          // await fetch('/api/forms', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data)
          // });
          console.log('Form submitted via background sync:', data.formId);
          return true;
        } catch (error) {
          console.error('Form sync failed:', error);
          return false;
        }
      });

      // Cart update handler
      registerSyncHandler('cart_update', async (data) => {
        try {
          // await fetch('/api/cart', {
          //   method: 'PUT',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data)
          // });
          console.log('Cart updated via background sync:', data.items?.length);
          return true;
        } catch (error) {
          console.error('Cart sync failed:', error);
          return false;
        }
      });
    }

    // Track network transitions
    const handleOnline = () => {
      trackNetworkTransition('offline', 'online');
      processQueue(); // Process queued actions when back online
    };

    const handleOffline = () => {
      trackNetworkTransition('online', 'offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Performance monitor keyboard shortcut (Ctrl/Cmd + Shift + P)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setShowPerformanceMonitor(prev => !prev);
      }
    };

    if (enablePerformanceMonitor) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableOfflineAnalytics, enableBackgroundSync, enablePerformanceMonitor, trackNetworkTransition, onSync, registerSyncHandler, processQueue]);

  return (
    <>
      {children}
      
      {/* PWA Update Notification */}
      <PWAUpdateNotification />
      
      {/* Performance Monitor (Dev mode or manual toggle) */}
      {enablePerformanceMonitor && (
        <OfflinePerformanceMonitor 
          isVisible={showPerformanceMonitor}
          onToggle={() => setShowPerformanceMonitor(false)}
        />
      )}
    </>
  );
};