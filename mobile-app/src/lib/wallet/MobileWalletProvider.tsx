/**
 * Mobile Wallet Provider for React Native
 * Provides wallet connection context for the entire app
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const APP_IDENTITY = {
  name: 'Magic Roulette',
  uri: 'https://magicroullete.com',
  icon: 'favicon.ico',
};

interface WalletAccount {
  address: string;
  publicKey: PublicKey;
  label?: string;
}

interface MobileWalletContextType {
  account: WalletAccount | null;
  authToken: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signIn: (domain: string, statement: string) => Promise<any>;
}

const MobileWalletContext = createContext<MobileWalletContextType | null>(null);

interface MobileWalletProviderProps {
  children: ReactNode;
  cluster?: 'mainnet-beta' | 'devnet' | 'testnet';
}

export function MobileWalletProvider({ 
  children, 
  cluster = 'devnet' 
}: MobileWalletProviderProps) {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
        });

        const accountData = authResult.accounts[0];
        return {
          address: accountData.address,
          publicKey: new PublicKey(accountData.address),
          label: accountData.label,
          authToken: authResult.auth_token,
        };
      });

      setAccount({
        address: result.address,
        publicKey: result.publicKey,
        label: result.label,
      });
      setAuthToken(result.authToken);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  const disconnect = useCallback(async () => {
    if (!authToken) return;

    try {
      await transact(async (wallet: Web3MobileWallet) => {
        await wallet.deauthorize({ auth_token: authToken });
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setAccount(null);
      setAuthToken(null);
    }
  }, [authToken]);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction): Promise<string> => {
      if (!authToken) {
        throw new Error('Wallet not connected');
      }

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
          auth_token: authToken,
        });

        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        return signatures[0];
      });

      return signature;
    },
    [authToken, cluster]
  );

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!authToken || !account) {
        throw new Error('Wallet not connected');
      }

      const signedMessage = await transact(async (wallet: Web3MobileWallet) => {
        await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
          auth_token: authToken,
        });

        const signedMessages = await wallet.signMessages({
          addresses: [account.address],
          payloads: [message],
        });

        return signedMessages[0];
      });

      return signedMessage;
    },
    [authToken, account, cluster]
  );

  const signIn = useCallback(
    async (domain: string, statement: string) => {
      setConnecting(true);
      try {
        const result = await transact(async (wallet: Web3MobileWallet) => {
          const authResult = await wallet.authorize({
            chain: `solana:${cluster}`,
            identity: APP_IDENTITY,
            sign_in_payload: {
              domain,
              statement,
              uri: APP_IDENTITY.uri,
            },
          });

          const accountData = authResult.accounts[0];
          return {
            address: accountData.address,
            publicKey: new PublicKey(accountData.address),
            label: accountData.label,
            authToken: authResult.auth_token,
            signInResult: authResult.sign_in_result,
          };
        });

        setAccount({
          address: result.address,
          publicKey: result.publicKey,
          label: result.label,
        });
        setAuthToken(result.authToken);

        return result.signInResult;
      } catch (error) {
        console.error('Failed to sign in:', error);
        throw error;
      } finally {
        setConnecting(false);
      }
    },
    [cluster]
  );

  const value: MobileWalletContextType = {
    account,
    authToken,
    connected: !!account,
    connecting,
    connect,
    disconnect,
    signAndSendTransaction,
    signMessage,
    signIn,
  };

  return (
    <MobileWalletContext.Provider value={value}>
      {children}
    </MobileWalletContext.Provider>
  );
}

export function useMobileWallet(): MobileWalletContextType {
  const context = useContext(MobileWalletContext);
  if (!context) {
    throw new Error('useMobileWallet must be used within MobileWalletProvider');
  }
  return context;
}
