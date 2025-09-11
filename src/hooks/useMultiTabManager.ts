import { useCallback, useEffect, useRef, useState } from 'react';
import { TabLeaderElection, ConflictResolver, TabCommunication } from '@/utils/stateSync';
import { useToast } from '@/hooks/use-toast';

interface TabStatus {
  isLeader: boolean;
  leaderId: string;
  activeTabs: number;
  conflicts: any[];
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'offline';
}

interface ConflictResolutionOptions {
  strategy: 'last-write-wins' | 'merge' | 'user-choice';
  showDialog: boolean;
  autoResolve: boolean;
}

interface UseMultiTabManagerOptions {
  channelName?: string;
  conflictResolution?: ConflictResolutionOptions;
  onConflict?: (conflict: any) => void;
  onLeaderChange?: (isLeader: boolean) => void;
  syncInterval?: number;
  showLeaderNotifications?: boolean;
}

/**
 * Advanced multi-tab manager hook with leader election and conflict resolution
 */
export const useMultiTabManager = (options: UseMultiTabManagerOptions = {}) => {
  const {
    channelName = 'app-sync',
    conflictResolution = {
      strategy: 'last-write-wins',
      showDialog: false,
      autoResolve: true
    },
    onConflict,
    onLeaderChange,
    syncInterval = 1000,
    showLeaderNotifications = false
  } = options;

  const { toast } = useToast();
  
  const [tabStatus, setTabStatus] = useState<TabStatus>({
    isLeader: false,
    leaderId: '',
    activeTabs: 1,
    conflicts: [],
    syncStatus: 'synced'
  });

  const leaderElectionRef = useRef<TabLeaderElection | null>(null);
  const conflictResolverRef = useRef<ConflictResolver | null>(null);
  const tabCommunicationRef = useRef<TabCommunication | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tab management systems
  useEffect(() => {
    // Initialize conflict resolver
    conflictResolverRef.current = new ConflictResolver();
    
    // Initialize tab communication
    tabCommunicationRef.current = new TabCommunication(channelName);
    
    // Initialize leader election
    leaderElectionRef.current = new TabLeaderElection((isLeader, leaderId) => {
      setTabStatus(prev => ({ ...prev, isLeader, leaderId }));
      onLeaderChange?.(isLeader);
      
      if (isLeader && showLeaderNotifications) {
        toast({
          title: "Tab Leader",
          description: "This tab is now managing synchronization",
          duration: 2000,
        });
      }
    });

    // Set up tab communication listeners
    const unsubscribeSync = tabCommunicationRef.current.subscribe('sync', (message) => {
      handleSyncMessage(message);
    });

    const unsubscribeConflict = tabCommunicationRef.current.subscribe('conflict', (message) => {
      handleConflictMessage(message);
    });

    // Start periodic sync status updates
    syncIntervalRef.current = setInterval(() => {
      updateTabCount();
    }, syncInterval);

    return () => {
      if (leaderElectionRef.current) {
        leaderElectionRef.current.destroy();
      }
      if (tabCommunicationRef.current) {
        tabCommunicationRef.current.destroy();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      unsubscribeSync();
      unsubscribeConflict();
    };
  }, [channelName, syncInterval, onLeaderChange, showLeaderNotifications]);

  const handleSyncMessage = useCallback((message: any) => {
    setTabStatus(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    // Process sync message
    setTimeout(() => {
      setTabStatus(prev => ({ ...prev, syncStatus: 'synced' }));
    }, 500);
  }, []);

  const handleConflictMessage = useCallback((message: any) => {
    const conflict = message.payload;
    
    setTabStatus(prev => ({
      ...prev,
      conflicts: [...prev.conflicts, conflict],
      syncStatus: 'conflict'
    }));

    onConflict?.(conflict);

    if (!conflictResolution.showDialog && conflictResolution.autoResolve) {
      resolveConflict(conflict.id, conflictResolution.strategy);
    } else {
      toast({
        title: "Sync Conflict Detected",
        description: "Changes made in another tab conflict with current changes",
        duration: 5000,
      });
    }
  }, [conflictResolution, onConflict, toast]);

  const updateTabCount = useCallback(() => {
    const tabKeys = Object.keys(localStorage).filter(key => key.startsWith('tab-'));
    const now = Date.now();
    const activeTabs = tabKeys.filter(key => {
      const tabData = JSON.parse(localStorage.getItem(key) || '{}');
      return (now - tabData.lastHeartbeat) < 5000;
    }).length;

    setTabStatus(prev => ({ ...prev, activeTabs }));
  }, []);

  const broadcastSync = useCallback((data: any, key: string) => {
    if (!tabCommunicationRef.current) return;

    tabCommunicationRef.current.send('sync', { data, key, timestamp: Date.now() });
  }, []);

  const detectConflict = useCallback((key: string, currentValue: any, incomingValue: any) => {
    if (!conflictResolverRef.current) return null;

    return conflictResolverRef.current.detectConflict(
      key,
      currentValue,
      incomingValue,
      tabCommunicationRef.current?.getTabId() || 'unknown'
    );
  }, []);

  const resolveConflict = useCallback((conflictId: string, strategy: string = 'last-write-wins') => {
    if (!conflictResolverRef.current) return null;

    const resolved = conflictResolverRef.current.resolveConflict(conflictId, strategy);
    
    if (resolved !== null) {
      setTabStatus(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => c.id !== conflictId),
        syncStatus: prev.conflicts.length <= 1 ? 'synced' : 'conflict'
      }));

      toast({
        title: "Conflict Resolved",
        description: `Applied ${strategy} strategy`,
        duration: 2000,
      });
    }

    return resolved;
  }, [toast]);

  const forceSync = useCallback(() => {
    if (!tabCommunicationRef.current) return;

    setTabStatus(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    tabCommunicationRef.current.send('force-sync', { 
      type: 'force-sync', 
      timestamp: Date.now() 
    });

    setTimeout(() => {
      setTabStatus(prev => ({ ...prev, syncStatus: 'synced' }));
    }, 1000);
  }, []);

  const getTabId = useCallback(() => {
    return leaderElectionRef.current?.getTabId() || '';
  }, []);

  const addConflictResolutionStrategy = useCallback((name: string, resolver: (current: any, incoming: any) => any) => {
    conflictResolverRef.current?.addResolutionStrategy(name, resolver);
  }, []);

  const clearConflicts = useCallback(() => {
    setTabStatus(prev => ({ ...prev, conflicts: [], syncStatus: 'synced' }));
  }, []);

  return {
    tabStatus,
    broadcastSync,
    detectConflict,
    resolveConflict,
    forceSync,
    getTabId,
    addConflictResolutionStrategy,
    clearConflicts,
    
    // Computed values
    isLeader: tabStatus.isLeader,
    hasConflicts: tabStatus.conflicts.length > 0,
    isMultiTab: tabStatus.activeTabs > 1,
    syncStatus: tabStatus.syncStatus,
    
    // Internal references for advanced usage
    conflictResolver: conflictResolverRef.current,
    tabCommunication: tabCommunicationRef.current
  };
};

/**
 * Specialized hook for cart multi-tab management
 */
export const useCartMultiTabManager = () => {
  const multiTab = useMultiTabManager({
    channelName: 'cart-sync',
    conflictResolution: {
      strategy: 'user-choice',
      showDialog: true,
      autoResolve: false
    },
    onConflict: (conflict) => {
      // Handle cart-specific conflicts
      console.log('Cart conflict detected:', conflict);
    },
    showLeaderNotifications: false
  });

  // Add cart-specific conflict resolution strategies
  useEffect(() => {
    // Strategy for merging cart items intelligently
    multiTab.addConflictResolutionStrategy('cart-merge', (current: any[], incoming: any[]) => {
      const merged = [...current];
      
      incoming.forEach(incomingItem => {
        const existingIndex = merged.findIndex(item => 
          item.productId === incomingItem.productId && item.variantId === incomingItem.variantId
        );
        
        if (existingIndex >= 0) {
          // Merge quantities for existing items
          merged[existingIndex] = {
            ...merged[existingIndex],
            qty: merged[existingIndex].qty + incomingItem.qty
          };
        } else {
          // Add new items
          merged.push(incomingItem);
        }
      });
      
      return merged;
    });

    // Strategy for quantity conflicts - keep higher quantity
    multiTab.addConflictResolutionStrategy('max-quantity', (current: any[], incoming: any[]) => {
      const merged = [...current];
      
      incoming.forEach(incomingItem => {
        const existingIndex = merged.findIndex(item => 
          item.productId === incomingItem.productId && item.variantId === incomingItem.variantId
        );
        
        if (existingIndex >= 0) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            qty: Math.max(merged[existingIndex].qty, incomingItem.qty)
          };
        } else {
          merged.push(incomingItem);
        }
      });
      
      return merged;
    });
  }, [multiTab]);

  return multiTab;
};
