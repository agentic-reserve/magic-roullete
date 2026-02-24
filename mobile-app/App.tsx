import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletProvider } from './src/contexts/WalletContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SplashScreen } from './src/components/SplashScreen';
import { preloadAssets, preloadNonCriticalAssets } from './src/lib/performance/AssetPreloader';
import { performanceMonitor } from './src/lib/performance/PerformanceMonitor';
import { 
  LazyGameLobbyScreen, 
  LazyCreateGameScreen,
  withSuspense 
} from './src/lib/performance/LazyScreens';
import './polyfill';

// Lazy load GamePlayScreen (critical for gameplay)
const GamePlayScreen = React.lazy(() => 
  import('./src/screens/GamePlayScreen').then(module => ({ default: module.GamePlayScreen }))
);

// Wrap lazy components with Suspense
const GameLobbyScreen = withSuspense(LazyGameLobbyScreen);
const CreateGameScreen = withSuspense(LazyCreateGameScreen);
const GamePlayScreenWithSuspense = withSuspense(GamePlayScreen);

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        performanceMonitor.start('asset-preloading');
        
        // Preload only critical assets for fast startup
        await preloadAssets();
        
        performanceMonitor.end('asset-preloading');
      } catch (error) {
        console.warn('Failed to preload critical assets:', error);
      } finally {
        // Mark app as ready
        performanceMonitor.end('app-initialization');
        setIsReady(true);
        
        // Log performance metrics in development
        if (__DEV__) {
          performanceMonitor.logMetrics();
          
          const meetsTarget = performanceMonitor.meetsLoadTimeTarget();
          console.log(
            meetsTarget 
              ? '✅ Load time meets Seeker target (<100ms)' 
              : '⚠️ Load time exceeds Seeker target (>100ms)'
          );
        }
      }
    }

    prepare();
  }, []);

  // Preload non-critical assets after app is ready
  useEffect(() => {
    if (isReady) {
      // Load non-critical assets in background
      preloadNonCriticalAssets().catch(error => {
        console.warn('Failed to preload non-critical assets:', error);
      });
    }
  }, [isReady]);

  // Show splash screen while loading
  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f1e' },
            animation: 'fade', // Optimize screen transitions
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
          <Stack.Screen name="CreateGame" component={CreateGameScreen} />
          <Stack.Screen name="GamePlay" component={GamePlayScreenWithSuspense} />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}
