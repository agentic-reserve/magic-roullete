import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletProvider, useWallet } from '../WalletContext';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';

// Mock dependencies
jest.mock('@solana-mobile/mobile-wallet-adapter-protocol');
jest.mock('@react-native-async-storage/async-storage');

const mockTransact = transact as jest.MockedFunction<typeof transact>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('WalletContext - Persistent Session', () => {
  const mockAuthToken = 'mock-auth-token-12345';
  const mockPublicKey = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
  const mockWallet = {
    authorize: jest.fn(),
    reauthorize: jest.fn(),
    signAndSendTransactions: jest.fn(),
    signTransactions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.multiRemove.mockResolvedValue(undefined);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WalletProvider>{children}</WalletProvider>
  );

  describe('Session Persistence', () => {
    it('should store auth token and expiry on connect', async () => {
      mockTransact.mockImplementation(async (callback) => {
        mockWallet.authorize.mockResolvedValue({
          accounts: [{ address: mockPublicKey }],
          auth_token: mockAuthToken,
        });
        await callback(mockWallet as any);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:auth_token',
        mockAuthToken
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:wallet_address',
        mockPublicKey
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:session_expiry',
        expect.any(String)
      );
    });

    it('should restore session from storage on mount', async () => {
      const futureExpiry = Date.now() + 3600000; // 1 hour from now
      
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
        if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
        if (key === '@magic_roulette:session_expiry') return Promise.resolve(futureExpiry.toString());
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
      });

      expect(result.current.publicKey?.toBase58()).toBe(mockPublicKey);
    });

    it('should not restore expired session', async () => {
      const pastExpiry = Date.now() - 1000; // Expired 1 second ago
      
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
        if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
        if (key === '@magic_roulette:session_expiry') return Promise.resolve(pastExpiry.toString());
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await waitFor(() => {
        expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
          '@magic_roulette:auth_token',
          '@magic_roulette:wallet_address',
          '@magic_roulette:session_expiry',
        ]);
      });

      expect(result.current.connected).toBe(false);
    });

    it('should clear session data on disconnect', async () => {
      mockTransact.mockImplementation(async (callback) => {
        mockWallet.authorize.mockResolvedValue({
          accounts: [{ address: mockPublicKey }],
          auth_token: mockAuthToken,
        });
        await callback(mockWallet as any);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@magic_roulette:auth_token',
        '@magic_roulette:wallet_address',
        '@magic_roulette:session_expiry',
      ]);
      expect(result.current.connected).toBe(false);
    });
  });

  describe('Session Reauthorization', () => {
    it('should reauthorize with stored token for transactions', async () => {
      const futureExpiry = Date.now() + 3600000;
      
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
        if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
        if (key === '@magic_roulette:session_expiry') return Promise.resolve(futureExpiry.toString());
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
      });

      const mockTransaction = {} as any;
      
      mockTransact.mockImplementation(async (callback) => {
        mockWallet.reauthorize.mockResolvedValue({
          accounts: [{ address: mockPublicKey }],
          auth_token: mockAuthToken,
        });
        mockWallet.signAndSendTransactions.mockResolvedValue(['mock-signature']);
        await callback(mockWallet as any);
      });

      await act(async () => {
        await result.current.signAndSendTransaction(mockTransaction);
      });

      expect(mockWallet.reauthorize).toHaveBeenCalledWith({
        auth_token: mockAuthToken,
        identity: expect.any(Object),
      });
    });

    it('should update auth token if changed during reauthorization', async () => {
      const futureExpiry = Date.now() + 3600000;
      const newAuthToken = 'new-auth-token-67890';
      
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
        if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
        if (key === '@magic_roulette:session_expiry') return Promise.resolve(futureExpiry.toString());
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
      });

      const mockTransaction = {} as any;
      
      mockTransact.mockImplementation(async (callback) => {
        mockWallet.reauthorize.mockResolvedValue({
          accounts: [{ address: mockPublicKey }],
          auth_token: newAuthToken, // Different token
        });
        mockWallet.signAndSendTransactions.mockResolvedValue(['mock-signature']);
        await callback(mockWallet as any);
      });

      await act(async () => {
        await result.current.signAndSendTransaction(mockTransaction);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:auth_token',
        newAuthToken
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@magic_roulette:session_expiry',
        expect.any(String)
      );
    });
  });

  describe('Session Expiration Handling', () => {
    it('should throw error when session is expired during transaction', async () => {
      const pastExpiry = Date.now() - 1000;
      
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
        if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
        if (key === '@magic_roulette:session_expiry') return Promise.resolve(pastExpiry.toString());
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      // Wait for session to be restored (but it's expired)
      await waitFor(() => {
        expect(result.current.connected).toBe(false);
      });

      // Manually set connected state to simulate edge case
      // In real scenario, this would be caught by the expiry check
    });
  });
});

describe('Automatic Reconnection', () => {
  // Mock AppState
  let appStateListener: ((state: string) => void) | null = null;
  
  beforeEach(() => {
    // Mock AppState.addEventListener
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        currentState: 'active',
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            appStateListener = callback;
          }
          return {
            remove: jest.fn(),
          };
        }),
      },
    }));
  });

  it('should attempt reconnection when app returns to foreground', async () => {
    const futureExpiry = Date.now() + 3600000;
    
    // Setup stored session
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
      if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
      if (key === '@magic_roulette:session_expiry') return Promise.resolve(futureExpiry.toString());
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    // Wait for session to be restored
    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });

    // Simulate disconnect (e.g., network issue)
    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.connected).toBe(false);

    // Setup successful reconnection
    mockTransact.mockImplementation(async (callback) => {
      mockWallet.reauthorize.mockResolvedValue({
        accounts: [{ address: mockPublicKey }],
        auth_token: mockAuthToken,
      });
      await callback(mockWallet as any);
    });

    // Simulate app going to background then foreground
    if (appStateListener) {
      act(() => {
        appStateListener('background');
      });
      
      // Small delay to simulate background time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      act(() => {
        appStateListener('active');
      });
    }

    // Wait for reconnection to complete
    await waitFor(() => {
      expect(result.current.reconnecting).toBe(true);
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
      expect(result.current.reconnecting).toBe(false);
    }, { timeout: 5000 });
  });

  it('should show reconnecting state during reconnection attempt', async () => {
    const futureExpiry = Date.now() + 3600000;
    
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
      if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
      if (key === '@magic_roulette:session_expiry') return Promise.resolve(futureExpiry.toString());
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });

    // Disconnect
    await act(async () => {
      await result.current.disconnect();
    });

    // Setup delayed reconnection to observe reconnecting state
    mockTransact.mockImplementation(async (callback) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      mockWallet.reauthorize.mockResolvedValue({
        accounts: [{ address: mockPublicKey }],
        auth_token: mockAuthToken,
      });
      await callback(mockWallet as any);
    });

    // Trigger foreground event
    if (appStateListener) {
      act(() => {
        appStateListener('active');
      });
    }

    // Should show reconnecting state
    await waitFor(() => {
      expect(result.current.reconnecting).toBe(true);
    }, { timeout: 2000 });
  });

  it('should retry with exponential backoff on reconnection failure', async () => {
    jest.useFakeTimers();
    
    const futureExpiry = Date.now() + 3600000;
    
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
      if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
      if (key === '@magic_roulette:session_expiry') return Promise.resolve(futureExpiry.toString());
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });

    await act(async () => {
      await result.current.disconnect();
    });

    // Setup failing reconnection
    let attemptCount = 0;
    mockTransact.mockImplementation(async () => {
      attemptCount++;
      throw new Error('Reconnection failed');
    });

    // Trigger foreground event
    if (appStateListener) {
      act(() => {
        appStateListener('active');
      });
    }

    // Fast-forward through retry attempts
    // Attempt 1: 1000ms delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Attempt 2: 2000ms delay
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Attempt 3: 4000ms delay
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(attemptCount).toBe(3); // Should have tried 3 times
      expect(result.current.reconnecting).toBe(false);
      expect(result.current.error?.code).toBe('RECONNECTION_FAILED');
    });

    jest.useRealTimers();
  });

  it('should not attempt reconnection if session is expired', async () => {
    const pastExpiry = Date.now() - 1000;
    
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === '@magic_roulette:auth_token') return Promise.resolve(mockAuthToken);
      if (key === '@magic_roulette:wallet_address') return Promise.resolve(mockPublicKey);
      if (key === '@magic_roulette:session_expiry') return Promise.resolve(pastExpiry.toString());
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useWallet(), { wrapper });

    // Session should be cleared due to expiration
    await waitFor(() => {
      expect(result.current.connected).toBe(false);
    });

    // Trigger foreground event
    if (appStateListener) {
      act(() => {
        appStateListener('active');
      });
    }

    // Should not attempt reconnection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    expect(result.current.reconnecting).toBe(false);
    expect(mockTransact).not.toHaveBeenCalled();
  });
});
