const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  console.log("🎮 Test Join Game");
  console.log("=================\n");

  // Setup
  const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json")))
  );
  
  console.log("Main Wallet:", walletKeypair.publicKey.toString());

  // Load IDL and create program
  const idl = JSON.parse(fs.readFileSync("./target/idl/magic_roulette.json", "utf8"));
  const programId = new PublicKey(idl.address);
  
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(idl, provider);
  
  // Get platform config
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );

  // Create test player
  console.log("📝 Creating test player...");
  const testPlayer = Keypair.generate();
  console.log("Test Player:", testPlayer.publicKey.toString());
  
  // Airdrop SOL to test player
  console.log("💰 Airdropping SOL to test player...");
  const airdropSig = await connection.requestAirdrop(
    testPlayer.publicKey,
    5 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  
  const balance = await connection.getBalance(testPlayer.publicKey);
  console.log("   Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  // Get the most recent game (should be game ID 0 if just initialized)
  const config = await program.account.platformConfig.fetch(platformConfig);
  console.log("\n📊 Platform Status:");
  console.log("   Total Games:", config.totalGames.toString());
  
  if (config.totalGames.toNumber() === 0) {
    console.log("\n❌ No games exist yet!");
    console.log("   Run: node scripts/simple-create-game.js");
    process.exit(1);
  }

  // Try to join the first game (game ID 0)
  const gameId = new anchor.BN(0);
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    programId
  );

  console.log("\n📝 Fetching game state...");
  const game = await program.account.game.fetch(gamePda);
  console.log("   Game ID:", game.gameId.toString());
  console.log("   Creator:", game.creator.toString());
  console.log("   Entry Fee:", game.entryFee.toNumber() / LAMPORTS_PER_SOL, "SOL");
  console.log("   Status:", Object.keys(game.status)[0]);
  console.log("   Team A Count:", game.teamACount);
  console.log("   Team B Count:", game.teamBCount);

  if (Object.keys(game.status)[0] !== "waitingForPlayers") {
    console.log("\n❌ Game is not accepting players!");
    console.log("   Current status:", Object.keys(game.status)[0]);
    process.exit(1);
  }

  // Get game vault PDA
  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    programId
  );

  console.log("\n📝 Joining game as test player...");
  
  try {
    const testWallet = new anchor.Wallet(testPlayer);
    const testProvider = new anchor.AnchorProvider(connection, testWallet, { commitment: "confirmed" });
    const testProgram = new anchor.Program(idl, testProvider);

    const tx = await testProgram.methods
      .joinGame()
      .accounts({
        game: gamePda,
        platformConfig,
        player: testPlayer.publicKey,
        gameVault: gameVault,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Joined game!");
    console.log("   TX:", tx);

    // Wait and fetch updated game state
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updatedGame = await program.account.game.fetch(gamePda);
    console.log("\n📊 Updated Game State:");
    console.log("   Team A Count:", updatedGame.teamACount);
    console.log("   Team B Count:", updatedGame.teamBCount);
    console.log("   Status:", Object.keys(updatedGame.status)[0]);
    console.log("   Total Pot:", updatedGame.totalPot.toNumber() / LAMPORTS_PER_SOL, "SOL");
    
    console.log("\n👥 Players:");
    console.log("   Team A:");
    updatedGame.teamA.forEach((player, i) => {
      if (player.toString() !== PublicKey.default.toString()) {
        console.log(`     [${i}]`, player.toString());
      }
    });
    console.log("   Team B:");
    updatedGame.teamB.forEach((player, i) => {
      if (player.toString() !== PublicKey.default.toString()) {
        console.log(`     [${i}]`, player.toString());
      }
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.log("\nLogs:");
      error.logs.forEach(log => console.log("  ", log));
    }
  }
}

main()
  .then(() => {
    console.log("\n✅ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
