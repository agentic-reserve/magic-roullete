# Performance Optimization Guide

This document describes the performance optimizations implemented for Magic Roulette mobile app, targeting sub-100ms load time on Solana Seeker devices.

## Overview

The mobile app implements multiple performance optimization strategies:

1. **Lazy Loading** - Non-critical screens loaded on-demand
2. **Code Splitting** - Gameplay screen split into separate chunk
3. **Asset Preloading** - Critical assets loaded during initialization
4. **Bundle Optimization** - Tree shaking and minification via Metro
5. **Splash Screen** - Loading indicator with progress tracking

## Implementation Details

### 1. Lazy Loading for Non-Critical Screens

Non-critical screens are lazy-loaded to reduce initial bundle size:

```typescript
// Lazy load screens
const LazyGameLobbyScreen = React.lazy(() => 
  import('./screens/GameLobbyScreen')
);

// Wrap with Suspense
const GameLobbyScreen = withSuspense(LazyGameLobbyScreen);
```

**Lazy-loaded screens:**
- GameLobbyScreen
- CreateGameScreen
- DashboardScreen
- SettingsScreen
- MigrationScreen

**Immediately loaded:**
- HomeScreen (initial screen)
- SplashScreen (loading indicator)

### 2. Code Splitting for Gameplay Screen

The GamePlayScreen is code-split to optimize initial load:

```typescript
const GamePlayScreen = React.lazy(() => 
  import('./screens/GamePlayScreen').then(module => ({ 
    default: module.GamePlayScreen 
  }))
);
```

This creates a separate chunk that's only loaded when entering gameplay.

### 3. Asset Preloading

Assets are preloaded in two phases:

**Phase 1: Critical Assets (Blocking)**
- App icon
- Splash screen image
- Custom fonts (if any)

**Phase 2: Non-Critical Assets (Background)**
- Adaptive icon
- Favicon
- Additional images

```typescript
// Phase 1: Critical assets (blocks app ready)
await preloadAssets();

// Phase 2: Non-critical assets (background)
preloadNonCriticalAssets();
```

### 4. Bundle Size Optimization

Metro bundler is configured for optimal tree shaking:

**metro.config.js optimizations:**
- Minification enabled
- Dead code elimination
- Console.log removal in production
- Mangle class/function names
- Source map optimization

```javascript
minifierConfig: {
  keep_classnames: false,
  keep_fnames: false,
  compress: {
    drop_console: true, // Remove console.log in production
  },
}
```

### 5. Splash Screen with Loading Indicator

Custom splash screen displays loading progress:

```typescript
<SplashScreen />
```

**Features:**
- Progress bar (0-100%)
- Loading percentage display
- Smooth animations
- Seeker-optimized styling

## Performance Monitoring

The app includes built-in performance monitoring:

```typescript
import { performanceMonitor } from './lib/performance';

// Start tracking
performanceMonitor.start('app-initialization');

// End tracking
performanceMonitor.end('app-initialization');

// Check if meets target
const meetsTarget = performanceMonitor.meetsLoadTimeTarget(); // <100ms
```

**Tracked metrics:**
- App initialization time
- Asset preloading time
- Screen transition time
- Total load time

## Performance Targets

### Seeker Device Targets (Requirement 3.6)

- **App Load Time**: <100ms (from launch to interactive)
- **Asset Preloading**: <50ms (critical assets only)
- **Screen Transitions**: <16ms (60fps)
- **Bundle Size**: <2MB (initial bundle)

### Optimization Results

Run the app in development mode to see performance metrics:

```bash
npm start
```

Console output will show:
```
=== Performance Metrics ===
App Load Time: 85ms
asset-preloading: 42ms
✅ Load time meets Seeker target (<100ms)
```

## Best Practices

### 1. Keep Critical Path Minimal

Only load what's needed for initial render:
- HomeScreen
- WalletContext
- Navigation container
- Critical assets

### 2. Lazy Load Everything Else

Use lazy loading for:
- Secondary screens
- Heavy components
- Non-critical features

### 3. Optimize Assets

- Use WebP for images (smaller size)
- Compress images before bundling
- Use vector icons when possible
- Limit font variants

### 4. Monitor Bundle Size

Check bundle size regularly:

```bash
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android.bundle \
  --assets-dest android
```

### 5. Profile Performance

Use React DevTools Profiler:
- Identify slow components
- Optimize re-renders
- Reduce component complexity

## Troubleshooting

### Load Time Exceeds Target

If load time exceeds 100ms:

1. **Check asset sizes** - Compress large images
2. **Review lazy loading** - Ensure non-critical screens are lazy-loaded
3. **Profile components** - Identify slow renders
4. **Optimize imports** - Use named imports for tree shaking

### Bundle Size Too Large

If bundle exceeds 2MB:

1. **Analyze bundle** - Use Metro bundle analyzer
2. **Remove unused dependencies** - Check package.json
3. **Enable tree shaking** - Verify Metro config
4. **Split code** - Add more lazy loading

### Slow Screen Transitions

If transitions are janky:

1. **Use fade animations** - Avoid complex transitions
2. **Optimize components** - Use React.memo
3. **Reduce re-renders** - Use useCallback/useMemo
4. **Profile with Flipper** - Identify bottlenecks

## Testing Performance

### Manual Testing

1. Clear app cache
2. Launch app
3. Measure time to interactive
4. Check console for metrics

### Automated Testing

```typescript
import { performanceMonitor } from './lib/performance';

test('app load time meets target', () => {
  const loadTime = performanceMonitor.getAppLoadTime();
  expect(loadTime).toBeLessThan(100);
});
```

## Future Optimizations

Potential improvements:

1. **Hermes Engine** - Enable for faster startup
2. **RAM Bundles** - Reduce initial load time
3. **Image Caching** - Implement persistent cache
4. **Service Workers** - For web version
5. **Prefetching** - Preload next screen on navigation

## References

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Metro Bundler](https://facebook.github.io/metro/)
- [Expo Performance](https://docs.expo.dev/guides/performance/)
- [Seeker Optimization Guide](https://docs.solanamobile.com/seeker/optimization)
