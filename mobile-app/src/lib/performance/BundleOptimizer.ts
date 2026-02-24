/**
 * Bundle optimization utilities
 * Provides tree shaking and code splitting helpers
 * Optimized for Seeker device performance
 */

/**
 * Dynamic import helper for code splitting
 * Ensures proper chunk naming and error handling
 */
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  chunkName?: string
): Promise<T> {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.error(`Failed to load chunk ${chunkName || 'unknown'}:`, error);
    throw error;
  }
}

/**
 * Preload a module without executing it
 * Useful for prefetching screens before navigation
 */
export function preloadModule<T>(
  importFn: () => Promise<{ default: T }>
): void {
  // Start loading the module but don't wait for it
  importFn().catch(error => {
    console.warn('Module preload failed:', error);
  });
}

/**
 * Check if code splitting is supported
 */
export function isCodeSplittingSupported(): boolean {
  return typeof Promise !== 'undefined' && typeof import !== 'undefined';
}

/**
 * Bundle size analyzer helper
 * Logs bundle information in development
 */
export function logBundleInfo(): void {
  if (__DEV__) {
    console.log('=== Bundle Optimization Info ===');
    console.log('Code Splitting:', isCodeSplittingSupported() ? 'Enabled' : 'Disabled');
    console.log('Tree Shaking: Enabled (via Metro)');
    console.log('Minification: Enabled in production');
  }
}

/**
 * Memory optimization helper
 * Clears module cache for unused screens
 */
export function clearModuleCache(moduleName: string): void {
  if (__DEV__) {
    console.log(`Clearing cache for module: ${moduleName}`);
  }
  // Note: React Native doesn't expose module cache directly
  // This is a placeholder for future optimization
}
