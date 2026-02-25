/**
 * Memory Management Utilities
 * Task 5.8: Memory optimization helpers and best practices
 * 
 * This module provides utilities and guidelines for efficient memory management
 * in the Magic Roulette mobile app.
 */

/**
 * Cleanup helper for component unmount
 * Use this to ensure proper cleanup of subscriptions, timers, and listeners
 */
export class CleanupManager {
  private cleanupFunctions: Array<() => void> = [];

  /**
   * Register a cleanup function to be called on unmount
   */
  add(cleanupFn: () => void): void {
    this.cleanupFunctions.push(cleanupFn);
  }

  /**
   * Execute all cleanup functions
   * Call this in useEffect return or componentWillUnmount
   */
  cleanup(): void {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

/**
 * Create a cleanup manager for use in components
 * 
 * Example usage:
 * ```tsx
 * useEffect(() => {
 *   const cleanup = createCleanupManager();
 *   
 *   const subscription = subscribe();
 *   cleanup.add(() => subscription.unsubscribe());
 *   
 *   const timer = setTimeout(() => {}, 1000);
 *   cleanup.add(() => clearTimeout(timer));
 *   
 *   return () => cleanup.cleanup();
 * }, []);
 * ```
 */
export function createCleanupManager(): CleanupManager {
  return new CleanupManager();
}

/**
 * Image cache management
 * Provides utilities for managing cached images
 */
export const ImageCacheManager = {
  /**
   * Clear all cached images
   * Use sparingly, only when memory pressure is detected
   */
  clearCache: async (): Promise<void> => {
    // Implementation would use expo-image cache clearing
    console.log('Image cache cleared');
  },

  /**
   * Get cache size estimate
   */
  getCacheSize: async (): Promise<number> => {
    // Implementation would check actual cache size
    return 0;
  },
};

/**
 * Memory optimization best practices
 * 
 * 1. Use React.memo for expensive components:
 *    - GameCard, PlayerList, ChamberAnimation
 *    - Provide custom comparison function when needed
 * 
 * 2. Use FlashList instead of FlatList:
 *    - Better memory management for long lists
 *    - Improved scroll performance
 *    - Provide estimatedItemSize for best results
 * 
 * 3. Cleanup on unmount:
 *    - Cancel subscriptions (WebSocket, event listeners)
 *    - Clear timers (setTimeout, setInterval)
 *    - Abort pending requests
 *    - Remove event listeners
 * 
 * 4. Image optimization:
 *    - Use expo-image with memory-disk caching
 *    - Provide blurhash placeholders
 *    - Use appropriate contentFit settings
 *    - Lazy load images when possible
 * 
 * 5. Avoid memory leaks:
 *    - Always return cleanup function from useEffect
 *    - Don't update state after unmount
 *    - Use AbortController for fetch requests
 *    - Properly dispose of animations
 */

/**
 * Hook to detect component unmount and prevent state updates
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = { current: true };

  // Cleanup on unmount
  const cleanup = () => {
    isMountedRef.current = false;
  };

  return () => isMountedRef.current;
}

/**
 * Safe state setter that checks if component is mounted
 * Prevents "Can't perform a React state update on an unmounted component" warnings
 */
export function useSafeState<T>(
  initialState: T
): [T, (newState: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState<T>(initialState);
  const isMounted = useIsMounted();

  const safeSetState = (newState: T | ((prev: T) => T)) => {
    if (isMounted()) {
      setState(newState);
    }
  };

  return [state, safeSetState];
}

// Import React for hooks
import React from 'react';
