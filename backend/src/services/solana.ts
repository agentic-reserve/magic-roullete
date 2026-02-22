/**
 * Solana Service
 * 
 * Handles all Solana blockchain interactions
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Helius } from 'helius-sdk';
import * as fs from 'fs';
import * as path from 'path';

export class SolanaService {
  private static instance: SolanaService;
  private connection: Connection;
  private helius: Helius;
  private program: Program | null = null;
  private programId: PublicKey;

  private constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (heliusApiKey) {
      this.helius = new Helius(heliusApiKey);
    }
    
    this.programId = new PublicKey(
      process.env.PROGRAM_ID || 'JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq'
    );
  }

  public static getInstance(): SolanaService {
    if (!SolanaService.instance) {
      SolanaService.instance = new SolanaService();
    }
    return SolanaService.instance;
  }

  public async initialize() {
    try {
      // Load IDL
      const idlPath = path.join(__dirname, '../../../target/idl/magic_roulette.json');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
      
      // Create dummy wallet for read-only operations
      const dummyWallet = Wallet.local();
      const provider = new AnchorProvider(this.connection, dummyWallet, {
        commitment: 'confirmed',
      });
      
      this.program = new Program(idl, this.programId, provider);
      
      console.log('✅ Solana program initialized:', this.programId.toBase58());
    } catch (error) {
      console.error('❌ Failed to initialize Solana program:', error);
      throw error;
    }
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public getProgram(): Program {
    if (!this.program) {
      throw new Error('Program not initialized');
    }
    return this.program;
  }

  public getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get account balance
   */
  public async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  public async getTransaction(signature: string) {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      return tx;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Confirm transaction
   */
  public async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const result = await this.connection.confirmTransaction(signature, 'confirmed');
      return !result.value.err;
    } catch (error) {
      console.error('Error confirming transaction:', error);
      return false;
    }
  }

  /**
   * Get game account
   */
  public async getGameAccount(gameId: number) {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('game'), Buffer.from(gameId.toString())],
        this.programId
      );

      const gameAccount = await this.program.account.game.fetch(gamePda);
      return gameAccount;
    } catch (error) {
      console.error('Error fetching game account:', error);
      throw error;
    }
  }

  /**
   * Get all active games
   */
  public async getActiveGames() {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const games = await this.program.account.game.all([
        {
          memcmp: {
            offset: 8 + 8 + 32 + 1 + 1 + 8 + 8, // Offset to status field
            bytes: '1', // IN_PROGRESS status
          },
        },
      ]);

      return games.map(g => ({
        address: g.publicKey.toBase58(),
        ...g.account,
      }));
    } catch (error) {
      console.error('Error fetching active games:', error);
      throw error;
    }
  }

  /**
   * Subscribe to account changes
   */
  public subscribeToAccount(
    address: PublicKey,
    callback: (accountInfo: any) => void
  ): number {
    return this.connection.onAccountChange(
      address,
      callback,
      'confirmed'
    );
  }

  /**
   * Unsubscribe from account changes
   */
  public unsubscribeFromAccount(subscriptionId: number) {
    this.connection.removeAccountChangeListener(subscriptionId);
  }

  /**
   * Get recent transactions for address
   */
  public async getRecentTransactions(address: string, limit: number = 10) {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(sig => this.getTransaction(sig.signature))
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Parse transaction logs
   */
  public parseTransactionLogs(logs: string[]): any {
    // Parse program logs to extract game events
    const events: any[] = [];

    for (const log of logs) {
      if (log.includes('Program log:')) {
        const logData = log.split('Program log: ')[1];
        try {
          const event = JSON.parse(logData);
          events.push(event);
        } catch {
          // Not JSON, skip
        }
      }
    }

    return events;
  }

  /**
   * Get Helius enhanced transaction
   */
  public async getEnhancedTransaction(signature: string) {
    if (!this.helius) {
      throw new Error('Helius not initialized');
    }

    try {
      const tx = await this.helius.rpc.getTransaction(signature);
      return tx;
    } catch (error) {
      console.error('Error fetching enhanced transaction:', error);
      throw error;
    }
  }
}
