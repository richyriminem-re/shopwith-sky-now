/**
 * Background Sync Manager
 * Handles offline form submissions and critical user actions
 */

interface SyncAction {
  id: string;
  type: 'form_submit' | 'cart_update' | 'user_action';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class BackgroundSyncManager {
  private storageKey = 'background-sync-queue';
  private maxRetries = 3;
  private syncCallbacks: Map<string, (data: any) => Promise<boolean>> = new Map();

  /**
   * Queue an action for background sync
   */
  queueAction(type: SyncAction['type'], data: any, maxRetries: number = this.maxRetries): string {
    const action: SyncAction = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    const queue = this.getQueue();
    queue.push(action);
    this.saveQueue(queue);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return action.id;
  }

  /**
   * Register a sync handler for a specific action type
   */
  registerSyncHandler(type: SyncAction['type'], handler: (data: any) => Promise<boolean>) {
    this.syncCallbacks.set(type, handler);
  }

  /**
   * Process the sync queue
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline - skipping sync queue processing');
      return;
    }

    const queue = this.getQueue();
    const updatedQueue: SyncAction[] = [];

    for (const action of queue) {
      const handler = this.syncCallbacks.get(action.type);
      
      if (!handler) {
        console.warn('No sync handler registered for type:', action.type);
        continue;
      }

      try {
        const success = await handler(action.data);
        
        if (success) {
          console.log('Background sync successful:', action.id);
          // Action completed successfully - remove from queue
          continue;
        } else {
          // Handler returned false - retry later
          throw new Error('Handler returned false');
        }
      } catch (error) {
        console.error('Background sync failed:', action.id, error);
        
        action.retryCount++;
        
        if (action.retryCount < action.maxRetries) {
          // Still have retries left
          updatedQueue.push(action);
        } else {
          console.error('Background sync max retries reached:', action.id);
          // Could implement dead letter queue here
        }
      }
    }

    this.saveQueue(updatedQueue);
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    const queue = this.getQueue();
    const byType = queue.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: queue.length,
      byType,
      oldestItem: queue.length > 0 ? Math.min(...queue.map(a => a.timestamp)) : null
    };
  }

  /**
   * Clear completed actions and reset retry counts (for testing/debugging)
   */
  resetQueue() {
    this.saveQueue([]);
  }

  /**
   * Get actions that failed max retries (dead letter queue)
   */
  getFailedActions(): SyncAction[] {
    // In a real implementation, you'd maintain a separate dead letter queue
    return [];
  }

  private getQueue(): SyncAction[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncAction[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const backgroundSync = new BackgroundSyncManager();

// Set up service worker sync integration
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    // Listen for sync events
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        backgroundSync.processQueue();
      }
    });
  });
}

// Auto-sync when coming back online
window.addEventListener('online', () => {
  console.log('Back online - processing sync queue');
  backgroundSync.processQueue();
});

// React hook for background sync
export const useBackgroundSync = () => {
  return {
    queueAction: backgroundSync.queueAction.bind(backgroundSync),
    registerSyncHandler: backgroundSync.registerSyncHandler.bind(backgroundSync),
    processQueue: backgroundSync.processQueue.bind(backgroundSync),
    getQueueStatus: backgroundSync.getQueueStatus.bind(backgroundSync),
    resetQueue: backgroundSync.resetQueue.bind(backgroundSync)
  };
};