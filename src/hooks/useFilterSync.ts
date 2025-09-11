/**
 * URL Filter Synchronization Hook
 * Handles bidirectional synchronization between URL parameters and filter state
 */

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilterStore } from '@/lib/filterManager';
import { parseUrlParams } from '@/utils/filterValidation';

interface UseFilterSyncOptions {
  // Whether to sync on mount
  syncOnMount?: boolean;
  // Whether to sync to URL when filters change
  syncToUrl?: boolean;
  // Whether to sync from URL when URL changes
  syncFromUrl?: boolean;
  // Debounce delay for URL updates (ms)
  debounceMs?: number;
}

export const useFilterSync = (options: UseFilterSyncOptions = {}) => {
  const {
    syncOnMount = true,
    syncToUrl = true,
    syncFromUrl = true,
    debounceMs = 300
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    filters,
    sort,
    searchQuery,
    syncFromUrl: syncFiltersFromUrl,
    syncToUrl: syncFiltersToUrl,
    isSyncingUrl
  } = useFilterStore();

  // Sync from URL to filters on mount and URL changes
  useEffect(() => {
    if (!syncFromUrl || isSyncingUrl) return;

    if (syncOnMount || searchParams.toString()) {
      syncFiltersFromUrl(searchParams);
    }
  }, [searchParams, syncFromUrl, syncOnMount, syncFiltersFromUrl, isSyncingUrl]);

  // Sync from filters to URL when filters change
  useEffect(() => {
    if (!syncToUrl || isSyncingUrl) return;

    const timeoutId = setTimeout(() => {
      syncFiltersToUrl();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, sort, searchQuery, syncToUrl, syncFiltersToUrl, isSyncingUrl, debounceMs]);

  // Manual sync methods
  const manualSyncFromUrl = useCallback(() => {
    syncFiltersFromUrl(searchParams);
  }, [searchParams, syncFiltersFromUrl]);

  const manualSyncToUrl = useCallback(() => {
    syncFiltersToUrl();
  }, [syncFiltersToUrl]);

  // Get current URL with filters
  const getCurrentUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    return `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [searchParams]);

  // Generate shareable URL
  const getShareableUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams(searchParams);
    return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [searchParams]);

  // Check if URL has filter parameters
  const hasUrlFilters = useCallback(() => {
    const urlFilters = parseUrlParams(searchParams);
    return Object.keys(urlFilters).length > 0 || searchParams.has('sort');
  }, [searchParams]);

  // Clear URL parameters
  const clearUrlParams = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return {
    // State
    isSyncing: isSyncingUrl,
    hasUrlFilters: hasUrlFilters(),
    currentUrl: getCurrentUrl(),
    shareableUrl: getShareableUrl(),
    
    // Methods
    syncFromUrl: manualSyncFromUrl,
    syncToUrl: manualSyncToUrl,
    clearUrlParams,
    
    // URL utilities
    getCurrentUrl,
    getShareableUrl,
  };
};

// Hook for deep linking support
export const useDeepLinking = () => {
  const { getShareableUrl, hasUrlFilters } = useFilterSync();
  const { getFilterSummary } = useFilterStore();

  const copyUrlToClipboard = useCallback(async () => {
    const url = getShareableUrl();
    
    try {
      await navigator.clipboard.writeText(url);
      return { success: true, url };
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true, url };
      } catch (fallbackError) {
        document.body.removeChild(textArea);
        return { success: false, error: fallbackError };
      }
    }
  }, [getShareableUrl]);

  const generateShareText = useCallback(() => {
    const summary = getFilterSummary();
    const url = getShareableUrl();
    return `Check out these products: ${summary}\n\n${url}`;
  }, [getFilterSummary, getShareableUrl]);

  const shareViaWebShare = useCallback(async () => {
    if (!navigator.share) {
      return { success: false, error: 'Web Share API not supported' };
    }

    try {
      await navigator.share({
        title: 'Product Filters',
        text: generateShareText(),
        url: getShareableUrl(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [generateShareText, getShareableUrl]);

  return {
    hasFiltersToShare: hasUrlFilters,
    shareableUrl: getShareableUrl(),
    shareText: generateShareText(),
    copyUrlToClipboard,
    shareViaWebShare,
    canUseWebShare: !!navigator.share,
  };
};

// Hook for filter state persistence across navigation
export const useFilterPersistence = () => {
  const { exportFilters, importFilters, history, clearHistory } = useFilterStore();

  const saveFiltersToStorage = useCallback((key: string) => {
    const filterData = exportFilters();
    localStorage.setItem(`saved-filters-${key}`, filterData);
    return true;
  }, [exportFilters]);

  const loadFiltersFromStorage = useCallback((key: string) => {
    const filterData = localStorage.getItem(`saved-filters-${key}`);
    if (filterData) {
      return importFilters(filterData);
    }
    return false;
  }, [importFilters]);

  const getSavedFilterKeys = useCallback(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('saved-filters-')) {
        keys.push(key.replace('saved-filters-', ''));
      }
    }
    return keys;
  }, []);

  const deleteSavedFilters = useCallback((key: string) => {
    localStorage.removeItem(`saved-filters-${key}`);
  }, []);

  return {
    saveFilters: saveFiltersToStorage,
    loadFilters: loadFiltersFromStorage,
    getSavedKeys: getSavedFilterKeys,
    deleteFilters: deleteSavedFilters,
    history,
    clearHistory,
  };
};