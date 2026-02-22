/**
 * SOL Native Game Example
 * 
 * Contoh lengkap bermain Magic Roulette dengan SOL (tanpa token)
 * Lebih simple dan mudah untuk pemain!
 */

import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";
import IDL from "../target/idl/magic_roulette.json";

const PROGRAM_ID = new PublicKey("JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq");

async function main() {
  console.log("🎮 Magic Roulette - SOL Native Example");
  console.log("======================================\n");

  // Setup connection
  const connection = new Connection("http://localhost:8899", "confirmed");
  
  // Setup wallets
  const authority = Keypair.generate();
  const treasury = Keypair.generate();
  const player1 = Keypair.generate();
  const player2 = Keypair.generate();

  console.log("💰 Airdropping SOL...");
  await Promise.all([
    connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL),
    connection.requestAirdrop(treasury.publicKey, 2 * LAMPORTS_PER_SOL),
    connection.requestAirdrop(player1.publicKey, 5 * LAMPORTS_PER_SOL),
    connection.requestAirdrop(player2.publicKey, 5 * LAMPORTS_PER_SOL),
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
  // STEP 1: Initialize Platform (jika belum)
  // ========================================================================
  console.log("🏗️  Initializing platform...");

  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    PROGRAM_ID
  );

  try {
    // Note: Untuk SOL native, platform_mint bisa dummy karena tidak digunakan
    const dummyMint = Keypair.generate().publicKey;
    
    await program.methods
      .initializePlatform(
        500,  // 5% platform fee
        1000  // 10% treasury fee
      )
      .accounts({
        platformConfig,
        authority: authority.publicKey,
        treasury: treasury.publicKey,
        platformMint: dummyMint,
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
  console.log("   Treasury fee:", config.treasuryFeeBps / 100, "%\n");

  // ========================================================================
  // STEP 2: Create Game dengan SOL
  // ========================================================================
  console.log("🎲 Creating 1v1 game with SOL...");

  const gameId = config.totalGames;
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );

  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    PROGRAM_ID
  );

  const entryFee = new BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
  const vrfSeed = Array(32).fill(1);

  // Check balance sebelum
  const player1BalanceBefore = await connection.getBalance(player1.publicKey);
  console.log("   Player 1 balance before:", player1BalanceBefore / LAMPORTS_PER_SOL, "SOL");

  await program.methods
    .createGameSol(
      { oneVsOne: {} },
      entryFee,
      vrfSeed
    )
    .accounts({
      game: gamePda,
      platformConfig,
      creator: player1.publicKey,
      gameVault,
      systemProgram: SystemProgram.programId,
    })
    .signers([player1])
    .rpc();

  console.log("✅ Game created with SOL!");
  console.log("   Game ID:", gameId.toString());
  console.log("   Entry fee: 0.5 SOL");

  const player1BalanceAfter = await connection.getBalance(player1.publicKey);
  console.log("   Player 1 balance after:", player1BalanceAfter / LAMPORTS_PER_SOL, "SOL");
  console.log("   Player 1 paid:", (player1BalanceBefore - player1BalanceAfter) / LAMPORTS_PER_SOL, "SOL\n");

  // ========================================================================
  // STEP 3: Join Game dengan SOL
  // ========================================================================
  console.log("👥 Player 2 joining game with SOL...");

  const player2BalanceBefore = await connection.getBalance(player2.publicKey);
  console.log("   Player 2 balance before:", player2BalanceBefore / LAMPORTS_PER_SOL, "SOL");

  await program.methods
    .joinGameSol()
    .accounts({
      game: gamePda,
      player: player2.publicKey,
      platformConfig,
      gameVault,
      systemProgram: SystemProgram.programId,
    })
    .signers([player2])
    .rpc();

  console.log("✅ Player 2 joined with SOL!");

  const player2BalanceAfter = await connection.getBalance(player2.publicKey);
  console.log("   Player 2 balance after:", player2BalanceAfter / LAMPORTS_PER_SOL, "SOL");
  console.log("   Player 2 paid:", (player2BalanceBefore - player2BalanceAfter) / LAMPORTS_PER_SOL, "SOL");

  const gameAfterJoin = await program.account.game.fetch(gamePda);
  console.log("   Total pot:", gameAfterJoin.totalPot.toNumber() / LAMPORTS_PER_SOL, "SOL");
  
  const vaultBalance = await connection.getBalance(gameVault);
  console.log("   Vault balance:", vaultBalance / LAMPORTS_PER_SOL, "SOL\n");

  // ========================================================================
  // STEP 4: Process VRF
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

  const gameAfterVrf = await program.account.game.fetch(gamePda);
  console.log("✅ VRF processed");
  console.log("   Bullet chamber:", gameAfterVrf.bulletChamber);
  console.log("   Status:", Object.keys(gameAfterVrf.status)[0], "\n");

  // ========================================================================
  // STEP 5: Play Game
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

      currentPlayer = currentPlayer === player1 ? player2 : player1;

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
  // STEP 6: Finalize Game & Distribute SOL
  // ========================================================================
  console.log("💰 Finalizing game and distributing SOL...");

  const winnerTeam = currentGame.winnerTeam;
  const winner = winnerTeam === 0 ? player1.publicKey : player2.publicKey;
  const loser = winnerTeam === 0 ? player2.publicKey : player1.publicKey;

  const winnerBalanceBefore = await connection.getBalance(winner);
  const loserBalanceBefore = await connection.getBalance(loser);
  const treasuryBalanceBefore = await connection.getBalance(treasury.publicKey);

  console.log("\n📊 Balances BEFORE finalization:");
  console.log("   Winner:", winnerBalanceBefore / LAMPORTS_PER_SOL, "SOL");
  console.log("   Loser:", loserBalanceBefore / LAMPORTS_PER_SOL, "SOL");
  console.log("   Treasury:", treasuryBalanceBefore / LAMPORTS_PER_SOL, "SOL");
  console.log("   Vault:", await connection.getBalance(gameVault) / LAMPORTS_PER_SOL, "SOL\n");

  await program.methods
    .finalizeGameSol()
    .accounts({
      game: gamePda,
      platformConfig,
      payer: authority.publicKey,
      gameVault,
      platformAuthority: authority.publicKey,
      treasury: treasury.publicKey,
      winner1: winner,
      winner2: winner, // Same for 1v1
      systemProgram: SystemProgram.programId,
    })
    .signers([authority])
    .rpc();

  console.log("✅ Game finalized!");

  const winnerBalanceAfter = await connection.getBalance(winner);
  const loserBalanceAfter = await connection.getBalance(loser);
  const treasuryBalanceAfter = await connection.getBalance(treasury.publicKey);

  console.log("\n📊 Balances AFTER finalization:");
  console.log("   Winner:", winnerBalanceAfter / LAMPORTS_PER_SOL, "SOL");
  console.log("   Loser:", loserBalanceAfter / LAMPORTS_PER_SOL, "SOL");
  console.log("   Treasury:", treasuryBalanceAfter / LAMPORTS_PER_SOL, "SOL");
  console.log("   Vault:", await connection.getBalance(gameVault) / LAMPORTS_PER_SOL, "SOL\n");

  console.log("💵 Changes:");
  console.log("   Winner gained:", (winnerBalanceAfter - winnerBalanceBefore) / LAMPORTS_PER_SOL, "SOL");
  console.log("   Loser lost:", (loserBalanceBefore - loserBalanceAfter) / LAMPORTS_PER_SOL, "SOL");
  console.log("   Treasury gained:", (treasuryBalanceAfter - treasuryBalanceBefore) / LAMPORTS_PER_SOL, "SOL");

  // ========================================================================
  // FINAL STATS
  // ========================================================================
  console.log("\n📊 Final Platform Stats:");
  const finalConfig = await program.account.platformConfig.fetch(platformConfig);
  console.log("   Total games:", finalConfig.totalGames.toString());
  console.log("   Total volume:", finalConfig.totalVolume.toNumber() / LAMPORTS_PER_SOL, "SOL");
  console.log("   Treasury balance:", finalConfig.treasuryBalance.toNumber() / LAMPORTS_PER_SOL, "SOL");

  console.log("\n✅ Complete! SOL Native works perfectly! 🎉");
  console.log("\n💡 Key Benefits:");
  console.log("   ✅ No token needed - just SOL");
  console.log("   ✅ Simpler for users");
  console.log("   ✅ Lower gas costs");
  console.log("   ✅ Instant onboarding");
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
