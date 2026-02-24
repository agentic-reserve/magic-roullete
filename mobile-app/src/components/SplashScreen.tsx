/**
 * Custom splash screen with loading indicator
 * Displays while assets are preloading
 * Optimized for Seeker device with progress tracking
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getPreloadProgress } from '../lib/performance/AssetPreloader';

export function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Update progress every 50ms for smooth animation
    const interval = setInterval(() => {
      const currentProgress = getPreloadProgress();
      setProgress(currentProgress);
      
      if (currentProgress >= 1) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Magic Roulette</Text>
        <ActivityIndicator 
          size="large" 
          color="#8b5cf6" 
          style={styles.loader}
        />
        <Text style={styles.subtitle}>
          Loading... {Math.round(progress * 100)}%
        </Text>
        
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#1f1f2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
});
