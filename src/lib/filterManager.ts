/**
 * Centralized Filter State Manager
 * Provides unified interface for all filter operations with validation,
 * URL synchronization, and advanced features like history and analytics
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  FilterState, 
  FilterHistoryEntry, 
  FilterAnalytics,
  SortOption 
} from '@/types';
import { 
  validateFilters, 
  sanitizeFilters, 
  parseUrlParams, 
  filtersToUrlParams,
  areFiltersEqual 
} from '@/utils/filterValidation';

interface FilterStore {
  // Core state
  filters: FilterState;
  sort: SortOption;
  searchQuery: string;
  
  // History and analytics
  history: FilterHistoryEntry[];
  analytics: FilterAnalytics[];
  
  // Loading states
  isApplyingFilters: boolean;
  isSyncingUrl: boolean;
  
  // Core actions
  setFilters: (filters: Partial<FilterState>) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  setSort: (sort: SortOption) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
  
  // Advanced actions
  applyFilterPreset: (preset: Partial<FilterState>) => void;
  bulkUpdateFilters: (updates: { filters?: Partial<FilterState>; sort?: SortOption; searchQuery?: string }) => void;
  
  // History management
  addToHistory: (resultCount?: number) => void;
  goToPreviousFilters: () => boolean;
  clearHistory: () => void;
  
  // URL synchronization
  syncToUrl: () => void;
  syncFromUrl: (searchParams: URLSearchParams) => void;
  
  // Analytics
  trackFilterUsage: (filterType: string, filterValue: string, resultCount: number) => void;
  getFilterAnalytics: () => FilterAnalytics[];
  clearAnalytics: () => void;
  
  // Utility methods
  getActiveFilterCount: () => number;
  hasActiveFilters: () => boolean;
  getFilterSummary: () => string;
  validateCurrentFilters: () => boolean;
  exportFilters: () => string;
  importFilters: (data: string) => boolean;
}

// Default state
const DEFAULT_STATE: Pick<FilterStore, 'filters' | 'sort' | 'searchQuery' | 'history' | 'analytics' | 'isApplyingFilters' | 'isSyncingUrl'> = {
  filters: {},
  sort: 'relevance',
  searchQuery: '',
  history: [],
  analytics: [],
  isApplyingFilters: false,
  isSyncingUrl: false,
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      
      // Core actions
      setFilters: (newFilters) => {
        const sanitized = sanitizeFilters(newFilters);
        const validation = validateFilters(sanitized);
        
        if (validation.isValid) {
          set({ filters: sanitized });
          get().addToHistory();
          get().syncToUrl();
        } else {
          console.warn('Invalid filters provided:', validation.errors);
        }
      },
      
      updateFilters: (filterUpdates) => {
        const current = get().filters;
        const merged = { ...current, ...filterUpdates };
        const sanitized = sanitizeFilters(merged);
        const validation = validateFilters(sanitized);
        
        if (validation.isValid) {
          set({ filters: sanitized });
          get().addToHistory();
          get().syncToUrl();
        } else {
          console.warn('Invalid filter update:', validation.errors);
        }
      },
      
      setSort: (sort) => {
        set({ sort });
        get().addToHistory();
        get().syncToUrl();
        get().trackFilterUsage('sort', sort, 0);
      },
      
      setSearchQuery: (searchQuery) => {
        const trimmed = searchQuery.trim();
        set({ searchQuery: trimmed });
        
        // Track search analytics if query is not empty
        if (trimmed) {
          get().trackFilterUsage('search', trimmed, 0);
        }
        
        // Sync to URL
        get().syncToUrl();
      },
      
      clearFilters: () => {
        set({ 
          filters: {}, 
          sort: 'relevance', 
          searchQuery: '' 
        });
        get().addToHistory();
        get().syncToUrl();
        get().trackFilterUsage('clear', 'all', 0);
      },
      
      resetToDefaults: () => {
        set({ 
          ...DEFAULT_STATE,
          history: get().history, // Preserve history
          analytics: get().analytics // Preserve analytics
        });
        get().syncToUrl();
      },
      
      // Advanced actions
      applyFilterPreset: (preset) => {
        const sanitized = sanitizeFilters(preset);
        const validation = validateFilters(sanitized);
        
        if (validation.isValid) {
          set({ filters: sanitized });
          get().addToHistory();
          get().syncToUrl();
          get().trackFilterUsage('preset', JSON.stringify(preset), 0);
        }
      },
      
      bulkUpdateFilters: ({ filters, sort, searchQuery }) => {
        const updates: Partial<Pick<FilterStore, 'filters' | 'sort' | 'searchQuery'>> = {};
        
        if (filters) {
          const current = get().filters;
          const merged = { ...current, ...filters };
          const sanitized = sanitizeFilters(merged);
          const validation = validateFilters(sanitized);
          
          if (validation.isValid) {
            updates.filters = sanitized;
          }
        }
        
        if (sort) {
          updates.sort = sort;
        }
        
        if (searchQuery !== undefined) {
          updates.searchQuery = searchQuery.trim();
        }
        
        if (Object.keys(updates).length > 0) {
          set(updates);
          get().addToHistory();
          get().syncToUrl();
        }
      },
      
      // History management
      addToHistory: (resultCount) => {
        const { filters, sort, history } = get();
        const timestamp = new Date().toISOString();
        
        // Don't add duplicate entries
        const lastEntry = history[0];
        if (lastEntry && areFiltersEqual(lastEntry.filters, filters) && lastEntry.sort === sort) {
          return;
        }
        
        const entry: FilterHistoryEntry = {
          id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          filters: { ...filters },
          sort,
          timestamp,
          resultCount,
        };
        
        // Keep only last 50 entries
        const newHistory = [entry, ...history].slice(0, 50);
        set({ history: newHistory });
      },
      
      goToPreviousFilters: () => {
        const { history } = get();
        if (history.length < 2) return false;
        
        const previousEntry = history[1]; // [0] is current, [1] is previous
        set({ 
          filters: { ...previousEntry.filters },
          sort: previousEntry.sort,
          searchQuery: previousEntry.filters.searchQuery || ''
        });
        
        // Remove the current entry and the one we're going back to
        set({ history: history.slice(2) });
        get().syncToUrl();
        
        return true;
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      // URL synchronization
      syncToUrl: () => {
        if (typeof window === 'undefined') return;
        
        set({ isSyncingUrl: true });
        
        try {
          const { filters, sort, searchQuery } = get();
          const params = filtersToUrlParams(filters, sort);
          
          // Add search query to URL params if it exists
          if (searchQuery) {
            params.set('search', searchQuery);
          }
          
          const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
          
          // Use replaceState to avoid creating browser history entries
          window.history.replaceState({}, '', newUrl);
        } catch (error) {
          console.error('Error syncing filters to URL:', error);
        } finally {
          set({ isSyncingUrl: false });
        }
      },
      
      syncFromUrl: (searchParams) => {
        if (get().isSyncingUrl) return; // Prevent circular updates
        
        try {
          const urlFilters = parseUrlParams(searchParams);
          const sort = searchParams.get('sort');
          const search = searchParams.get('search');
          
          const updates: Partial<Pick<FilterStore, 'filters' | 'sort' | 'searchQuery'>> = {};
          
          if (Object.keys(urlFilters).length > 0) {
            updates.filters = urlFilters;
          }
          
          if (sort && ['relevance', 'newest', 'price-low', 'price-high'].includes(sort)) {
            updates.sort = sort as SortOption;
          }
          
          if (search) {
            updates.searchQuery = search;
          }
          
          if (Object.keys(updates).length > 0) {
            set(updates);
          }
        } catch (error) {
          console.error('Error syncing filters from URL:', error);
        }
      },
      
      // Analytics
      trackFilterUsage: (filterType, filterValue, resultCount) => {
        const analytics = get().analytics;
        const entry: FilterAnalytics = {
          filterId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filterType,
          filterValue,
          timestamp: new Date().toISOString(),
          sessionId: `session-${Date.now()}`,
          resultCount,
        };
        
        // Keep only last 1000 entries
        const newAnalytics = [entry, ...analytics].slice(0, 1000);
        set({ analytics: newAnalytics });
      },
      
      getFilterAnalytics: () => {
        return get().analytics;
      },
      
      clearAnalytics: () => {
        set({ analytics: [] });
      },
      
      // Utility methods
      getActiveFilterCount: () => {
        const { filters } = get();
        let count = 0;
        
        if (filters.primaryCategory) count += 1;
        if (filters.subcategories?.length) count += filters.subcategories.length;
        if (filters.sizes?.length) count += filters.sizes.length;
        if (filters.colors?.length) count += filters.colors.length;
        if (filters.priceRange) count += 1;
        if (filters.showDeals) count += 1;
        if (filters.searchQuery) count += 1;
        
        return count;
      },
      
      hasActiveFilters: () => {
        return get().getActiveFilterCount() > 0;
      },
      
      getFilterSummary: () => {
        const { filters, sort, searchQuery } = get();
        const parts: string[] = [];
        
        if (searchQuery) parts.push(`\"${searchQuery}\"`);
        if (filters.primaryCategory) parts.push(filters.primaryCategory.replace('-', ' '));
        if (filters.subcategories?.length) parts.push(`${filters.subcategories.length} categories`);
        if (filters.sizes?.length) parts.push(`${filters.sizes.length} sizes`);
        if (filters.colors?.length) parts.push(`${filters.colors.length} colors`);
        if (filters.priceRange) parts.push(`₦${filters.priceRange[0]}-₦${filters.priceRange[1]}`);
        if (filters.showDeals) parts.push('on sale');
        if (sort !== 'relevance') parts.push(`sorted by ${sort}`);
        
        return parts.length > 0 ? parts.join(', ') : 'no filters applied';
      },
      
      validateCurrentFilters: () => {
        const { filters } = get();
        const validation = validateFilters(filters);
        
        if (!validation.isValid) {
          console.warn('Current filters are invalid:', validation.errors);
        }
        
        return validation.isValid;
      },
      
      exportFilters: () => {
        const { filters, sort, searchQuery } = get();
        return JSON.stringify({ filters, sort, searchQuery });
      },
      
      importFilters: (data) => {
        try {
          const parsed = JSON.parse(data);
          const { filters, sort, searchQuery } = parsed;
          
          if (filters) {
            const sanitized = sanitizeFilters(filters);
            const validation = validateFilters(sanitized);
            
            if (validation.isValid) {
              set({ 
                filters: sanitized,
                sort: sort || 'relevance',
                searchQuery: searchQuery || ''
              });
              get().addToHistory();
              get().syncToUrl();
              return true;
            }
          }
          
          return false;
        } catch (error) {
          console.error('Error importing filters:', error);
          return false;
        }
      },
    }),
    {
      name: 'filter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        analytics: state.analytics.slice(0, 100), // Limit persisted analytics
      }),
    }
  )
);

// Helper hook for filter presets
export const useFilterPresets = () => {
  const applyFilterPreset = useFilterStore(state => state.applyFilterPreset);
  
  return {
    applyPreset: applyFilterPreset,
    presets: [
      {
        id: 'on-sale',
        name: 'On Sale',
        description: 'Items with discounts',
        filters: { showDeals: true }
      },
      {
        id: 'under-50k',
        name: 'Under ₦50K',
        description: 'Affordable options',
        filters: { priceRange: [0, 50000] as [number, number] }
      },
      {
        id: 'mens-shoes',
        name: "Men's Shoes",
        description: 'All men\'s footwear',
        filters: { 
          primaryCategory: 'bags-shoes' as const,
          subcategories: ['mens-shoes' as const]
        }
      }
    ]
  };
};
