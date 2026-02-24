/**
 * Lazy-loaded screen components for performance optimization
 * Reduces initial bundle size by loading screens on-demand
 */
import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Loading fallback component
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#8b5cf6" />
  </View>
);

// Lazy load non-critical screens
export const LazyGameLobbyScreen = React.lazy(() => 
  import('../../screens/GameLobbyScreen').then(module => ({ default: module.GameLobbyScreen }))
);

export const LazyCreateGameScreen = React.lazy(() => 
  import('../../screens/CreateGameScreen').then(module => ({ default: module.CreateGameScreen }))
);

export const LazyGamePlayScreen = React.lazy(() => 
  import('../../screens/GamePlayScreen').then(module => ({ default: module.GamePlayScreen }))
);

export const LazyDashboardScreen = React.lazy(() => 
  import('../../screens/DashboardScreen').then(module => ({ default: module.DashboardScreen }))
);

export const LazySettingsScreen = React.lazy(() => 
  import('../../screens/SettingsScreen').then(module => ({ default: module.SettingsScreen }))
);

export const LazyMigrationScreen = React.lazy(() => 
  import('../../screens/MigrationScreen').then(module => ({ default: module.MigrationScreen }))
);

// HOC to wrap lazy components with Suspense
export function withSuspense<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
  },
});
