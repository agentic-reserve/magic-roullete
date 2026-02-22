/**
 * MagicBlock Ephemeral Rollups Integration Example
 * 
 * This example demonstrates the complete flow of:
 * 1. Creating a game on Solana base layer
 * 2. Delegating to MagicBlock Ephemeral Rollup
 * 3. Executing game logic on ER (fast, gasless)
 * 4. Finalizing and distributing prizes
 */

import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import {
  DELEGATION_PROGRAM_ID,
  createDelegateInstruction,
  createUndelegateInstruction,
  GetCommitmentSignature,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { MagicRoulette } from "../target/types/magic_roulette";
import IDL from "../target/idl/magic_roulette.json";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Network endpoints
  SOLANA_RPC: "https://api.devnet.solana.com",
  ER_RPC: "https://devnet.magicblock.app", // Or use router: https://devnet-router.magicblock.app
  
  // Program ID (update after deployment)
  PROGRAM_ID: new PublicKey("JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq"),
  
  // Timeouts
  DELEGATION_TIMEOUT: 10000, // 10 seconds
  FINALIZATION_TIMEOUT: 15000, // 15 seconds
};

// ============================================================================
// MAGIC ROULETTE CLIENT
// ============================================================================

export class MagicRouletteClient {
  private baseConnection: Connection;
  private erConnection: Connection;
  private baseProvider: AnchorProvider;
  private erProvider: AnchorProvider;
  private baseProgram: Program<MagicRoulette>;
  private erProgram: Program<MagicRoulette>;
  private wallet: Keypair;

  constructor(wallet: Keypair) {
    this.wallet = wallet;

    // Setup connections
    this.baseConnection = new Connection(CONFIG.SOLANA_RPC, "confirmed");
    this.erConnection = new Connection(CONFIG.ER_RPC, "confirmed");

    // Setup providers
    const walletAdapter = new Wallet(wallet);

    this.baseProvider = new AnchorProvider(this.baseConnection, walletAdapter, {
      commitment: "confirmed",
    });

    this.erProvider = new AnchorProvider(this.erConnection, walletAdapter, {
      commitment: "confirmed",
      skipPreflight: true, // CRITICAL: Always skip preflight for ER
    });

    // Setup programs
    this.baseProgram = new Program(IDL as any, CONFIG.PROGRAM_ID, this.baseProvider);
    this.erProgram = new Program(IDL as any, CONFIG.PROGRAM_ID, this.erProvider);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if account is delegated to ER
   */
  async isDelegated(accountPubkey: PublicKey): Promise<boolean> {
    const accountInfo = await this.baseConnection.getAccountInfo(accountPubkey);
    if (!accountInfo) return false;
    return accountInfo.owner.equals(DELEGATION_PROGRAM_ID);
  }

  /**
   * Wait for delegation to complete
   */
  async waitForDelegation(
    accountPubkey: PublicKey,
    timeout: number = CONFIG.DELEGATION_TIMEOUT
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isDelegated(accountPubkey)) {
        return true;
      }
      await this.sleep(1000);
    }

    return false;
  }

  /**
   * Wait for undelegation to complete
   */
  async waitForUndelegation(
    accountPubkey: PublicKey,
    timeout: number = CONFIG.FINALIZATION_TIMEOUT
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (!(await this.isDelegated(accountPubkey))) {
        return true;
      }
      await this.sleep(1000);
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get platform config PDA
   */
  getPlatformConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      CONFIG.PROGRAM_ID
    );
  }

  /**
   * Get game PDA
   */
  getGamePda(gameId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      CONFIG.PROGRAM_ID
    );
  }

  /**
   * Get game vault PDA
   */
  getGameVaultPda(gamePubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("game_vault"), gamePubkey.toBuffer()],
      CONFIG.PROGRAM_ID
    );
  }

  // ==========================================================================
  // PLATFORM MANAGEMENT
  // ==========================================================================

  /**
   * Initialize platform configuration
   */
  async initializePlatform(
    authority: Keypair,
    treasury: PublicKey,
    platformMint: PublicKey,
    platformFeeBps: number = 500, // 5%
    treasuryFeeBps: number = 1000 // 10%
  ): Promise<string> {
    console.log("🎮 Initializing Magic Roulette platform...");

    const [platformConfig] = this.getPlatformConfigPda();

    const sig = await this.baseProgram.methods
      .initializePlatform(platformFeeBps, treasuryFeeBps)
      .accounts({
        platformConfig,
        authority: authority.publicKey,
        treasury,
        platformMint,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("✅ Platform initialized:", sig);
    return sig;
  }

  // ==========================================================================
  // GAME CREATION & JOINING (BASE LAYER)
  // ==========================================================================

  /**
   * Create a new game on base layer
   */
  async createGame(
    creator: Keypair,
    gameMode: "oneVsOne" | "twoVsTwo",
    entryFee: BN,
    mint: PublicKey
  ): Promise<{ gamePda: PublicKey; signature: string }> {
    console.log(`\n🎲 Creating ${gameMode} game...`);

    const [platformConfig] = this.getPlatformConfigPda();
    const platformConfigData = await this.baseProgram.account.platformConfig.fetch(platformConfig);
    const gameId = platformConfigData.totalGames;

    const [gamePda] = this.getGamePda(gameId);
    const [gameVault] = this.getGameVaultPda(gamePda);

    const creatorTokenAccount = await getAssociatedTokenAddress(
      mint,
      creator.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));

    const sig = await this.baseProgram.methods
      .createGame({ [gameMode]: {} }, entryFee, vrfSeed)
      .accounts({
        game: gamePda,
        platformConfig,
        creator: creator.publicKey,
        mint,
        creatorTokenAccount,
        gameVault,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    console.log("✅ Game created:", sig);
    console.log("   Game PDA:", gamePda.toString());
    console.log("   Game ID:", gameId.toString());

    return { gamePda, signature: sig };
  }

  /**
   * Join an existing game
   */
  async joinGame(
    player: Keypair,
    gamePda: PublicKey,
    mint: PublicKey
  ): Promise<string> {
    console.log("\n👥 Joining game...");

    const [platformConfig] = this.getPlatformConfigPda();
    const [gameVault] = this.getGameVaultPda(gamePda);

    const playerTokenAccount = await getAssociatedTokenAddress(
      mint,
      player.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const sig = await this.baseProgram.methods
      .joinGame()
      .accounts({
        game: gamePda,
        player: player.publicKey,
        platformConfig,
        mint,
        playerTokenAccount,
        gameVault,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([player])
      .rpc();

    console.log("✅ Joined game:", sig);
    return sig;
  }

  // ==========================================================================
  // DELEGATION TO EPHEMERAL ROLLUP
  // ==========================================================================

  /**
   * Delegate game to Ephemeral Rollup
   */
  async delegateGame(gamePda: PublicKey, payer: Keypair): Promise<string> {
    console.log("\n🚀 Delegating game to Ephemeral Rollup...");

    // Check if already delegated
    if (await this.isDelegated(gamePda)) {
      console.log("⚠️  Game already delegated");
      return "";
    }

    // Create delegation instruction
    const delegateIx = createDelegateInstruction({
      payer: payer.publicKey,
      delegatedAccount: gamePda,
      ownerProgram: CONFIG.PROGRAM_ID,
      buffer: Buffer.from([]),
      validUntil: 0, // 0 = no expiry
    });

    // Send transaction
    const tx = new Transaction().add(delegateIx);
    const sig = await this.baseConnection.sendTransaction(tx, [payer]);
    await this.baseConnection.confirmTransaction(sig);

    console.log("✅ Delegation tx sent:", sig);

    // Wait for delegation to complete
    const delegated = await this.waitForDelegation(gamePda);
    if (!delegated) {
      throw new Error("Delegation timeout - game not delegated");
    }

    console.log("✅ Game delegated to ER");
    console.log("   🔒 Game now executing in Intel TDX for privacy");
    console.log("   ⚡ Sub-10ms latency enabled");

    return sig;
  }

  // ==========================================================================
  // GAME EXECUTION (EPHEMERAL ROLLUP)
  // ==========================================================================

  /**
   * Process VRF result (on ER)
   */
  async processVrfResult(
    gamePda: PublicKey,
    vrfAuthority: Keypair,
    randomness: number[]
  ): Promise<string> {
    console.log("\n🎲 Processing VRF randomness...");

    // Verify game is delegated
    if (!(await this.isDelegated(gamePda))) {
      throw new Error("Game not delegated - cannot execute on ER");
    }

    const sig = await this.erProgram.methods
      .processVrfResult(randomness)
      .accounts({
        game: gamePda,
        vrfAuthority: vrfAuthority.publicKey,
      })
      .signers([vrfAuthority])
      .rpc({ skipPreflight: true });

    console.log("✅ VRF processed:", sig);
    return sig;
  }

  /**
   * Player takes a shot (on ER)
   */
  async takeShot(gamePda: PublicKey, player: Keypair): Promise<string> {
    console.log("\n🔫 Taking shot...");

    // Verify game is delegated
    if (!(await this.isDelegated(gamePda))) {
      throw new Error("Game not delegated - cannot execute on ER");
    }

    const sig = await this.erProgram.methods
      .takeShot()
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player])
      .rpc({ skipPreflight: true });

    console.log("✅ Shot taken:", sig);

    // Fetch game state from ER
    const game = await this.erProgram.account.game.fetch(gamePda);
    console.log("   Current chamber:", game.currentChamber);
    console.log("   Shots taken:", game.shotsTaken);

    if (game.status.finished) {
      console.log("🎉 Game finished!");
      console.log("   Winner team:", game.winnerTeam);
    }

    return sig;
  }

  /**
   * Subscribe to game updates on ER
   */
  subscribeToGame(
    gamePda: PublicKey,
    callback: (game: any) => void
  ): number {
    console.log("\n👀 Subscribing to game updates on ER...");

    return this.erConnection.onAccountChange(gamePda, (accountInfo) => {
      try {
        const game = this.erProgram.coder.accounts.decode(
          "Game",
          accountInfo.data
        );
        callback(game);
      } catch (e) {
        console.error("Failed to decode game:", e);
      }
    });
  }

  // ==========================================================================
  // FINALIZATION (COMMIT & UNDELEGATE)
  // ==========================================================================

  /**
   * Finalize game and distribute prizes
   */
  async finalizeGame(
    gamePda: PublicKey,
    payer: Keypair,
    mint: PublicKey,
    winner1: PublicKey,
    winner2?: PublicKey
  ): Promise<string> {
    console.log("\n💰 Finalizing game and distributing prizes...");

    // First, undelegate to commit state back to base layer
    console.log("📤 Committing state from ER to base layer...");

    const undelegateIx = createUndelegateInstruction({
      payer: payer.publicKey,
      delegatedAccount: gamePda,
    });

    const tx = new Transaction().add(undelegateIx);
    const undelegateSig = await this.erConnection.sendTransaction(tx, [payer], {
      skipPreflight: true,
    });

    console.log("✅ Undelegate tx sent:", undelegateSig);

    // Wait for undelegation
    const undelegated = await this.waitForUndelegation(gamePda);
    if (!undelegated) {
      throw new Error("Undelegation timeout - game still delegated");
    }

    console.log("✅ State committed to base layer");

    // Now finalize on base layer
    console.log("💸 Distributing prizes...");

    const [platformConfig] = this.getPlatformConfigPda();
    const [gameVault] = this.getGameVaultPda(gamePda);

    const platformConfigData = await this.baseProgram.account.platformConfig.fetch(platformConfig);

    const platformVault = await getAssociatedTokenAddress(
      mint,
      platformConfigData.authority,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const treasuryVault = await getAssociatedTokenAddress(
      mint,
      platformConfigData.treasury,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const winner1TokenAccount = await getAssociatedTokenAddress(
      mint,
      winner1,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const winner2TokenAccount = winner2
      ? await getAssociatedTokenAddress(mint, winner2, false, TOKEN_2022_PROGRAM_ID)
      : winner1TokenAccount; // Use winner1 as placeholder if no winner2

    const sig = await this.baseProgram.methods
      .finalizeGame()
      .accounts({
        game: gamePda,
        platformConfig,
        payer: payer.publicKey,
        mint,
        gameVault,
        platformVault,
        treasuryVault,
        winner1,
        winner1TokenAccount,
        winner2: winner2 || winner1,
        winner2TokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();

    console.log("✅ Game finalized:", sig);
    console.log("🎉 Prizes distributed!");

    return sig;
  }

  // ==========================================================================
  // AI PRACTICE MODE
  // ==========================================================================

  /**
   * Create AI practice game (FREE - no entry fee)
   */
  async createAiGame(
    player: Keypair,
    difficulty: "easy" | "medium" | "hard"
  ): Promise<{ gamePda: PublicKey; signature: string }> {
    console.log(`\n🤖 Creating AI practice game (${difficulty})...`);

    const [platformConfig] = this.getPlatformConfigPda();
    const platformConfigData = await this.baseProgram.account.platformConfig.fetch(platformConfig);
    const gameId = platformConfigData.totalGames;

    const [gamePda] = this.getGamePda(gameId);

    // AI bot is a dummy keypair
    const aiBot = Keypair.generate();

    const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));

    const sig = await this.baseProgram.methods
      .createAiGame({ [difficulty]: {} }, vrfSeed)
      .accounts({
        game: gamePda,
        platformConfig,
        player: player.publicKey,
        aiBot: aiBot.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player])
      .rpc();

    console.log("✅ AI practice game created:", sig);
    console.log("   🆓 FREE - No entry fee, no prizes");
    console.log("   Game PDA:", gamePda.toString());

    return { gamePda, signature: sig };
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

async function main() {
  console.log("🎮 Magic Roulette - MagicBlock Integration Example");
  console.log("===================================================\n");

  // Setup wallet (in production, use actual wallet)
  const wallet = Keypair.generate();
  console.log("Wallet:", wallet.publicKey.toString());

  // Airdrop SOL for testing
  const client = new MagicRouletteClient(wallet);
  // await client.baseConnection.requestAirdrop(wallet.publicKey, 2 * 1e9);

  // Example: Create and play a 1v1 game
  // const mint = new PublicKey("YourTokenMintAddress");
  // const player2 = Keypair.generate();

  // 1. Create game
  // const { gamePda } = await client.createGame(
  //   wallet,
  //   "oneVsOne",
  //   new BN(100_000_000), // 0.1 tokens
  //   mint
  // );

  // 2. Player 2 joins
  // await client.joinGame(player2, gamePda, mint);

  // 3. Delegate to ER
  // await client.delegateGame(gamePda, wallet);

  // 4. Process VRF
  // const vrfAuthority = Keypair.generate();
  // const randomness = Array.from(crypto.getRandomValues(new Uint8Array(32)));
  // await client.processVrfResult(gamePda, vrfAuthority, randomness);

  // 5. Play game on ER
  // await client.takeShot(gamePda, wallet);
  // await client.takeShot(gamePda, player2);
  // ... continue until game finishes

  // 6. Finalize and distribute prizes
  // await client.finalizeGame(gamePda, wallet, mint, wallet.publicKey, player2.publicKey);

  console.log("\n✅ Example complete!");
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default MagicRouletteClient;
