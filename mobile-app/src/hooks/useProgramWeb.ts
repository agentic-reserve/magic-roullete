import { useMemo } from 'react';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getProgram } from '../services/solana';

export const useProgramWeb = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    const anchorWallet: Wallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions || (async (txs) => {
        if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
        return Promise.all(txs.map((tx) => wallet.signTransaction!(tx)));
      }),
    };

    return new AnchorProvider(connection, anchorWallet, {
      commitment: 'confirmed',
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return getProgram(provider);
  }, [provider]);

  return { provider, program, wallet };
};
