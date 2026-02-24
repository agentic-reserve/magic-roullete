// Game Types
export interface Game {
  id: string;
  entryFee: number;
  gameMode: '1v1' | '2v2' | 'AI practice';
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
  players?: Player[];
  currentTurn?: string;
  winner?: string;
  prize?: number;
}

export interface Player {
  publicKey: string;
  isAlive: boolean;
  shotsTaken: number;
}

// Wallet Types
export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'game_update' | 'player_joined' | 'shot_taken' | 'game_finished';
  data: any;
}

// Dashboard Types
export interface GameHistory {
  gameId: string;
  entryFee: number;
  result: 'won' | 'lost';
  prize: number;
  timestamp: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalWagered: number;
  lifetimeEarnings: number;
  winRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Seeker Types
export interface SeekerInfo {
  isSeeker: boolean;
  deviceModel?: string;
  optimizationsEnabled: boolean;
}

// Performance Metrics
export interface PerformanceMetrics {
  loadTime: number;
  latency: number;
  fps: number;
}
