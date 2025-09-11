import { useCallback, useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store';
import { useCartMultiTabManager } from '@/hooks/useMultiTabManager';
import { useCrossTabSync, safeGetFromStorage, safeSetToStorage } from '@/utils/stateSync';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/types';

interface CartSyncOptions {
  autoSync?: boolean;
  conflictResolution?: 'manual' | 'auto-merge' | 'last-write-wins';
  onConflict?: (conflict: any) => void;
  syncDelay?: number;
}

/**
 * Hook for cart-specific multi-tab synchronization with conflict resolution
 */
export const useCartSync = (options: CartSyncOptions = {}) => {
  const {
    autoSync = true,
    conflictResolution = 'manual',
    onConflict,
    syncDelay = 500
  } = options;

  const { toast } = useToast();
  const cartStore = useCartStore();
  const multiTab = useCartMultiTabManager();
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const conflictDialogRef = useRef<any>(null);

  // Track cart changes and sync to other tabs
  const syncCartToTabs = useCallback((items: CartItem[], source: 'local' | 'remote' = 'local') => {
    if (source === 'remote' || !autoSync) return;

    // Debounce sync operations
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const syncData = {
        items,
        timestamp: Date.now(),
        tabId: multiTab.getTabId(),
        checksum: generateCartChecksum(items)
      };

      safeSetToStorage('cart-sync-data', syncData);
      multiTab.broadcastSync(syncData, 'cart-items');
      lastSyncRef.current = Date.now();
    }, syncDelay);
  }, [autoSync, syncDelay, multiTab]);

  // Generate checksum for cart data integrity
  const generateCartChecksum = useCallback((items: CartItem[]): string => {
    const sortedItems = [...items].sort((a, b) => 
      `${a.productId}-${a.variantId}`.localeCompare(`${b.productId}-${b.variantId}`)
    );
    
    const dataString = JSON.stringify(sortedItems.map(item => ({
      id: `${item.productId}-${item.variantId}`,
      qty: item.qty
    })));
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }, []);

  // Handle incoming cart sync data
  const handleCartSync = useCallback((syncData: any, conflict?: any) => {
    if (!syncData || syncData.tabId === multiTab.getTabId()) return;

    const currentItems = cartStore.items;
    const incomingItems = syncData.items || [];
    
    // Verify data integrity
    const expectedChecksum = generateCartChecksum(incomingItems);
    if (syncData.checksum && syncData.checksum !== expectedChecksum) {
      console.warn('Cart sync data integrity check failed');
      return;
    }

    // Check if we have a conflict
    if (conflict || hasCartConflict(currentItems, incomingItems, syncData.timestamp)) {
      const conflictData = multiTab.detectConflict('cart-items', currentItems, incomingItems);
      
      if (conflictData) {
        onConflict?.(conflictData);
        
        if (conflictResolution === 'auto-merge') {
          const resolved = multiTab.resolveConflict(conflictData.id, 'cart-merge');
          if (resolved) {
            updateCartWithResolution(resolved);
          }
        } else if (conflictResolution === 'last-write-wins') {
          if (syncData.timestamp > lastSyncRef.current) {
            updateCartWithResolution(incomingItems);
          }
        }
        // For 'manual', we'll let the UI handle it
        
        return;
      }
    }

    // No conflict, apply changes
    if (syncData.timestamp > lastSyncRef.current) {
      updateCartWithResolution(incomingItems);
      
      toast({
        title: "Cart Synchronized",
        description: "Your cart was updated from another tab",
        duration: 3000,
      });
    }
  }, [cartStore.items, multiTab, conflictResolution, onConflict, toast, generateCartChecksum]);

  // Check if current cart state conflicts with incoming data
  const hasCartConflict = useCallback((current: CartItem[], incoming: CartItem[], incomingTimestamp: number): boolean => {
    // If local changes were made after the incoming timestamp, it's a conflict
    if (lastSyncRef.current > incomingTimestamp) {
      return true;
    }

    // Check for structural differences
    const currentMap = new Map(current.map(item => [`${item.productId}-${item.variantId}`, item.qty]));
    const incomingMap = new Map(incoming.map(item => [`${item.productId}-${item.variantId}`, item.qty]));

    // Different number of unique items
    if (currentMap.size !== incomingMap.size) {
      return true;
    }

    // Check for quantity differences
    for (const [key, qty] of currentMap) {
      if (!incomingMap.has(key) || incomingMap.get(key) !== qty) {
        return true;
      }
    }

    return false;
  }, []);

  // Update cart with resolved data
  const updateCartWithResolution = useCallback((resolvedItems: CartItem[]) => {
    // Clear current cart
    cartStore.clearCart();
    
    // Add resolved items
    resolvedItems.forEach(item => {
      cartStore.addItem(item);
    });

    lastSyncRef.current = Date.now();
  }, [cartStore]);

  // Set up cross-tab sync listener
  useCrossTabSync('cart-sync-data', handleCartSync, autoSync, multiTab.conflictResolver);

  // Sync cart changes to other tabs
  useEffect(() => {
    syncCartToTabs(cartStore.items);
  }, [cartStore.items, syncCartToTabs]);

  // Prevent duplicate orders by checking checkout state across tabs
  const preventDuplicateCheckout = useCallback(async (): Promise<boolean> => {
    const checkoutKey = 'checkout-in-progress';
    const existingCheckout = safeGetFromStorage(checkoutKey, null);
    
    if (existingCheckout && existingCheckout.tabId !== multiTab.getTabId()) {
      const timeDiff = Date.now() - existingCheckout.timestamp;
      
      // If checkout started less than 5 minutes ago in another tab
      if (timeDiff < 300000) {
        toast({
          title: "Checkout in Progress",
          description: "Another tab is currently processing this order",
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }
    }

    // Mark checkout as in progress
    safeSetToStorage(checkoutKey, {
      tabId: multiTab.getTabId(),
      timestamp: Date.now(),
      cartChecksum: generateCartChecksum(cartStore.items)
    });

    return true;
  }, [multiTab, cartStore.items, generateCartChecksum, toast]);

  // Clear checkout lock
  const clearCheckoutLock = useCallback(() => {
    localStorage.removeItem('checkout-in-progress');
  }, []);

  // Force sync with other tabs
  const forceSync = useCallback(() => {
    const currentData = {
      items: cartStore.items,
      timestamp: Date.now(),
      tabId: multiTab.getTabId(),
      checksum: generateCartChecksum(cartStore.items)
    };

    safeSetToStorage('cart-sync-data', currentData);
    multiTab.forceSync();
    lastSyncRef.current = Date.now();

    toast({
      title: "Cart Synchronized",
      description: "Forced sync with other tabs completed",
      duration: 2000,
    });
  }, [cartStore.items, multiTab, generateCartChecksum, toast]);

  // Get cart sync status
  const getSyncStatus = useCallback(() => {
    return {
      ...multiTab.tabStatus,
      lastSync: lastSyncRef.current,
      timeSinceLastSync: Date.now() - lastSyncRef.current,
      hasConflicts: multiTab.hasConflicts,
      isMultiTab: multiTab.isMultiTab
    };
  }, [multiTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      clearCheckoutLock();
    };
  }, [clearCheckoutLock]);

  return {
    // Status
    syncStatus: getSyncStatus(),
    isLeader: multiTab.isLeader,
    hasConflicts: multiTab.hasConflicts,
    isMultiTab: multiTab.isMultiTab,
    
    // Actions
    forceSync,
    preventDuplicateCheckout,
    clearCheckoutLock,
    resolveConflict: multiTab.resolveConflict,
    clearConflicts: multiTab.clearConflicts,
    
    // Multi-tab manager
    multiTabManager: multiTab
  };
};