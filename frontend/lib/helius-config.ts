/**
 * Helius RPC Configuration
 * 
 * Centralized Helius configuration for the entire app
 */

import { createHelius } from "helius-sdk";
import { Connection, clusterApiUrl } from "@solana/web3.js";

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

export const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || "";
export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as "mainnet-beta" | "devnet";

// ============================================================================
// HELIUS RPC ENDPOINTS
// ============================================================================

/**
 * Get Helius RPC URL for the current network
 */
export function getHeliusRpcUrl(network: "mainnet-beta" | "devnet" = SOLANA_NETWORK): string {
  if (!HELIUS_API_KEY) {
    console.warn("⚠️ HELIUS_API_KEY not set, using public RPC (rate limited)");
    return clusterApiUrl(network);
  }

  const endpoint = network === "mainnet-beta" 
    ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  return endpoint;
}

/**
 * Get Helius WebSocket URL for the current network
 */
export function getHeliusWsUrl(network: "mainnet-beta" | "devnet" = SOLANA_NETWORK): string {
  if (!HELIUS_API_KEY) {
    console.warn("⚠️ HELIUS_API_KEY not set, WebSocket unavailable");
    return "";
  }

  const endpoint = network === "mainnet-beta"
    ? `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : `wss://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  return endpoint;
}

/**
 * Get Atlas Enhanced WebSocket URL (1.5-2x faster)
 */
export function getAtlasWsUrl(network: "mainnet-beta" | "devnet" = SOLANA_NETWORK): string {
  if (!HELIUS_API_KEY) {
    console.warn("⚠️ HELIUS_API_KEY not set, Atlas WebSocket unavailable");
    return "";
  }

  const endpoint = network === "mainnet-beta"
    ? `wss://atlas-mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : `wss://atlas-devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  return endpoint;
}

// ============================================================================
// HELIUS SDK INSTANCE
// ============================================================================

/**
 * Create Helius SDK instance
 */
export function createHeliusInstance() {
  if (!HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is required");
  }

  return createHelius({
    apiKey: HELIUS_API_KEY,
  });
}

// ============================================================================
// SOLANA CONNECTION
// ============================================================================

/**
 * Create Solana connection with Helius RPC
 */
export function createHeliusConnection(network: "mainnet-beta" | "devnet" = SOLANA_NETWORK): Connection {
  const rpcUrl = getHeliusRpcUrl(network);
  
  return new Connection(rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: getHeliusWsUrl(network),
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const heliusRpcUrl = getHeliusRpcUrl();
export const heliusWsUrl = getHeliusWsUrl();
export const atlasWsUrl = getAtlasWsUrl();
export const heliusConnection = createHeliusConnection();

// Log configuration (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🚀 Helius Configuration:");
  console.log("  Network:", SOLANA_NETWORK);
  console.log("  RPC:", heliusRpcUrl);
  console.log("  WebSocket:", heliusWsUrl ? "✅ Enabled" : "❌ Disabled");
  console.log("  Atlas WS:", atlasWsUrl ? "✅ Enabled" : "❌ Disabled");
}
