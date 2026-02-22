/**
 * Simple Game Flow Example
 * 
 * Demonstrates a complete 1v1 game without MagicBlock ER
 * (for testing the core program logic)
 */

import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { MagicRoulette } from "../target/types/magic_roulette";
import IDL from "../target/idl/magic_roulette.json";

const PROGRAM_ID = new PublicKey("JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq");

async function main() {
  console.log("🎮 Magic Roulette - Simple Game Flow");
  console.log("====================================\n");

  // Setup connection
  const connection = new Connection("http://localhost:8899", "confirmed");
  
  // Setup wallets
  const authority = Keypair.generate();
  const treasury = Keypair.generate();
  const player1 = Keypair.generate();
  const player2 = Keypair.generate();

  console.log("💰 Airdropping SOL...");
  await Promise.all([
    connection.requestAirdrop(authority.publicKey, 10 * 1e9),
    connection.requestAirdrop(treasury.publicKey, 2 * 1e9),
    connection.requestAirdrop(player1.publicKey, 5 * 1e9),
    connection.requestAirdrop(player2.publicKey, 5 * 1e9),
  ]);

  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("✅ SOL airdropped\n");

  // Setup program
  const provider = new AnchorProvider(
    connection,
    new Wallet(authority),
    { commitment: "confirmed" }
  );
  const program = new Program(IDL as any, PROGRAM_ID, provider);

  // ========================================================================
  // STEP 1: Create Token Mint
  // ========================================================================
  console.log("🪙 Creating token mint...");
  const mint = await createMint(
    connection,
    authority,
    authority.publicKey,
    null,
    9, // decimals
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log("✅ Mint created:", mint.toString());

  // Create token accounts
  const player1TokenAccount = await createAssociatedTokenAccount(
    connection,
    player1,
    mint,
    player1.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const player2TokenAccount = await createAssociatedTokenAccount(
    connection,
    player2,
    mint,
    player2.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // Mint tokens to players
  await mintTo(
    connection,
    authority,
    mint,
    player1TokenAccount,
    authority,
    1000 * 1e9, // 1000 tokens
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  await mintTo(
    connection,
    authority,
    mint,
    player2TokenAccount,
    authority,
    1000 * 1e9,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  console.log("✅ Tokens minted to players\n");

  // ========================================================================
  // STEP 2: Initialize Platform
  // ========================================================================
  console.log("🏗️  Initializing platform...");

  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    PROGRAM_ID
  );

  try {
    await program.methods
      .initializePlatform(
        500,  // 5% platform fee
        1000  // 10% treasury fee
      )
      .accounts({
        platformConfig,
        authority: authority.publicKey,
        treasury: treasury.publicKey,
        platformMint: mint,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("✅ Platform initialized");
  } catch (e) {
    console.log("⚠️  Platform already initialized");
  }

  const config = await program.account.platformConfig.fetch(platformConfig);
  console.log("   Platform fee:", config.platformFeeBps / 100, "%");
  console.log("   Treasury fee:", config.treasuryFeeBps / 100, "%");
  console.log("   Total games:", config.totalGames.toString(), "\n");

  // ========================================================================
  // STEP 3: Create Game
  // ========================================================================
  console.log("🎲 Creating 1v1 game...");

  const gameId = config.totalGames;
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );

  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    PROGRAM_ID
  );

  const entryFee = new BN(100 * 1e9); // 100 tokens
  const vrfSeed = Array(32).fill(1);

  await program.methods
    .createGame(
      { oneVsOne: {} },
      entryFee,
      vrfSeed
    )
    .accounts({
      game: gamePda,
      platformConfig,
      creator: player1.publicKey,
      mint,
      creatorTokenAccount: player1TokenAccount,
      gameVault,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([player1])
    .rpc();

  console.log("✅ Game created");
  console.log("   Game ID:", gameId.toString());
  console.log("   Entry fee:", entryFee.toString(), "tokens");

  const game = await program.account.game.fetch(gamePda);
  console.log("   Status:", Object.keys(game.status)[0]);
  console.log("   Team A:", game.teamACount, "player(s)\n");

  // ========================================================================
  // STEP 4: Join Game
  // ========================================================================
  console.log("👥 Player 2 joining game...");

  await program.methods
    .joinGame()
    .accounts({
      game: gamePda,
      player: player2.publicKey,
      platformConfig,
      mint,
      playerTokenAccount: player2TokenAccount,
      gameVault,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    })
    .signers([player2])
    .rpc();

  console.log("✅ Player 2 joined");

  const gameAfterJoin = await program.account.game.fetch(gamePda);
  console.log("   Team A:", gameAfterJoin.teamACount, "player(s)");
  console.log("   Team B:", gameAfterJoin.teamBCount, "player(s)");
  console.log("   Total pot:", gameAfterJoin.totalPot.toString(), "tokens");
  console.log("   Status:", Object.keys(gameAfterJoin.status)[0], "\n");

  // ========================================================================
  // STEP 5: Process VRF (Simulate)
  // ========================================================================
  console.log("🎲 Processing VRF randomness...");

  const vrfAuthority = Keypair.generate();
  const randomness = Array.from(crypto.getRandomValues(new Uint8Array(32)));

  await program.methods
    .processVrfResult(randomness)
    .accounts({
      game: gamePda,
      vrfAuthority: vrfAuthority.publicKey,
    })
    .signers([vrfAuthority])
    .rpc();

  console.log("✅ VRF processed");

  const gameAfterVrf = await program.account.game.fetch(gamePda);
  console.log("   Bullet chamber:", gameAfterVrf.bulletChamber);
  console.log("   Status:", Object.keys(gameAfterVrf.status)[0], "\n");

  // ========================================================================
  // STEP 6: Play Game
  // ========================================================================
  console.log("🔫 Playing game...\n");

  let currentGame = gameAfterVrf;
  let currentPlayer = player1;
  let shotCount = 0;

  while (Object.keys(currentGame.status)[0] === "inProgress") {
    shotCount++;
    console.log(`Shot ${shotCount}:`);
    console.log(`   Player: ${currentPlayer.publicKey.toString().slice(0, 8)}...`);
    console.log(`   Current chamber: ${currentGame.currentChamber}`);
    console.log(`   Bullet chamber: ${currentGame.bulletChamber}`);

    try {
      await program.methods
        .takeShot()
        .accounts({
          game: gamePda,
          player: currentPlayer.publicKey,
        })
        .signers([currentPlayer])
        .rpc();

      currentGame = await program.account.game.fetch(gamePda);

      if (Object.keys(currentGame.status)[0] === "finished") {
        console.log("   💥 BANG! Game over!");
        console.log(`   Winner: Team ${currentGame.winnerTeam === 0 ? "A" : "B"}\n`);
        break;
      } else {
        console.log("   ✅ Click! Safe.\n");
      }

      // Switch player
      currentPlayer = currentPlayer === player1 ? player2 : player1;

      // Safety check
      if (shotCount > 10) {
        console.log("⚠️  Too many shots, stopping");
        break;
      }
    } catch (e: any) {
      console.log("   Error:", e.message);
      break;
    }
  }

  // ========================================================================
  // STEP 7: Finalize Game
  // ========================================================================
  console.log("💰 Finalizing game...");

  // Create platform and treasury vaults
  const platformVault = await createAssociatedTokenAccount(
    connection,
    authority,
    mint,
    authority.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const treasuryVault = await createAssociatedTokenAccount(
    connection,
    treasury,
    mint,
    treasury.publicKey,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // Determine winners
  const winnerTeam = currentGame.winnerTeam;
  const winner1 = winnerTeam === 0 ? player1.publicKey : player2.publicKey;
  const winner1TokenAccount = winnerTeam === 0 ? player1TokenAccount : player2TokenAccount;

  await program.methods
    .finalizeGame()
    .accounts({
      game: gamePda,
      platformConfig,
      payer: authority.publicKey,
      mint,
      gameVault,
      platformVault,
      treasuryVault,
      winner1,
      winner1TokenAccount,
      winner2: winner1, // Same for 1v1
      winner2TokenAccount: winner1TokenAccount,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    })
    .signers([authority])
    .rpc();

  console.log("✅ Game finalized");
  console.log("🎉 Prizes distributed!\n");

  // ========================================================================
  // FINAL STATS
  // ========================================================================
  console.log("📊 Final Stats:");
  const finalConfig = await program.account.platformConfig.fetch(platformConfig);
  console.log("   Total games:", finalConfig.totalGames.toString());
  console.log("   Total volume:", finalConfig.totalVolume.toString());
  console.log("   Treasury balance:", finalConfig.treasuryBalance.toString());

  console.log("\n✅ Complete!");
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
