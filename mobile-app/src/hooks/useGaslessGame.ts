/**
 * React Hook for Gasless Gameplay
 * Integrates WalletContext session authorization with Ephemeral Rollup execution
 */

import { useState, useCallback, useEffect } from 'react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { useWallet } from '../contexts/WalletContext';
import {
  executeShotOnER,
  delegateGameToER,
  commitGameFromER,
  undelegateGameFromER,
  isGameReadyForGasless,
  getGameStateFromER,
  GaslessShotResult,
} from '../services/gaslessGame';

export interface GaslessGameState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  lastShotResult: GaslessShotResult | null;
  averageLatency: number | null;
}

export interface UseGaslessGameReturn extends GaslessGameState {
  initializeGaslessGame: (gameId: number, maxShots?: number) => Promise<void>;
  executeShot: (gameId: number) => Promise<GaslessShotResult>;
  finishGame: (gameId: number) => Promise<void>;
  checkReadiness: (gameId: number) => Promise<boolean>;
  resetState: () => void;
}

/**
 * Hook for managing gasless gameplay with Ephemeral Rollups
 * Provides zero-gas shot execution without wallet popups
 */
export const useGaslessGame = (provider: AnchorProvider | null): UseGaslessGameReturn => {
  const wallet = useWallet();
  const [state, setState] = useState<GaslessGameState>({
    isReady: false,
    isLoading: false,
    error: null,
    lastShotResult: null,
    averageLatency: null,
  });
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);

  /**
   * Initialize gasless gameplay for a game
   * 1. Delegates game to ER
   * 2. Pre-authorizes game session in wallet
   */
  const initializeGaslessGame = useCallback(
    async (gameId: number, maxShots: number = 6) => {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      if (!wallet.connected) {
        throw new Error('Wallet not connected');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Step 1: Delegate game to Ephemeral Rollup
        console.log(`Delegating game ${gameId} to ER...`);
        await delegateGameToER(provider, gameId);

        // Step 2: Pre-authorize game session in wallet (no popup during gameplay)
        console.log(`Pre-authorizing game session for ${maxShots} shots...`);
        await wallet.preAuthorizeGameSession(gameId, maxShots);

        // Step 3: Verify readiness
        const ready = await isGameReadyForGasless(provider, gameId);

        setState((prev) => ({
          ...prev,
          isReady: ready,
          isLoading: false,
        }));

        console.log(`Gasless gameplay initialized for game ${gameId}`);
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to initialize gasless gameplay';
        setState((prev) => ({
          ...prev,
          isReady: false,
          isLoading: false,
          error: errorMsg,
        }));
        throw error;
      }
    },
    [provider, wallet]
  );

  /**
   * Execute shot without gas fees or wallet popups
   * Uses pre-authorized session and ER for instant execution
   */
  const executeShot = useCallback(
    async (gameId: number): Promise<GaslessShotResult> => {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      if (!state.isReady) {
        throw new Error('Gasless gameplay not initialized. Call initializeGaslessGame first.');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Verify wallet session authorization
        await wallet.executeShotGasless(gameId);

        // Execute shot on ER (zero gas, no popup)
        const result = await executeShotOnER(provider, gameId);

        // Track latency
        setLatencyHistory((prev) => [...prev, result.latency]);
        const avgLatency = latencyHistory.length > 0
          ? latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length
          : result.latency;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          lastShotResult: result,
          averageLatency: avgLatency,
        }));

        console.log(`Gasless shot executed in ${result.latency}ms`);
        return result;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to execute gasless shot';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
        throw error;
      }
    },
    [provider, wallet, state.isReady, latencyHistory]
  );

  /**
   * Finish game and commit state from ER to base layer
   * Clears game session authorization
   */
  const finishGame = useCallback(
    async (gameId: number) => {
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Commit game state from ER to base layer
        console.log(`Committing game ${gameId} from ER...`);
        await commitGameFromER(provider, gameId);

        // Undelegate game from ER
        console.log(`Undelegating game ${gameId} from ER...`);
        await undelegateGameFromER(provider, gameId);

        // Clear game session authorization
        await wallet.clearGameSession();

        setState((prev) => ({
          ...prev,
          isReady: false,
          isLoading: false,
        }));

        console.log(`Game ${gameId} finished and committed`);
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to finish game';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
        throw error;
      }
    },
    [provider, wallet]
  );

  /**
   * Check if game is ready for gasless gameplay
   */
  const checkReadiness = useCallback(
    async (gameId: number): Promise<boolean> => {
      if (!provider) return false;

      try {
        const ready = await isGameReadyForGasless(provider, gameId);
        setState((prev) => ({ ...prev, isReady: ready }));
        return ready;
      } catch (error) {
        console.error('Failed to check gasless readiness:', error);
        return false;
      }
    },
    [provider]
  );

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    setState({
      isReady: false,
      isLoading: false,
      error: null,
      lastShotResult: null,
      averageLatency: null,
    });
    setLatencyHistory([]);
  }, []);

  return {
    ...state,
    initializeGaslessGame,
    executeShot,
    finishGame,
    checkReadiness,
    resetState,
  };
};

/**
 * Hook for monitoring gasless gameplay performance
 */
export const useGaslessPerformance = () => {
  const [metrics, setMetrics] = useState({
    totalShots: 0,
    averageLatency: 0,
    minLatency: Infinity,
    maxLatency: 0,
    successRate: 100,
  });

  const recordShot = useCallback((latency: number, success: boolean) => {
    setMetrics((prev) => {
      const totalShots = prev.totalShots + 1;
      const successCount = success ? prev.successRate * prev.totalShots / 100 + 1 : prev.successRate * prev.totalShots / 100;
      
      return {
        totalShots,
        averageLatency: (prev.averageLatency * prev.totalShots + latency) / totalShots,
        minLatency: Math.min(prev.minLatency, latency),
        maxLatency: Math.max(prev.maxLatency, latency),
        successRate: (successCount / totalShots) * 100,
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalShots: 0,
      averageLatency: 0,
      minLatency: Infinity,
      maxLatency: 0,
      successRate: 100,
    });
  }, []);

  return {
    metrics,
    recordShot,
    resetMetrics,
  };
};
