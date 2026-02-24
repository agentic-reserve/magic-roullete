// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000';

// Solana Configuration
export const SOLANA_NETWORK = process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.EXPO_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';

// Game Configuration
export const MIN_ENTRY_FEE = 0.01;
export const MAX_ENTRY_FEE = 100;
export const GAME_MODES = ['1v1', '2v2', 'AI practice'] as const;

// UI Configuration
export const COLORS = {
  primary: '#9945FF',
  secondary: '#14F195',
  danger: '#ff4444',
  background: '#0a0a0a',
  card: '#1a1a1a',
  border: '#333',
  text: '#fff',
  textSecondary: '#999',
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  loadTime: 100, // ms
  latency: 10, // ms
  fps: 60,
};

// WebSocket Events
export const WS_EVENTS = {
  GAME_UPDATE: 'game_update',
  PLAYER_JOINED: 'player_joined',
  SHOT_TAKEN: 'shot_taken',
  GAME_FINISHED: 'game_finished',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
};
