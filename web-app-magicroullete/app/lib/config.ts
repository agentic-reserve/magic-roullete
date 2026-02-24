/**
 * Magic Roulette Configuration
 * Centralized configuration for the web app
 */

// Solana Network
export const SOLANA_CONFIG = {
  network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
  rpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  wsUrl: process.env.NEXT_PUBLIC_SOLANA_WS_URL || "wss://api.devnet.solana.com",
  secureRpcUrl: process.env.NEXT_PUBLIC_HELIUS_SECURE_RPC,
} as const;

// Program IDs
export const PROGRAM_IDS = {
  magicRoulette: process.env.NEXT_PUBLIC_PROGRAM_ID || "",
  klend: process.env.NEXT_PUBLIC_KLEND_PROGRAM_ID || "",
  kvault: process.env.NEXT_PUBLIC_KVAULT_PROGRAM_ID || "",
} as const;

// MagicBlock Ephemeral Rollups
export const MAGICBLOCK_CONFIG = {
  erRpcUrl:
    process.env.NEXT_PUBLIC_MAGICBLOCK_ER_RPC_URL ||
    "https://devnet-eu.magicblock.app",
  erValidator: process.env.NEXT_PUBLIC_MAGICBLOCK_ER_VALIDATOR || "",
  delegationProgram:
    process.env.NEXT_PUBLIC_MAGICBLOCK_DELEGATION_PROGRAM || "",
} as const;

// Kamino Finance
export const KAMINO_CONFIG = {
  apiUrl:
    process.env.NEXT_PUBLIC_KAMINO_API_URL || "https://api.kamino.finance",
} as const;

// App Configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Magic Roulette",
  uri: process.env.NEXT_PUBLIC_APP_URI || "https://magicroullete.com",
  platformFeeBps: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || "500"),
  treasuryFeeBps: parseInt(process.env.NEXT_PUBLIC_TREASURY_FEE_BPS || "1000"),
  minEntryFee: parseInt(process.env.NEXT_PUBLIC_MIN_ENTRY_FEE || "100000000"),
  maxEntryFee: parseInt(process.env.NEXT_PUBLIC_MAX_ENTRY_FEE || "10000000000"),
} as const;

// Game Modes
export enum GameMode {
  OneVsOne = 0,
  TwoVsTwo = 1,
}

// Game Status
export enum GameStatus {
  WaitingForPlayers = 0,
  Ready = 1,
  Delegated = 2,
  InProgress = 3,
  Finished = 4,
  Cancelled = 5,
}

// AI Difficulty
export enum AiDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

// Validation
export function validateConfig() {
  const errors: string[] = [];

  if (!PROGRAM_IDS.magicRoulette) {
    errors.push("NEXT_PUBLIC_PROGRAM_ID is not set");
  }

  if (!MAGICBLOCK_CONFIG.erValidator) {
    errors.push("NEXT_PUBLIC_MAGICBLOCK_ER_VALIDATOR is not set");
  }

  if (!MAGICBLOCK_CONFIG.delegationProgram) {
    errors.push("NEXT_PUBLIC_MAGICBLOCK_DELEGATION_PROGRAM is not set");
  }

  if (errors.length > 0) {
    console.warn("⚠️ Configuration warnings:", errors);
  }

  return errors.length === 0;
}
