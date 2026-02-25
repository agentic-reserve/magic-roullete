/**
 * Tests for Gasless Gameplay in WalletContext
 * Validates session-based authorization and shot tracking
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletProvider, useWallet } from '../WalletContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Mobile Wallet Adapter
jest.mock('@solana-mobile/mobile-wallet-adapter-protocol', () => ({
  transact: jest.fn(),
}));

describe('WalletContext - Gasless Gameplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WalletProvider>{children}</WalletProvider>
  );

  describe('preAuthorizeGameSession', () => {
    it('should create game session with default max shots', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Mock connected wallet
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1);
      });

      expect(result.current.gameSession).toBeDefined();
      expect(result.current.gameSession?.gameId).toBe(1);
      expect(result.current.gameSession?.maxShots).toBe(6);
      expect(result.current.gameSession?.shotsTaken).toBe(0);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:game_session',
        expect.any(String)
      );
    });

    it('should create game session with custom max shots', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Mock connected wallet
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(2, 10);
      });

      expect(result.current.gameSession?.gameId).toBe(2);
      expect(result.current.gameSession?.maxShots).toBe(10);
    });

    it('should throw error if wallet not connected', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      await expect(
        result.current.preAuthorizeGameSession(1)
      ).rejects.toThrow('Wallet not connected');
    });

    it('should set session expiry to 30 minutes', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Mock connected wallet
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      const beforeTime = Date.now();
      await act(async () => {
        await result.current.preAuthorizeGameSession(1);
      });
      const afterTime = Date.now();

      const session = result.current.gameSession!;
      const expectedExpiry = 30 * 60 * 1000; // 30 minutes
      const actualDuration = session.expiresAt - session.authorizedAt;

      expect(actualDuration).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(actualDuration).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });

  describe('executeShotGasless', () => {
    it('should execute shot and increment counter', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup connected wallet with game session
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 6);
      });

      const initialShots = result.current.gameSession!.shotsTaken;

      await act(async () => {
        await result.current.executeShotGasless(1);
      });

      expect(result.current.gameSession!.shotsTaken).toBe(initialShots + 1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:game_session',
        expect.stringContaining('"shotsTaken":1')
      );
    });

    it('should throw error if no active session', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Mock connected wallet without session
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await expect(
        result.current.executeShotGasless(1)
      ).rejects.toThrow('No active game session');
    });

    it('should throw error if game ID mismatch', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup session for game 1
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 6);
      });

      // Try to execute shot for game 2
      await expect(
        result.current.executeShotGasless(2)
      ).rejects.toThrow('No active game session');
    });

    it('should throw error if session expired', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup connected wallet
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 6);
      });

      // Manually expire session
      act(() => {
        const expiredSession = {
          ...result.current.gameSession!,
          expiresAt: Date.now() - 1000,
        };
        (result.current as any).setGameSession(expiredSession);
      });

      await expect(
        result.current.executeShotGasless(1)
      ).rejects.toThrow('Game session expired');
    });

    it('should throw error if max shots reached', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup connected wallet
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 2);
      });

      // Execute max shots
      await act(async () => {
        await result.current.executeShotGasless(1);
        await result.current.executeShotGasless(1);
      });

      // Try to execute one more
      await expect(
        result.current.executeShotGasless(1)
      ).rejects.toThrow('Maximum shots reached');
    });

    it('should allow multiple shots up to limit', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup connected wallet
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 6);
      });

      // Execute 6 shots
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          await result.current.executeShotGasless(1);
        });
        expect(result.current.gameSession!.shotsTaken).toBe(i + 1);
      }

      // 7th shot should fail
      await expect(
        result.current.executeShotGasless(1)
      ).rejects.toThrow('Maximum shots reached');
    });
  });

  describe('clearGameSession', () => {
    it('should clear game session', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup session
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 6);
      });

      expect(result.current.gameSession).toBeDefined();

      await act(async () => {
        await result.current.clearGameSession();
      });

      expect(result.current.gameSession).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@magic_roulette:game_session'
      );
    });
  });

  describe('disconnect', () => {
    it('should clear game session on disconnect', async () => {
      const { result } = renderHook(() => useWallet(), { wrapper });

      // Setup connected wallet with session
      act(() => {
        (result.current as any).setConnected(true);
        (result.current as any).setPublicKey({ toBase58: () => 'test-pubkey' });
      });

      await act(async () => {
        await result.current.preAuthorizeGameSession(1, 6);
      });

      expect(result.current.gameSession).toBeDefined();

      await act(async () => {
        await result.current.disconnect();
      });

      expect(result.current.gameSession).toBeNull();
      expect(result.current.connected).toBe(false);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
        expect.arrayContaining(['@magic_roulette:game_session'])
      );
    });
  });

  describe('session restoration', () => {
    it('should restore game session from storage', async () => {
      const mockSession = {
        gameId: 1,
        authorizedAt: Date.now(),
        expiresAt: Date.now() + 1800000,
        maxShots: 6,
        shotsTaken: 2,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@magic_roulette:game_session') {
          return Promise.resolve(JSON.stringify(mockSession));
        }
        if (key === '@magic_roulette:auth_token') {
          return Promise.resolve('test-token');
        }
        if (key === '@magic_roulette:wallet_address') {
          return Promise.resolve('test-pubkey');
        }
        if (key === '@magic_roulette:session_expiry') {
          return Promise.resolve(String(Date.now() + 3600000));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await waitFor(() => {
        expect(result.current.gameSession).toBeDefined();
      });

      expect(result.current.gameSession?.gameId).toBe(1);
      expect(result.current.gameSession?.shotsTaken).toBe(2);
    });

    it('should not restore expired game session', async () => {
      const expiredSession = {
        gameId: 1,
        authorizedAt: Date.now() - 2000000,
        expiresAt: Date.now() - 1000,
        maxShots: 6,
        shotsTaken: 2,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@magic_roulette:game_session') {
          return Promise.resolve(JSON.stringify(expiredSession));
        }
        if (key === '@magic_roulette:auth_token') {
          return Promise.resolve('test-token');
        }
        if (key === '@magic_roulette:wallet_address') {
          return Promise.resolve('test-pubkey');
        }
        if (key === '@magic_roulette:session_expiry') {
          return Promise.resolve(String(Date.now() + 3600000));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
      });

      expect(result.current.gameSession).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@magic_roulette:game_session'
      );
    });
  });
});
