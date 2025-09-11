/**
 * PWA Service Worker Manager
 * Handles service worker registration and update detection
 */

export interface PWAManager {
  register: () => Promise<ServiceWorkerRegistration | undefined>;
  checkForUpdates: () => Promise<void>;
  getRegistration: () => Promise<ServiceWorkerRegistration | undefined>;
}

class PWAServiceManager implements PWAManager {
  private registration: ServiceWorkerRegistration | undefined;
  private updateCallbacks: Array<(registration: ServiceWorkerRegistration) => void> = [];

  async register(): Promise<ServiceWorkerRegistration | undefined> {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
      return undefined;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service worker registered successfully');

      // Set up update detection
      this.setupUpdateHandling();

      return this.registration;
    } catch (error) {
      console.error('PWA: Service worker registration failed:', error);
      return undefined;
    }
  }

  async checkForUpdates(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.warn('PWA: Failed to check for updates:', error);
      }
    }
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    if (this.registration) {
      return this.registration;
    }

    if ('serviceWorker' in navigator) {
      this.registration = await navigator.serviceWorker.getRegistration();
      return this.registration;
    }

    return undefined;
  }

  onUpdateFound(callback: (registration: ServiceWorkerRegistration) => void): void {
    this.updateCallbacks.push(callback);
  }

  private setupUpdateHandling(): void {
    if (!this.registration) return;

    // Handle immediate updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version is available
            this.updateCallbacks.forEach(callback => callback(this.registration!));
          }
        });
      }
    });

    // Check for existing waiting worker
    if (this.registration.waiting) {
      this.updateCallbacks.forEach(callback => callback(this.registration!));
    }

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('PWA: Cache updated:', event.data.payload);
      }
    });
  }
}

// Create and export singleton instance
export const pwaManager = new PWAServiceManager();