import { useState, useEffect, useCallback } from 'react';
import { useProgram } from './useProgram';
import {
  GameData,
  GameMode,
  AiDifficulty,
  createGame,
  createGameWithCompressedTokens,
  joinGame,
  joinGameWithCompressedTokens,
  createAiGame,
  takeShot,
  finalizeGame,
  finalizeGameWithCompressedTokens,
  fetchGame,
  fetchActiveGames,
} from '../services/game';

export const useGame = (gameId?: number) => {
  const { provider } = useProgram();
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCompressedTokens, setUseCompressedTokens] = useState(true); // Default to compressed tokens

  // Fetch game data
  const loadGame = useCallback(async () => {
    if (!provider || gameId === undefined) return;

    try {
      setLoading(true);
      setError(null);
      const gameData = await fetchGame(provider, gameId);
      setGame(gameData);
    } catch (err: any) {
      setError(err.message || 'Failed to load game');
      console.error('Load game error:', err);
    } finally {
      setLoading(false);
    }
  }, [provider, gameId]);

  // Create new game (with optional compressed token support)
  const handleCreateGame = useCallback(
    async (gameMode: GameMode, entryFee: number, compressed: boolean = true) => {
      if (!provider) throw new Error('Wallet not connected');

      try {
        setLoading(true);
        setError(null);
        
        const signature = compressed
          ? await createGameWithCompressedTokens(provider, gameMode, entryFee, true)
          : await createGame(provider, gameMode, entryFee);
        
        console.log('Game created:', signature);
        console.log('Using compressed tokens:', compressed);
        
        return signature;
      } catch (err: any) {
        setError(err.message || 'Failed to create game');
        console.error('Create game error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider]
  );

  // Join existing game (with optional compressed token support)
  const handleJoinGame = useCallback(
    async (targetGameId: number, compressed: boolean = true) => {
      if (!provider) throw new Error('Wallet not connected');

      try {
        setLoading(true);
        setError(null);
        
        const signature = compressed
          ? await joinGameWithCompressedTokens(provider, targetGameId, true)
          : await joinGame(provider, targetGameId);
        
        console.log('Joined game:', signature);
        console.log('Using compressed tokens:', compressed);
        
        await loadGame();
        return signature;
      } catch (err: any) {
        setError(err.message || 'Failed to join game');
        console.error('Join game error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, loadGame]
  );

  // Create AI practice game
  const handleCreateAiGame = useCallback(
    async (difficulty: AiDifficulty) => {
      if (!provider) throw new Error('Wallet not connected');

      try {
        setLoading(true);
        setError(null);
        const signature = await createAiGame(provider, difficulty);
        console.log('AI game created:', signature);
        return signature;
      } catch (err: any) {
        setError(err.message || 'Failed to create AI game');
        console.error('Create AI game error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider]
  );

  // Take shot
  const handleTakeShot = useCallback(async () => {
    if (!provider || gameId === undefined) throw new Error('Invalid state');

    try {
      setLoading(true);
      setError(null);
      const signature = await takeShot(provider, gameId);
      console.log('Shot taken:', signature);
      await loadGame();
      return signature;
    } catch (err: any) {
      setError(err.message || 'Failed to take shot');
      console.error('Take shot error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [provider, gameId, loadGame]);

  // Finalize game (with optional compressed token support)
  const handleFinalizeGame = useCallback(async (compressed: boolean = true) => {
    if (!provider || gameId === undefined) throw new Error('Invalid state');

    try {
      setLoading(true);
      setError(null);
      
      const signature = compressed
        ? await finalizeGameWithCompressedTokens(provider, gameId, true)
        : await finalizeGame(provider, gameId);
      
      console.log('Game finalized:', signature);
      console.log('Using compressed tokens:', compressed);
      
      await loadGame();
      return signature;
    } catch (err: any) {
      setError(err.message || 'Failed to finalize game');
      console.error('Finalize game error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [provider, gameId, loadGame]);

  // Auto-load game on mount
  useEffect(() => {
    if (gameId !== undefined) {
      loadGame();
    }
  }, [gameId, loadGame]);

  return {
    game,
    loading,
    error,
    useCompressedTokens,
    setUseCompressedTokens,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    createAiGame: handleCreateAiGame,
    takeShot: handleTakeShot,
    finalizeGame: handleFinalizeGame,
    refreshGame: loadGame,
  };
};

// Hook for fetching active games list
export const useActiveGames = () => {
  const { provider } = useProgram();
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    if (!provider) return;

    try {
      setLoading(true);
      setError(null);
      const activeGames = await fetchActiveGames(provider);
      setGames(activeGames);
    } catch (err: any) {
      setError(err.message || 'Failed to load games');
      console.error('Load games error:', err);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return { games, loading, error, refreshGames: loadGames };
};
