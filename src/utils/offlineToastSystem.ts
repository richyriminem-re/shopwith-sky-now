/**
 * Offline-aware toast system with queue and retry mechanisms
 */

interface OfflineToast {
  id: string;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  timestamp: number;
  retries: number;
}

interface ToastSystem {
  show: (toast: Omit<OfflineToast, 'id' | 'timestamp' | 'retries'>) => void;
  queue: OfflineToast[];
  isOnline: boolean;
}

class OfflineToastSystem {
  private toastQueue: OfflineToast[] = [];
  private toastFunction: any = null;
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * Initialize with toast function from useToast hook
   */
  initialize(toastFn: any) {
    this.toastFunction = toastFn;
    this.processQueue();
  }

  /**
   * Show toast with offline handling
   */
  show(toast: Omit<OfflineToast, 'id' | 'timestamp' | 'retries'>) {
    const offlineToast: OfflineToast = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0
    };

    // Try immediate display
    if (this.tryShowToast(offlineToast)) {
      return;
    }

    // Queue for later if failed
    this.toastQueue.push(offlineToast);
    this.processQueue();
  }

  /**
   * Try to show toast with error handling
   */
  private tryShowToast(toast: OfflineToast): boolean {
    try {
      if (!this.toastFunction) {
        console.warn('Toast function not initialized, queuing toast:', toast);
        return false;
      }

      // Check if we're in a valid React context
      if (typeof window === 'undefined' || !document.body) {
        return false;
      }

      this.toastFunction({
        title: toast.title,
        description: toast.description,
        variant: toast.variant || 'default'
      });

      return true;
    } catch (error) {
      console.warn('Toast display failed:', error, toast);
      
      // Fallback to console for critical messages
      if (toast.variant === 'destructive') {
        console.error(`⚠️ ${toast.title}: ${toast.description}`);
      } else {
        console.log(`ℹ️ ${toast.title}: ${toast.description}`);
      }
      
      return false;
    }
  }

  /**
   * Process queued toasts with retry logic
   */
  private processQueue() {
    if (this.toastQueue.length === 0) return;

    const toastsToProcess = [...this.toastQueue];
    this.toastQueue = [];

    toastsToProcess.forEach(toast => {
      if (this.tryShowToast(toast)) {
        // Success - toast shown
        return;
      }

      // Failed - retry if under limit
      if (toast.retries < this.maxRetries) {
        toast.retries++;
        
        setTimeout(() => {
          if (this.tryShowToast(toast)) {
            return;
          }
          
          // Still failing - queue again if retries left
          if (toast.retries < this.maxRetries) {
            this.toastQueue.push(toast);
          }
        }, this.retryDelay * toast.retries);
      }
    });
  }

  /**
   * Get queue status for debugging
   */
  getQueueStatus() {
    return {
      queueLength: this.toastQueue.length,
      initialized: !!this.toastFunction,
      oldestToast: this.toastQueue[0]?.timestamp
    };
  }

  /**
   * Clear old queued toasts
   */
  cleanup() {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    this.toastQueue = this.toastQueue.filter(
      toast => (now - toast.timestamp) < maxAge
    );
  }
}

// Singleton instance
export const offlineToastSystem = new OfflineToastSystem();

// React hook for easy integration
export const useOfflineToast = () => {
  return {
    showToast: offlineToastSystem.show.bind(offlineToastSystem),
    getQueueStatus: offlineToastSystem.getQueueStatus.bind(offlineToastSystem)
  };
};