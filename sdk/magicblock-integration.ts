/**
 * MagicBlock Ephemeral Rollup & VRF Integration SDK
 * 
 * This SDK provides utilities for integrating Magic Roulette with MagicBlock's
 * Private Ephemeral Rollups and VRF services.
 */

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";

export interface MagicBlockConfig {
  vrfProgramId: PublicKey;
  erProgramId: PublicKey;
  enabled: boolean;
}

export interface VrfRequest {
  gameId: BN;
  vrfSeed: number[];
  status: "Pending" | "Fulfilled" | "Failed";
  randomness?: number[];
  requestedAt: BN;
  fulfilledAt?: BN;
}

export interface ErDelegation {
  gameId: BN;
  status: "Pending" | "Active" | "Committed" | "Finalized" | "Failed";
  erInstanceId?: number[];
  stateCommitment?: number[];
  delegatedAt: BN;
  completedAt?: BN;
}

export class MagicBlockIntegration {
  private program: Program<MagicRoulette>;
  private connection: Connection;
  private magicBlockConfigPda: PublicKey;

  constructor(program: Program<MagicRoulette>) {
    this.program = program;
    this.connection = program.provider.connection;
    
    // Derive MagicBlock config PDA
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("magicblock_config")],
      program.programId
    );
    this.magicBlockConfigPda = pda;
  }

  /**
   * Initialize MagicBlock configuration
   */
  async initializeMagicBlock(
    authority: Keypair,
    vrfProgramId: PublicKey,
    erProgramId: PublicKey
  ): Promise<string> {
    const tx = await this.program.methods
      .initializeMagicblock(vrfProgramId, erProgramId)
      .accounts({
        magicblockConfig: this.magicBlockConfigPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("✅ MagicBlock initialized:", tx);
    return tx;
  }

  /**
   * Request VRF randomness for a game
   */
  async requestVrf(
    gameId: BN,
    payer: Keypair
  ): Promise<{ tx: string; vrfRequestPda: PublicKey }> {
    // Derive game PDA
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    // Derive VRF request PDA
    const [vrfRequestPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vrf_request"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const tx = await this.program.methods
      .requestVrf()
      .accounts({
        vrfRequest: vrfRequestPda,
        game: gamePda,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    console.log("🎲 VRF request created:", tx);
    return { tx, vrfRequestPda };
  }

  /**
   * Fulfill VRF request with randomness (called by MagicBlock VRF)
   */
  async fulfillVrf(
    gameId: BN,
    randomness: number[],
    vrfProgram: Keypair
  ): Promise<string> {
    // Derive PDAs
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const [vrfRequestPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vrf_request"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const randomnessArray = new Uint8Array(randomness);

    const tx = await this.program.methods
      .fulfillVrf(Array.from(randomnessArray))
      .accounts({
        vrfRequest: vrfRequestPda,
        game: gamePda,
        vrfProgram: vrfProgram.publicKey,
      })
      .signers([vrfProgram])
      .rpc();

    console.log("✅ VRF fulfilled:", tx);
    return tx;
  }

  /**
   * Delegate game to Ephemeral Rollup
   */
  async delegateToEr(
    gameId: BN,
    payer: Keypair
  ): Promise<{ tx: string; erDelegationPda: PublicKey }> {
    // Derive PDAs
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const [erDelegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("er_delegation"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const tx = await this.program.methods
      .delegateToEr()
      .accounts({
        erDelegation: erDelegationPda,
        game: gamePda,
        magicblockConfig: this.magicBlockConfigPda,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    console.log("🚀 Game delegated to ER:", tx);
    return { tx, erDelegationPda };
  }

  /**
   * Commit state from Ephemeral Rollup
   */
  async commitErState(
    gameId: BN,
    stateCommitment: number[],
    erProgram: Keypair
  ): Promise<string> {
    // Derive PDAs
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const [erDelegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("er_delegation"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const commitmentArray = new Uint8Array(stateCommitment);

    const tx = await this.program.methods
      .commitErState(Array.from(commitmentArray))
      .accounts({
        erDelegation: erDelegationPda,
        game: gamePda,
        erProgram: erProgram.publicKey,
      })
      .signers([erProgram])
      .rpc();

    console.log("✅ ER state committed:", tx);
    return tx;
  }

  /**
   * Undelegate from Ephemeral Rollup (finalize)
   */
  async undelegateFromEr(
    gameId: BN,
    erProgram: Keypair
  ): Promise<string> {
    // Derive PDAs
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const [erDelegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("er_delegation"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    const tx = await this.program.methods
      .undelegateFromEr()
      .accounts({
        erDelegation: erDelegationPda,
        game: gamePda,
        erProgram: erProgram.publicKey,
      })
      .signers([erProgram])
      .rpc();

    console.log("✅ Game undelegated from ER:", tx);
    return tx;
  }

  /**
   * Get VRF request details
   */
  async getVrfRequest(gameId: BN): Promise<VrfRequest | null> {
    const [vrfRequestPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vrf_request"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    try {
      const vrfRequest = await this.program.account.vrfRequest.fetch(
        vrfRequestPda
      );
      return vrfRequest as any;
    } catch (error) {
      console.error("Failed to fetch VRF request:", error);
      return null;
    }
  }

  /**
   * Get ER delegation details
   */
  async getErDelegation(gameId: BN): Promise<ErDelegation | null> {
    const [erDelegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("er_delegation"), gameId.toBuffer("le", 8)],
      this.program.programId
    );

    try {
      const erDelegation = await this.program.account.erDelegation.fetch(
        erDelegationPda
      );
      return erDelegation as any;
    } catch (error) {
      console.error("Failed to fetch ER delegation:", error);
      return null;
    }
  }

  /**
   * Get MagicBlock configuration
   */
  async getMagicBlockConfig(): Promise<MagicBlockConfig | null> {
    try {
      const config = await this.program.account.magicblockConfig.fetch(
        this.magicBlockConfigPda
      );
      return config as any;
    } catch (error) {
      console.error("Failed to fetch MagicBlock config:", error);
      return null;
    }
  }

  /**
   * Complete game flow with MagicBlock integration
   */
  async completeGameFlow(
    gameId: BN,
    payer: Keypair,
    vrfProgram: Keypair,
    erProgram: Keypair
  ): Promise<void> {
    console.log("\n🎮 Starting complete game flow with MagicBlock...\n");

    // 1. Request VRF
    console.log("1️⃣ Requesting VRF randomness...");
    const { vrfRequestPda } = await this.requestVrf(gameId, payer);
    await this.sleep(2000);

    // 2. Fulfill VRF (simulated)
    console.log("2️⃣ Fulfilling VRF with randomness...");
    const randomness = this.generateRandomness();
    await this.fulfillVrf(gameId, randomness, vrfProgram);
    await this.sleep(2000);

    // 3. Delegate to ER
    console.log("3️⃣ Delegating game to Ephemeral Rollup...");
    const { erDelegationPda } = await this.delegateToEr(gameId, payer);
    await this.sleep(2000);

    // 4. Commit state from ER
    console.log("4️⃣ Committing state from ER...");
    const stateCommitment = this.generateStateCommitment();
    await this.commitErState(gameId, stateCommitment, erProgram);
    await this.sleep(2000);

    // 5. Undelegate from ER
    console.log("5️⃣ Undelegating from ER (finalizing)...");
    await this.undelegateFromEr(gameId, erProgram);

    console.log("\n✅ Game flow completed successfully!\n");
  }

  /**
   * Generate random 32-byte array for testing
   */
  private generateRandomness(): number[] {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  }

  /**
   * Generate state commitment hash for testing
   */
  private generateStateCommitment(): number[] {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Helper function to create MagicBlock integration instance
 */
export function createMagicBlockIntegration(
  program: Program<MagicRoulette>
): MagicBlockIntegration {
  return new MagicBlockIntegration(program);
}
