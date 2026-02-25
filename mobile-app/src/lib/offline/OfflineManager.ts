/**
 * Offline Manager
 * Task 5.6: Offline capability with graceful degradation
 * 
 * Features:
 * 1. Offline detection and UI indicator
 * 2. Local caching for game data
 * 3. Graceful degradation for offline state
 * 4. Queue for pending actions when offline
 * 
 * Requirements: 3.9
 * 
 * NOTE: This implementation requires the following dependencies:
 * - @react-native-async-storage/async-storage
 * - @react-native-community/netinfo
 * 
 * Install with: npm install @react-native-async-storage/async-storage @react-native-community/netinfo
 */

// Mock implementations for development without dependencies
const AsyncStorage = {
  setItem: async (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  getItem: async (key: string) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: async (key: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  getAllKeys: async () => {
    if (typeof localStorage !== 'undefined') {
      return Object.keys(localStorage);
    }
    return [];
  },
  multiRemove: async (keys: string[]) => {
    if (typeof localStorage !== 'undefined') {
      keys.forEach(key => localStorage.removeItem(key));
    }
  },
};

const NetInfo = {
  addEventListener: (callback: (state: any) => void) => {
    // Mock implementation - always online
    const state = { isConnected: true };
    callback(state);
    
    // Listen to online/offline events
    if (typeof window !== 'undefined') {
      const handleOnline = () => callback({ isConnected: true });
      const handleOffline = () => callback({ isConnected: false });
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    
    return () => {};
  },
};

interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

class OfflineManager {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private pendingActions: PendingAction[] = [];
  private readonly PENDING_ACTIONS_KEY = '@magic_roulette:pending_actions';
  private readonly CACHE_PREFIX = '@magic_roulette:cache:';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initialize();
  }

  /**
   * Initialize offline manager
   */
  private async initialize() {
    // Listen to network state changes
    NetInfo.addEventListener((state: any) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Notify listeners
      this.listeners.forEach(listener => listener(this.isOnline));

      // Process pending actions when coming back online
      if (!wasOnline && this.isOnline) {
        this.processPendingActions();
      }
    });

    // Load pending actions from storage
    await this.loadPendingActions();
  }

  /**
   * Check if device is online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to online/offline state changes
   */
  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cache data locally
   */
  async cacheData(key: string, data: any, expiresIn?: number): Promise<void> {
    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };

    try {
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cachedData)
      );
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      
      if (!cached) {
        return null;
      }

      const cachedData: CachedData = JSON.parse(cached);

      // Check if cache has expired
      if (cachedData.expiresAt && Date.now() > cachedData.expiresAt) {
        await this.clearCache(key);
        return null;
      }

      return cachedData.data as T;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Queue action for later execution when online
   */
  async queueAction(type: string, payload: any): Promise<void> {
    const action: PendingAction = {
      id: `${type}-${Date.now()}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingActions.push(action);
    await this.savePendingActions();
  }

  /**
   * Get pending actions
   */
  getPendingActions(): PendingAction[] {
    return [...this.pendingActions];
  }

  /**
   * Process pending actions
   */
  private async processPendingActions(): Promise<void> {
    if (!this.isOnline || this.pendingActions.length === 0) {
      return;
    }

    console.log(`Processing ${this.pendingActions.length} pending actions...`);

    const actionsToProcess = [...this.pendingActions];
    this.pendingActions = [];

    for (const action of actionsToProcess) {
      try {
        // Attempt to execute action
        await this.executeAction(action);
        console.log(`Successfully executed action: ${action.type}`);
      } catch (error) {
        console.error(`Failed to execute action: ${action.type}`, error);

        // Retry if under max retry count
        if (action.retryCount < this.MAX_RETRY_COUNT) {
          action.retryCount++;
          this.pendingActions.push(action);
        } else {
          console.warn(`Max retries reached for action: ${action.type}`);
        }
      }
    }

    await this.savePendingActions();
  }

  /**
   * Execute a pending action
   */
  private async executeAction(action: PendingAction): Promise<void> {
    // This should be implemented by the app to handle specific action types
    // For now, just log the action
    console.log('Executing action:', action);
    
    // TODO: Implement action execution based on type
    // Example:
    // switch (action.type) {
    //   case 'JOIN_GAME':
    //     await gameService.joinGame(action.payload.gameId);
    //     break;
    //   case 'TAKE_SHOT':
    //     await gameService.takeShot(action.payload.gameId);
    //     break;
    // }
  }

  /**
   * Load pending actions from storage
   */
  private async loadPendingActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.PENDING_ACTIONS_KEY);
      if (stored) {
        this.pendingActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  }

  /**
   * Save pending actions to storage
   */
  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.PENDING_ACTIONS_KEY,
        JSON.stringify(this.pendingActions)
      );
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }

  /**
   * Clear all pending actions
   */
  async clearPendingActions(): Promise<void> {
    this.pendingActions = [];
    await this.savePendingActions();
  }

  /**
   * Get offline status message
   */
  getOfflineMessage(): string {
    const pendingCount = this.pendingActions.length;
    
    if (pendingCount === 0) {
      return 'You are offline. Some features may be unavailable.';
    }
    
    return `You are offline. ${pendingCount} action${pendingCount > 1 ? 's' : ''} pending.`;
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

/**
 * React hook for offline state
 */
export function useOffline() {
  const [isOnline, setIsOnline] = React.useState(offlineManager.getIsOnline());
  const [pendingActions, setPendingActions] = React.useState(offlineManager.getPendingActions());

  React.useEffect(() => {
    const unsubscribe = offlineManager.subscribe((online) => {
      setIsOnline(online);
      setPendingActions(offlineManager.getPendingActions());
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    offlineMessage: offlineManager.getOfflineMessage(),
    queueAction: (type: string, payload: any) => offlineManager.queueAction(type, payload),
    cacheData: (key: string, data: any, expiresIn?: number) =>
      offlineManager.cacheData(key, data, expiresIn),
    getCachedData: <T,>(key: string) => offlineManager.getCachedData<T>(key),
    clearCache: (key: string) => offlineManager.clearCache(key),
  };
}

// Re-export React for the hook
import * as React from 'react';
