import { useCallback, useEffect, useRef } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { useMultiTabManager } from '@/hooks/useMultiTabManager';
import { useCrossTabSync, safeGetFromStorage, safeSetToStorage } from '@/utils/stateSync';
import { useToast } from '@/hooks/use-toast';

interface CheckoutData {
  appliedPromoCodes: string[];
  shippingOption: 'standard' | 'express';
  currentStep: 'address' | 'review';
  address: any;
}

interface CheckoutSyncOptions {
  autoSync?: boolean;
  conflictResolution?: 'user-choice' | 'merge' | 'last-write-wins';
  onConflict?: (conflict: any) => void;
  syncDelay?: number;
}

/**
 * Hook for checkout-specific multi-tab synchronization with conflict resolution
 */
export const useCheckoutSync = (options: CheckoutSyncOptions = {}) => {
  const {
    autoSync = true,
    conflictResolution = 'last-write-wins',
    onConflict,
    syncDelay = 300
  } = options;

  const { toast } = useToast();
  const checkoutStore = useCheckoutStore();
  const multiTab = useMultiTabManager({
    channelName: 'checkout-sync',
    conflictResolution: {
      strategy: conflictResolution,
      showDialog: false,
      autoResolve: conflictResolution !== 'user-choice'
    },
    onConflict: (conflict) => {
      onConflict?.(conflict);
    },
    showLeaderNotifications: false
  });
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  // Get current checkout data
  const getCurrentCheckoutData = useCallback((): CheckoutData => ({
    appliedPromoCodes: checkoutStore.appliedPromoCodes,
    shippingOption: checkoutStore.shippingOption,
    currentStep: checkoutStore.currentStep,
    address: checkoutStore.address
  }), [checkoutStore]);

  // Generate checksum for checkout data integrity
  const generateCheckoutChecksum = useCallback((data: CheckoutData): string => {
    const dataString = JSON.stringify({
      codes: data.appliedPromoCodes.sort(),
      shipping: data.shippingOption,
      step: data.currentStep
    });
    
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }, []);

  // Track checkout changes and sync to other tabs
  const syncCheckoutToTabs = useCallback((data: CheckoutData, source: 'local' | 'remote' = 'local') => {
    if (source === 'remote' || !autoSync) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const syncData = {
        ...data,
        timestamp: Date.now(),
        tabId: multiTab.getTabId(),
        checksum: generateCheckoutChecksum(data)
      };

      safeSetToStorage('checkout-sync-data', syncData);
      multiTab.broadcastSync(syncData, 'checkout-data');
      lastSyncRef.current = Date.now();
    }, syncDelay);
  }, [autoSync, syncDelay, multiTab, generateCheckoutChecksum]);

  // Handle incoming checkout sync data
  const handleCheckoutSync = useCallback((syncData: any, conflict?: any) => {
    if (!syncData || syncData.tabId === multiTab.getTabId()) return;

    const currentData = getCurrentCheckoutData();
    
    // Verify data integrity
    const expectedChecksum = generateCheckoutChecksum(syncData);
    if (syncData.checksum && syncData.checksum !== expectedChecksum) {
      console.warn('Checkout sync data integrity check failed');
      return;
    }

    // Check if we have a conflict
    if (conflict || hasCheckoutConflict(currentData, syncData, syncData.timestamp)) {
      const conflictData = multiTab.detectConflict('checkout-data', currentData, syncData);
      
      if (conflictData) {
        onConflict?.(conflictData);
        
        if (conflictResolution === 'merge') {
          const resolved = multiTab.resolveConflict(conflictData.id, 'checkout-merge');
          if (resolved) {
            updateCheckoutWithResolution(resolved);
          }
        } else if (conflictResolution === 'last-write-wins') {
          if (syncData.timestamp > lastSyncRef.current) {
            updateCheckoutWithResolution(syncData);
          }
        }
        return;
      }
    }

    // No conflict, apply changes
    if (syncData.timestamp > lastSyncRef.current) {
      updateCheckoutWithResolution(syncData);
      
      toast({
        title: "Checkout Synchronized",
        description: "Promo codes and checkout data updated from another tab",
        duration: 3000,
      });
    }
  }, [getCurrentCheckoutData, multiTab, conflictResolution, onConflict, toast, generateCheckoutChecksum]);

  // Check if current checkout state conflicts with incoming data
  const hasCheckoutConflict = useCallback((current: CheckoutData, incoming: any, incomingTimestamp: number): boolean => {
    if (lastSyncRef.current > incomingTimestamp) {
      return true;
    }

    // Check for promo code differences
    const currentCodes = new Set(current.appliedPromoCodes);
    const incomingCodes = new Set(incoming.appliedPromoCodes || []);
    
    if (currentCodes.size !== incomingCodes.size) {
      return true;
    }

    for (const code of currentCodes) {
      if (!incomingCodes.has(code)) {
        return true;
      }
    }

    // Check for discount differences - removed since discount is now calculated dynamically

    // Check for shipping option differences
    if (current.shippingOption !== incoming.shippingOption) {
      return true;
    }

    return false;
  }, []);

  // Update checkout with resolved data
  const updateCheckoutWithResolution = useCallback((resolvedData: any) => {
    if (resolvedData.appliedPromoCodes !== undefined) {
      // Reset promos first, then add resolved ones
      checkoutStore.resetPromos();
      resolvedData.appliedPromoCodes.forEach((code: string) => {
        checkoutStore.addPromoCode(code); // Just add the code, discount calculated dynamically
      });
    }

    // Discount is now calculated dynamically from promo codes, no need to sync

    if (resolvedData.shippingOption !== undefined) {
      checkoutStore.setShippingOption(resolvedData.shippingOption);
    }

    if (resolvedData.currentStep !== undefined) {
      checkoutStore.setCurrentStep(resolvedData.currentStep);
    }

    if (resolvedData.address !== undefined) {
      checkoutStore.setAddress(resolvedData.address);
    }

    lastSyncRef.current = Date.now();
  }, [checkoutStore]);

  // Set up cross-tab sync listener
  useCrossTabSync('checkout-sync-data', handleCheckoutSync, autoSync, multiTab.conflictResolver);

  // Sync checkout changes to other tabs
  useEffect(() => {
    const currentData = getCurrentCheckoutData();
    syncCheckoutToTabs(currentData);
  }, [
    checkoutStore.appliedPromoCodes,
    checkoutStore.shippingOption,
    checkoutStore.currentStep,
    syncCheckoutToTabs,
    getCurrentCheckoutData
  ]);

  // Add checkout-specific conflict resolution strategies
  useEffect(() => {
    // Strategy for merging checkout data intelligently
    multiTab.addConflictResolutionStrategy('checkout-merge', (current: CheckoutData, incoming: any) => {
      return {
        appliedPromoCodes: [...new Set([...current.appliedPromoCodes, ...(incoming.appliedPromoCodes || [])])],
        shippingOption: incoming.shippingOption || current.shippingOption,
        currentStep: incoming.currentStep || current.currentStep,
        address: { ...current.address, ...(incoming.address || {}) }
      };
    });
  }, [multiTab]);

  // Force sync with other tabs
  const forceSync = useCallback(() => {
    const currentData = getCurrentCheckoutData();
    const syncData = {
      ...currentData,
      timestamp: Date.now(),
      tabId: multiTab.getTabId(),
      checksum: generateCheckoutChecksum(currentData)
    };

    safeSetToStorage('checkout-sync-data', syncData);
    multiTab.forceSync();
    lastSyncRef.current = Date.now();

    toast({
      title: "Checkout Synchronized",
      description: "Forced sync with other tabs completed",
      duration: 2000,
    });
  }, [getCurrentCheckoutData, multiTab, generateCheckoutChecksum, toast]);

  // Get checkout sync status
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
    };
  }, []);

  return {
    // Status
    syncStatus: getSyncStatus(),
    isLeader: multiTab.isLeader,
    hasConflicts: multiTab.hasConflicts,
    isMultiTab: multiTab.isMultiTab,
    
    // Actions
    forceSync,
    resolveConflict: multiTab.resolveConflict,
    clearConflicts: multiTab.clearConflicts,
    
    // Multi-tab manager
    multiTabManager: multiTab
  };
};