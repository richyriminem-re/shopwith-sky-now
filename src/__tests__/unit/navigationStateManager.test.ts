/**
 * Unit tests for navigationStateManager
 * Tests push/pop, deduplication, and first visit behavior
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { navigationStateManager } from '@/utils/navigationStateManager';

// Mock localStorage
const mockStorage = new Map<string, string>();
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn((key: string) => mockStorage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => mockStorage.set(key, value)),
    removeItem: vi.fn((key: string) => mockStorage.delete(key)),
  },
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

describe('NavigationStateManager', () => {
  beforeEach(() => {
    // Reset storage and manager state
    mockStorage.clear();
    navigationStateManager.reset();
    vi.clearAllMocks();
  });

  describe('Navigation History Stack', () => {
    it('should push routes to history without duplicates', () => {
      navigationStateManager.updateRoute('/');
      navigationStateManager.updateRoute('/products');
      navigationStateManager.updateRoute('/products'); // duplicate
      navigationStateManager.updateRoute('/product/1');

      const state = navigationStateManager.getState();
      expect(state.navigationHistory).toEqual(['/', '/products', '/product/1']);
    });

    it('should pop from history correctly', () => {
      navigationStateManager.updateRoute('/');
      navigationStateManager.updateRoute('/products');
      navigationStateManager.updateRoute('/product/1');

      const poppedRoute = navigationStateManager.popFromHistory();
      expect(poppedRoute).toBe('/products');
      
      const state = navigationStateManager.getState();
      expect(state.navigationHistory).toEqual(['/', '/products']);
    });

    it('should return null when popping with single history entry', () => {
      navigationStateManager.updateRoute('/');
      
      const poppedRoute = navigationStateManager.popFromHistory();
      expect(poppedRoute).toBeNull();
      
      const state = navigationStateManager.getState();
      expect(state.navigationHistory).toEqual(['/']);
    });

    it('should deduplicate consecutive identical routes', () => {
      navigationStateManager.updateRoute('/products');
      navigationStateManager.updateRoute('/products');
      navigationStateManager.updateRoute('/products');

      const state = navigationStateManager.getState();
      expect(state.navigationHistory).toEqual(['/', '/products']);
    });
  });

  describe('First Visit Behavior', () => {
    it('should initialize with current pathname as first entry', () => {
      // Mock window.location.pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/products' },
        writable: true,
      });

      navigationStateManager.reset();
      const state = navigationStateManager.getState();
      
      expect(state.navigationHistory).toEqual(['/products']);
      expect(state.currentRoute).toBe('/products');
    });

    it('should detect first visit correctly', () => {
      navigationStateManager.reset();
      
      expect(navigationStateManager.hasNavigationHistory()).toBe(false);
      
      navigationStateManager.updateRoute('/products');
      expect(navigationStateManager.hasNavigationHistory()).toBe(true);
    });
  });

  describe('Previous Route Tracking', () => {
    it('should track previous route correctly', () => {
      navigationStateManager.updateRoute('/');
      navigationStateManager.updateRoute('/products');
      
      expect(navigationStateManager.getPreviousRoute()).toBe('/');
      
      navigationStateManager.updateRoute('/product/1');
      expect(navigationStateManager.getPreviousRoute()).toBe('/products');
    });

    it('should not update previous route for same route', () => {
      navigationStateManager.updateRoute('/products');
      const previousBefore = navigationStateManager.getPreviousRoute();
      
      navigationStateManager.updateRoute('/products'); // same route
      expect(navigationStateManager.getPreviousRoute()).toBe(previousBefore);
    });
  });

  describe('Navigation ID Correlation', () => {
    it('should store and retrieve navigation ID', () => {
      const navId = 'nav_123_456';
      navigationStateManager.updateRoute('/products', navId);
      
      expect(navigationStateManager.getLastNavigationId()).toBe(navId);
    });

    it('should update navigation ID on new navigation', () => {
      navigationStateManager.updateRoute('/products', 'nav_1');
      navigationStateManager.updateRoute('/product/1', 'nav_2');
      
      expect(navigationStateManager.getLastNavigationId()).toBe('nav_2');
    });
  });

  describe('Failed Navigation Tracking', () => {
    it('should track failed navigations', () => {
      navigationStateManager.trackFailedNavigation('/broken-route');
      
      expect(navigationStateManager.hasRecentFailure('/broken-route')).toBe(true);
      expect(navigationStateManager.hasRecentFailure('/working-route')).toBe(false);
    });

    it('should clear failed navigation tracking', () => {
      navigationStateManager.trackFailedNavigation('/broken-route');
      expect(navigationStateManager.hasRecentFailure('/broken-route')).toBe(true);
      
      navigationStateManager.clearFailedNavigation('/broken-route');
      expect(navigationStateManager.hasRecentFailure('/broken-route')).toBe(false);
    });

    it('should limit failed navigation entries', () => {
      // Add more than 5 failed navigations
      for (let i = 0; i < 7; i++) {
        navigationStateManager.trackFailedNavigation(`/route-${i}`);
      }
      
      const state = navigationStateManager.getState();
      expect(state.failedNavigations.length).toBe(5);
      expect(state.failedNavigations).not.toContain('/route-0');
      expect(state.failedNavigations).not.toContain('/route-1');
    });
  });

  describe('Storage Persistence', () => {
    it('should persist state to storage', () => {
      navigationStateManager.updateRoute('/products');
      
      expect(mockStorage.has('navigation-state')).toBe(true);
      const stored = JSON.parse(mockStorage.get('navigation-state')!);
      expect(stored.currentRoute).toBe('/products');
    });

    it('should load state from storage on initialization', () => {
      // Pre-populate storage
      const savedState = {
        currentRoute: '/products',
        navigationHistory: ['/', '/products'],
        previousRoute: '/',
      };
      mockStorage.set('navigation-state', JSON.stringify(savedState));
      
      navigationStateManager.reset();
      const loadedState = navigationStateManager.getState();
      
      expect(loadedState.currentRoute).toBe('/products');
      expect(loadedState.navigationHistory).toEqual(['/', '/products']);
      expect(loadedState.previousRoute).toBe('/');
    });
  });
});