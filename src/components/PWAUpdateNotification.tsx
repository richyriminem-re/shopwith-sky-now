import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createSoftRefresh } from '@/utils/softRefresh';

interface PWAUpdateNotificationProps {
  onUpdateReady?: () => void;
}

export const PWAUpdateNotification = ({ onUpdateReady }: PWAUpdateNotificationProps) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      // Listen for update events from the service worker
      const handleUpdateFound = (reg: ServiceWorkerRegistration) => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              setRegistration(reg);
              showUpdateNotification();
            }
          });
        }
      };

      // Get existing registration or wait for it
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.addEventListener('updatefound', () => handleUpdateFound(reg));
          // Check if update is already available
          if (reg.waiting) {
            setUpdateAvailable(true);
            setRegistration(reg);
            showUpdateNotification();
          }
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
          showUpdateNotification();
        }
      });
    }
  }, []);

  const showUpdateNotification = () => {
    if (updateAvailable) return; // Prevent duplicate notifications

    toast(
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">New version available!</div>
            <div className="text-sm text-muted-foreground">
              Update to get the latest features and improvements.
            </div>
          </div>
        </div>
      </div>,
      {
        duration: Infinity,
        action: {
          label: 'Update Now',
          onClick: handleUpdate,
        },
        cancel: {
          label: 'Later',
          onClick: () => {
            setUpdateAvailable(false);
          },
        },
        onDismiss: () => {
          setUpdateAvailable(false);
        },
      }
    );
  };

  const handleUpdate = () => {
    const softRefresh = createSoftRefresh(navigate);
    
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the controlling change and use soft refresh
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        softRefresh({ clearCaches: true, reason: 'sw_update' });
      });
    } else {
      // Fallback: use soft refresh
      softRefresh({ clearCaches: true, reason: 'sw_update_fallback' });
    }
    
    onUpdateReady?.();
  };

  return null; // This component doesn't render anything visible
};