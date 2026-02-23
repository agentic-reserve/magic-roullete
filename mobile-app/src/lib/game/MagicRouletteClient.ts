/**
 * Magic Roulette Game Client
 * Handles game creation, joining, and gameplay
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';

export interface GameMode {
  oneVsOne?: {};
  twoVsTwo?: {};
}

export interface AIDifficulty {
  easy?: {};
  medium?: {};
  hard?: {};
}

export class MagicRouletteClient {
  private connection: Connection;
  private programId: PublicKey;

  constructor(
    connection: Connection,
    programId: string = 'HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam'
  ) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
  }

  /**
   * Derive Platform Config PDA
   */
  getPlatformConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      this.programId
    );
  }

  /**
   * Derive Game PDA
   */
  getGamePDA(gameId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('game'), gameId.toArrayLike(Buffer, 'le', 8)],
      this.programId
    );
  }

  /**
   * Create a 1v1 SOL-based game
   */
  async createGame1v1(
    creator: PublicKey,
    entryFee: number // in SOL
  ): Promise<{ gameId: BN; gamePda: PublicKey; transaction: Transaction }> {
    const gameId = new BN(Date.now());
    const [gamePda] = this.getGamePDA(gameId);
    const [platformConfig] = this.getPlatformConfigPDA();

    const gameMode: GameMode = { oneVsOne: {} };
    const entryFeeLamports = new BN(entryFee * LAMPORTS_PER_SOL);
    const vrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));

    // Build transaction (simplified - in production use Anchor)
    const transaction = new Transaction();
    
    // Note: This is a placeholder. In production, you would use Anchor
    // to properly construct the instruction with the program IDL
    
    return {
      gameId,
      gamePda,
      transaction,
    };
  }

  /**
   * Create an AI practice game (FREE)
   */
  async createAIGame(
    player: PublicKey,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<{ gameId: BN; gamePda: PublicKey; transaction: Transaction }> {
    const gameId = new BN(Date.now());
    const [gamePda] = this.getGamePDA(gameId);
    const [platformConfig] = this.getPlatformConfigPDA();

    const aiDifficulty: AIDifficulty = { [difficulty]: {} };
    const vrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));

    const transaction = new Transaction();
    
    return {
      gameId,
      gamePda,
      transaction,
    };
  }

  /**
   * Join an existing game
   */
  async joinGame(
    gamePda: PublicKey,
    player: PublicKey,
    entryFee: number
  ): Promise<Transaction> {
    const transaction = new Transaction();
    
    // Add join game instruction
    // In production, use Anchor to construct this properly
    
    return transaction;
  }

  /**
   * Get game state
   */
  async getGameState(gamePda: PublicKey): Promise<any> {
    try {
      const accountInfo = await this.connection.getAccountInfo(gamePda);
      
      if (!accountInfo) {
        throw new Error('Game not found');
      }

      // Deserialize game state
      // In production, use Anchor to deserialize properly
      
      return {
        exists: true,
        data: accountInfo.data,
      };
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }

  /**
   * Get platform config
   */
  async getPlatformConfig(): Promise<any> {
    const [platformConfigPda] = this.getPlatformConfigPDA();
    
    try {
      const accountInfo = await this.connection.getAccountInfo(platformConfigPda);
      
      if (!accountInfo) {
        return null;
      }

      return {
        exists: true,
        data: accountInfo.data,
      };
    } catch (error) {
      console.error('Failed to get platform config:', error);
      return null;
    }
  }
}

/**
 * Hook for using Magic Roulette client
 */
export function useMagicRouletteClient(rpcUrl: string = 'http://localhost:8899') {
  const connection = new Connection(rpcUrl, 'confirmed');
  const client = new MagicRouletteClient(connection);

  return {
    client,
    connection,
  };
}
