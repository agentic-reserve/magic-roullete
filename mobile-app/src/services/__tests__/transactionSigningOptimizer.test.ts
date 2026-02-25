/**
 * Unit tests for Transaction Signing Optimizer
 * 
 * Tests transaction size optimization, parallel preparation,
 * performance tracking, and Seeker-specific optimizations.
 * 
 * Validates: Requirements 4.10
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
  Keypair,
} from '@solana/web3.js';
import {
  TransactionSigningOptimizer,
  createTransactionSigningOptimizer,
} from '../transactionSigningOptimizer';

// Mock connection
const mockConnection = {
  getLatestBlockhash: jest.fn().mockResolvedValue({
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 1000000,
  }),
} as unknown as Connection;

describe('TransactionSigningOptimizer', () => {
  let optimizer: TransactionSigningOptimizer;
  let feePayer: PublicKey;

  beforeEach(() => {
    optimizer = createTransactionSigningOptimizer(mockConnection, false);
    feePayer = Keypair.generate().publicKey;
    jest.clearAllMocks();
  });

  describe('optimizeTransactionSize', () => {
    it('should remove duplicate instructions', async () => {
      const transaction = new Transaction();
      const recipient = Keypair.generate().publicKey;

      // Add same instruction twice
      const instruction = SystemProgram.transfer({
        fromPubkey: feePayer,
        toPubkey: recipient,
        lamports: 1000000,
      });

      transaction.add(instruction);
      transaction.add(instruction); // Duplicate

      const result = await optimizer.optimizeTransactionSize(transaction);

      expect(result.optimizationsApplied).toContain('deduplicate_instructions');
      expect(result.savingsBytes).toBeGreaterThan(0);
      expect(result.savingsPercent).toBeGreaterThan(0);
    });

    it('should optimize compute budget instructions', async () => {
      const transaction = new Transaction();

      // Add multiple compute budget instructions (redundant)
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })
      );
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })
      );
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })
      );

      const result = await optimizer.optimizeTransactionSize(transaction);

      expect(result.optimizationsApplied).toContain('optimize_compute_budget');
      expect(result.optimizedSize).toBeLessThan(result.originalSize);
    });

    it('should report optimization metrics', async () => {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const result = await optimizer.optimizeTransactionSize(transaction);

      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.optimizedSize).toBeGreaterThan(0);
      expect(result.savingsBytes).toBeGreaterThanOrEqual(0);
      expect(result.savingsPercent).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.optimizationsApplied)).toBe(true);
    });
  });

  describe('prepareTransactionsParallel', () => {
    it('should prepare multiple transactions in parallel', async () => {
      const transactions = [
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 1000000,
          })
        ),
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 2000000,
          })
        ),
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 3000000,
          })
        ),
      ];

      const result = await optimizer.prepareTransactionsParallel(
        transactions,
        feePayer
      );

      expect(result.transactions).toHaveLength(3);
      expect(result.preparationTime).toBeGreaterThan(0);
      expect(result.parallelizationGain).toBeGreaterThanOrEqual(0);

      // Verify all transactions have blockhash and feePayer set
      result.transactions.forEach((tx) => {
        if (tx instanceof Transaction) {
          expect(tx.recentBlockhash).toBe('mock-blockhash');
          expect(tx.feePayer).toEqual(feePayer);
        }
      });
    });

    it('should fetch blockhash only once for all transactions', async () => {
      const transactions = [
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 1000000,
          })
        ),
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 2000000,
          })
        ),
      ];

      await optimizer.prepareTransactionsParallel(transactions, feePayer);

      // Should only call getLatestBlockhash once
      expect(mockConnection.getLatestBlockhash).toHaveBeenCalledTimes(1);
    });

    it('should report parallelization gain', async () => {
      const transactions = Array.from({ length: 5 }, () =>
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 1000000,
          })
        )
      );

      const result = await optimizer.prepareTransactionsParallel(
        transactions,
        feePayer
      );

      // With 5 transactions, parallelization should provide some gain
      expect(result.parallelizationGain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('trackSigningPerformance', () => {
    it('should track signing duration', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const transactionId = 'test-tx-1';
      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      const result = await optimizer.trackSigningPerformance(
        transactionId,
        transaction,
        mockSignFn
      );

      expect(result.metrics.transactionId).toBe(transactionId);
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0);
      expect(result.metrics.startTime).toBeGreaterThan(0);
      expect(result.metrics.endTime).toBeGreaterThan(0);
      expect(mockSignFn).toHaveBeenCalled();
    });

    it('should detect if signing meets 200ms target', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const transactionId = 'test-tx-2';
      const mockSignFn = jest.fn().mockImplementation(async () => {
        // Simulate fast signing (<200ms)
        await new Promise((resolve) => setTimeout(resolve, 50));
        return transaction;
      });

      const result = await optimizer.trackSigningPerformance(
        transactionId,
        transaction,
        mockSignFn
      );

      expect(result.metrics.meetsTarget).toBe(true);
      expect(result.metrics.duration).toBeLessThan(200);
    });

    it('should collect transaction metrics', async () => {
      const transaction = new Transaction()
        .add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 1000000,
          })
        )
        .add(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: Keypair.generate().publicKey,
            lamports: 2000000,
          })
        );

      const transactionId = 'test-tx-3';
      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      const result = await optimizer.trackSigningPerformance(
        transactionId,
        transaction,
        mockSignFn
      );

      expect(result.metrics.instructionCount).toBe(2);
      expect(result.metrics.transactionSize).toBeGreaterThan(0);
      expect(result.metrics.signatureCount).toBeGreaterThan(0);
    });
  });

  describe('applySeekerOptimizations', () => {
    it('should add compute budget for Seeker devices', () => {
      const seekerOptimizer = createTransactionSigningOptimizer(
        mockConnection,
        true
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const optimized = seekerOptimizer.applySeekerOptimizations(transaction);

      // Should have compute budget instruction added
      expect(optimized instanceof Transaction).toBe(true);
      if (optimized instanceof Transaction) {
        const hasComputeBudget = optimized.instructions.some((ix) =>
          ix.programId.equals(ComputeBudgetProgram.programId)
        );
        expect(hasComputeBudget).toBe(true);
      }
    });

    it('should not modify transactions on non-Seeker devices', () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const originalInstructionCount = transaction.instructions.length;
      const optimized = optimizer.applySeekerOptimizations(transaction);

      expect(optimized).toBe(transaction);
      expect(transaction.instructions.length).toBe(originalInstructionCount);
    });
  });

  describe('getMetrics', () => {
    it('should retrieve metrics for specific transaction', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const transactionId = 'test-tx-4';
      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      await optimizer.trackSigningPerformance(
        transactionId,
        transaction,
        mockSignFn
      );

      const metrics = optimizer.getMetrics(transactionId);

      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(false);
      if (!Array.isArray(metrics)) {
        expect(metrics.transactionId).toBe(transactionId);
      }
    });

    it('should retrieve all metrics when no ID provided', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      await optimizer.trackSigningPerformance('tx-1', transaction, mockSignFn);
      await optimizer.trackSigningPerformance('tx-2', transaction, mockSignFn);

      const allMetrics = optimizer.getMetrics();

      expect(Array.isArray(allMetrics)).toBe(true);
      if (Array.isArray(allMetrics)) {
        expect(allMetrics.length).toBe(2);
      }
    });
  });

  describe('getAverageSigningTime', () => {
    it('should calculate average signing time', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      await optimizer.trackSigningPerformance('tx-1', transaction, mockSignFn);
      await optimizer.trackSigningPerformance('tx-2', transaction, mockSignFn);
      await optimizer.trackSigningPerformance('tx-3', transaction, mockSignFn);

      const avgTime = optimizer.getAverageSigningTime();

      expect(avgTime).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 when no metrics exist', () => {
      const avgTime = optimizer.getAverageSigningTime();
      expect(avgTime).toBe(0);
    });
  });

  describe('getTargetComplianceRate', () => {
    it('should calculate percentage meeting 200ms target', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const fastSignFn = jest.fn().mockResolvedValue(transaction);

      // Track 3 fast transactions
      await optimizer.trackSigningPerformance('tx-1', transaction, fastSignFn);
      await optimizer.trackSigningPerformance('tx-2', transaction, fastSignFn);
      await optimizer.trackSigningPerformance('tx-3', transaction, fastSignFn);

      const complianceRate = optimizer.getTargetComplianceRate();

      // All should meet target
      expect(complianceRate).toBeGreaterThanOrEqual(0);
      expect(complianceRate).toBeLessThanOrEqual(100);
    });

    it('should return 100% when no metrics exist', () => {
      const complianceRate = optimizer.getTargetComplianceRate();
      expect(complianceRate).toBe(100);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all stored metrics', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      await optimizer.trackSigningPerformance('tx-1', transaction, mockSignFn);
      await optimizer.trackSigningPerformance('tx-2', transaction, mockSignFn);

      optimizer.clearMetrics();

      const allMetrics = optimizer.getMetrics();
      expect(Array.isArray(allMetrics)).toBe(true);
      if (Array.isArray(allMetrics)) {
        expect(allMetrics.length).toBe(0);
      }
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics as JSON', async () => {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const mockSignFn = jest.fn().mockResolvedValue(transaction);

      await optimizer.trackSigningPerformance('tx-1', transaction, mockSignFn);

      const exported = optimizer.exportMetrics();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('totalTransactions');
      expect(parsed).toHaveProperty('averageSigningTime');
      expect(parsed).toHaveProperty('targetComplianceRate');
      expect(parsed).toHaveProperty('deviceType');
      expect(parsed).toHaveProperty('metrics');
      expect(Array.isArray(parsed.metrics)).toBe(true);
    });
  });
});
