import { useState, useCallback, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import {
  createTokenService,
  TokenService,
  TokenOperationResult,
} from '../services/tokenService';
import { CompressedTokenError } from '../services/lightProtocol';

/**
 * Hook for managing compressed token operations with automatic SPL fallback
 * Provides methods for creating accounts, transferring tokens, and checking balances
 */
export const useCompressedTokens = () => {
  const { provider } = useProgram();
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Initialize unified token service with fallback enabled
  const tokenService = createTokenService({
    rpcEndpoint: process.env.EXPO_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    enableFallback: true,
    preferCompressed: true,
  });

  // Game token mint (should be configured in environment)
  const GAME_TOKEN_MINT = new PublicKey(
    process.env.EXPO_PUBLIC_GAME_TOKEN_MINT || '11111111111111111111111111111111'
  );

  /**
   * Handle operation result and update state
   */
  const handleOperationResult = useCallback((result: TokenOperationResult) => {
    if (result.fallbackUsed) {
      setFallbackUsed(true);
      console.warn('Operation used SPL fallback:', result.errorMessage);
    }
    return result;
  }, []);

  /**
   * Get compressed token balance for the connected wallet
   */
  const getBalance = useCallback(async (): Promise<bigint> => {
    if (!provider?.wallet?.publicKey) {
      return 0n;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement balance fetching using Light Protocol SDK
      // For now, return 0 as placeholder
      const balance = 0n;
      setBalance(balance);
      return balance;
    } catch (err: any) {
      const errorMsg = err instanceof CompressedTokenError
        ? `Balance fetch failed (${err.type}): ${err.message}`
        : err.message || 'Failed to fetch balance';
      setError(errorMsg);
      console.error('Get balance error:', err);
      return 0n;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  /**
   * Transfer tokens (compressed with SPL fallback)
   */
  const transferTokens = useCallback(
    async (recipient: PublicKey, amount: bigint): Promise<TokenOperationResult> => {
      if (!provider?.wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Get sender keypair from wallet adapter
        // For now, this is a placeholder implementation
        throw new Error('Token transfer not yet implemented');

        // const result = await tokenService.transfer(
        //   payerKeypair,
        //   GAME_TOKEN_MINT,
        //   amount,
        //   senderKeypair,
        //   recipient
        // );

        // handleOperationResult(result);
        // await getBalance(); // Refresh balance
        // return result;
      } catch (err: any) {
        const errorMsg = err instanceof CompressedTokenError
          ? `Transfer failed (${err.type}): ${err.message}`
          : err.message || 'Failed to transfer tokens';
        setError(errorMsg);
        console.error('Transfer error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, tokenService, GAME_TOKEN_MINT, getBalance, handleOperationResult]
  );

  /**
   * Compress existing SPL tokens to compressed format
   */
  const compressTokens = useCallback(
    async (amount: bigint): Promise<string> => {
      if (!provider?.wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Implement compression
        throw new Error('Token compression not yet implemented');
      } catch (err: any) {
        const errorMsg = err instanceof CompressedTokenError
          ? `Compression failed (${err.type}): ${err.message}`
          : err.message || 'Failed to compress tokens';
        setError(errorMsg);
        console.error('Compress error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider]
  );

  /**
   * Decompress compressed tokens back to SPL format
   */
  const decompressTokens = useCallback(
    async (amount: bigint): Promise<string> => {
      if (!provider?.wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Implement decompression
        throw new Error('Token decompression not yet implemented');
      } catch (err: any) {
        const errorMsg = err instanceof CompressedTokenError
          ? `Decompression failed (${err.type}): ${err.message}`
          : err.message || 'Failed to decompress tokens';
        setError(errorMsg);
        console.error('Decompress error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider]
  );

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (provider?.wallet?.publicKey) {
      getBalance();
    }
  }, [provider?.wallet?.publicKey, getBalance]);

  return {
    balance,
    loading,
    error,
    fallbackUsed,
    getBalance,
    transferTokens,
    compressTokens,
    decompressTokens,
    gameTokenMint: GAME_TOKEN_MINT,
    tokenService,
  };
};
