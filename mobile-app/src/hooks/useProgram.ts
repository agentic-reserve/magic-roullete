import { useMemo } from 'react';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { useWallet } from '../contexts/WalletContext';
import { connection, getProgram } from '../services/solana';

export const useProgram = () => {
  const { publicKey, signTransaction } = useWallet();

  const provider = useMemo(() => {
    if (!publicKey) return null;

    const wallet: Wallet = {
      publicKey,
      signTransaction,
      signAllTransactions: async (txs) => {
        return Promise.all(txs.map((tx) => signTransaction(tx)));
      },
    };

    return new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
  }, [publicKey, signTransaction]);

  const program = useMemo(() => {
    if (!provider) return null;
    return getProgram(provider);
  }, [provider]);

  return { provider, program };
};
