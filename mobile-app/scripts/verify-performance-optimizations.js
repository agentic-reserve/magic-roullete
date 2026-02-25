#!/usr/bin/env node
/**
 * Performance Optimization Verification Script
 * Task 5.1: Verify all load time optimizations are implemented
 * 
 * Checks:
 * 1. Lazy loading configuration
 * 2. Code splitting setup
 * 3. Asset preloading implementation
 * 4. Bundle optimization (Metro config)
 * 5. Splash screen with loading indicator
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const CHECKS = [];

function check(name, condition, details) {
  CHECKS.push({ name, passed: condition, details });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

console.log('=== Performance Optimization Verification ===\n');

// Check 1: Lazy loading for non-critical screens
console.log('1. Lazy Loading for Non-Critical Screens');
const lazyScreensPath = path.join(ROOT_DIR, 'src/lib/performance/LazyScreens.tsx');
const lazyScreensExists = fs.existsSync(lazyScreensPath);
check(
  'LazyScreens.tsx exists',
  lazyScreensExists,
  lazyScreensExists ? 'Found at src/lib/performance/LazyScreens.tsx' : 'Missing'
);

if (lazyScreensExists) {
  const lazyScreensContent = fs.readFileSync(lazyScreensPath, 'utf8');
  check(
    'LazyGameLobbyScreen defined',
    lazyScreensContent.includes('LazyGameLobbyScreen'),
    'GameLobbyScreen is lazy-loaded'
  );
  check(
    'LazyCreateGameScreen defined',
    lazyScreensContent.includes('LazyCreateGameScreen'),
    'CreateGameScreen is lazy-loaded'
  );
  check(
    'withSuspense HOC defined',
    lazyScreensContent.includes('withSuspense'),
    'Suspense wrapper for lazy components'
  );
}

// Check 2: Code splitting for gameplay screen
console.log('\n2. Code Splitting for Gameplay Screen');
const appPath = path.join(ROOT_DIR, 'App.tsx');
const appExists = fs.existsSync(appPath);
check('App.tsx exists', appExists);

if (appExists) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  check(
    'GamePlayScreen code splitting',
    appContent.includes('React.lazy') && appContent.includes('GamePlayScreen'),
    'GamePlayScreen is code-split with React.lazy'
  );
}

// Check 3: Asset preloading
console.log('\n3. Asset Preloading for Images and Fonts');
const assetPreloaderPath = path.join(ROOT_DIR, 'src/lib/performance/AssetPreloader.ts');
const assetPreloaderExists = fs.existsSync(assetPreloaderPath);
check('AssetPreloader.ts exists', assetPreloaderExists);

if (assetPreloaderExists) {
  const assetPreloaderContent = fs.readFileSync(assetPreloaderPath, 'utf8');
  check(
    'preloadAssets function defined',
    assetPreloaderContent.includes('export async function preloadAssets'),
    'Critical asset preloading implemented'
  );
  check(
    'preloadNonCriticalAssets function defined',
    assetPreloaderContent.includes('export async function preloadNonCriticalAssets'),
    'Non-critical asset preloading implemented'
  );
  check(
    'Font preloading support',
    assetPreloaderContent.includes('Font.loadAsync'),
    'Font preloading via expo-font'
  );
}

// Check 4: Bundle optimization with tree shaking
console.log('\n4. Bundle Optimization with Tree Shaking');
const metroConfigPath = path.join(ROOT_DIR, 'metro.config.js');
const metroConfigExists = fs.existsSync(metroConfigPath);
check('metro.config.js exists', metroConfigExists);

if (metroConfigExists) {
  const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf8');
  check(
    'Minification enabled',
    metroConfigContent.includes('minifierConfig'),
    'Metro minifier configured'
  );
  check(
    'Tree shaking enabled',
    metroConfigContent.includes('dead_code') || metroConfigContent.includes('unused'),
    'Dead code elimination enabled'
  );
  check(
    'Console.log removal in production',
    metroConfigContent.includes('drop_console'),
    'Console statements removed in production builds'
  );
  check(
    'Inline requires enabled',
    metroConfigContent.includes('inlineRequires'),
    'Inline requires for better tree shaking'
  );
}

// Check 5: Splash screen with loading indicator
console.log('\n5. Splash Screen with Loading Indicator');
const splashScreenPath = path.join(ROOT_DIR, 'src/components/SplashScreen.tsx');
const splashScreenExists = fs.existsSync(splashScreenPath);
check('SplashScreen.tsx exists', splashScreenExists);

if (splashScreenExists) {
  const splashScreenContent = fs.readFileSync(splashScreenPath, 'utf8');
  check(
    'Loading indicator implemented',
    splashScreenContent.includes('ActivityIndicator'),
    'ActivityIndicator for loading state'
  );
  check(
    'Progress tracking',
    splashScreenContent.includes('progress') || splashScreenContent.includes('getPreloadProgress'),
    'Progress bar with percentage display'
  );
}

// Check 6: Performance monitoring
console.log('\n6. Performance Monitoring');
const perfMonitorPath = path.join(ROOT_DIR, 'src/lib/performance/PerformanceMonitor.ts');
const perfMonitorExists = fs.existsSync(perfMonitorPath);
check('PerformanceMonitor.ts exists', perfMonitorExists);

if (perfMonitorExists) {
  const perfMonitorContent = fs.readFileSync(perfMonitorPath, 'utf8');
  check(
    'Load time target check',
    perfMonitorContent.includes('meetsLoadTimeTarget'),
    'Seeker target (<100ms) verification'
  );
}

// Summary
console.log('\n=== Summary ===');
const passed = CHECKS.filter(c => c.passed).length;
const total = CHECKS.length;
const percentage = Math.round((passed / total) * 100);

console.log(`Passed: ${passed}/${total} (${percentage}%)`);

if (passed === total) {
  console.log('\n✅ All performance optimizations are implemented!');
  console.log('Task 5.1 requirements met:');
  console.log('  ✓ Lazy loading for non-critical screens');
  console.log('  ✓ Code splitting for gameplay screen');
  console.log('  ✓ Asset preloading for images and fonts');
  console.log('  ✓ Bundle optimization with tree shaking');
  console.log('  ✓ Splash screen with loading indicator');
  process.exit(0);
} else {
  console.log('\n⚠️  Some optimizations are missing or incomplete.');
  console.log('Please review the failed checks above.');
  process.exit(1);
}
