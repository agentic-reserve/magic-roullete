import { useState, useCallback, useMemo } from 'react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { useWallet } from '../contexts/WalletContext';
import { connection } from '../services/solana';
import { 
  createTransactionBatchingService,
  BatchedTransaction,
  BatchResult,
} from '../services/transactionBatching';

/**
 * React hook for transaction batching
 * 
 * Provides easy-to-use interface for batching transactions
 * to minimize wallet popup interruptions.
 * 
 * Usage:
 * ```tsx
 * const { batchCreateGame, batchClaimWinnings, executing } = useTransactionBatching();
 * 
 * // Batch entry fee deposit + game creation
 * await batchCreateGame('OneVsOne', 0.1);
 * 
 * // Batch winnings claim + withdrawal
 * await batchClaimWinnings(gameId, 1.5);
 * ```
 */
export function useTransactionBatching() {
  const { publicKey, signAllTransactions } = useWallet();
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create batching service instance
  const batchingService = useMemo(
    () => createTransactionBatchingService(connection),
    []
  );

  /**
   * Batch entry fee deposit and game creation
   * 
   * Combines deposit and game creation into single transaction
   * requiring only one wallet approval.
   * 
   * @param gameMode - Game mode (1v1 or 2v2)
   * @param entryFeeSol - Entry fee in SOL
   * @param useCompressed - Whether to use compressed tokens
   * @returns Transaction signature
   */
  const batchCreateGame = useCallback(
    async (
      gameMode: 'OneVsOne' | 'TwoVsTwo',
      entryFeeSol: number,
      useCompressed: boolean = true
    ): Promise<string | null> => {
      if (!publicKey || !signAllTransactions) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setExecuting(true);
        setError(null);

        // Create provider
        const provider = new AnchorProvider(
          connection,
          { publicKey, signAllTransactions, signTransaction: async (tx) => tx } as any,
          { commitment: 'confirmed' }
        );

        // Create batched transaction
        const batchedTx = await batchingService.batchCreateGameWithDeposit(
          provider,
          gameMode,
          entryFeeSol,
          useCompressed
        );

        console.log(`Batching: ${batchedTx.description}`);
        console.log(`Estimated cost: ${batchedTx.estimatedCost} lamports`);

        // Execute batch (single wallet popup)
        const result = await batchingService.executeBatch(
          signAllTransactions,
          [batchedTx]
        );

        if (!result.success) {
          throw new Error(result.errors?.join(', ') || 'Batch execution failed');
        }

        console.log('Batch executed successfully:', result.signatures);
        return result.signatures[0];
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('Failed to batch create game:', err);
        return null;
      } finally {
        setExecuting(false);
      }
    },
    [publicKey, signAllTransactions, batchingService]
  );

  /**
   * Batch winnings claim and withdrawal
   * 
   * Combines claim and withdrawal into single transaction
   * requiring only one wallet approval.
   * 
   * @param gameId - Game ID to claim from
   * @param withdrawAmount - Amount to withdraw (optional)
   * @param useCompressed - Whether to use compressed tokens
   * @returns Transaction signature
   */
  const batchClaimWinnings = useCallback(
    async (
      gameId: number,
      withdrawAmount?: number,
      useCompressed: boolean = true
    ): Promise<string | null> => {
      if (!publicKey || !signAllTransactions) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setExecuting(true);
        setError(null);

        // Create provider
        const provider = new AnchorProvider(
          connection,
          { publicKey, signAllTransactions, signTransaction: async (tx) => tx } as any,
          { commitment: 'confirmed' }
        );

        // Create batched transaction
        const batchedTx = await batchingService.batchClaimAndWithdraw(
          provider,
          gameId,
          withdrawAmount,
          useCompressed
        );

        console.log(`Batching: ${batchedTx.description}`);
        console.log(`Estimated cost: ${batchedTx.estimatedCost} lamports`);

        // Execute batch (single wallet popup)
        const result = await batchingService.executeBatch(
          signAllTransactions,
          [batchedTx]
        );

        if (!result.success) {
          throw new Error(result.errors?.join(', ') || 'Batch execution failed');
        }

        console.log('Batch executed successfully:', result.signatures);
        return result.signatures[0];
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('Failed to batch claim winnings:', err);
        return null;
      } finally {
        setExecuting(false);
      }
    },
    [publicKey, signAllTransactions, batchingService]
  );

  /**
   * Execute multiple batched transactions
   * 
   * Generic method for executing multiple batched transactions
   * with a single wallet approval.
   * 
   * @param batchedTransactions - Array of batched transactions
   * @returns Batch execution result
   */
  const executeBatch = useCallback(
    async (batchedTransactions: BatchedTransaction[]): Promise<BatchResult | null> => {
      if (!publicKey || !signAllTransactions) {
        setError('Wallet not connected');
        return null;
      }

      try {
        setExecuting(true);
        setError(null);

        console.log(`Executing ${batchedTransactions.length} batched transactions`);
        
        // Execute batch
        const result = await batchingService.executeBatch(
          signAllTransactions,
          batchedTransactions
        );

        if (!result.success) {
          throw new Error(result.errors?.join(', ') || 'Batch execution failed');
        }

        console.log('Batch executed successfully:', result.signatures);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error('Failed to execute batch:', err);
        return null;
      } finally {
        setExecuting(false);
      }
    },
    [publicKey, signAllTransactions, batchingService]
  );

  return {
    // State
    executing,
    error,

    // Batching methods
    batchCreateGame,
    batchClaimWinnings,
    executeBatch,

    // Service instance for advanced usage
    batchingService,
  };
}
