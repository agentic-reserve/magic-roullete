/**
 * Seeker Device Detection
 * Detects if the user is on a Solana Seeker device
 */

import { Platform } from 'react-native';
import { Connection, PublicKey } from '@solana/web3.js';

/**
 * Method 1: Platform Constants Check
 * Quick, lightweight check using React Native's Platform API
 * Note: This is spoofable on rooted devices
 */
export function isSeekerDevice(): boolean {
  return Platform.constants.Model === 'Seeker';
}

/**
 * Get detailed device information
 */
export function getDeviceInfo() {
  return {
    model: Platform.constants.Model,
    brand: Platform.constants.Brand,
    manufacturer: Platform.constants.Manufacturer,
    os: Platform.OS,
    version: Platform.Version,
    isSeeker: isSeekerDevice(),
  };
}

/**
 * Seeker Genesis Token (SGT) Constants
 */
export const SGT_CONSTANTS = {
  MINT_AUTHORITY: 'GT2zuHVaZQYZSyQMgJPLzvkmyztfyXg2NJunqFp4p3A4',
  METADATA_ADDRESS: 'GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te',
  GROUP_MINT_ADDRESS: 'GT22s89nU4iWFkNXj1Bw6uYhJJWDRPpShHt4Bk8f99Te',
  TOKEN_2022_PROGRAM_ID: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
};

/**
 * Method 2: Seeker Genesis Token Verification
 * Server-side verification that the wallet owns a Seeker Genesis Token
 * This should be called from your backend server
 */
export interface SGTVerificationRequest {
  walletAddress: string;
  signedMessage: Uint8Array;
  signature: Uint8Array;
}

/**
 * Client-side: Prepare SIWS payload for SGT verification
 */
export function prepareSIWSPayload(domain: string, statement: string) {
  return {
    domain,
    statement: statement || 'Sign in to verify Seeker ownership',
    uri: `https://${domain}`,
  };
}

/**
 * Client-side: Check if wallet has SGT (simplified check)
 * For production, this should be done on the backend
 */
export async function checkWalletForSGT(
  walletAddress: string,
  connection: Connection
): Promise<boolean> {
  try {
    // This is a simplified client-side check
    // For production, use the backend verification with Helius API
    const publicKey = new PublicKey(walletAddress);
    
    // Get token accounts for Token-2022 program
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey(SGT_CONSTANTS.TOKEN_2022_PROGRAM_ID) }
    );

    // Check if any token account matches SGT criteria
    // This is a basic check - full verification requires checking extensions
    for (const account of tokenAccounts.value) {
      const mintAddress = account.account.data.parsed.info.mint;
      
      // In production, you would verify:
      // 1. Mint authority matches SGT_MINT_AUTHORITY
      // 2. Metadata pointer matches SGT_METADATA_ADDRESS
      // 3. Token group member matches SGT_GROUP_MINT_ADDRESS
      
      // For now, we just check if the mint exists
      if (mintAddress) {
        return true; // Simplified check
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking for SGT:', error);
    return false;
  }
}

/**
 * Combined Seeker Verification
 * Combines platform check with optional SGT verification
 */
export interface SeekerVerificationResult {
  isPlatformSeeker: boolean;
  hasSGT: boolean | null;
  deviceInfo: ReturnType<typeof getDeviceInfo>;
  verified: boolean;
}

export async function verifySeekerUser(
  walletAddress?: string,
  connection?: Connection
): Promise<SeekerVerificationResult> {
  const isPlatformSeeker = isSeekerDevice();
  const deviceInfo = getDeviceInfo();
  
  let hasSGT: boolean | null = null;
  
  // If wallet address and connection provided, check for SGT
  if (walletAddress && connection) {
    try {
      hasSGT = await checkWalletForSGT(walletAddress, connection);
    } catch (error) {
      console.error('SGT verification failed:', error);
    }
  }

  return {
    isPlatformSeeker,
    hasSGT,
    deviceInfo,
    verified: isPlatformSeeker && (hasSGT === null || hasSGT === true),
  };
}

/**
 * Hook-friendly Seeker detection
 */
export function useSeekerDetection() {
  const isPlatformSeeker = isSeekerDevice();
  const deviceInfo = getDeviceInfo();

  return {
    isSeeker: isPlatformSeeker,
    deviceInfo,
    verifySGT: async (walletAddress: string, connection: Connection) => {
      return await checkWalletForSGT(walletAddress, connection);
    },
  };
}
