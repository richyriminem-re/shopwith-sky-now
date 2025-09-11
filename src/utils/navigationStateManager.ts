/**
 * Enhanced navigation state management with offline support
 */

interface NavigationState {
  isNavigating: boolean;
  currentRoute: string;
  previousRoute: string | null;
  navigationHistory: string[];
  lastNavigationTime: number;
  failedNavigations: string[];
  offlineMode: boolean;
}

interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

class NavigationStateManager {
  private state: NavigationState = {
    isNavigating: false,
    currentRoute: '/',
    previousRoute: null,
    navigationHistory: ['/'],
    lastNavigationTime: Date.now(),
    failedNavigations: [],
    offlineMode: !navigator.onLine
  };

  private storageKey = 'navigation-state';
  private maxHistoryLength = 10;
  private storage: StorageAdapter;

  constructor() {
    this.storage = this.initializeStorage();
    this.loadState();
    this.setupOnlineListener();
  }

  /**
   * Initialize storage adapter with fallbacks
   */
  private initializeStorage(): StorageAdapter {
    try {
      // Try sessionStorage first
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return sessionStorage;
      }
    } catch (e) {
      console.warn('SessionStorage unavailable, trying localStorage');
    }

    try {
      // Fallback to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return localStorage;
      }
    } catch (e) {
      console.warn('localStorage unavailable, using memory storage');
    }

    // Fallback to in-memory storage
    const memoryStorage = new Map<string, string>();
    return {
      getItem: (key: string) => memoryStorage.get(key) || null,
      setItem: (key: string, value: string) => memoryStorage.set(key, value),
      removeItem: (key: string) => memoryStorage.delete(key)
    };
  }

  /**
   * Load state from storage with error handling
   */
  private loadState() {
    try {
      const saved = this.storage.getItem(this.storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        this.state = {
          ...this.state,
          ...parsedState,
          isNavigating: false, // Always reset navigation state on load
          offlineMode: !navigator.onLine
        };
      }
    } catch (error) {
      console.warn('Failed to load navigation state:', error);
    }
  }

  /**
   * Save state to storage with error handling
   */
  private saveState() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }

  /**
   * Setup online/offline listener
   */
  private setupOnlineListener() {
    if (typeof window !== 'undefined') {
      const updateOnlineStatus = () => {
        this.state.offlineMode = !navigator.onLine;
        this.saveState();
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
    }
  }

  /**
   * Update current route and history
   */
  updateRoute(newRoute: string, navigationId?: string) {
    const previousRoute = this.state.currentRoute;
    
    // Only update previous route if we're actually changing routes
    if (previousRoute !== newRoute) {
      this.state.previousRoute = previousRoute;
    }
    
    this.state.currentRoute = newRoute;
    this.state.lastNavigationTime = Date.now();

    // Enhanced deduplication: check last entry in history
    const lastHistoryEntry = this.state.navigationHistory[this.state.navigationHistory.length - 1];
    
    // Only add to history if it's different from the last entry (prevent consecutive duplicates)
    if (lastHistoryEntry !== newRoute) {
      this.state.navigationHistory.push(newRoute);
      
      // Trim history if too long
      if (this.state.navigationHistory.length > this.maxHistoryLength) {
        this.state.navigationHistory = this.state.navigationHistory.slice(-this.maxHistoryLength);
      }
    } else if (import.meta.env.DEV) {
      console.log('Skipped adding duplicate route to history:', newRoute);
    }

    // Store navigation ID if provided for timing correlation
    if (navigationId) {
      (this.state as any).lastNavigationId = navigationId;
    }

    this.saveState();
  }

  /**
   * Get last navigation ID for timing correlation
   */
  getLastNavigationId(): string | undefined {
    return (this.state as any).lastNavigationId;
  }

  /**
   * Set navigation loading state
   */
  setNavigating(isNavigating: boolean) {
    this.state.isNavigating = isNavigating;
    if (!isNavigating) {
      this.state.lastNavigationTime = Date.now();
    }
    this.saveState();
  }

  /**
   * Track failed navigation
   */
  trackFailedNavigation(route: string) {
    if (!this.state.failedNavigations.includes(route)) {
      this.state.failedNavigations.push(route);
      
      // Keep only recent failed navigations
      if (this.state.failedNavigations.length > 5) {
        this.state.failedNavigations.shift();
      }
    }
    this.saveState();
  }

  /**
   * Check if navigation has history
   */
  hasNavigationHistory(): boolean {
    return this.state.navigationHistory.length > 1;
  }

  /**
   * Get safe previous route
   */
  getPreviousRoute(): string | null {
    if (this.state.navigationHistory.length > 1) {
      return this.state.navigationHistory[this.state.navigationHistory.length - 2];
    }
    return this.state.previousRoute;
  }

  /**
   * Pop from navigation history (for back navigation)
   */
  popFromHistory(): string | null {
    if (this.state.navigationHistory.length > 1) {
      this.state.navigationHistory.pop();
      this.saveState();
      return this.state.navigationHistory[this.state.navigationHistory.length - 1];
    }
    return null;
  }

  /**
   * Get current state snapshot
   */
  getState(): Readonly<NavigationState> {
    return { ...this.state };
  }

  /**
   * Check if route has failed recently
   */
  hasRecentFailure(route: string): boolean {
    return this.state.failedNavigations.includes(route);
  }

  /**
   * Clear failed navigation tracking
   */
  clearFailedNavigation(route: string) {
    this.state.failedNavigations = this.state.failedNavigations.filter(r => r !== route);
    this.saveState();
  }

  /**
   * Reset state (useful for testing or error recovery)
   */
  reset() {
    this.state = {
      isNavigating: false,
      currentRoute: window.location.pathname,
      previousRoute: null,
      navigationHistory: [window.location.pathname],
      lastNavigationTime: Date.now(),
      failedNavigations: [],
      offlineMode: !navigator.onLine
    };
    this.saveState();
  }
}

// Singleton instance
export const navigationStateManager = new NavigationStateManager();

// React hook for using navigation state
export const useNavigationState = () => {
  return {
    getState: navigationStateManager.getState.bind(navigationStateManager),
    updateRoute: navigationStateManager.updateRoute.bind(navigationStateManager),
    setNavigating: navigationStateManager.setNavigating.bind(navigationStateManager),
    trackFailedNavigation: navigationStateManager.trackFailedNavigation.bind(navigationStateManager),
    hasNavigationHistory: navigationStateManager.hasNavigationHistory.bind(navigationStateManager),
    getPreviousRoute: navigationStateManager.getPreviousRoute.bind(navigationStateManager),
    popFromHistory: navigationStateManager.popFromHistory.bind(navigationStateManager),
    hasRecentFailure: navigationStateManager.hasRecentFailure.bind(navigationStateManager),
    clearFailedNavigation: navigationStateManager.clearFailedNavigation.bind(navigationStateManager),
    getLastNavigationId: navigationStateManager.getLastNavigationId.bind(navigationStateManager)
  };
};
