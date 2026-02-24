/**
 * Metro configuration for React Native
 * Optimized for bundle size and performance
 * 
 * @see https://facebook.github.io/metro/docs/configuration
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking for better bundle optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      drop_console: true, // Remove console.log in production
      reduce_funcs: false,
      keep_fargs: false,
    },
  },
};

// Optimize resolver for faster builds
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;
