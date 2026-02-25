# Quick Reference: Tasks 5.3-5.6

## Task 5.3: Gameplay Latency Optimization ✅

### Usage

```typescript
import { useGameplayLatency } from './lib/performance/GameplayLatencyOptimizer';

const { optimizedShotExecution, getCurrentFPS, getPerformanceSummary } = useGameplayLatency();

// Optimistic shot execution
await optimizedShotExecution(
  'shot-123',
  async () => await takeShot(),
  { chamber: 1, isBullet: false }, // Optimistic result
  (actualResult) => {
    // Handle actual result from Ephemeral Rollup
    setLastShot(actualResult);
  }
);

// Check performance
const summary = getPerformanceSummary();
console.log(`Latency: ${summary.averageLatency}ms, FPS: ${summary.currentFPS}`);
```

### Targets
- Shot latency: <10ms
- Animation: 60fps
- Optimistic update: <5ms

---

## Task 5.5: Responsive Design ✅

### Usage

```typescript
import { useResponsiveLayout, scaleFontSize } from './lib/responsive';
import { ResponsiveText, SafeAreaContainer } from './components/ui';

// Get responsive layout
const layout = useResponsiveLayout();

// Scale font
const fontSize = scaleFontSize(16);

// Responsive text
<ResponsiveText size="large" weight="bold">
  Title
</ResponsiveText>

// Safe area container
<SafeAreaContainer edges={['top', 'bottom']}>
  <View>{/* Content */}</View>
</SafeAreaContainer>
```

### Screen Sizes
- Small: 5 inch
- Medium: 6 inch (Seeker)
- Large: 7 inch

---

## Task 5.6: Offline Capability ✅

### Usage

```typescript
import { useOffline } from './lib/offline';
import { OfflineIndicator } from './components/ui';

const { isOnline, isOffline, queueAction, cacheData, getCachedData } = useOffline();

// Check status
if (isOffline) {
  // Queue action
  await queueAction('JOIN_GAME', { gameId: '123' });
}

// Cache data
await cacheData('game-123', gameData, 5 * 60 * 1000);

// Get cached data
const cached = await getCachedData('game-123');

// Show indicator
<OfflineIndicator />
```

### Features
- Offline detection
- Local caching (5 min default)
- Action queuing
- Auto-sync when online

---

## Quick Commands

```bash
# Check implementation
ls -la mobile-app/src/lib/performance/GameplayLatencyOptimizer.ts
ls -la mobile-app/src/lib/responsive/ResponsiveLayout.ts
ls -la mobile-app/src/lib/offline/OfflineManager.ts

# Run diagnostics
# (Use your IDE's diagnostic tools)
```

---

## Dependencies

### Required for Offline (Task 5.6)
```bash
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
```

Current implementation includes mock fallbacks for development.

---

## Performance Metrics

### Gameplay (5.3)
```typescript
gameplayLatencyOptimizer.logMetrics();
// === Gameplay Performance Metrics ===
// Total Shots: 10
// Average Latency: 8.5ms
// Meets Target (<10ms): ✅
// Current FPS: 60.0
// Meets FPS Target (60fps): ✅
```

### Responsive (5.5)
```typescript
const layout = getResponsiveLayout();
console.log(layout);
// {
//   width: 375,
//   height: 812,
//   isPortrait: true,
//   sizeCategory: 'medium',
//   hasNotch: true,
//   safeAreaInsets: { top: 44, bottom: 34, left: 0, right: 0 }
// }
```

### Offline (5.6)
```typescript
console.log('Online:', offlineManager.getIsOnline());
console.log('Pending:', offlineManager.getPendingActions().length);
console.log('Message:', offlineManager.getOfflineMessage());
```

---

## Troubleshooting

### Gameplay Latency Issues
1. Check Ephemeral Rollup connection
2. Verify optimistic updates are enabled
3. Monitor FPS in console
4. Check for animation bottlenecks

### Responsive Layout Issues
1. Test on different screen sizes
2. Verify font scaling limits
3. Check safe area insets
4. Test both orientations

### Offline Issues
1. Install required dependencies
2. Check network permissions
3. Verify AsyncStorage access
4. Test airplane mode

---

## Files Created

### Task 5.3
- `src/lib/performance/GameplayLatencyOptimizer.ts`

### Task 5.5
- `src/lib/responsive/ResponsiveLayout.ts`
- `src/lib/responsive/index.ts`
- `src/components/ui/ResponsiveText.tsx`
- `src/components/ui/SafeAreaContainer.tsx`

### Task 5.6
- `src/lib/offline/OfflineManager.ts`
- `src/lib/offline/index.ts`
- `src/components/ui/OfflineIndicator.tsx`

---

## Status

✅ Task 5.3: Gameplay latency optimization - COMPLETE
✅ Task 5.5: Responsive design - COMPLETE
✅ Task 5.6: Offline capability - COMPLETE

⏭️ Task 5.2: Property test (optional) - QUEUED
⏭️ Task 5.4: Property test (optional) - QUEUED
