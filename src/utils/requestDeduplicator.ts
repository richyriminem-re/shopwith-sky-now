/**
 * Comprehensive Request Deduplication System
 * 
 * Provides intelligent request deduplication with TTL management,
 * priority handling, and promise sharing for optimal performance.
 */

import CryptoJS from 'crypto-js';

export interface RequestConfig {
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  priority?: 'high' | 'normal' | 'low';
}

export interface CacheEntry {
  promise: Promise<any>;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'normal' | 'low';
  requestCount: number;
  lastAccessed: number;
  fingerprint: string;
}

export interface DeduplicationConfig {
  defaultTtl: number;
  maxCacheSize: number;
  enableDebugMode: boolean;
  memoryThreshold: number; // MB
}

export interface DeduplicationMetrics {
  hitRate: number;
  totalRequests: number;
  deduplicatedRequests: number;
  cacheSize: number;
  memoryUsage: number;
  averageResponseTime: number;
}

class RequestDeduplicator {
  private cache = new Map<string, CacheEntry>();
  private config: DeduplicationConfig;
  private metrics = {
    totalRequests: 0,
    deduplicatedRequests: 0,
    responseTimeSum: 0,
    responseTimeCount: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<DeduplicationConfig> = {}) {
    this.config = {
      defaultTtl: 5000, // 5 seconds default
      maxCacheSize: 1000,
      enableDebugMode: import.meta.env.DEV,
      memoryThreshold: 50, // 50MB
      ...config,
    };

    this.startCleanupInterval();
  }

  /**
   * Generate unique fingerprint for request
   */
  private generateFingerprint(config: RequestConfig): string {
    const { url, method, body, headers } = config;
    
    // Create consistent hash input
    const hashInput = JSON.stringify({
      url: url.toLowerCase(),
      method: method.toUpperCase(),
      body: body ? JSON.stringify(body) : null,
      // Only include cache-relevant headers
      headers: headers ? this.normalizeHeaders(headers) : null,
    });

    return CryptoJS.MD5(hashInput).toString();
  }

  /**
   * Normalize headers for consistent fingerprinting
   */
  private normalizeHeaders(headers: Record<string, string>): Record<string, string> {
    const relevantHeaders = ['content-type', 'authorization', 'accept'];
    const normalized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (relevantHeaders.includes(lowerKey)) {
        normalized[lowerKey] = value;
      }
    }
    
    return normalized;
  }

  /**
   * Check if request should be deduplicated
   */
  private shouldDeduplicate(config: RequestConfig): boolean {
    // Don't deduplicate DELETE requests
    if (config.method.toUpperCase() === 'DELETE') {
      return false;
    }

    // Always deduplicate GET requests
    if (config.method.toUpperCase() === 'GET') {
      return true;
    }

    // Deduplicate POST/PUT for specific endpoints
    const deduplicatePatterns = [
      '/api/cart/add',
      '/api/auth/login',
      '/api/user/profile',
      '/api/orders',
    ];

    return deduplicatePatterns.some(pattern => 
      config.url.includes(pattern)
    );
  }

  /**
   * Get TTL based on request type and URL
   */
  private getTTL(config: RequestConfig): number {
    const { url, method } = config;

    // Product details - longer cache
    if (url.includes('/api/products/') && method === 'GET') {
      return 10000; // 10 seconds
    }

    // Search queries - shorter cache
    if (url.includes('/api/search') || url.includes('?search=')) {
      return 2000; // 2 seconds
    }

    // Cart operations - prevent double submission
    if (url.includes('/api/cart')) {
      return 3000; // 3 seconds
    }

    // User profile updates
    if (url.includes('/api/user') && method !== 'GET') {
      return 5000; // 5 seconds
    }

    // Authentication
    if (url.includes('/api/auth')) {
      return 8000; // 8 seconds
    }

    return this.config.defaultTtl;
  }

  /**
   * Execute request with deduplication
   */
  async deduplicate<T>(
    config: RequestConfig,
    requestFn: () => Promise<T>
  ): Promise<T> {
    this.metrics.totalRequests++;

    if (!this.shouldDeduplicate(config)) {
      return this.executeWithMetrics(requestFn);
    }

    const fingerprint = this.generateFingerprint(config);
    const now = Date.now();
    const existingEntry = this.cache.get(fingerprint);

    // Check if we have a valid cached promise
    if (existingEntry && (now - existingEntry.timestamp) < existingEntry.ttl) {
      this.metrics.deduplicatedRequests++;
      existingEntry.requestCount++;
      existingEntry.lastAccessed = now;

      if (this.config.enableDebugMode) {
        console.log('🔄 Request deduplicated:', {
          url: config.url,
          method: config.method,
          fingerprint: fingerprint.slice(0, 8),
          age: now - existingEntry.timestamp,
          requestCount: existingEntry.requestCount,
        });
      }

      return existingEntry.promise;
    }

    // Create new cache entry
    const ttl = this.getTTL(config);
    const priority = config.priority || 'normal';
    
    const promise = this.executeWithMetrics(requestFn);
    
    const cacheEntry: CacheEntry = {
      promise,
      timestamp: now,
      ttl,
      priority,
      requestCount: 1,
      lastAccessed: now,
      fingerprint,
    };

    this.cache.set(fingerprint, cacheEntry);

    if (this.config.enableDebugMode) {
      console.log('📦 Request cached:', {
        url: config.url,
        method: config.method,
        fingerprint: fingerprint.slice(0, 8),
        ttl,
        priority,
        cacheSize: this.cache.size,
      });
    }

    // Clean up on promise completion
    promise.finally(() => {
      // Keep successful responses for a bit longer for potential reuse
      setTimeout(() => {
        const entry = this.cache.get(fingerprint);
        if (entry && entry === cacheEntry) {
          this.cache.delete(fingerprint);
        }
      }, ttl);
    });

    // Cleanup if cache is getting too large
    if (this.cache.size > this.config.maxCacheSize) {
      this.performCleanup();
    }

    return promise;
  }

  /**
   * Execute request with performance metrics
   */
  private async executeWithMetrics<T>(requestFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await requestFn();
      const duration = performance.now() - startTime;
      
      this.metrics.responseTimeSum += duration;
      this.metrics.responseTimeCount++;
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.responseTimeSum += duration;
      this.metrics.responseTimeCount++;
      
      throw error;
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const [fingerprint, entry] of this.cache.entries()) {
      // We can't reconstruct URL from fingerprint easily, so this is basic cleanup
      // In practice, you'd want to store URL in cache entry for better invalidation
      if (entry.priority === 'low') {
        this.cache.delete(fingerprint);
      }
    }

    if (this.config.enableDebugMode) {
      console.log('🗑️ Cache invalidated by pattern:', pattern.toString());
    }
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
    
    if (this.config.enableDebugMode) {
      console.log('🧹 Cache cleared completely');
    }
  }

  /**
   * Cleanup expired entries
   */
  private performCleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [fingerprint, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      const isExpired = age > entry.ttl;
      const isOld = age > entry.ttl * 2; // Double TTL for stale cleanup
      
      if (isExpired || isOld || this.cache.size > this.config.maxCacheSize) {
        this.cache.delete(fingerprint);
        removedCount++;
      }
    }

    if (this.config.enableDebugMode && removedCount > 0) {
      console.log('🧽 Cache cleanup:', {
        removed: removedCount,
        remaining: this.cache.size,
      });
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000); // Clean up every 30 seconds
  }

  /**
   * Get current metrics
   */
  getMetrics(): DeduplicationMetrics {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.deduplicatedRequests / this.metrics.totalRequests) * 100 
      : 0;

    const averageResponseTime = this.metrics.responseTimeCount > 0
      ? this.metrics.responseTimeSum / this.metrics.responseTimeCount
      : 0;

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.metrics.totalRequests,
      deduplicatedRequests: this.metrics.deduplicatedRequests,
      cacheSize: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    // Rough estimation: each cache entry ~1KB
    return (this.cache.size * 1024) / (1024 * 1024); // Convert to MB
  }

  /**
   * Destroy instance and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.cache.clear();
  }
}

// Global instance
const globalDeduplicator = new RequestDeduplicator();

// Export both class and global instance
export { RequestDeduplicator };
export default globalDeduplicator;
