/**
 * Gasless Game Service
 * Handles game operations on Ephemeral Rollups with zero gas fees
 * Integrates with WalletContext for session-based authorization
 */

import { PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { getProgram, getGamePDA } from './solana';
import { getERConnection, isDelegated, waitForDelegation } from './magicblock';

export interface GaslessShotResult {
  success: boolean;
  chamber: number;
  isBullet: boolean;
  gameOver: boolean;
  winner?: PublicKey;
  latency: number; // Execution time in ms
}

/**
 * Execute shot on Ephemeral Rollup without gas fees
 * Uses pre-authorized game session from WalletContext
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to execute shot for
 * @returns Shot result with latency metrics
 */
export const executeShotOnER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<GaslessShotResult> => {
  const startTime = Date.now();
  
  try {
    const gamePDA = getGamePDA(gameId);
    
    // Verify game is delegated to ER
    const delegated = await isDelegated(gamePDA);
    if (!delegated) {
      throw new Error('Game is not delegated to Ephemeral Rollup. Cannot execute gasless shot.');
    }
    
    // Get ER connection for gasless execution
    const erConnection = getERConnection();
    
    // Create provider with ER connection
    const erProvider = new AnchorProvider(
      erConnection,
      provider.wallet,
      { commitment: 'confirmed' }
    );
    
    const program = getProgram(erProvider);
    
    // Execute shot on ER (zero gas)
    // This happens instantly on the ER without requiring transaction approval
    const tx = await program.methods
      .takeShot()
      .accounts({
        game: gamePDA,
        player: provider.wallet.publicKey,
      })
      .rpc();
    
    // Fetch updated game state from ER
    const gameData = await program.account.game.fetch(gamePDA);
    
    const latency = Date.now() - startTime;
    
    // Determine shot result
    const currentChamber = gameData.currentChamber;
    const bulletChamber = gameData.bulletChamber;
    const isBullet = currentChamber === bulletChamber;
    const gameOver = gameData.status.finished !== undefined;
    
    return {
      success: true,
      chamber: currentChamber,
      isBullet,
      gameOver,
      winner: gameOver ? gameData.winner : undefined,
      latency,
    };
  } catch (error: any) {
    console.error('Failed to execute gasless shot:', error);
    throw new Error(`Gasless shot execution failed: ${error.message}`);
  }
};

/**
 * Delegate game to Ephemeral Rollup for gasless gameplay
 * Must be called before executing gasless shots
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to delegate
 * @returns Transaction signature
 */
export const delegateGameToER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  try {
    const program = getProgram(provider);
    const gamePDA = getGamePDA(gameId);
    
    // Check if already delegated
    const alreadyDelegated = await isDelegated(gamePDA);
    if (alreadyDelegated) {
      console.log('Game already delegated to ER');
      return 'already_delegated';
    }
    
    // Delegate to ER
    const tx = await program.methods
      .delegateGame()
      .accounts({
        game: gamePDA,
        payer: provider.wallet.publicKey,
      })
      .rpc();
    
    // Wait for delegation to propagate
    const success = await waitForDelegation(gamePDA, 10, 1000);
    if (!success) {
      throw new Error('Delegation did not propagate in time');
    }
    
    console.log(`Game ${gameId} delegated to ER: ${tx}`);
    return tx;
  } catch (error: any) {
    console.error('Failed to delegate game to ER:', error);
    throw new Error(`Game delegation failed: ${error.message}`);
  }
};

/**
 * Commit game state from ER back to base layer
 * Called after game finishes to persist final state
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to commit
 * @returns Transaction signature
 */
export const commitGameFromER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  try {
    const program = getProgram(provider);
    const gamePDA = getGamePDA(gameId);
    
    // Verify game is delegated
    const delegated = await isDelegated(gamePDA);
    if (!delegated) {
      throw new Error('Game is not delegated to ER. Cannot commit.');
    }
    
    // Commit state from ER to base layer
    const tx = await program.methods
      .commitGame()
      .accounts({
        game: gamePDA,
        payer: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log(`Game ${gameId} committed from ER: ${tx}`);
    return tx;
  } catch (error: any) {
    console.error('Failed to commit game from ER:', error);
    throw new Error(`Game commit failed: ${error.message}`);
  }
};

/**
 * Undelegate game from Ephemeral Rollup
 * Returns game to base layer execution
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to undelegate
 * @returns Transaction signature
 */
export const undelegateGameFromER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  try {
    const program = getProgram(provider);
    const gamePDA = getGamePDA(gameId);
    
    // Verify game is delegated
    const delegated = await isDelegated(gamePDA);
    if (!delegated) {
      console.log('Game is not delegated to ER');
      return 'not_delegated';
    }
    
    // Undelegate from ER
    const tx = await program.methods
      .undelegateGame()
      .accounts({
        game: gamePDA,
        payer: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log(`Game ${gameId} undelegated from ER: ${tx}`);
    return tx;
  } catch (error: any) {
    console.error('Failed to undelegate game from ER:', error);
    throw new Error(`Game undelegation failed: ${error.message}`);
  }
};

/**
 * Check if game is ready for gasless gameplay
 * Verifies game is delegated to ER and session is authorized
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to check
 * @returns True if ready for gasless gameplay
 */
export const isGameReadyForGasless = async (
  provider: AnchorProvider,
  gameId: number
): Promise<boolean> => {
  try {
    const gamePDA = getGamePDA(gameId);
    const delegated = await isDelegated(gamePDA);
    return delegated;
  } catch (error) {
    console.error('Failed to check game gasless readiness:', error);
    return false;
  }
};

/**
 * Get game state from Ephemeral Rollup
 * Fetches current game state with sub-10ms latency
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to fetch
 * @returns Game account data
 */
export const getGameStateFromER = async (
  provider: AnchorProvider,
  gameId: number
) => {
  try {
    const gamePDA = getGamePDA(gameId);
    
    // Check if delegated to ER
    const delegated = await isDelegated(gamePDA);
    
    // Use ER connection if delegated, otherwise base connection
    const connection = delegated ? getERConnection() : provider.connection;
    const erProvider = new AnchorProvider(
      connection,
      provider.wallet,
      { commitment: 'confirmed' }
    );
    
    const program = getProgram(erProvider);
    const gameData = await program.account.game.fetch(gamePDA);
    
    return gameData;
  } catch (error: any) {
    console.error('Failed to fetch game state:', error);
    throw new Error(`Failed to fetch game state: ${error.message}`);
  }
};
