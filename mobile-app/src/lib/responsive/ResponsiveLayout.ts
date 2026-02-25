/**
 * Responsive Layout Utilities
 * Task 5.5: Responsive design for 5-7 inch screens (Seeker range)
 * 
 * Features:
 * 1. Responsive layout for various screen sizes
 * 2. Dynamic font scaling
 * 3. Safe area handling for notches
 * 4. Orientation support
 * 
 * Requirements: 3.8
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Seeker device screen size range: 5-7 inches
const SCREEN_SIZES = {
  SMALL: 5,    // 5 inch screens
  MEDIUM: 6,   // 6 inch screens (typical Seeker)
  LARGE: 7,    // 7 inch screens
};

// Base dimensions for scaling (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Get current screen dimensions
 */
export function getScreenDimensions() {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isPortrait: height > width,
    isLandscape: width > height,
  };
}

/**
 * Calculate screen size category
 */
export function getScreenSizeCategory(): 'small' | 'medium' | 'large' {
  const { width, height } = getScreenDimensions();
  const diagonal = Math.sqrt(width * width + height * height) / PixelRatio.get();
  
  if (diagonal < 5.5) return 'small';
  if (diagonal < 6.5) return 'medium';
  return 'large';
}

/**
 * Scale value based on screen width
 */
export function scaleWidth(size: number): number {
  const { width } = getScreenDimensions();
  return (width / BASE_WIDTH) * size;
}

/**
 * Scale value based on screen height
 */
export function scaleHeight(size: number): number {
  const { height } = getScreenDimensions();
  return (height / BASE_HEIGHT) * size;
}

/**
 * Scale font size dynamically
 * Ensures readability across different screen sizes
 */
export function scaleFontSize(size: number): number {
  const { width } = getScreenDimensions();
  const scale = width / BASE_WIDTH;
  const newSize = size * scale;
  
  // Limit scaling to prevent too large or too small fonts
  const minSize = size * 0.8;
  const maxSize = size * 1.2;
  
  return Math.round(Math.max(minSize, Math.min(maxSize, newSize)));
}

/**
 * Moderate scale - less aggressive than full scale
 * Good for spacing and padding
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  const { width } = getScreenDimensions();
  const scale = width / BASE_WIDTH;
  return size + (scale - 1) * size * factor;
}

/**
 * Get responsive spacing
 */
export function getSpacing(multiplier: number = 1): number {
  const baseSpacing = 8;
  return moderateScale(baseSpacing * multiplier);
}

/**
 * Get responsive padding
 */
export function getPadding(size: 'small' | 'medium' | 'large' = 'medium'): number {
  const paddings = {
    small: 8,
    medium: 16,
    large: 24,
  };
  return moderateScale(paddings[size]);
}

/**
 * Get responsive border radius
 */
export function getBorderRadius(size: 'small' | 'medium' | 'large' = 'medium'): number {
  const radii = {
    small: 4,
    medium: 8,
    large: 12,
  };
  return moderateScale(radii[size]);
}

/**
 * Check if device has notch (safe area insets)
 */
export function hasNotch(): boolean {
  const { height, width } = getScreenDimensions();
  
  // iPhone X and newer have specific dimensions
  if (Platform.OS === 'ios') {
    return (
      (height === 812 || width === 812) || // iPhone X, XS, 11 Pro
      (height === 896 || width === 896) || // iPhone XR, XS Max, 11, 11 Pro Max
      (height === 844 || width === 844) || // iPhone 12, 12 Pro
      (height === 926 || width === 926)    // iPhone 12 Pro Max
    );
  }
  
  // Android devices with notch typically have height > 800
  return height > 800;
}

/**
 * Get safe area insets
 */
export function getSafeAreaInsets() {
  const hasNotchDevice = hasNotch();
  
  return {
    top: hasNotchDevice ? 44 : 20,
    bottom: hasNotchDevice ? 34 : 0,
    left: 0,
    right: 0,
  };
}

/**
 * Responsive breakpoints
 */
export const BREAKPOINTS = {
  SMALL: 320,
  MEDIUM: 375,
  LARGE: 414,
  XLARGE: 480,
};

/**
 * Check if screen width matches breakpoint
 */
export function isScreenSize(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const { width } = getScreenDimensions();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Get responsive layout config
 */
export function getResponsiveLayout() {
  const { width, height, isPortrait } = getScreenDimensions();
  const sizeCategory = getScreenSizeCategory();
  const safeAreaInsets = getSafeAreaInsets();
  
  return {
    width,
    height,
    isPortrait,
    isLandscape: !isPortrait,
    sizeCategory,
    hasNotch: hasNotch(),
    safeAreaInsets,
    spacing: getSpacing(),
    padding: getPadding(),
    borderRadius: getBorderRadius(),
  };
}

/**
 * Create responsive styles
 */
export function createResponsiveStyles<T extends Record<string, any>>(
  styles: T
): T {
  const layout = getResponsiveLayout();
  
  // Apply responsive scaling to numeric values
  const responsiveStyles: any = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'object' && value !== null) {
      responsiveStyles[key] = createResponsiveStyles(value);
    } else if (typeof value === 'number') {
      // Scale numeric values (except for specific properties)
      const noScaleProps = ['flex', 'opacity', 'zIndex', 'elevation'];
      if (noScaleProps.includes(key)) {
        responsiveStyles[key] = value;
      } else {
        responsiveStyles[key] = moderateScale(value);
      }
    } else {
      responsiveStyles[key] = value;
    }
  }
  
  return responsiveStyles as T;
}

/**
 * React hook for responsive layout
 */
export function useResponsiveLayout() {
  const [layout, setLayout] = React.useState(getResponsiveLayout());
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setLayout(getResponsiveLayout());
    });
    
    return () => subscription?.remove();
  }, []);
  
  return layout;
}

// Re-export React for the hook
import * as React from 'react';
