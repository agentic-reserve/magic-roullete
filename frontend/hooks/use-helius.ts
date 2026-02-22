/**
 * Helius React Hooks
 * 
 * Custom hooks for Helius SDK integration
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createHeliusInstance, heliusConnection } from '@/lib/helius-config';

// ============================================================================
// TYPES
// ============================================================================

interface Asset {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
    };
  };
  token_info?: {
    balance: number;
    decimals: number;
  };
}

interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
  description: string;
  fee: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch user's assets (NFTs and tokens)
 */
export function useHeliusAssets(ownerAddress: string | null) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!ownerAddress) {
      setAssets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const helius = createHeliusInstance();
      const response = await helius.getAssetsByOwner({
        ownerAddress,
        page: 1,
        limit: 100,
        displayOptions: {
          showFungible: true,
          showNativeBalance: true,
        },
      });

      setAssets(response.items || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  }, [ownerAddress]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}

/**
 * Hook to fetch user's transaction history
 */
export function useHeliusTransactions(address: string | null, limit: number = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const helius = createHeliusInstance();
      const response = await helius.enhanced.getTransactionsByAddress({
        address,
      });

      setTransactions(response.slice(0, limit));
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [address, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

/**
 * Hook to get SOL balance with real-time updates
 */
export function useHeliusBalance(address: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const publicKey = new PublicKey(address);
      const lamports = await heliusConnection.getBalance(publicKey);
      setBalance(lamports / 1e9); // Convert to SOL
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();

    // Subscribe to balance changes
    if (!address) return;

    const publicKey = new PublicKey(address);
    const subscriptionId = heliusConnection.onAccountChange(
      publicKey,
      (accountInfo) => {
        setBalance(accountInfo.lamports / 1e9);
      },
      'confirmed'
    );

    return () => {
      heliusConnection.removeAccountChangeListener(subscriptionId);
    };
  }, [address, fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}

/**
 * Hook to get priority fee estimate
 */
export function useHeliusPriorityFee(accountKeys: string[] = []) {
  const [priorityFee, setPriorityFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPriorityFee = useCallback(async () => {
    if (accountKeys.length === 0) {
      setPriorityFee(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const helius = createHeliusInstance();
      const estimate = await helius.getPriorityFeeEstimate({
        accountKeys,
        options: {
          priorityLevel: 'HIGH',
        },
      });

      setPriorityFee(estimate.priorityFeeEstimate);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching priority fee:', err);
    } finally {
      setLoading(false);
    }
  }, [accountKeys]);

  useEffect(() => {
    fetchPriorityFee();
  }, [fetchPriorityFee]);

  return { priorityFee, loading, error, refetch: fetchPriorityFee };
}

/**
 * Hook to subscribe to account changes
 */
export function useHeliusAccountSubscription(
  address: string | null,
  callback: (data: any) => void
) {
  useEffect(() => {
    if (!address) return;

    const publicKey = new PublicKey(address);
    const subscriptionId = heliusConnection.onAccountChange(
      publicKey,
      callback,
      'confirmed'
    );

    return () => {
      heliusConnection.removeAccountChangeListener(subscriptionId);
    };
  }, [address, callback]);
}

/**
 * Hook to subscribe to program account changes
 */
export function useHeliusProgramSubscription(
  programId: string | null,
  callback: (data: any) => void
) {
  useEffect(() => {
    if (!programId) return;

    const publicKey = new PublicKey(programId);
    const subscriptionId = heliusConnection.onProgramAccountChange(
      publicKey,
      callback,
      'confirmed'
    );

    return () => {
      heliusConnection.removeProgramAccountChangeListener(subscriptionId);
    };
  }, [programId, callback]);
}
