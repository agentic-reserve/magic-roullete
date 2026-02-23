/**
 * Unified Wallet Interface
 * Supports both Mobile Wallet Adapter (Seeker/Mobile) and Web Wallet Adapter (Desktop/Web)
 */

import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Platform } from 'react-native';

// Mobile Wallet Adapter imports
import {
  connectMobileWallet,
  reauthorizeMobileWallet,
  signAndSendTransactionMobile,
  signMessageMobile,
  signInWithSolana as signInWithSolanaMobile,
  disconnectMobileWallet,
  AuthorizationResult,
} from './mobile-wallet-adapter';

// Web Wallet Adapter imports
import {
  connectWebWallet,
  disconnectWebWallet,
  signAndSendTransactionWeb,
  signMessageWeb,
  signInWithSolanaWeb,
  WebWalletContext,
} from './web-wallet-adapter';

export type WalletType = 'mobile' | 'web';

export interface UnifiedWalletState {
  type: WalletType;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  authToken?: string; // For mobile wallet
  label?: string;
}

export interface UnifiedWalletAdapter {
  state: UnifiedWalletState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection
  ) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signInWithSolana: (domain: string, statement: string) => Promise<{
    address: string;
    publicKey: PublicKey;
    signedMessage: Uint8Array;
    signature: Uint8Array;
  }>;
}

/**
 * Detect if running on mobile (Seeker) or web/desktop
 */
export function detectWalletType(): WalletType {
  // Check if running on React Native
  if (typeof Platform !== 'undefined' && Platform.OS) {
    return 'mobile';
  }
  
  // Check if running in browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }
  
  // Default to web
  return 'web';
}

/**
 * Create a unified wallet adapter that works on both mobile and web
 */
export function createUnifiedWalletAdapter(
  webWalletContext?: WebWalletContext,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'
): UnifiedWalletAdapter {
  const walletType = detectWalletType();
  
  let state: UnifiedWalletState = {
    type: walletType,
    publicKey: null,
    connected: false,
    connecting: false,
    address: null,
  };

  // Mobile Wallet Adapter implementation
  if (walletType === 'mobile') {
    return {
      state,
      
      async connect() {
        state.connecting = true;
        try {
          const result = await connectMobileWallet(cluster);
          state.publicKey = result.publicKey;
          state.address = result.address;
          state.authToken = result.authToken;
          state.label = result.label;
          state.connected = true;
        } finally {
          state.connecting = false;
        }
      },

      async disconnect() {
        if (state.authToken) {
          await disconnectMobileWallet(state.authToken);
        }
        state.publicKey = null;
        state.address = null;
        state.authToken = undefined;
        state.label = undefined;
        state.connected = false;
      },

      async signAndSendTransaction(transaction, connection) {
        if (!state.connected || !state.authToken) {
          throw new Error('Wallet not connected');
        }
        return await signAndSendTransactionMobile(transaction, state.authToken);
      },

      async signMessage(message) {
        if (!state.connected || !state.address || !state.authToken) {
          throw new Error('Wallet not connected');
        }
        return await signMessageMobile(message, state.address, state.authToken);
      },

      async signInWithSolana(domain, statement) {
        const result = await signInWithSolanaMobile(domain, statement);
        
        // Update state
        state.publicKey = result.publicKey;
        state.address = result.address;
        state.authToken = result.authToken;
        state.connected = true;

        return {
          address: result.address,
          publicKey: result.publicKey,
          signedMessage: Buffer.from(result.signInResult.signedMessage, 'base64'),
          signature: Buffer.from(result.signInResult.signature, 'base64'),
        };
      },
    };
  }

  // Web Wallet Adapter implementation
  if (!webWalletContext) {
    throw new Error('Web wallet context required for web wallet type');
  }

  return {
    state: {
      ...state,
      publicKey: webWalletContext.publicKey,
      connected: webWalletContext.connected,
      connecting: webWalletContext.connecting,
      address: webWalletContext.publicKey?.toBase58() || null,
    },

    async connect() {
      await connectWebWallet(webWalletContext);
      state.publicKey = webWalletContext.publicKey;
      state.address = webWalletContext.publicKey?.toBase58() || null;
      state.connected = webWalletContext.connected;
    },

    async disconnect() {
      await disconnectWebWallet(webWalletContext);
      state.publicKey = null;
      state.address = null;
      state.connected = false;
    },

    async signAndSendTransaction(transaction, connection) {
      return await signAndSendTransactionWeb(transaction, connection, webWalletContext);
    },

    async signMessage(message) {
      return await signMessageWeb(message, webWalletContext);
    },

    async signInWithSolana(domain, statement) {
      return await signInWithSolanaWeb(domain, statement, webWalletContext);
    },
  };
}

/**
 * Storage helper for persisting auth tokens (mobile only)
 */
export const WalletStorage = {
  AUTH_TOKEN_KEY: 'magic_roulette_auth_token',
  
  async saveAuthToken(authToken: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.AUTH_TOKEN_KEY, authToken);
    }
  },
  
  async getAuthToken(): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }
    return null;
  },
  
  async clearAuthToken(): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
    }
  },
};
