/**
 * Safe Area Container Component
 * Task 5.5: Safe area handling for notches and screen edges
 */
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { getSafeAreaInsets } from '../../lib/responsive';

interface SafeAreaContainerProps extends ViewProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeAreaContainer({
  edges = ['top', 'bottom'],
  style,
  children,
  ...props
}: SafeAreaContainerProps) {
  const insets = getSafeAreaInsets();
  
  const paddingStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };
  
  return (
    <View {...props} style={[styles.container, paddingStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
