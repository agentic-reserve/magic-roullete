/**
 * Optimized Image Component
 * Task 5.8: Image loading with caching using expo-image
 * 
 * Features:
 * - Memory-disk caching for optimal performance
 * - Blurhash placeholder support
 * - Automatic content fit
 * - Smooth transitions
 */
import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: string | { uri: string };
  placeholder?: string; // Blurhash string
  showLoading?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  source,
  placeholder,
  showLoading = true,
  style,
  contentFit = 'cover',
  transition = 200,
  ...props
}) => {
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={style}>
      <Image
        source={imageSource}
        placeholder={placeholder}
        contentFit={contentFit}
        transition={transition}
        cachePolicy="memory-disk"
        style={StyleSheet.absoluteFill}
        {...props}
      />
      {showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#9945FF" />
        </View>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if source changes
  const prevSource = typeof prevProps.source === 'string' 
    ? prevProps.source 
    : prevProps.source.uri;
  const nextSource = typeof nextProps.source === 'string' 
    ? nextProps.source 
    : nextProps.source.uri;
  
  return prevSource === nextSource;
});

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
