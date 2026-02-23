/**
 * Seeker Device Detection
 * Two methods: Platform Constants Check and Seeker Genesis Token Verification
 */

import { Platform } from 'react-native';
import { Connection, PublicKey } from '@solana/web3.js';
import { verifySignIn } from '@solana/wallet-standard-util';

/**
 * Method 1: Platform Constants Check (Client-side, lightweight)
 * This is spoofable but good for UI treatments
 */
export function isSeekerDevice(): boolean {
  if (typeof Platform === 'undefined' || !Platform.constants) {
    return false;
  }

  // Check if the device model is "Seeker"
  return Platform.constants.Model === 'Seeker';
}

/**
 * Get detailed device information
 */
export function getDeviceInfo() {
  if (typeof Platform === 'undefined' || !Platform.constants) {
    return null;
  }

  return {
    model: Platform.constants.Model,
    brand: Platform.constants.Brand,
    manufacturer: Platform.constants.Manufacturer,
    version: Platform.constants.Version,
    release: Platform.constants.Release,
    fingerprint: Platform.constants.Fingerprint,
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
 * Method 2: Seeker Genesis Token Verification (Server-side, guaranteed)
 * This requires backend verification and cannot be spoofed
 */

/**
 * Step 1: Sign In with Solana (SIWS) - Client Side
 */
export interface SIWSPayload {
  domain: string;
  statement: string;
  uri: string;
}

export interface SIWSResult {
  address: string;
  signedMessage: Uint8Array;
  signature: Uint8Array;
}

/**
 * Step 2: Verify SIWS Signature - Server Side
 */
export async function verifySIWS(
  payload: SIWSPayload,
  result: SIWSResult
): Promise<boolean> {
  try {
    const serializedOutput = {
      account: {
        publicKey: new Uint8Array(Buffer.from(result.address, 'base64')),
        address: result.address,
        chains: ['solana:mainnet'],
        features: [],
      },
      signature: result.signature,
      signedMessage: result.signedMessage,
    };

    return verifySignIn(payload, serializedOutput);
  } catch (error) {
    console.error('SIWS verification failed:', error);
    return false;
  }
}

/**
 * Step 3: Check SGT Ownership - Server Side
 * This should be called from your backend server
 */
export async function checkWalletForSGT(
  walletAddress: string,
  heliusApiKey: string
): Promise<boolean> {
  const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;

  try {
    const connection = new Connection(HELIUS_RPC_URL);
    
    // Use getTokenAccountsByOwnerV2 with pagination
    let allTokenAccounts: any[] = [];
    let paginationKey: string | null = null;
    let pageCount = 0;

    console.log(`Starting paginated fetch for wallet: ${walletAddress}`);

    do {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);

      const requestPayload = {
        jsonrpc: '2.0',
        id: `page-${pageCount}`,
        method: 'getTokenAccountsByOwnerV2',
        params: [
          walletAddress,
          { programId: SGT_CONSTANTS.TOKEN_2022_PROGRAM_ID },
          {
            encoding: 'jsonParsed',
            limit: 1000,
            ...(paginationKey && { paginationKey }),
          },
        ],
      };

      const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      const pageResults = data.result?.value?.accounts || [];
      console.log(`Page ${pageCount}: Found ${pageResults.length} token accounts`);

      if (pageResults.length > 0) {
        allTokenAccounts.push(...pageResults);
      }
      paginationKey = data.result?.paginationKey;
    } while (paginationKey);

    console.log(`Completed pagination: ${pageCount} pages, ${allTokenAccounts.length} total token accounts`);

    if (allTokenAccounts.length === 0) {
      console.log('No Token-2022 accounts found for this wallet.');
      return false;
    }

    // Extract mint addresses from token accounts
    const mintPubkeys = allTokenAccounts
      .map((accountInfo) => {
        try {
          if (accountInfo?.account?.data?.parsed?.info?.mint) {
            return new PublicKey(accountInfo.account.data.parsed.info.mint);
          }
          return null;
        } catch (error) {
          return null;
        }
      })
      .filter((mintPubkey) => mintPubkey !== null);

    console.log(`Extracted ${mintPubkeys.length} mint addresses`);

    // Fetch all mint account data in batches
    const BATCH_SIZE = 100;
    const mintAccountInfos: any[] = [];

    for (let i = 0; i < mintPubkeys.length; i += BATCH_SIZE) {
      const batch = mintPubkeys.slice(i, i + BATCH_SIZE);
      console.log(`Fetching mint info batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(mintPubkeys.length / BATCH_SIZE)}`);

      const batchResults = await connection.getMultipleAccountsInfo(batch);
      mintAccountInfos.push(...batchResults);
    }

    // Check each mint for SGT verification
    console.log(`Checking ${mintAccountInfos.length} mints for SGT verification...`);

    for (let i = 0; i < mintAccountInfos.length; i++) {
      const mintInfo = mintAccountInfos[i];
      if (mintInfo) {
        // Here you would unpack the mint and verify extensions
        // This requires @solana/spl-token library
        // For now, we'll return a placeholder
        
        // TODO: Implement full SGT verification with mint unpacking
        // See the example script in the documentation
      }
    }

    return false; // Placeholder
  } catch (error) {
    console.error('Error verifying SGT ownership:', error);
    return false;
  }
}

/**
 * Combined verification: SIWS + SGT Check
 * This should be called from your backend server
 */
export async function verifySeekerUser(
  siwsPayload: SIWSPayload,
  siwsResult: SIWSResult,
  heliusApiKey: string
): Promise<boolean> {
  // Step 1: Verify SIWS signature
  const siwsVerified = await verifySIWS(siwsPayload, siwsResult);
  
  if (!siwsVerified) {
    console.log('SIWS verification failed');
    return false;
  }

  // Step 2: Check SGT ownership
  const hasSGT = await checkWalletForSGT(siwsResult.address, heliusApiKey);

  // Both must be true for verified Seeker user
  return siwsVerified && hasSGT;
}
