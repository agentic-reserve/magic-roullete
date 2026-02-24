/**
 * Asset preloading service for images and fonts
 * Preloads critical assets during app initialization
 * Optimized for Seeker device performance (<100ms load time target)
 */
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

// Critical images to preload (only essential assets for initial render)
const criticalImages = [
  require('../../../assets/icon.png'),
  require('../../../assets/splash.png'),
];

// Non-critical images (loaded after initial render)
const nonCriticalImages = [
  require('../../../assets/adaptive-icon.png'),
  require('../../../assets/favicon.png'),
];

// Critical fonts to preload
const fonts = {
  // Add custom fonts here if needed
  // 'CustomFont-Regular': require('../../../assets/fonts/CustomFont-Regular.ttf'),
};

/**
 * Preload only critical assets for fast initial load
 * Should be called during app initialization
 */
export async function preloadAssets(): Promise<void> {
  try {
    // Preload only critical images for fast startup
    const imageAssets = criticalImages.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });

    // Preload fonts
    const fontAssets = Object.keys(fonts).length > 0 
      ? [Font.loadAsync(fonts)]
      : [];

    // Wait for all critical assets to load
    await Promise.all([...imageAssets, ...fontAssets]);
  } catch (error) {
    console.warn('Critical asset preloading failed:', error);
    // Don't throw - app should still work without preloaded assets
  }
}

/**
 * Preload non-critical assets in the background
 * Called after app is ready to avoid blocking initial render
 */
export async function preloadNonCriticalAssets(): Promise<void> {
  try {
    const imageAssets = nonCriticalImages.map(image => {
      return Asset.fromModule(image).downloadAsync();
    });

    await Promise.all(imageAssets);
  } catch (error) {
    console.warn('Non-critical asset preloading failed:', error);
  }
}

/**
 * Check if critical assets are cached
 */
export function areAssetsCached(): boolean {
  return criticalImages.every(image => Asset.fromModule(image).downloaded);
}

/**
 * Get preloading progress (0-1)
 */
export function getPreloadProgress(): number {
  const totalAssets = criticalImages.length + Object.keys(fonts).length;
  if (totalAssets === 0) return 1;

  const loadedImages = criticalImages.filter(
    image => Asset.fromModule(image).downloaded
  ).length;

  return loadedImages / totalAssets;
}
