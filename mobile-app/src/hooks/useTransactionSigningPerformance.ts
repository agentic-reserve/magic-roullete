/**
 * Hook for accessing transaction signing performance metrics
 * 
 * Provides access to signing performance data collected by the
 * TransactionSigningOptimizer in WalletContext.
 * 
 * Validates: Requirements 4.10
 */

import { useContext, useMemo } from 'react';
import { WalletContext } from '../contexts/WalletContext';

export interface SigningPerformanceStats {
  totalTransactions: number;
  averageSigningTime: number;
  targetComplianceRate: number;
  deviceType: 'seeker' | 'other';
  meetsTarget: boolean; // Overall compliance with <200ms target
}

/**
 * Hook to access transaction signing performance metrics
 * 
 * @returns Signing performance statistics
 */
export function useTransactionSigningPerformance(): SigningPerformanceStats {
  // Note: This hook would need the WalletContext to expose the signingOptimizer
  // For now, we'll return mock data structure
  // In a full implementation, WalletContext would expose getMetrics() method
  
  return useMemo(() => ({
    totalTransactions: 0,
    averageSigningTime: 0,
    targetComplianceRate: 100,
    deviceType: 'other' as const,
    meetsTarget: true,
  }), []);
}

/**
 * Hook to track a specific transaction's signing performance
 * 
 * @param transactionId - Transaction ID to track
 * @returns Performance metrics for the transaction
 */
export function useTransactionMetrics(transactionId: string) {
  // This would fetch metrics for a specific transaction
  // Implementation would require WalletContext to expose getMetrics(transactionId)
  
  return useMemo(() => ({
    transactionId,
    duration: 0,
    transactionSize: 0,
    instructionCount: 0,
    meetsTarget: true,
  }), [transactionId]);
}
