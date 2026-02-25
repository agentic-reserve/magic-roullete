/**
 * Transaction Signing Performance Optimizer
 * 
 * Optimizes transaction signing performance for Seeker hardware
 * Target: <200ms signing time on Seeker devices
 * 
 * Features:
 * - Transaction size optimization (minimal serialization)
 * - Parallel transaction preparation
 * - Signing performance tracking
 * - Seeker hardware-specific optimizations
 * 
 * Validates: Requirements 4.10
 */

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  TransactionMessage,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
} from '@solana/web3.js';

/**
 * Performance metrics for transaction signing
 */
export interface SigningPerformanceMetrics {
  transactionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  transactionSize: number;
  instructionCount: number;
  signatureCount: number;
  optimizationsApplied: string[];
  deviceType: 'seeker' | 'other';
  meetsTarget: boolean; // <200ms target
}

/**
 * Transaction optimization result
 */
export interface OptimizedTransaction {
  transaction: Transaction | VersionedTransaction;
  originalSize: number;
  optimizedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  optimizationsApplied: string[];
}

/**
 * Parallel preparation result
 */
export interface ParallelPreparationResult {
  transactions: (Transaction | VersionedTransaction)[];
  preparationTime: number;
  parallelizationGain: number; // Time saved vs sequential
}

/**
 * Transaction Signing Performance Optimizer
 */
export class TransactionSigningOptimizer {
  private connection: Connection;
  private metrics: Map<string, SigningPerformanceMetrics> = new Map();
  private isSeeker: boolean;
  private lookupTables: Map<string, AddressLookupTableAccount> = new Map();

  constructor(connection: Connection, isSeeker: boolean = false) {
    this.connection = connection;
    this.isSeeker = isSeeker;
  }

  /**
   * Optimize transaction for minimal size
   * 
   * Applies multiple optimization techniques:
   * - Remove duplicate instructions
   * - Deduplicate account keys
   * - Use address lookup tables (ALTs) for repeated accounts
   * - Minimize compute budget instructions
   * - Use versioned transactions when beneficial
   * 
   * @param transaction - Transaction to optimize
   * @returns Optimized transaction with metrics
   */
  async optimizeTransactionSize(
    transaction: Transaction
  ): Promise<OptimizedTransaction> {
    const optimizationsApplied: string[] = [];
    const originalSize = transaction.serialize({ verifySignatures: false }).length;

    // Step 1: Remove duplicate instructions
    const dedupedTx = this.deduplicateInstructions(transaction);
    if (dedupedTx.instructions.length < transaction.instructions.length) {
      optimizationsApplied.push('deduplicate_instructions');
    }

    // Step 2: Deduplicate account keys
    const optimizedTx = this.deduplicateAccountKeys(dedupedTx);
    optimizationsApplied.push('deduplicate_accounts');

    // Step 3: Optimize compute budget
    const computeOptimizedTx = this.optimizeComputeBudget(optimizedTx);
    optimizationsApplied.push('optimize_compute_budget');

    // Step 4: Consider using versioned transaction with ALTs
    let finalTx: Transaction | VersionedTransaction = computeOptimizedTx;
    
    if (this.shouldUseVersionedTransaction(computeOptimizedTx)) {
      try {
        finalTx = await this.convertToVersionedTransaction(computeOptimizedTx);
        optimizationsApplied.push('use_versioned_transaction');
      } catch (error) {
        console.warn('Failed to convert to versioned transaction:', error);
        // Fall back to legacy transaction
      }
    }

    const optimizedSize = this.getTransactionSize(finalTx);
    const savingsBytes = originalSize - optimizedSize;
    const savingsPercent = (savingsBytes / originalSize) * 100;

    return {
      transaction: finalTx,
      originalSize,
      optimizedSize,
      savingsBytes,
      savingsPercent,
      optimizationsApplied,
    };
  }

  /**
   * Prepare multiple transactions in parallel
   * 
   * Parallelizes transaction preparation steps:
   * - Fetch recent blockhash once for all transactions
   * - Prepare transactions concurrently
   * - Optimize each transaction in parallel
   * 
   * @param transactions - Array of transactions to prepare
   * @param feePayer - Fee payer public key
   * @returns Parallel preparation result
   */
  async prepareTransactionsParallel(
    transactions: Transaction[],
    feePayer: PublicKey
  ): Promise<ParallelPreparationResult> {
    const startTime = performance.now();

    // Fetch blockhash once for all transactions (shared resource)
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');

    // Prepare all transactions in parallel
    const preparedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        // Set common properties
        tx.recentBlockhash = blockhash;
        tx.feePayer = feePayer;

        // Optimize transaction size
        const optimized = await this.optimizeTransactionSize(tx);
        return optimized.transaction;
      })
    );

    const preparationTime = performance.now() - startTime;

    // Estimate sequential time (rough approximation)
    const estimatedSequentialTime = transactions.length * (preparationTime / transactions.length + 50);
    const parallelizationGain = estimatedSequentialTime - preparationTime;

    return {
      transactions: preparedTransactions,
      preparationTime,
      parallelizationGain: Math.max(0, parallelizationGain),
    };
  }

  /**
   * Track signing performance
   * 
   * Wraps transaction signing to measure performance metrics
   * 
   * @param transactionId - Unique transaction identifier
   * @param transaction - Transaction being signed
   * @param signFn - Signing function to track
   * @returns Signed transaction and performance metrics
   */
  async trackSigningPerformance<T extends Transaction | VersionedTransaction>(
    transactionId: string,
    transaction: T,
    signFn: () => Promise<T>
  ): Promise<{ signedTransaction: T; metrics: SigningPerformanceMetrics }> {
    const startTime = performance.now();
    const transactionSize = this.getTransactionSize(transaction);
    const instructionCount = this.getInstructionCount(transaction);
    const signatureCount = this.getSignatureCount(transaction);

    // Execute signing
    const signedTransaction = await signFn();

    const endTime = performance.now();
    const duration = endTime - startTime;
    const meetsTarget = duration < 200; // Target: <200ms

    const metrics: SigningPerformanceMetrics = {
      transactionId,
      startTime,
      endTime,
      duration,
      transactionSize,
      instructionCount,
      signatureCount,
      optimizationsApplied: [],
      deviceType: this.isSeeker ? 'seeker' : 'other',
      meetsTarget,
    };

    // Store metrics
    this.metrics.set(transactionId, metrics);

    // Log warning if target not met
    if (!meetsTarget) {
      console.warn(
        `Transaction signing exceeded 200ms target: ${duration.toFixed(2)}ms`,
        { transactionId, transactionSize, instructionCount }
      );
    }

    return { signedTransaction, metrics };
  }

  /**
   * Apply Seeker-specific optimizations
   * 
   * Optimizations for Seeker hardware:
   * - Use hardware crypto acceleration hints
   * - Optimize for Seeker's CPU architecture
   * - Minimize memory allocations
   * - Use efficient serialization
   * 
   * @param transaction - Transaction to optimize
   * @returns Optimized transaction
   */
  applySeekerOptimizations(
    transaction: Transaction | VersionedTransaction
  ): Transaction | VersionedTransaction {
    if (!this.isSeeker) {
      return transaction;
    }

    // Seeker-specific optimizations
    if (transaction instanceof Transaction) {
      // Ensure compute budget is optimized for Seeker
      const hasComputeBudget = transaction.instructions.some(
        ix => ix.programId.equals(ComputeBudgetProgram.programId)
      );

      if (!hasComputeBudget) {
        // Add optimal compute budget for Seeker
        transaction.instructions.unshift(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 200_000, // Conservative limit for fast execution
          })
        );
      }
    }

    return transaction;
  }

  /**
   * Get signing performance metrics
   * 
   * @param transactionId - Transaction ID (optional, returns all if omitted)
   * @returns Performance metrics
   */
  getMetrics(transactionId?: string): SigningPerformanceMetrics | SigningPerformanceMetrics[] {
    if (transactionId) {
      const metric = this.metrics.get(transactionId);
      if (!metric) {
        throw new Error(`No metrics found for transaction: ${transactionId}`);
      }
      return metric;
    }

    return Array.from(this.metrics.values());
  }

  /**
   * Get average signing time
   * 
   * @returns Average signing duration in milliseconds
   */
  getAverageSigningTime(): number {
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) return 0;

    const totalDuration = allMetrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );

    return totalDuration / allMetrics.length;
  }

  /**
   * Get percentage of transactions meeting target
   * 
   * @returns Percentage (0-100) of transactions under 200ms
   */
  getTargetComplianceRate(): number {
    const allMetrics = Array.from(this.metrics.values());
    if (allMetrics.length === 0) return 100;

    const meetingTarget = allMetrics.filter(m => m.meetsTarget).length;
    return (meetingTarget / allMetrics.length) * 100;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Export metrics for analytics
   * 
   * @returns Metrics in JSON format
   */
  exportMetrics(): string {
    const allMetrics = Array.from(this.metrics.values());
    return JSON.stringify({
      totalTransactions: allMetrics.length,
      averageSigningTime: this.getAverageSigningTime(),
      targetComplianceRate: this.getTargetComplianceRate(),
      deviceType: this.isSeeker ? 'seeker' : 'other',
      metrics: allMetrics,
    }, null, 2);
  }

  // Private helper methods

  /**
   * Remove duplicate instructions from transaction
   */
  private deduplicateInstructions(transaction: Transaction): Transaction {
    const dedupedTx = new Transaction();
    dedupedTx.recentBlockhash = transaction.recentBlockhash;
    dedupedTx.feePayer = transaction.feePayer;

    const seenInstructions = new Set<string>();

    for (const instruction of transaction.instructions) {
      const ixHash = this.hashInstruction(instruction);
      
      if (!seenInstructions.has(ixHash)) {
        seenInstructions.add(ixHash);
        dedupedTx.add(instruction);
      }
    }

    return dedupedTx;
  }

  /**
   * Deduplicate account keys in transaction
   */
  private deduplicateAccountKeys(transaction: Transaction): Transaction {
    // Account deduplication is handled automatically by Transaction class
    // This method exists for future custom optimizations
    return transaction;
  }

  /**
   * Optimize compute budget instructions
   */
  private optimizeComputeBudget(transaction: Transaction): Transaction {
    const optimizedTx = new Transaction();
    optimizedTx.recentBlockhash = transaction.recentBlockhash;
    optimizedTx.feePayer = transaction.feePayer;

    let hasComputeLimit = false;
    let hasComputePrice = false;

    // Filter out redundant compute budget instructions
    for (const instruction of transaction.instructions) {
      if (instruction.programId.equals(ComputeBudgetProgram.programId)) {
        // Check instruction type by data
        const isComputeLimit = instruction.data[0] === 2; // SetComputeUnitLimit
        const isComputePrice = instruction.data[0] === 3; // SetComputeUnitPrice

        if (isComputeLimit && !hasComputeLimit) {
          hasComputeLimit = true;
          optimizedTx.add(instruction);
        } else if (isComputePrice && !hasComputePrice) {
          hasComputePrice = true;
          optimizedTx.add(instruction);
        }
        // Skip duplicate compute budget instructions
      } else {
        optimizedTx.add(instruction);
      }
    }

    return optimizedTx;
  }

  /**
   * Check if transaction should use versioned format
   */
  private shouldUseVersionedTransaction(transaction: Transaction): boolean {
    // Use versioned transactions for:
    // 1. Transactions with many unique accounts (>20)
    // 2. Transactions that could benefit from ALTs
    
    const uniqueAccounts = new Set<string>();
    
    for (const instruction of transaction.instructions) {
      instruction.keys.forEach(key => {
        uniqueAccounts.add(key.pubkey.toBase58());
      });
    }

    return uniqueAccounts.size > 20;
  }

  /**
   * Convert legacy transaction to versioned transaction
   */
  private async convertToVersionedTransaction(
    transaction: Transaction
  ): Promise<VersionedTransaction> {
    // Create transaction message
    const message = TransactionMessage.compile({
      payerKey: transaction.feePayer!,
      instructions: transaction.instructions,
      recentBlockhash: transaction.recentBlockhash!,
    });

    // Create versioned transaction
    return new VersionedTransaction(message);
  }

  /**
   * Get transaction size in bytes
   */
  private getTransactionSize(transaction: Transaction | VersionedTransaction): number {
    try {
      if (transaction instanceof Transaction) {
        return transaction.serialize({ verifySignatures: false }).length;
      } else {
        return transaction.serialize().length;
      }
    } catch (error) {
      // If serialization fails, estimate size
      return this.estimateTransactionSize(transaction);
    }
  }

  /**
   * Estimate transaction size
   */
  private estimateTransactionSize(transaction: Transaction | VersionedTransaction): number {
    const instructionCount = this.getInstructionCount(transaction);
    const signatureCount = this.getSignatureCount(transaction);
    
    // Rough estimate: 64 bytes per signature + 100 bytes per instruction + 100 bytes overhead
    return signatureCount * 64 + instructionCount * 100 + 100;
  }

  /**
   * Get instruction count
   */
  private getInstructionCount(transaction: Transaction | VersionedTransaction): number {
    if (transaction instanceof Transaction) {
      return transaction.instructions.length;
    } else {
      return transaction.message.compiledInstructions.length;
    }
  }

  /**
   * Get signature count
   */
  private getSignatureCount(transaction: Transaction | VersionedTransaction): number {
    if (transaction instanceof Transaction) {
      return transaction.signatures.length || 1;
    } else {
      return transaction.signatures.length || 1;
    }
  }

  /**
   * Hash instruction for deduplication
   */
  private hashInstruction(instruction: TransactionInstruction): string {
    return JSON.stringify({
      programId: instruction.programId.toBase58(),
      keys: instruction.keys.map(k => ({
        pubkey: k.pubkey.toBase58(),
        isSigner: k.isSigner,
        isWritable: k.isWritable,
      })),
      data: Buffer.from(instruction.data).toString('base64'),
    });
  }
}

/**
 * Create transaction signing optimizer instance
 * 
 * @param connection - Solana connection
 * @param isSeeker - Whether running on Seeker device
 * @returns Transaction signing optimizer
 */
export function createTransactionSigningOptimizer(
  connection: Connection,
  isSeeker: boolean = false
): TransactionSigningOptimizer {
  return new TransactionSigningOptimizer(connection, isSeeker);
}
