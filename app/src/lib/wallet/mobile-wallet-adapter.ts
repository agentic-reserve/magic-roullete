/**
 * Mobile Wallet Adapter Integration for Solana Mobile/Seeker
 * Based on Solana Mobile documentation
 */

import { 
  transact, 
  Web3MobileWallet 
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export const APP_IDENTITY = {
  name: 'Magic Roulette',
  uri: 'https://magicroullete.com',
  icon: 'favicon.ico',
};

export interface AuthorizationResult {
  address: string;
  publicKey: PublicKey;
  authToken: string;
  label?: string;
}

/**
 * Connect to a mobile wallet using Mobile Wallet Adapter
 */
export async function connectMobileWallet(
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'
): Promise<AuthorizationResult> {
  const result = await transact(async (wallet: Web3MobileWallet) => {
    const authResult = await wallet.authorize({
      chain: `solana:${cluster}`,
      identity: APP_IDENTITY,
    });

    const account = authResult.accounts[0];
    
    return {
      address: account.address,
      publicKey: new PublicKey(account.address),
      authToken: authResult.auth_token,
      label: account.label,
    };
  });

  return result;
}

/**
 * Reauthorize with a stored auth token
 */
export async function reauthorizeMobileWallet(
  authToken: string,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'
): Promise<AuthorizationResult> {
  const result = await transact(async (wallet: Web3MobileWallet) => {
    const authResult = await wallet.authorize({
      chain: `solana:${cluster}`,
      identity: APP_IDENTITY,
      auth_token: authToken,
    });

    const account = authResult.accounts[0];
    
    return {
      address: account.address,
      publicKey: new PublicKey(account.address),
      authToken: authResult.auth_token,
      label: account.label,
    };
  });

  return result;
}

/**
 * Sign and send a transaction using Mobile Wallet Adapter
 */
export async function signAndSendTransactionMobile(
  transaction: Transaction | VersionedTransaction,
  authToken?: string
): Promise<string> {
  const signature = await transact(async (wallet: Web3MobileWallet) => {
    // Authorize if auth token provided
    if (authToken) {
      await wallet.authorize({
        chain: 'solana:devnet',
        identity: APP_IDENTITY,
        auth_token: authToken,
      });
    }

    // Sign and send transaction
    const signatures = await wallet.signAndSendTransactions({
      transactions: [transaction],
    });

    return signatures[0];
  });

  return signature;
}

/**
 * Sign a message using Mobile Wallet Adapter
 */
export async function signMessageMobile(
  message: Uint8Array,
  address: string,
  authToken?: string
): Promise<Uint8Array> {
  const signedMessage = await transact(async (wallet: Web3MobileWallet) => {
    // Authorize if auth token provided
    if (authToken) {
      await wallet.authorize({
        chain: 'solana:devnet',
        identity: APP_IDENTITY,
        auth_token: authToken,
      });
    }

    // Sign message
    const signedMessages = await wallet.signMessages({
      addresses: [address],
      payloads: [message],
    });

    return signedMessages[0];
  });

  return signedMessage;
}

/**
 * Sign In with Solana (SIWS) using Mobile Wallet Adapter
 */
export async function signInWithSolana(
  domain: string,
  statement: string
): Promise<{
  address: string;
  publicKey: PublicKey;
  authToken: string;
  signInResult: {
    address: string;
    signedMessage: string;
    signature: string;
  };
}> {
  const result = await transact(async (wallet: Web3MobileWallet) => {
    const authResult = await wallet.authorize({
      chain: 'solana:devnet',
      identity: APP_IDENTITY,
      sign_in_payload: {
        domain,
        statement,
        uri: APP_IDENTITY.uri,
      },
    });

    const account = authResult.accounts[0];
    
    return {
      address: account.address,
      publicKey: new PublicKey(account.address),
      authToken: authResult.auth_token,
      signInResult: authResult.sign_in_result!,
    };
  });

  return result;
}

/**
 * Disconnect from mobile wallet
 */
export async function disconnectMobileWallet(authToken: string): Promise<void> {
  await transact(async (wallet: Web3MobileWallet) => {
    await wallet.deauthorize({
      auth_token: authToken,
    });
  });
}
