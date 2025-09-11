/**
 * Service worker communication for coordinated offline navigation
 */

interface ServiceWorkerMessage {
  type: 'NAVIGATION_REQUEST' | 'NAVIGATION_RESPONSE' | 'OFFLINE_STATUS';
  data: any;
  timestamp: number;
}

class ServiceWorkerCommunication {
  private messageQueue: ServiceWorkerMessage[] = [];
  private isServiceWorkerReady = false;

  constructor() {
    this.setupMessageListener();
    this.checkServiceWorkerStatus();
  }

  /**
   * Setup message listener for service worker communication
   */
  private setupMessageListener() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const message: ServiceWorkerMessage = event.data;
        this.handleServiceWorkerMessage(message);
      });
    }
  }

  /**
   * Check if service worker is ready
   */
  private async checkServiceWorkerStatus() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.isServiceWorkerReady = !!registration.active;
    } catch (error) {
      console.warn('Service worker not available:', error);
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(message: ServiceWorkerMessage) {
    switch (message.type) {
      case 'OFFLINE_STATUS':
        // Service worker is reporting offline status
        if (import.meta.env.DEV) {
          console.log('Service worker offline status:', message.data);
        }
        break;
      
      case 'NAVIGATION_RESPONSE':
        // Service worker handled navigation
        if (import.meta.env.DEV) {
          console.log('Service worker navigation response:', message.data);
        }
        break;
    }
  }

  /**
   * Send message to service worker
   */
  private async sendToServiceWorker(message: ServiceWorkerMessage) {
    if (!this.isServiceWorkerReady || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      this.messageQueue.push(message);
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage(message);
        return true;
      }
    } catch (error) {
      console.warn('Failed to send message to service worker:', error);
      this.messageQueue.push(message);
    }

    return false;
  }

  /**
   * Notify service worker about navigation attempt
   */
  async notifyNavigationAttempt(route: string, isOffline: boolean) {
    const message: ServiceWorkerMessage = {
      type: 'NAVIGATION_REQUEST',
      data: {
        route,
        isOffline,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      },
      timestamp: Date.now()
    };

    return this.sendToServiceWorker(message);
  }

  /**
   * Check if service worker should handle offline navigation
   */
  shouldServiceWorkerHandleOffline(route: string): boolean {
    // Let service worker handle document navigation when offline
    return !navigator.onLine && 
           !route.startsWith('/offline') && 
           this.isServiceWorkerReady;
  }

  /**
   * Process queued messages when service worker becomes ready
   */
  async processMessageQueue() {
    if (!this.isServiceWorkerReady || this.messageQueue.length === 0) {
      return;
    }

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      await this.sendToServiceWorker(message);
    }
  }

  /**
   * Get communication status for debugging
   */
  getStatus() {
    return {
      isServiceWorkerReady: this.isServiceWorkerReady,
      queuedMessages: this.messageQueue.length,
      isOnline: navigator.onLine
    };
  }
}

// Singleton instance
export const serviceWorkerComm = new ServiceWorkerCommunication();

// React hook for service worker communication
export const useServiceWorkerComm = () => {
  return {
    notifyNavigationAttempt: serviceWorkerComm.notifyNavigationAttempt.bind(serviceWorkerComm),
    shouldServiceWorkerHandleOffline: serviceWorkerComm.shouldServiceWorkerHandleOffline.bind(serviceWorkerComm),
    getStatus: serviceWorkerComm.getStatus.bind(serviceWorkerComm)
  };
};