/**
 * MagicBlock Ephemeral Rollups Integration
 * Provides connection management and delegation utilities
 */

import { Connection, PublicKey, Commitment } from '@solana/web3.js';

// MagicBlock Program IDs
export const DELEGATION_PROGRAM_ID = new PublicKey(
  'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh'
);

export const PERMISSION_PROGRAM_ID = new PublicKey(
  'ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1'
);

// RPC Endpoints
export const BASE_RPC = 'https://api.devnet.solana.com';
export const ER_RPC_ROUTER = 'https://devnet-router.magicblock.app'; // Auto-selects best region
export const ER_RPC_ASIA = 'https://devnet-as.magicblock.app';
export const ER_RPC_EU = 'https://devnet-eu.magicblock.app';
export const ER_RPC_US = 'https://devnet-us.magicblock.app';
export const ER_RPC_TEE = 'https://tee.magicblock.app';

// ER Validators (Devnet)
export const ER_VALIDATORS = {
  ASIA: new PublicKey('MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57'),
  EU: new PublicKey('MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e'),
  US: new PublicKey('MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd'),
  TEE: new PublicKey('FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA'),
};

// Default validator (Asia for best latency in most regions)
export const DEFAULT_ER_VALIDATOR = ER_VALIDATORS.ASIA;

/**
 * Create connection to Solana base layer
 */
export const createBaseConnection = (commitment: Commitment = 'confirmed'): Connection => {
  return new Connection(BASE_RPC, {
    commitment,
    confirmTransactionInitialTimeout: 60000,
  });
};

/**
 * Create connection to Ephemeral Rollup
 * Use router for automatic region selection
 */
export const createERConnection = (commitment: Commitment = 'confirmed'): Connection => {
  return new Connection(ER_RPC_ROUTER, {
    commitment,
    confirmTransactionInitialTimeout: 60000,
  });
};

/**
 * Create connection to specific ER region
 */
export const createERConnectionRegion = (
  region: 'ASIA' | 'EU' | 'US' | 'TEE',
  commitment: Commitment = 'confirmed'
): Connection => {
  const rpcMap = {
    ASIA: ER_RPC_ASIA,
    EU: ER_RPC_EU,
    US: ER_RPC_US,
    TEE: ER_RPC_TEE,
  };

  return new Connection(rpcMap[region], {
    commitment,
    confirmTransactionInitialTimeout: 60000,
  });
};

// Singleton connections
let baseConnectionInstance: Connection | null = null;
let erConnectionInstance: Connection | null = null;

/**
 * Get base layer connection (singleton)
 */
export const getBaseConnection = (): Connection => {
  if (!baseConnectionInstance) {
    baseConnectionInstance = createBaseConnection();
  }
  return baseConnectionInstance;
};

/**
 * Get ER connection (singleton)
 */
export const getERConnection = (): Connection => {
  if (!erConnectionInstance) {
    erConnectionInstance = createERConnection();
  }
  return erConnectionInstance;
};

/**
 * Check if an account is delegated to ER
 */
export const isDelegated = async (
  pubkey: PublicKey,
  connection?: Connection
): Promise<boolean> => {
  const conn = connection || getBaseConnection();
  const info = await conn.getAccountInfo(pubkey);
  return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
};

/**
 * Get appropriate connection based on account delegation status
 */
export const getConnectionForAccount = async (
  pubkey: PublicKey
): Promise<Connection> => {
  const delegated = await isDelegated(pubkey);
  return delegated ? getERConnection() : getBaseConnection();
};

/**
 * Wait for account delegation to propagate
 */
export const waitForDelegation = async (
  pubkey: PublicKey,
  maxAttempts: number = 10,
  delayMs: number = 1000
): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    const delegated = await isDelegated(pubkey);
    if (delegated) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
};

/**
 * Measure ER latency
 */
export const measureERLatency = async (): Promise<number> => {
  const connection = getERConnection();
  const start = Date.now();
  await connection.getLatestBlockhash();
  return Date.now() - start;
};

/**
 * Get ER validator for delegation instruction
 */
export const getERValidator = (region?: 'ASIA' | 'EU' | 'US' | 'TEE'): PublicKey => {
  if (region) {
    return ER_VALIDATORS[region];
  }
  return DEFAULT_ER_VALIDATOR;
};

/**
 * Authorization token for TEE endpoint
 */
export interface AuthToken {
  token: string;
  expiresAt: number;
}

/**
 * Request authorization token from TEE endpoint
 */
export const requestAuthToken = async (
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<AuthToken> => {
  const message = `Authorize Magic Roulette access at ${Date.now()}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = await signMessage(messageBytes);

  const response = await fetch(`${ER_RPC_TEE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: publicKey.toBase58(),
      message,
      signature: Buffer.from(signature).toString('base64'),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get auth token: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    expiresAt: Date.now() + 3600000, // 1 hour
  };
};

/**
 * Check if auth token is valid
 */
export const isAuthTokenValid = (authToken: AuthToken | null): boolean => {
  if (!authToken) return false;
  return Date.now() < authToken.expiresAt;
};
