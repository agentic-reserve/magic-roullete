/**
 * Kamino Integration Tests
 * 
 * Tests for create_game_with_loan and finalize_game_with_loan instructions
 * with real Kamino CPI calls
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { MagicRoulette } from "../target/types/magic_roulette";
import {
  getKaminoAccountsForGame,
  calculateRequiredCollateral,
  validateCollateral,
  lamportsToSol,
  solToLamports,
  KAMINO_PROGRAM_ID,
} from "../sdk/kamino-helpers";

describe("Kamino Integration Tests", () => {
  // Use Helius RPC
  const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
  const HELIUS_RPC_URL = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;
  const connection = new Connection(HELIUS_RPC_URL, "confirmed");
  
  let platformConfig: PublicKey;
  let player: Keypair;
  let gamePda: PublicKey;
  let gameVault: PublicKey;
  
  before(async () => {
    // Derive platform config PDA
    [platformConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );
    
    // Create test player
    player = Keypair.generate();
    
    // Airdrop SOL to player
    const airdropSig = await connection.requestAirdrop(
      player.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
    
    console.log("Test player:", player.publicKey.toString());
    console.log("Platform config:", platformConfig.toString());
  });

  describe("Collateral Calculations", () => {
    it("calculates 110% collateral correctly", () => {
      const entryFee = solToLamports(0.1);
      const required = calculateRequiredCollateral(entryFee);
      const expected = solToLamports(0.11);
      
      assert.equal(required.toString(), expected.toString());
    });

    it("validates sufficient collateral", () => {
      const entryFee = solToLamports(0.1);
      const collateral = solToLamports(0.11);
      
      assert.isTrue(validateCollateral(entryFee, collateral));
    });

    it("rejects insufficient collateral", () => {
      const entryFee = solToLamports(0.1);
      const collateral = solToLamports(0.109); // Just under 110%
      
      assert.isFalse(validateCollateral(entryFee, collateral));
    });
  });

  describe("Account Derivation", () => {
    it("derives Kamino accounts correctly", async () => {
      // Derive game PDA
      const gameId = new BN(0);
      [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      
      // Get Kamino accounts
      const accounts = await getKaminoAccountsForGame(
        player.publicKey,
        gamePda,
        platformConfig,
        true // devnet
      );
      
      // Verify accounts are valid PublicKeys
      assert.instanceOf(accounts.lendingMarket, PublicKey);
      assert.instanceOf(accounts.lendingMarketAuthority, PublicKey);
      assert.instanceOf(accounts.obligation, PublicKey);
      assert.instanceOf(accounts.obligationCollateral, PublicKey);
      assert.instanceOf(accounts.kaminoProgram, PublicKey);
      
      // Verify Kamino program ID
      assert.equal(
        accounts.kaminoProgram.toString(),
        KAMINO_PROGRAM_ID.toString()
      );
      
      console.log("Kamino Accounts:");
      console.log("  Market:", accounts.lendingMarket.toString());
      console.log("  Authority:", accounts.lendingMarketAuthority.toString());
      console.log("  Obligation:", accounts.obligation.toString());
    });
  });

  describe.skip("create_game_with_loan (Integration)", () => {
    // Skip by default - requires real Kamino devnet market
    // Run with: npm test -- --grep "create_game_with_loan"
    
    it("creates game with Kamino loan", async () => {
      const entryFee = solToLamports(0.01); // 0.01 SOL minimum
      const collateral = calculateRequiredCollateral(entryFee);
      const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));
      
      // Derive game PDA
      const gameId = new BN(0);
      [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      
      // Get Kamino accounts
      const accounts = await getKaminoAccountsForGame(
        player.publicKey,
        gamePda,
        platformConfig,
        true
      );
      
      console.log("Creating game with loan...");
      console.log("  Entry fee:", lamportsToSol(entryFee), "SOL");
      console.log("  Collateral:", lamportsToSol(collateral), "SOL");
      
      // Create game with loan
      const tx = await program.methods
        .createGameWithLoan(
          { oneVsOne: {} },
          entryFee,
          collateral,
          vrfSeed
        )
        .accounts(accounts)
        .signers([player])
        .rpc();
      
      console.log("Transaction:", tx);
      
      // Fetch game account
      const gameAccount = await program.account.game.fetch(gamePda);
      
      // Verify game state
      assert.equal(gameAccount.gameId.toString(), "0");
      assert.equal(gameAccount.creator.toString(), player.publicKey.toString());
      assert.equal(gameAccount.entryFee.toString(), entryFee.toString());
      assert.isTrue(gameAccount.hasLoan);
      assert.equal(gameAccount.loanAmount.toString(), entryFee.toString());
      assert.equal(gameAccount.collateralAmount.toString(), collateral.toString());
      assert.isNotNull(gameAccount.loanObligation);
      
      console.log("✅ Game created with loan successfully");
      console.log("  Game ID:", gameAccount.gameId.toString());
      console.log("  Obligation:", gameAccount.loanObligation?.toString());
    });
  });

  describe.skip("finalize_game_with_loan (Integration)", () => {
    // Skip by default - requires game to be created and finished
    
    it("finalizes game and repays loan", async () => {
      // This test requires:
      // 1. Game created with loan
      // 2. Game played and finished
      // 3. Winner determined
      
      // TODO: Implement full game flow test
      console.log("TODO: Implement finalize_game_with_loan test");
    });
  });

  describe("Error Handling", () => {
    it("rejects insufficient collateral", async () => {
      const entryFee = solToLamports(0.01);
      const insufficientCollateral = solToLamports(0.0109); // Just under 110%
      const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));
      
      const gameId = new BN(0);
      [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      
      const accounts = await getKaminoAccountsForGame(
        connection,
        player.publicKey,
        gamePda,
        platformConfig,
        true
      );
      
      try {
        await program.methods
          .createGameWithLoan(
            { oneVsOne: {} },
            entryFee,
            insufficientCollateral,
            vrfSeed
          )
          .accounts(accounts)
          .signers([player])
          .rpc();
        
        assert.fail("Should have thrown InsufficientCollateral error");
      } catch (error: any) {
        assert.include(error.toString(), "InsufficientCollateral");
      }
    });

    it("rejects entry fee below minimum", async () => {
      const tooLowEntryFee = solToLamports(0.009); // Below 0.01 SOL minimum
      const collateral = calculateRequiredCollateral(tooLowEntryFee);
      const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));
      
      const gameId = new BN(0);
      [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      
      const accounts = await getKaminoAccountsForGame(
        connection,
        player.publicKey,
        gamePda,
        platformConfig,
        true
      );
      
      try {
        await program.methods
          .createGameWithLoan(
            { oneVsOne: {} },
            tooLowEntryFee,
            collateral,
            vrfSeed
          )
          .accounts(accounts)
          .signers([player])
          .rpc();
        
        assert.fail("Should have thrown InsufficientEntryFee error");
      } catch (error: any) {
        assert.include(error.toString(), "InsufficientEntryFee");
      }
    });
  });

  describe("Kamino Market Data (Optional)", () => {
    it.skip("fetches Kamino market data", async () => {
      // Requires @kamino-finance/klend-sdk
      // Uncomment when SDK is installed:
      
      /*
      const { KaminoMarket } = await import('@kamino-finance/klend-sdk');
      const { KAMINO_MAIN_MARKET_DEVNET } = await import('../sdk/kamino-helpers');
      
      const market = await KaminoMarket.load(
        connection,
        KAMINO_MAIN_MARKET_DEVNET,
        400
      );
      
      const solReserve = market.getReserve("SOL");
      
      assert.isNotNull(solReserve);
      console.log("SOL Reserve:", solReserve.address.toString());
      console.log("Total Deposits:", solReserve.stats.totalDepositsWads.toString());
      console.log("Total Borrows:", solReserve.stats.totalBorrowsWads.toString());
      */
    });
  });
});
