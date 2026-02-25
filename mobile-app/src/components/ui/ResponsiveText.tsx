/**
 * Responsive Text Component
 * Task 5.5: Dynamic font scaling for different screen sizes
 */
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { scaleFontSize } from '../../lib/responsive';

interface ResponsiveTextProps extends TextProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'bold' | '600' | '700';
}

const FONT_SIZES = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
};

export function ResponsiveText({
  size = 'medium',
  weight = 'normal',
  style,
  ...props
}: ResponsiveTextProps) {
  const fontSize = scaleFontSize(FONT_SIZES[size]);
  
  const fontWeight = weight === 'bold' ? '700' : weight === '600' ? '600' : weight === '700' ? '700' : 'normal';
  
  return (
    <Text
      {...props}
      style={[
        styles.text,
        { fontSize, fontWeight },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#ffffff',
  },
});
