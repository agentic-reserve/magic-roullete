/**
 * Game Real-Time Subscription Hook
 * 
 * Subscribe to game state changes in real-time using Helius WebSocket
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { heliusConnection } from '@/lib/helius-config';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// ============================================================================
// TYPES
// ============================================================================

export interface GameState {
  gameId: number;
  creator: string;
  gameMode: 'oneVsOne' | 'twoVsTwo';
  entryFee: number;
  status: 'waiting' | 'active' | 'finished';
  players: string[];
  currentTurn: number;
  winner: string | null;
  hasLoan: boolean;
  loanAmount: number;
  collateralAmount: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Subscribe to game state changes in real-time
 */
export function useGameSubscription(gamePda: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial game state
  const fetchGameState = useCallback(async () => {
    if (!gamePda) {
      setGameState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const publicKey = new PublicKey(gamePda);
      const accountInfo = await heliusConnection.getAccountInfo(publicKey);

      if (!accountInfo) {
        throw new Error('Game account not found');
      }

      // TODO: Decode account data using Anchor program
      // For now, just set a placeholder
      setGameState({
        gameId: 0,
        creator: '',
        gameMode: 'oneVsOne',
        entryFee: 0,
        status: 'waiting',
        players: [],
        currentTurn: 0,
        winner: null,
        hasLoan: false,
        loanAmount: 0,
        collateralAmount: 0,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching game state:', err);
    } finally {
      setLoading(false);
    }
  }, [gamePda]);

  // Subscribe to game account changes
  useEffect(() => {
    fetchGameState();

    if (!gamePda) return;

    const publicKey = new PublicKey(gamePda);
    
    // Subscribe to account changes
    const subscriptionId = heliusConnection.onAccountChange(
      publicKey,
      (accountInfo, context) => {
        console.log('🎮 Game state updated:', {
          slot: context.slot,
          lamports: accountInfo.lamports,
        });

        // TODO: Decode and update game state
        // For now, refetch
        fetchGameState();
      },
      'confirmed'
    );

    return () => {
      heliusConnection.removeAccountChangeListener(subscriptionId);
    };
  }, [gamePda, fetchGameState]);

  return { gameState, loading, error, refetch: fetchGameState };
}

/**
 * Subscribe to all active games
 */
export function useActiveGamesSubscription(programId: string) {
  const [games, setGames] = useState<GameState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActiveGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const publicKey = new PublicKey(programId);
      
      // Get all program accounts
      const accounts = await heliusConnection.getProgramAccounts(publicKey, {
        filters: [
          // TODO: Add filters for active games
        ],
      });

      // TODO: Decode accounts and filter active games
      setGames([]);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching active games:', err);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchActiveGames();

    // Subscribe to program account changes
    const publicKey = new PublicKey(programId);
    const subscriptionId = heliusConnection.onProgramAccountChange(
      publicKey,
      (keyedAccountInfo, context) => {
        console.log('🎮 Program account changed:', {
          slot: context.slot,
          pubkey: keyedAccountInfo.accountId.toBase58(),
        });

        // Refetch active games
        fetchActiveGames();
      },
      'confirmed'
    );

    return () => {
      heliusConnection.removeProgramAccountChangeListener(subscriptionId);
    };
  }, [programId, fetchActiveGames]);

  return { games, loading, error, refetch: fetchActiveGames };
}

/**
 * Subscribe to player's game history
 */
export function usePlayerGamesSubscription(playerAddress: string | null) {
  const [games, setGames] = useState<GameState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayerGames = useCallback(async () => {
    if (!playerAddress) {
      setGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Fetch player's game history using Helius Enhanced Transactions API
      // Filter transactions by program ID and player address
      setGames([]);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching player games:', err);
    } finally {
      setLoading(false);
    }
  }, [playerAddress]);

  useEffect(() => {
    fetchPlayerGames();
  }, [fetchPlayerGames]);

  return { games, loading, error, refetch: fetchPlayerGames };
}
