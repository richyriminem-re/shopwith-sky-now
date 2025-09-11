/**
 * Advanced Cache Manager
 * 
 * Intelligent cache management with dependency tracking, compression,
 * and cross-component coordination
 */

import LZString from 'lz-string';
import { requestIdleCallbackPolyfill } from './compatibility';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  dependencies: string[];
  compressed?: boolean;
}

export interface CacheConfig {
  maxMemoryMB: number;
  maxLocalStorageMB: number;
  defaultTTL: number;
  compressionThreshold: number; // bytes
  enableAnalytics: boolean;
  enableNetworkAware: boolean;
  enableBatteryAware: boolean;
}

export interface CacheMetrics {
  memoryUsage: number;
  localStorageUsage: number;
  hitRate: number;
  missRate: number;
  compressionRatio: number;
  totalEntries: number;
  performanceGain: number;
}

export interface InvalidationRule {
  trigger: string;
  targets: string[];
  strategy: 'immediate' | 'lazy' | 'background';
  condition?: (data: any) => boolean;
}

class AdvancedCacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metrics = {
    hits: 0,
    misses: 0,
    compressionSaved: 0,
    totalSize: 0,
  };
  private invalidationRules: InvalidationRule[] = [];
  private dependencies = new Map<string, Set<string>>();
  private behaviorPatterns = new Map<string, number>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxMemoryMB: 100,
      maxLocalStorageMB: 50,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      compressionThreshold: 1024, // 1KB
      enableAnalytics: true,
      enableNetworkAware: true,
      enableBatteryAware: true,
      ...config,
    };

    this.initializeInvalidationRules();
    this.startBackgroundTasks();
  }

  /**
   * Initialize smart invalidation rules
   */
  private initializeInvalidationRules(): void {
    this.invalidationRules = [
      // Product-related invalidations
      {
        trigger: 'product:update',
        targets: ['product:*', 'category:*', 'featured:*', 'search:*'],
        strategy: 'immediate',
      },
      {
        trigger: 'product:inventory',
        targets: ['product:*', 'cart:*'],
        strategy: 'lazy',
      },

      // Cart-related invalidations
      {
        trigger: 'cart:add',
        targets: ['cart:*', 'checkout:*'],
        strategy: 'immediate',
      },
      {
        trigger: 'cart:update',
        targets: ['cart:*', 'checkout:*'],
        strategy: 'immediate',
      },

      // User-related invalidations
      {
        trigger: 'user:login',
        targets: ['user:*', 'cart:*', 'orders:*', 'wishlist:*'],
        strategy: 'immediate',
      },
      {
        trigger: 'user:logout',
        targets: ['*'], // Clear everything
        strategy: 'immediate',
      },

      // Search and category invalidations
      {
        trigger: 'catalog:update',
        targets: ['category:*', 'search:*', 'featured:*'],
        strategy: 'background',
      },
    ];
  }

  /**
   * Set cache entry with intelligent storage strategy
   */
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      priority?: CacheEntry['priority'];
      dependencies?: string[];
      forceMemory?: boolean;
    } = {}
  ): void {
    const {
      ttl = this.config.defaultTTL,
      tags = [],
      priority = 'normal',
      dependencies = [],
      forceMemory = false,
    } = options;

    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;
    const shouldCompress = size > this.config.compressionThreshold;
    
    let finalData: any = data;
    let compressed = false;

    if (shouldCompress && !forceMemory) {
      try {
        const compressedStr = LZString.compress(serialized);
        const compressedSize = new Blob([compressedStr]).size;
        
        if (compressedSize < size * 0.8) { // Only compress if significant savings
          finalData = compressedStr;
          compressed = true;
          this.metrics.compressionSaved += size - compressedSize;
        }
      } catch (error) {
        console.warn('Compression failed for cache key:', key);
      }
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: Date.now(),
      ttl,
      tags,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
      priority,
      dependencies,
      compressed,
    };

    // Store dependencies
    dependencies.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep)!.add(key);
    });

    // Decide storage location based on priority and size
    if (forceMemory || priority === 'critical' || size < 10000) {
      this.memoryCache.set(key, entry);
    } else {
      this.setInLocalStorage(key, entry);
    }

    this.metrics.totalSize += size;
    this.maybeCleanup();
  }

  /**
   * Get cache entry with intelligent retrieval
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    let entry = this.memoryCache.get(key);
    let fromMemory = true;

    // Try localStorage if not in memory
    if (!entry) {
      entry = this.getFromLocalStorage(key);
      fromMemory = false;
    }

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Update access patterns
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.metrics.hits++;

    // Promote to memory if accessed frequently and not already there
    if (!fromMemory && entry.accessCount > 3 && entry.priority !== 'low') {
      this.memoryCache.set(key, entry);
    }

    // Track user behavior patterns
    this.trackBehaviorPattern(key);

    // Decompress if needed
    if (entry.compressed) {
      try {
        const decompressed = LZString.decompress(entry.data as string);
        return JSON.parse(decompressed);
      } catch (error) {
        console.warn('Decompression failed for cache key:', key);
        this.delete(key);
        return null;
      }
    }

    return entry.data;
  }

  /**
   * Track user behavior patterns for predictive caching
   */
  private trackBehaviorPattern(key: string): void {
    const pattern = this.extractPattern(key);
    if (pattern) {
      const current = this.behaviorPatterns.get(pattern) || 0;
      this.behaviorPatterns.set(pattern, current + 1);
    }
  }

  /**
   * Extract behavior pattern from cache key
   */
  private extractPattern(key: string): string | null {
    const patterns = [
      /^product:category:(.+)$/,
      /^product:(\w+)$/,
      /^search:(.+)$/,
      /^user:(.+)$/,
      /^cart:(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = key.match(pattern);
      if (match) {
        return match[0].split(':').slice(0, 2).join(':');
      }
    }

    return null;
  }

  /**
   * Intelligent cache invalidation
   */
  invalidate(trigger: string, data?: any): void {
    const applicableRules = this.invalidationRules.filter(rule => {
      if (rule.trigger !== trigger) return false;
      if (rule.condition && !rule.condition(data)) return false;
      return true;
    });

    applicableRules.forEach(rule => {
      const targetsToInvalidate = this.expandTargetPatterns(rule.targets);
      
      switch (rule.strategy) {
        case 'immediate':
          targetsToInvalidate.forEach(target => this.delete(target));
          break;
        case 'lazy':
          targetsToInvalidate.forEach(target => this.markStale(target));
          break;
        case 'background':
          requestIdleCallbackPolyfill(() => {
            targetsToInvalidate.forEach(target => this.delete(target));
          });
          break;
      }
    });

    // Invalidate dependencies
    if (this.dependencies.has(trigger)) {
      const dependentKeys = this.dependencies.get(trigger)!;
      dependentKeys.forEach(key => this.delete(key));
    }
  }

  /**
   * Expand wildcard patterns to actual cache keys
   */
  private expandTargetPatterns(patterns: string[]): string[] {
    const allKeys = [
      ...this.memoryCache.keys(),
      ...this.getLocalStorageKeys(),
    ];

    const targets: string[] = [];

    patterns.forEach(pattern => {
      if (pattern === '*') {
        targets.push(...allKeys);
      } else if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        targets.push(...allKeys.filter(key => key.startsWith(prefix)));
      } else {
        targets.push(pattern);
      }
    });

    return [...new Set(targets)]; // Remove duplicates
  }

  /**
   * Mark cache entry as stale for lazy invalidation
   */
  private markStale(key: string): void {
    const entry = this.memoryCache.get(key) || this.getFromLocalStorage(key);
    if (entry) {
      entry.ttl = 0; // Mark as immediately expired
      if (this.memoryCache.has(key)) {
        this.memoryCache.set(key, entry);
      } else {
        this.setInLocalStorage(key, entry);
      }
    }
  }

  /**
   * Predictive cache warming based on user patterns
   */
  warmCache(context: { currentKey?: string; userAction?: string }): void {
    const { currentKey, userAction } = context;

    requestIdleCallbackPolyfill(() => {
      // Pattern-based predictions
      if (currentKey) {
        const predictions = this.predictNextAccess(currentKey);
        predictions.forEach(prediction => {
          if (!this.memoryCache.has(prediction.key) && prediction.confidence > 0.7) {
            // Trigger preload (would be handled by React Query integration)
            this.notifyPrediction(prediction);
          }
        });
      }

      // Behavior-based warming
      if (userAction) {
        const warmingTargets = this.getWarmingTargets(userAction);
        warmingTargets.forEach(target => this.notifyPrediction({ key: target, confidence: 0.8 }));
      }
    });
  }

  /**
   * Predict next cache access based on patterns
   */
  private predictNextAccess(currentKey: string): Array<{ key: string; confidence: number }> {
    const predictions: Array<{ key: string; confidence: number }> = [];

    // Product detail → related products
    if (currentKey.startsWith('product:')) {
      const productId = currentKey.split(':')[1];
      // Would predict related products, similar categories, etc.
      predictions.push(
        { key: `product:related:${productId}`, confidence: 0.8 },
        { key: `category:${productId}`, confidence: 0.6 }
      );
    }

    // Category → popular products in category
    if (currentKey.startsWith('category:')) {
      const category = currentKey.split(':')[1];
      predictions.push(
        { key: `product:category:${category}:popular`, confidence: 0.7 }
      );
    }

    // Search → related searches
    if (currentKey.startsWith('search:')) {
      const query = currentKey.split(':')[1];
      // Predict related search terms
      predictions.push(
        { key: `search:${query}:suggestions`, confidence: 0.5 }
      );
    }

    return predictions;
  }

  /**
   * Get warming targets based on user action
   */
  private getWarmingTargets(action: string): string[] {
    const targets: string[] = [];

    switch (action) {
      case 'view_product':
        targets.push('cart:current', 'user:wishlist');
        break;
      case 'add_to_cart':
        targets.push('checkout:shipping', 'checkout:payment');
        break;
      case 'browse_category':
        targets.push('featured:products', 'category:trending');
        break;
      case 'search':
        targets.push('search:popular', 'category:all');
        break;
    }

    return targets;
  }

  /**
   * Notify prediction for external handling
   */
  private notifyPrediction(prediction: { key: string; confidence: number }): void {
    // Emit custom event for React components to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cache:prediction', {
        detail: prediction
      }));
    }
  }

  /**
   * Network-aware caching adjustments
   */
  private adjustForNetworkConditions(): void {
    if (!this.config.enableNetworkAware || typeof navigator === 'undefined') return;

    const connection = (navigator as any).connection;
    if (connection) {
      const { effectiveType, saveData } = connection;
      
      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        // Aggressive caching for slow connections
        this.config.defaultTTL *= 2;
        this.config.compressionThreshold = 512; // Compress smaller files
      } else if (effectiveType === '4g') {
        // Less aggressive caching for fast connections
        this.config.defaultTTL = Math.max(this.config.defaultTTL * 0.8, 60000);
      }
    }
  }

  /**
   * Battery-aware caching adjustments
   */
  private adjustForBatteryConditions(): void {
    if (!this.config.enableBatteryAware || typeof navigator === 'undefined') return;

    (navigator as any).getBattery?.()?.then((battery: any) => {
      if (battery.level < 0.2 || !battery.charging) {
        // Reduce cache activity when battery is low
        this.config.maxMemoryMB *= 0.5;
        clearInterval(this.cleanupInterval!);
        this.cleanupInterval = setInterval(() => this.cleanup(), 2 * 60 * 1000); // Less frequent cleanup
      }
    });
  }

  /**
   * Storage operations for localStorage
   */
  private setInLocalStorage(key: string, entry: CacheEntry): void {
    try {
      const storageKey = `cache:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      // Storage quota exceeded, cleanup and retry
      this.cleanupLocalStorage();
      try {
        localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
      } catch (retryError) {
        console.warn('Failed to store in localStorage:', key);
      }
    }
  }

  private getFromLocalStorage(key: string): CacheEntry | null {
    try {
      const storageKey = `cache:${key}`;
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  private getLocalStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache:')) {
        keys.push(key.slice(6)); // Remove 'cache:' prefix
      }
    }
    return keys;
  }

  /**
   * Cleanup operations
   */
  private maybeCleanup(): void {
    const memoryUsageMB = this.getMemoryUsage();
    if (memoryUsageMB > this.config.maxMemoryMB) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    
    // Clean expired entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // If still over limit, use LRU eviction
    if (this.getMemoryUsage() > this.config.maxMemoryMB) {
      this.performLRUEviction();
    }

    // Clean localStorage
    this.cleanupLocalStorage();
  }

  private performLRUEviction(): void {
    const entries = Array.from(this.memoryCache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => {
        // Sort by priority first, then by last accessed time
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.entry.priority] - priorityOrder[a.entry.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return a.entry.lastAccessed - b.entry.lastAccessed;
      });

    // Remove lower priority and least recently used entries
    const targetSize = this.config.maxMemoryMB * 0.8; // Clean to 80% of max
    let currentSize = this.getMemoryUsage();
    
    for (const { key } of entries) {
      if (currentSize <= targetSize) break;
      
      const entry = this.memoryCache.get(key);
      if (entry && entry.priority !== 'critical') {
        this.memoryCache.delete(key);
        currentSize -= entry.size / (1024 * 1024);
      }
    }
  }

  private cleanupLocalStorage(): void {
    const keys = this.getLocalStorageKeys();
    const now = Date.now();
    
    keys.forEach(key => {
      const entry = this.getFromLocalStorage(key);
      if (entry && now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`cache:${key}`);
      }
    });
  }

  /**
   * Utility methods
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache:${key}`);
    
    // Clean up dependencies
    this.dependencies.forEach((deps, depKey) => {
      deps.delete(key);
      if (deps.size === 0) {
        this.dependencies.delete(depKey);
      }
    });
  }

  clear(): void {
    this.memoryCache.clear();
    
    // Clear only cache entries from localStorage
    const keys = this.getLocalStorageKeys();
    keys.forEach(key => localStorage.removeItem(`cache:${key}`));
    
    this.dependencies.clear();
    this.behaviorPatterns.clear();
  }

  private getMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size;
    }
    return totalSize / (1024 * 1024); // Convert to MB
  }

  getMetrics(): CacheMetrics {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;
    const missRate = 100 - hitRate;
    
    return {
      memoryUsage: this.getMemoryUsage(),
      localStorageUsage: this.getLocalStorageUsage(),
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      compressionRatio: this.metrics.compressionSaved / Math.max(this.metrics.totalSize, 1),
      totalEntries: this.memoryCache.size + this.getLocalStorageKeys().length,
      performanceGain: hitRate * 0.1, // Rough estimate of performance improvement
    };
  }

  private getLocalStorageUsage(): number {
    let size = 0;
    const keys = this.getLocalStorageKeys();
    keys.forEach(key => {
      const entry = this.getFromLocalStorage(key);
      if (entry) size += entry.size;
    });
    return size / (1024 * 1024); // Convert to MB
  }

  /**
   * Background tasks initialization
   */
  private startBackgroundTasks(): void {
    // Periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Network condition monitoring
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.adjustForNetworkConditions());
      window.addEventListener('offline', () => this.adjustForNetworkConditions());
    }

    // Battery condition monitoring
    this.adjustForBatteryConditions();
  }

  /**
   * Cleanup on destruction
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global cache manager instance
export const globalCacheManager = new AdvancedCacheManager();
export default globalCacheManager;