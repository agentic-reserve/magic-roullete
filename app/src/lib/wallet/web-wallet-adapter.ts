/**
 * Web Wallet Adapter Integration for Desktop/Web
 * Using @solana/wallet-adapter
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  SendOptions 
} from '@solana/web3.js';

export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string>;
}

/**
 * Web Wallet Context
 * This would typically be provided by @solana/wallet-adapter-react
 */
export interface WebWalletContext {
  wallet: WalletAdapter | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendOptions
  ) => Promise<string>;
}

/**
 * Connect to a web wallet
 */
export async function connectWebWallet(
  walletContext: WebWalletContext
): Promise<PublicKey> {
  await walletContext.connect();
  
  if (!walletContext.publicKey) {
    throw new Error('Failed to connect wallet');
  }
  
  return walletContext.publicKey;
}

/**
 * Disconnect from web wallet
 */
export async function disconnectWebWallet(
  walletContext: WebWalletContext
): Promise<void> {
  await walletContext.disconnect();
}

/**
 * Sign and send transaction using web wallet
 */
export async function signAndSendTransactionWeb(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  walletContext: WebWalletContext,
  options?: SendOptions
): Promise<string> {
  if (!walletContext.connected || !walletContext.publicKey) {
    throw new Error('Wallet not connected');
  }

  const signature = await walletContext.sendTransaction(
    transaction,
    connection,
    options
  );

  return signature;
}

/**
 * Sign a message using web wallet
 */
export async function signMessageWeb(
  message: Uint8Array,
  walletContext: WebWalletContext
): Promise<Uint8Array> {
  if (!walletContext.connected) {
    throw new Error('Wallet not connected');
  }

  const signedMessage = await walletContext.signMessage(message);
  return signedMessage;
}

/**
 * Sign In with Solana (SIWS) for web wallets
 */
export async function signInWithSolanaWeb(
  domain: string,
  statement: string,
  walletContext: WebWalletContext
): Promise<{
  address: string;
  publicKey: PublicKey;
  signedMessage: Uint8Array;
  signature: Uint8Array;
}> {
  if (!walletContext.connected || !walletContext.publicKey) {
    throw new Error('Wallet not connected');
  }

  // Construct SIWS message
  const message = `${domain} wants you to sign in with your Solana account:\n${walletContext.publicKey.toBase58()}\n\n${statement}`;
  const messageBytes = new TextEncoder().encode(message);

  // Sign message
  const signature = await walletContext.signMessage(messageBytes);

  return {
    address: walletContext.publicKey.toBase58(),
    publicKey: walletContext.publicKey,
    signedMessage: messageBytes,
    signature,
  };
}
