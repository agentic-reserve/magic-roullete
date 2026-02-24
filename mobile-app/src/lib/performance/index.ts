/**
 * Performance optimization utilities
 * Exports all performance-related modules
 */

export { 
  preloadAssets, 
  preloadNonCriticalAssets,
  areAssetsCached,
  getPreloadProgress 
} from './AssetPreloader';
export { performanceMonitor } from './PerformanceMonitor';
export {
  LazyGameLobbyScreen,
  LazyCreateGameScreen,
  LazyGamePlayScreen,
  LazyDashboardScreen,
  LazySettingsScreen,
  LazyMigrationScreen,
  withSuspense,
} from './LazyScreens';
export {
  dynamicImport,
  preloadModule,
  isCodeSplittingSupported,
  logBundleInfo,
  clearModuleCache,
} from './BundleOptimizer';
