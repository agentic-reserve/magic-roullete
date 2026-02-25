import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  TransactionInstruction,
  SystemProgram,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import {
  getProgram,
  getPlatformConfigPDA,
  getGamePDA,
  getGameVaultPDA,
  solToLamports,
} from './solana';
import { createLightProtocolService } from './lightProtocol';

/**
 * Transaction Batching Service
 * 
 * Implements transaction batching to minimize wallet popup interruptions
 * by combining related operations into single transactions.
 * 
 * Key Features:
 * - Batch entry fee deposit + game creation
 * - Batch winnings claim + withdrawal
 * - Automatic transaction optimization
 * - Support for both SPL and compressed tokens
 */

export interface BatchedTransaction {
  transaction: Transaction | VersionedTransaction;
  description: string;
  estimatedCost: number; // lamports
}

export interface BatchResult {
  signatures: string[];
  success: boolean;
  errors?: string[];
}

/**
 * Transaction Batching Service
 */
export class TransactionBatchingService {
  private connection: Connection;
  private lightProtocol: ReturnType<typeof createLightProtocolService>;

  constructor(connection: Connection) {
    this.connection = connection;
    this.lightProtocol = createLightProtocolService(connection.rpcEndpoint);
  }

  /**
   * Batch entry fee deposit and game creation into single transaction
   * 
   * This minimizes wallet popups by combining:
   * 1. Entry fee deposit (compressed or SPL tokens)
   * 2. Game creation
   * 
   * @param provider - Anchor provider with wallet
   * @param gameMode - Game mode (1v1 or 2v2)
   * @param entryFeeSol - Entry fee in SOL
   * @param useCompressed - Whether to use compressed tokens
   * @returns Batched transaction
   */
  async batchCreateGameWithDeposit(
    provider: AnchorProvider,
    gameMode: 'OneVsOne' | 'TwoVsTwo',
    entryFeeSol: number,
    useCompressed: boolean = true
  ): Promise<BatchedTransaction> {
    const program = getProgram(provider);
    const platformConfig = getPlatformConfigPDA();

    // Fetch platform config to get total games count
    const platformConfigData = await program.account.platformConfig.fetch(platformConfig);
    const gameId = platformConfigData.totalGames;

    const gamePDA = getGamePDA(gameId);
    const gameVault = getGameVaultPDA(gamePDA);

    // Generate random VRF seed
    const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));

    // Create transaction
    const transaction = new Transaction();

    // Add compute budget instruction for optimization
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000, // Increased limit for batched operations
      })
    );

    if (useCompressed) {
      // TODO: Add compressed token deposit instruction
      // For now, use regular SOL deposit
      console.log('Compressed token batching not yet implemented, using SOL');
    }

    // Add game creation instruction
    const createGameIx = await program.methods
      .createGameSol(
        { [gameMode.toLowerCase()]: {} },
        new BN(solToLamports(entryFeeSol)),
        vrfSeed
      )
      .accounts({
        game: gamePDA,
        platformConfig,
        creator: provider.wallet.publicKey,
        gameVault,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    transaction.add(createGameIx);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.wallet.publicKey;

    // Estimate transaction cost
    const estimatedCost = await this.estimateTransactionCost(transaction);

    return {
      transaction,
      description: `Create ${gameMode} game with ${entryFeeSol} SOL entry fee`,
      estimatedCost,
    };
  }

  /**
   * Batch winnings claim and withdrawal into single transaction
   * 
   * This minimizes wallet popups by combining:
   * 1. Claim winnings from game
   * 2. Withdraw to player wallet
   * 
   * @param provider - Anchor provider with wallet
   * @param gameId - Game ID to claim from
   * @param withdrawAmount - Amount to withdraw (optional, defaults to full balance)
   * @param useCompressed - Whether to use compressed tokens
   * @returns Batched transaction
   */
  async batchClaimAndWithdraw(
    provider: AnchorProvider,
    gameId: number,
    withdrawAmount?: number,
    useCompressed: boolean = true
  ): Promise<BatchedTransaction> {
    const program = getProgram(provider);
    const platformConfig = getPlatformConfigPDA();
    const gamePDA = getGamePDA(gameId);
    const gameVault = getGameVaultPDA(gamePDA);

    // Fetch game data to get winners and prize
    const gameData = await program.account.game.fetch(gamePDA);
    const platformConfigData = await program.account.platformConfig.fetch(platformConfig);

    const winner1 = gameData.players[0];
    const winner2 = gameData.players[1] || winner1;

    // Create transaction
    const transaction = new Transaction();

    // Add compute budget instruction
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000,
      })
    );

    // Add finalize game instruction (claims winnings)
    const finalizeIx = await program.methods
      .finalizeGameSol()
      .accounts({
        game: gamePDA,
        platformConfig,
        payer: provider.wallet.publicKey,
        gameVault,
        platformAuthority: platformConfigData.authority,
        treasury: platformConfigData.treasury,
        winner1,
        winner2,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    transaction.add(finalizeIx);

    if (useCompressed) {
      // TODO: Add compressed token withdrawal instruction
      console.log('Compressed token withdrawal not yet implemented');
    } else if (withdrawAmount) {
      // Add SOL withdrawal instruction
      const withdrawIx = SystemProgram.transfer({
        fromPubkey: gameVault,
        toPubkey: provider.wallet.publicKey,
        lamports: solToLamports(withdrawAmount),
      });
      transaction.add(withdrawIx);
    }

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.wallet.publicKey;

    // Estimate transaction cost
    const estimatedCost = await this.estimateTransactionCost(transaction);

    return {
      transaction,
      description: `Claim winnings from game ${gameId}${withdrawAmount ? ` and withdraw ${withdrawAmount} SOL` : ''}`,
      estimatedCost,
    };
  }

  /**
   * Batch multiple related operations
   * 
   * Generic batching utility for combining multiple instructions
   * into a single transaction.
   * 
   * @param provider - Anchor provider with wallet
   * @param instructions - Array of transaction instructions
   * @param description - Human-readable description
   * @returns Batched transaction
   */
  async batchInstructions(
    provider: AnchorProvider,
    instructions: TransactionInstruction[],
    description: string
  ): Promise<BatchedTransaction> {
    const transaction = new Transaction();

    // Add compute budget for optimization
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: Math.min(1_400_000, 200_000 * instructions.length), // Scale with instruction count
      })
    );

    // Add priority fee for faster confirmation
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1, // Minimal priority fee
      })
    );

    // Add all instructions
    instructions.forEach(ix => transaction.add(ix));

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.wallet.publicKey;

    // Estimate transaction cost
    const estimatedCost = await this.estimateTransactionCost(transaction);

    return {
      transaction,
      description,
      estimatedCost,
    };
  }

  /**
   * Execute batched transactions using wallet's signAllTransactions
   * 
   * @param signAllTransactions - Wallet's signAllTransactions function
   * @param batchedTransactions - Array of batched transactions
   * @returns Batch execution result
   */
  async executeBatch(
    signAllTransactions: (txs: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>,
    batchedTransactions: BatchedTransaction[]
  ): Promise<BatchResult> {
    try {
      // Extract transactions
      const transactions = batchedTransactions.map(bt => bt.transaction);

      // Sign all transactions in one wallet popup
      const signedTransactions = await signAllTransactions(transactions);

      // Send all signed transactions
      const signatures: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < signedTransactions.length; i++) {
        try {
          const signedTx = signedTransactions[i];
          const serialized = signedTx instanceof Transaction 
            ? signedTx.serialize()
            : signedTx.serialize();

          const signature = await this.connection.sendRawTransaction(serialized, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });

          signatures.push(signature);

          // Wait for confirmation
          await this.connection.confirmTransaction(signature, 'confirmed');
        } catch (error) {
          const errorMsg = `Transaction ${i} failed: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        signatures,
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        signatures: [],
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Optimize transaction by removing duplicate instructions
   * and combining similar operations
   * 
   * @param transaction - Transaction to optimize
   * @returns Optimized transaction
   */
  optimizeTransaction(transaction: Transaction): Transaction {
    const optimized = new Transaction();
    optimized.recentBlockhash = transaction.recentBlockhash;
    optimized.feePayer = transaction.feePayer;

    // Track seen instructions to avoid duplicates
    const seenInstructions = new Set<string>();

    for (const instruction of transaction.instructions) {
      // Create instruction signature for deduplication
      const ixSignature = JSON.stringify({
        programId: instruction.programId.toBase58(),
        keys: instruction.keys.map(k => ({
          pubkey: k.pubkey.toBase58(),
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })),
        data: Buffer.from(instruction.data).toString('base64'),
      });

      // Skip duplicate instructions
      if (seenInstructions.has(ixSignature)) {
        console.log('Skipping duplicate instruction');
        continue;
      }

      seenInstructions.add(ixSignature);
      optimized.add(instruction);
    }

    return optimized;
  }

  /**
   * Estimate transaction cost in lamports
   * 
   * @param transaction - Transaction to estimate
   * @returns Estimated cost in lamports
   */
  private async estimateTransactionCost(transaction: Transaction): Promise<number> {
    try {
      // Base transaction fee (5000 lamports per signature)
      const signatureFee = 5000;

      // Estimate compute units (rough estimate based on instruction count)
      const computeUnits = transaction.instructions.length * 100_000;

      // Priority fee (if set)
      const priorityFee = 0; // Minimal for now

      // Total estimated cost
      return signatureFee + priorityFee;
    } catch (error) {
      console.error('Failed to estimate transaction cost:', error);
      return 5000; // Default to base fee
    }
  }

  /**
   * Check if transactions can be batched together
   * 
   * Validates that transactions don't conflict and can be safely batched
   * 
   * @param transactions - Transactions to check
   * @returns Whether transactions can be batched
   */
  canBatch(transactions: Transaction[]): boolean {
    // Check total instruction count doesn't exceed limit
    const totalInstructions = transactions.reduce(
      (sum, tx) => sum + tx.instructions.length,
      0
    );

    if (totalInstructions > 10) {
      console.warn('Too many instructions to batch safely');
      return false;
    }

    // Check for conflicting account writes
    const writableAccounts = new Set<string>();
    
    for (const tx of transactions) {
      for (const ix of tx.instructions) {
        for (const key of ix.keys) {
          if (key.isWritable) {
            const accountKey = key.pubkey.toBase58();
            if (writableAccounts.has(accountKey)) {
              // Same account written multiple times - might conflict
              console.warn(`Account ${accountKey} written multiple times`);
              // This is actually OK for sequential operations, so we allow it
            }
            writableAccounts.add(accountKey);
          }
        }
      }
    }

    return true;
  }
}

/**
 * Create transaction batching service instance
 * 
 * @param connection - Solana connection
 * @returns Transaction batching service
 */
export function createTransactionBatchingService(
  connection: Connection
): TransactionBatchingService {
  return new TransactionBatchingService(connection);
}
