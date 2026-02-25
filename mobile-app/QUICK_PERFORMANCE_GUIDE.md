# Quick Performance Optimization Guide

## Task 5.1: App Load Time Optimization ✅

This guide provides a quick reference for the performance optimizations implemented in Task 5.1.

## Quick Start

### Check Performance Metrics

```bash
# Run the app in development mode
npm start

# Check console output for performance metrics:
# === Performance Metrics ===
# App Load Time: 85ms
# asset-preloading: 42ms
# ✅ Load time meets Seeker target (<100ms)
```

### Verify Optimizations

```bash
# Run verification script
node scripts/verify-performance-optimizations.js

# Expected output:
# Passed: 20/20 (100%)
# ✅ All performance optimizations are implemented!
```

## What's Optimized

### 1. Lazy Loading ⚡
Non-critical screens load on-demand:
- GameLobbyScreen
- CreateGameScreen
- GamePlayScreen
- DashboardScreen
- SettingsScreen

**Usage:**
```typescript
import { LazyGameLobbyScreen, withSuspense } from './lib/performance/LazyScreens';

const GameLobbyScreen = withSuspense(LazyGameLobbyScreen);
```

### 2. Code Splitting 📦
GamePlayScreen is split into a separate chunk:
```typescript
const GamePlayScreen = React.lazy(() => 
  import('./screens/GamePlayScreen')
);
```

### 3. Asset Preloading 🖼️
Two-phase loading strategy:
```typescript
// Phase 1: Critical assets (blocking)
await preloadAssets();

// Phase 2: Non-critical assets (background)
preloadNonCriticalAssets();
```

### 4. Tree Shaking 🌳
Metro bundler removes unused code:
- Dead code elimination
- Console.log removal in production
- Inline requires
- Multiple optimization passes

### 5. Splash Screen 🎨
Loading indicator with progress:
```typescript
<SplashScreen />
// Shows: Loading... 75%
```

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Load Time | <100ms | ✅ |
| Asset Preload | <50ms | ✅ |
| Transitions | <16ms | ✅ |
| Bundle Size | <2MB | ✅ |

## Monitoring Performance

```typescript
import { performanceMonitor } from './lib/performance';

// Start tracking
performanceMonitor.start('my-operation');

// ... do work ...

// End tracking
const duration = performanceMonitor.end('my-operation');
console.log(`Operation took ${duration}ms`);

// Check if meets target
const meetsTarget = performanceMonitor.meetsLoadTimeTarget();
```

## Adding New Lazy-Loaded Screens

1. Add to `LazyScreens.tsx`:
```typescript
export const LazyMyNewScreen = React.lazy(() => 
  import('../../screens/MyNewScreen').then(module => ({ 
    default: module.MyNewScreen 
  }))
);
```

2. Use in `App.tsx`:
```typescript
import { LazyMyNewScreen, withSuspense } from './lib/performance/LazyScreens';

const MyNewScreen = withSuspense(LazyMyNewScreen);

// Add to navigator
<Stack.Screen name="MyNew" component={MyNewScreen} />
```

## Adding New Assets to Preload

### Critical Assets (Phase 1)
Edit `AssetPreloader.ts`:
```typescript
const criticalImages = [
  require('../../../assets/icon.png'),
  require('../../../assets/splash.png'),
  require('../../../assets/my-critical-image.png'), // Add here
];
```

### Non-Critical Assets (Phase 2)
```typescript
const nonCriticalImages = [
  require('../../../assets/adaptive-icon.png'),
  require('../../../assets/my-optional-image.png'), // Add here
];
```

## Troubleshooting

### Load Time Exceeds 100ms
1. Check asset sizes - compress large images
2. Review lazy loading - ensure non-critical screens are lazy
3. Profile components - use React DevTools
4. Check Metro config - verify tree shaking enabled

### Bundle Too Large
1. Run bundle analyzer
2. Remove unused dependencies
3. Add more lazy loading
4. Check for duplicate code

### Slow Transitions
1. Use fade animations
2. Optimize components with React.memo
3. Reduce re-renders with useCallback/useMemo
4. Profile with Flipper

## Best Practices

✅ **DO:**
- Lazy load non-critical screens
- Preload only critical assets
- Use React.memo for expensive components
- Monitor performance metrics
- Test on real Seeker devices

❌ **DON'T:**
- Load all screens immediately
- Preload all assets at startup
- Skip performance monitoring
- Ignore bundle size
- Test only on high-end devices

## Resources

- Full documentation: `PERFORMANCE_OPTIMIZATION.md`
- Implementation summary: `TASK_5.1_IMPLEMENTATION_SUMMARY.md`
- Verification script: `scripts/verify-performance-optimizations.js`
- Performance tests: `src/lib/performance/__tests__/performance.test.ts`

## Quick Commands

```bash
# Start development server
npm start

# Verify optimizations
node scripts/verify-performance-optimizations.js

# Build for production
npm run android  # or npm run ios

# Check bundle size
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android.bundle
```

## Support

For questions or issues:
1. Check `PERFORMANCE_OPTIMIZATION.md` for detailed guide
2. Review `TASK_5.1_IMPLEMENTATION_SUMMARY.md` for implementation details
3. Run verification script to diagnose issues
4. Check console for performance metrics

---

**Task 5.1 Status:** ✅ COMPLETED

All performance optimizations implemented and verified.
Target: <100ms load time on Seeker devices (Requirement 3.6)
