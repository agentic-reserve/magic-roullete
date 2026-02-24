/**
 * React Hook for MagicBlock Ephemeral Rollups
 * Manages delegation, ER connections, and performance monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import {
  getBaseConnection,
  getERConnection,
  isDelegated,
  waitForDelegation,
  measureERLatency,
  getERValidator,
  DELEGATION_PROGRAM_ID,
} from '../services/magicblock';
import { getProgram, getGamePDA } from '../services/solana';

export interface MagicBlockState {
  isDelegated: boolean;
  isLoading: boolean;
  error: string | null;
  erLatency: number | null;
  validator: PublicKey;
}

export interface UseMagicBlockReturn extends MagicBlockState {
  delegateGame: (gameId: number) => Promise<string>;
  commitGame: (gameId: number) => Promise<string>;
  undelegateGame: (gameId: number) => Promise<string>;
  checkDelegation: (gameId: number) => Promise<boolean>;
  refreshState: () => Promise<void>;
}

/**
 * Hook for managing MagicBlock ER integration
 */
export const useMagicBlock = (
  provider: AnchorProvider | null,
  gameId?: number
): UseMagicBlockReturn => {
  const [state, setState] = useState<MagicBlockState>({
    isDelegated: false,
    isLoading: false,
    error: null,
    erLatency: null,
    validator: getERValidator(),
  });

  /**
   * Check if game is delegated
   */
  const checkDelegation = useCallback(
    async (id: number): Promise<boolean> => {
      if (!provider) return false;

      try {
        const gamePDA = getGamePDA(id);
        const delegated = await isDelegated(gamePDA);
        setState((prev) => ({ ...prev, isDelegated: delegated }));
        return delegated;
      } catch (error: any) {
        console.error('Error checking delegation:', error);
        return false;
      }
    },
    [provider]
  );

  /**
   * Delegate game to ER
   */
  const delegateGame = useCallback(
    async (id: number): Promise<string> => {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const program = getProgram(provider);
        const gamePDA = getGamePDA(id);

        // Check if already delegated
        const alreadyDelegated = await isDelegated(gamePDA);
        if (alreadyDelegated) {
          setState((prev) => ({ ...prev, isLoading: false, isDelegated: true }));
          return 'Already delegated';
        }

        // Delegate to ER
        const tx = await program.methods
          .delegateGame()
          .accounts({
            game: gamePDA,
            payer: provider.wallet.publicKey,
            delegationProgram: DELEGATION_PROGRAM_ID,
          })
          .rpc();

        // Wait for delegation to propagate
        const success = await waitForDelegation(gamePDA);
        if (!success) {
          throw new Error('Delegation did not propagate in time');
        }

        setState((prev) => ({ ...prev, isLoading: false, isDelegated: true }));
        return tx;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to delegate game';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        throw error;
      }
    },
    [provider]
  );

  /**
   * Commit game state from ER to base layer
   */
  const commitGame = useCallback(
    async (id: number): Promise<string> => {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const program = getProgram(provider);
        const gamePDA = getGamePDA(id);

        // Verify game is delegated
        const delegated = await isDelegated(gamePDA);
        if (!delegated) {
          throw new Error('Game is not delegated');
        }

        // Commit state
        const tx = await program.methods
          .commitGame()
          .accounts({
            game: gamePDA,
            payer: provider.wallet.publicKey,
          })
          .rpc();

        setState((prev) => ({ ...prev, isLoading: false }));
        return tx;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to commit game';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        throw error;
      }
    },
    [provider]
  );

  /**
   * Undelegate game from ER
   */
  const undelegateGame = useCallback(
    async (id: number): Promise<string> => {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const program = getProgram(provider);
        const gamePDA = getGamePDA(id);

        // Verify game is delegated
        const delegated = await isDelegated(gamePDA);
        if (!delegated) {
          setState((prev) => ({ ...prev, isLoading: false, isDelegated: false }));
          return 'Already undelegated';
        }

        // Undelegate
        const tx = await program.methods
          .undelegateGame()
          .accounts({
            game: gamePDA,
            payer: provider.wallet.publicKey,
            delegationProgram: DELEGATION_PROGRAM_ID,
          })
          .rpc();

        setState((prev) => ({ ...prev, isLoading: false, isDelegated: false }));
        return tx;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to undelegate game';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        throw error;
      }
    },
    [provider]
  );

  /**
   * Refresh state (delegation status and ER latency)
   */
  const refreshState = useCallback(async () => {
    if (!provider || !gameId) return;

    try {
      // Check delegation
      const delegated = await checkDelegation(gameId);

      // Measure ER latency
      const latency = await measureERLatency();

      setState((prev) => ({
        ...prev,
        isDelegated: delegated,
        erLatency: latency,
      }));
    } catch (error: any) {
      console.error('Error refreshing state:', error);
    }
  }, [provider, gameId, checkDelegation]);

  /**
   * Auto-refresh on mount and when gameId changes
   */
  useEffect(() => {
    if (gameId) {
      refreshState();
    }
  }, [gameId, refreshState]);

  return {
    ...state,
    delegateGame,
    commitGame,
    undelegateGame,
    checkDelegation,
    refreshState,
  };
};

/**
 * Hook for ER performance monitoring
 */
export const useERPerformance = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const measureLatency = useCallback(async () => {
    try {
      const result = await measureERLatency();
      setLatency(result);
      return result;
    } catch (error) {
      console.error('Error measuring ER latency:', error);
      return null;
    }
  }, []);

  const startMonitoring = useCallback((intervalMs: number = 5000) => {
    setIsMonitoring(true);
    const interval = setInterval(measureLatency, intervalMs);
    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [measureLatency]);

  useEffect(() => {
    measureLatency();
  }, [measureLatency]);

  return {
    latency,
    isMonitoring,
    measureLatency,
    startMonitoring,
  };
};
