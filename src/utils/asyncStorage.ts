/**
 * Asynchronous Storage Utilities
 * 
 * Non-blocking storage operations to prevent main thread blocking
 */

import { requestIdleCallbackPolyfill } from './compatibility';

interface StorageOptions {
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  compress?: boolean;
}

// Queue for batching storage operations
const storageQueue: Array<{
  operation: () => Promise<void>;
  priority: 'high' | 'normal' | 'low';
}> = [];

let isProcessingQueue = false;

// Process storage queue during idle time
const processStorageQueue = async () => {
  if (isProcessingQueue || storageQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    // Sort by priority (high -> normal -> low)
    storageQueue.sort((a, b) => {
      const priorities = { high: 3, normal: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
    
    // Process in chunks to avoid blocking
    while (storageQueue.length > 0) {
      const batch = storageQueue.splice(0, 3); // Process 3 at a time
      
      await Promise.all(
        batch.map(item => item.operation().catch(console.warn))
      );
      
      // Yield control between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  } finally {
    isProcessingQueue = false;
  }
};

// Schedule queue processing
const scheduleQueueProcessing = () => {
  requestIdleCallbackPolyfill(processStorageQueue, { timeout: 5000 });
};

// Async localStorage operations
export const asyncLocalStorage = {
  async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      requestIdleCallbackPolyfill(() => {
        try {
          resolve(localStorage.getItem(key));
        } catch (error) {
          console.warn('Failed to get from localStorage:', error);
          resolve(null);
        }
      });
    });
  },

  async setItem(key: string, value: string, options: StorageOptions = {}): Promise<void> {
    const { priority = 'normal', compress = false } = options;
    
    const operation = async () => {
      try {
        let finalValue = value;
        
        // Optional compression for large values
        if (compress && value.length > 1000) {
          // Simple compression placeholder - could use LZ-string or similar
          finalValue = value;
        }
        
        localStorage.setItem(key, finalValue);
      } catch (error) {
        console.warn('Failed to set localStorage:', error);
      }
    };

    if (priority === 'high') {
      // Execute immediately for high priority
      await operation();
    } else {
      // Queue for batch processing
      storageQueue.push({ operation, priority });
      scheduleQueueProcessing();
    }
  },

  async removeItem(key: string, options: StorageOptions = {}): Promise<void> {
    const { priority = 'normal' } = options;
    
    const operation = async () => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    };

    if (priority === 'high') {
      await operation();
    } else {
      storageQueue.push({ operation, priority });
      scheduleQueueProcessing();
    }
  },

  // Batch operations
  async setBatch(items: Array<{ key: string; value: string }>, options: StorageOptions = {}): Promise<void> {
    const { priority = 'normal' } = options;
    
    const operation = async () => {
      try {
        items.forEach(({ key, value }) => {
          localStorage.setItem(key, value);
        });
      } catch (error) {
        console.warn('Failed to set batch localStorage:', error);
      }
    };

    if (priority === 'high') {
      await operation();
    } else {
      storageQueue.push({ operation, priority });
      scheduleQueueProcessing();
    }
  }
};

// Async sessionStorage operations
export const asyncSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      requestIdleCallbackPolyfill(() => {
        try {
          resolve(sessionStorage.getItem(key));
        } catch (error) {
          console.warn('Failed to get from sessionStorage:', error);
          resolve(null);
        }
      });
    });
  },

  async setItem(key: string, value: string, options: StorageOptions = {}): Promise<void> {
    const { priority = 'normal' } = options;
    
    const operation = async () => {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.warn('Failed to set sessionStorage:', error);
      }
    };

    if (priority === 'high') {
      await operation();
    } else {
      storageQueue.push({ operation, priority });
      scheduleQueueProcessing();
    }
  }
};

// Cache with automatic cleanup
interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class AsyncCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async get(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      requestIdleCallbackPolyfill(() => {
        const item = this.cache.get(key);
        
        if (!item) {
          resolve(null);
          return;
        }

        if (Date.now() - item.timestamp > item.ttl) {
          this.cache.delete(key);
          resolve(null);
          return;
        }

        resolve(item.value);
      });
    });
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    return new Promise((resolve) => {
      requestIdleCallbackPolyfill(() => {
        this.cache.set(key, {
          value,
          timestamp: Date.now(),
          ttl: ttl || this.defaultTTL
        });
        resolve();
      });
    });
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Global async cache instance
export const globalAsyncCache = new AsyncCache();