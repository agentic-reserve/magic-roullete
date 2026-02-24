import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      
      await transact(async (wallet: Web3MobileWallet) => {
        const authorization = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Magic Roulette',
            uri: 'https://magicroulette.com',
            icon: 'https://magicroulette.com/icon.png',
          },
        });

        const pubKey = new PublicKey(authorization.accounts[0].address);
        setPublicKey(pubKey);
        setConnected(true);
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setConnected(false);
  }, []);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction): Promise<string> => {
      if (!publicKey) throw new Error('Wallet not connected');

      let signature = '';
      await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Magic Roulette',
            uri: 'https://magicroulette.com',
            icon: 'https://magicroulette.com/icon.png',
          },
        });

        const signedTransactions = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        signature = signedTransactions[0];
      });

      return signature;
    },
    [publicKey]
  );

  const signTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction) => {
      if (!publicKey) throw new Error('Wallet not connected');

      let signedTx = transaction;
      await transact(async (wallet: Web3MobileWallet) => {
        await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Magic Roulette',
            uri: 'https://magicroulette.com',
            icon: 'https://magicroulette.com/icon.png',
          },
        });

        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        signedTx = signedTransactions[0];
      });

      return signedTx;
    },
    [publicKey]
  );

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        connect,
        disconnect,
        signAndSendTransaction,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
