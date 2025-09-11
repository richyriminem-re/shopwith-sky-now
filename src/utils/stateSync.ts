import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Advanced state synchronization utilities for managing state across browser tabs
 * with leader election, conflict resolution, and cross-tab communication
 */

interface StorageEventData {
  key: string;
  oldValue: string | null;
  newValue: string | null;
}

interface TabInfo {
  id: string;
  lastHeartbeat: number;
  isLeader: boolean;
  sessionStart: number;
}

interface ConflictData<T = any> {
  id: string;
  key: string;
  currentValue: T;
  incomingValue: T;
  timestamp: number;
  sourceTabId: string;
  conflictType: 'modification' | 'deletion' | 'addition';
}

interface TabMessage {
  type: 'heartbeat' | 'election' | 'conflict' | 'sync' | 'resolution' | 'force-sync';
  payload: any;
  timestamp: number;
  tabId: string;
}

const TAB_HEARTBEAT_INTERVAL = 1000; // 1 second
const TAB_TIMEOUT = 5000; // 5 seconds
const LEADER_ELECTION_DELAY = 2000; // 2 seconds

/**
 * Enhanced cross-tab communication with BroadcastChannel and localStorage fallback
 */
export class TabCommunication {
  private broadcastChannel: BroadcastChannel | null = null;
  private tabId: string;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(channelName: string) {
    this.tabId = Math.random().toString(36).substr(2, 9);
    
    try {
      this.broadcastChannel = new BroadcastChannel(channelName);
      this.broadcastChannel.addEventListener('message', this.handleBroadcastMessage);
    } catch (error) {
      console.warn('BroadcastChannel not supported, using localStorage fallback');
    }

    // Listen for localStorage changes as fallback
    window.addEventListener('storage', this.handleStorageMessage);
  }

  private handleBroadcastMessage = (event: MessageEvent<TabMessage>) => {
    if (event.data.tabId === this.tabId) return; // Ignore own messages
    this.notifyListeners(event.data.type, event.data);
  };

  private handleStorageMessage = (event: StorageEvent) => {
    if (!event.key?.startsWith('tab-message-')) return;
    
    try {
      const message: TabMessage = JSON.parse(event.newValue || '{}');
      if (message.tabId === this.tabId) return;
      this.notifyListeners(message.type, message);
    } catch (error) {
      console.error('Failed to parse tab message:', error);
    }
  };

  private notifyListeners(type: string, data: TabMessage) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  send(type: 'heartbeat' | 'election' | 'conflict' | 'sync' | 'resolution' | 'force-sync', payload: any) {
    const message: TabMessage = {
      type,
      payload,
      timestamp: Date.now(),
      tabId: this.tabId
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    } else {
      // Fallback to localStorage
      const key = `tab-message-${Date.now()}-${Math.random()}`;
      localStorage.setItem(key, JSON.stringify(message));
      // Clean up after a short delay
      setTimeout(() => localStorage.removeItem(key), 1000);
    }
  }

  subscribe(type: string, callback: (data: TabMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  getTabId() {
    return this.tabId;
  }

  destroy() {
    if (this.broadcastChannel) {
      this.broadcastChannel.removeEventListener('message', this.handleBroadcastMessage);
      this.broadcastChannel.close();
    }
    window.removeEventListener('storage', this.handleStorageMessage);
    this.listeners.clear();
  }
}

/**
 * Tab leader election system using heartbeat mechanism
 */
export class TabLeaderElection {
  private tabId: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private electionTimeout: NodeJS.Timeout | null = null;
  private isLeader = false;
  private onLeaderChange: (isLeader: boolean, leaderId: string) => void;
  private sessionStart: number;

  constructor(onLeaderChange: (isLeader: boolean, leaderId: string) => void) {
    this.tabId = Math.random().toString(36).substr(2, 9);
    this.sessionStart = Date.now();
    this.onLeaderChange = onLeaderChange;
    this.startHeartbeat();
    this.scheduleElection();
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
      this.checkForDeadTabs();
      this.checkLeadership();
    }, TAB_HEARTBEAT_INTERVAL);
  }

  private sendHeartbeat() {
    const tabInfo: TabInfo = {
      id: this.tabId,
      lastHeartbeat: Date.now(),
      isLeader: this.isLeader,
      sessionStart: this.sessionStart
    };

    safeSetToStorage(`tab-${this.tabId}`, tabInfo);
  }

  private checkForDeadTabs() {
    const now = Date.now();
    const tabKeys = Object.keys(localStorage).filter(key => key.startsWith('tab-'));
    
    tabKeys.forEach(key => {
      const tabInfo = safeGetFromStorage<TabInfo>(key, null);
      if (tabInfo && (now - tabInfo.lastHeartbeat) > TAB_TIMEOUT) {
        localStorage.removeItem(key);
      }
    });
  }

  private checkLeadership() {
    const activeTabs = this.getActiveTabs();
    const currentLeader = activeTabs.find(tab => tab.isLeader);
    
    if (!currentLeader && !this.isLeader) {
      // No leader exists, elect based on session start time
      const oldestTab = activeTabs.reduce((oldest, current) => 
        current.sessionStart < oldest.sessionStart ? current : oldest
      );
      
      if (oldestTab.id === this.tabId) {
        this.becomeLeader();
      }
    } else if (currentLeader && currentLeader.id !== this.tabId && this.isLeader) {
      // Another tab became leader, step down
      this.stepDown();
    }
  }

  private getActiveTabs(): TabInfo[] {
    const now = Date.now();
    const tabKeys = Object.keys(localStorage).filter(key => key.startsWith('tab-'));
    
    return tabKeys
      .map(key => safeGetFromStorage<TabInfo>(key, null))
      .filter((tab): tab is TabInfo => 
        tab !== null && (now - tab.lastHeartbeat) < TAB_TIMEOUT
      );
  }

  private scheduleElection() {
    this.electionTimeout = setTimeout(() => {
      const activeTabs = this.getActiveTabs();
      const hasLeader = activeTabs.some(tab => tab.isLeader);
      
      if (!hasLeader) {
        this.becomeLeader();
      }
    }, LEADER_ELECTION_DELAY);
  }

  private becomeLeader() {
    this.isLeader = true;
    this.sendHeartbeat(); // Update storage immediately
    this.onLeaderChange(true, this.tabId);
  }

  private stepDown() {
    this.isLeader = false;
    this.sendHeartbeat(); // Update storage immediately
    const activeTabs = this.getActiveTabs();
    const leader = activeTabs.find(tab => tab.isLeader);
    this.onLeaderChange(false, leader?.id || '');
  }

  getTabId() {
    return this.tabId;
  }

  isCurrentLeader() {
    return this.isLeader;
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
    }
    localStorage.removeItem(`tab-${this.tabId}`);
  }
}

/**
 * Conflict detection and resolution system
 */
export class ConflictResolver<T = any> {
  private conflicts: Map<string, ConflictData<T>> = new Map();
  private resolutionStrategies: Map<string, (current: T, incoming: T) => T> = new Map();

  constructor() {
    // Default resolution strategies
    this.resolutionStrategies.set('last-write-wins', (current, incoming) => incoming);
    this.resolutionStrategies.set('merge', this.mergeStrategy);
    this.resolutionStrategies.set('user-choice', (current, incoming) => current); // Requires UI
  }

  private mergeStrategy = (current: any, incoming: any): any => {
    if (Array.isArray(current) && Array.isArray(incoming)) {
      // Merge arrays by combining and deduplicating
      const merged = [...current];
      incoming.forEach((item: any) => {
        const exists = merged.find(existing => 
          typeof item === 'object' && item.id ? existing.id === item.id : existing === item
        );
        if (!exists) {
          merged.push(item);
        }
      });
      return merged;
    } else if (typeof current === 'object' && typeof incoming === 'object') {
      // Merge objects
      return { ...current, ...incoming };
    }
    return incoming; // Fallback to last-write-wins
  };

  detectConflict(key: string, currentValue: T, incomingValue: T, sourceTabId: string): ConflictData<T> | null {
    // Simple conflict detection - values are different
    if (JSON.stringify(currentValue) === JSON.stringify(incomingValue)) {
      return null;
    }

    const conflict: ConflictData<T> = {
      id: Math.random().toString(36).substr(2, 9),
      key,
      currentValue,
      incomingValue,
      timestamp: Date.now(),
      sourceTabId,
      conflictType: this.determineConflictType(currentValue, incomingValue)
    };

    this.conflicts.set(conflict.id, conflict);
    return conflict;
  }

  private determineConflictType(current: T, incoming: T): ConflictData['conflictType'] {
    if (current === null || current === undefined) return 'addition';
    if (incoming === null || incoming === undefined) return 'deletion';
    return 'modification';
  }

  resolveConflict(conflictId: string, strategy: string = 'last-write-wins'): T | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return null;

    const resolver = this.resolutionStrategies.get(strategy);
    if (!resolver) return null;

    const resolved = resolver(conflict.currentValue, conflict.incomingValue);
    this.conflicts.delete(conflictId);
    return resolved;
  }

  getConflicts(): ConflictData<T>[] {
    return Array.from(this.conflicts.values());
  }

  addResolutionStrategy(name: string, resolver: (current: T, incoming: T) => T) {
    this.resolutionStrategies.set(name, resolver);
  }
}

/**
 * Enhanced hook to synchronize state across browser tabs with conflict resolution
 */
export const useCrossTabSync = (
  storageKey: string,
  onStorageChange: (data: any, conflict?: ConflictData) => void,
  enabled: boolean = true,
  conflictResolver?: ConflictResolver
) => {
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (!enabled || e.key !== storageKey) return;

    try {
      const newValue = e.newValue ? JSON.parse(e.newValue) : null;
      const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;

      if (conflictResolver && oldValue !== null) {
        const conflict = conflictResolver.detectConflict(
          storageKey,
          oldValue,
          newValue,
          'unknown'
        );
        
        if (conflict) {
          onStorageChange(newValue, conflict);
          return;
        }
      }

      onStorageChange(newValue);
    } catch (error) {
      console.error('Failed to sync state across tabs:', error);
    }
  }, [storageKey, onStorageChange, enabled, conflictResolver]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleStorageChange, enabled]);
};

/**
 * Utility to safely get data from localStorage with error handling
 */
export const safeGetFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to get ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Utility to safely set data to localStorage with error handling
 */
export const safeSetToStorage = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set ${key} to localStorage:`, error);
    return false;
  }
};

/**
 * Utility to validate and recover corrupted state
 */
export const validateAndRecoverState = <T>(
  data: any,
  validator: (data: any) => data is T,
  fallback: T
): T => {
  try {
    if (validator(data)) {
      return data;
    }
    console.warn('Invalid state detected, using fallback');
    return fallback;
  } catch (error) {
    console.error('State validation error:', error);
    return fallback;
  }
};

/**
 * Hook for managing state with automatic recovery and cross-tab sync
 */
export const useResilientState = <T>(
  key: string,
  defaultValue: T,
  validator?: (data: any) => data is T
) => {
  // Get initial state with validation
  const getInitialState = useCallback((): T => {
    const stored = safeGetFromStorage(key, defaultValue);
    
    if (validator) {
      return validateAndRecoverState(stored, validator, defaultValue);
    }
    
    return stored;
  }, [key, defaultValue, validator]);

  // Set state with validation and persistence
  const setState = useCallback((newState: T): boolean => {
    if (validator && !validator(newState)) {
      console.warn(`Invalid state for ${key}:`, newState);
      return false;
    }
    
    return safeSetToStorage(key, newState);
  }, [key, validator]);

  return {
    getInitialState,
    setState,
    clearState: () => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Failed to clear ${key}:`, error);
        return false;
      }
    }
  };
};