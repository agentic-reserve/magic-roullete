/**
 * MagicBlock Ephemeral Rollups Integration
 * Utilities for delegation, connection management, and performance monitoring
 */

import { MAGICBLOCK_CONFIG, SOLANA_CONFIG } from "./config";

/**
 * Get base layer connection (Solana devnet)
 */
export function getBaseRpcUrl(): string {
  return SOLANA_CONFIG.rpcUrl;
}

/**
 * Get Ephemeral Rollup connection
 */
export function getERRpcUrl(): string {
  return MAGICBLOCK_CONFIG.erRpcUrl;
}

/**
 * Get connection based on account delegation status
 * @param isDelegated - Whether the account is delegated to ER
 */
export function getConnectionUrl(isDelegated: boolean): string {
  return isDelegated ? getERRpcUrl() : getBaseRpcUrl();
}

/**
 * Check if an account is delegated to Ephemeral Rollup
 * This is a placeholder - actual implementation requires checking on-chain data
 */
export async function isDelegated(accountPubkey: string): Promise<boolean> {
  // TODO: Implement actual delegation check
  // This would query the delegation program to check if account is delegated
  console.log("Checking delegation status for:", accountPubkey);
  return false;
}

/**
 * Wait for account delegation to propagate
 * @param accountPubkey - Account to check
 * @param maxAttempts - Maximum number of attempts (default: 10)
 * @param delayMs - Delay between attempts in milliseconds (default: 1000)
 */
export async function waitForDelegation(
  accountPubkey: string,
  maxAttempts: number = 10,
  delayMs: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const delegated = await isDelegated(accountPubkey);
    if (delegated) {
      console.log(`✅ Account delegated after ${i + 1} attempts`);
      return true;
    }

    if (i < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.warn(
    `⚠️ Account delegation not confirmed after ${maxAttempts} attempts`
  );
  return false;
}

/**
 * Measure Ephemeral Rollup latency
 */
export async function measureERLatency(): Promise<number> {
  const start = performance.now();

  try {
    const response = await fetch(getERRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
    });

    await response.json();
    const end = performance.now();
    const latency = end - start;

    console.log(`⚡ ER Latency: ${latency.toFixed(2)}ms`);
    return latency;
  } catch (error) {
    console.error("Failed to measure ER latency:", error);
    return -1;
  }
}

/**
 * MagicBlock ER Validators
 */
export const ER_VALIDATORS = {
  ASIA: "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57E",
  EU: "MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e",
  US: "MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd",
  TEE: "FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA",
} as const;

/**
 * Get default ER validator (EU)
 */
export function getDefaultValidator(): string {
  return MAGICBLOCK_CONFIG.erValidator || ER_VALIDATORS.EU;
}

/**
 * Format latency for display
 */
export function formatLatency(latency: number): string {
  if (latency < 0) return "N/A";
  if (latency < 10) return `${latency.toFixed(1)}ms ⚡`;
  if (latency < 50) return `${latency.toFixed(0)}ms ✅`;
  if (latency < 100) return `${latency.toFixed(0)}ms ⚠️`;
  return `${latency.toFixed(0)}ms ❌`;
}

/**
 * Check if ER is available
 */
export async function isERAvailable(): Promise<boolean> {
  try {
    const response = await fetch(getERRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth",
      }),
    });

    const data = await response.json();
    return data.result === "ok";
  } catch (error) {
    console.error("ER health check failed:", error);
    return false;
  }
}
