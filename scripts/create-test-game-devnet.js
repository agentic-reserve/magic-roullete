const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  console.log("🎮 Magic Roulette - Create Test Game (Devnet)");
  console.log("==============================================\n");

  // Setup connection to devnet
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  
  // Load wallet
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json")))
  );
  
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program
  const programId = new PublicKey("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");
  const idl = JSON.parse(fs.readFileSync("./target/idl/magic_roulette.json", "utf8"));
  const program = new anchor.Program(idl, programId, provider);

  console.log("Program ID:", programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

  // Derive Platform Config PDA
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );

  // Check if platform is initialized
  try {
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("✅ Platform Config Found");
    console.log("   Total Games:", config.totalGames.toString(), "\n");
  } catch (error) {
    console.error("❌ Platform not initialized. Run init-platform-devnet.js first.");
    process.exit(1);
  }

  // Create a 1v1 SOL game
  console.log("📝 Creating 1v1 Game (SOL-based)...");
  
  const gameId = new anchor.BN(Date.now());
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    programId
  );

  const gameMode = { oneVsOne: {} };
  const entryFee = new anchor.BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
  const vrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));

  try {
    const tx = await program.methods
      .createGameSol(gameMode, entryFee, vrfSeed)
      .accounts({
        game: gamePda,
        platformConfig,
        creator: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Game created successfully!");
    console.log("   Transaction:", tx);
    console.log("   Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log("   Game PDA:", gamePda.toString());
    console.log("   Game ID:", gameId.toString());
    console.log("   Entry Fee:", entryFee.toNumber() / LAMPORTS_PER_SOL, "SOL\n");

    // Wait for confirmation
    await connection.confirmTransaction(tx, "confirmed");

    // Fetch game state
    const game = await program.account.game.fetch(gamePda);
    console.log("📊 Game State:");
    console.log("   Creator:", game.creator.toString());
    console.log("   Mode: 1v1");
    console.log("   Team A Count:", game.teamACount);
    console.log("   Team B Count:", game.teamBCount);
    console.log("   Status:", Object.keys(game.status)[0]);
    console.log("   Is AI Game:", game.isAiGame);
    console.log("   Practice Mode:", game.isPracticeMode);
    console.log("   Entry Fee:", game.entryFee.toString(), "lamports");

    console.log("\n✨ Game creation complete!");
    console.log("Players can now join this game!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.log("\nProgram Logs:");
      error.logs.forEach(log => console.log("  ", log));
    }
    throw error;
  }

  // Create an AI Practice Game
  console.log("\n📝 Creating AI Practice Game...");
  
  const aiGameId = new anchor.BN(Date.now() + 1000);
  const [aiGamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), aiGameId.toArrayLike(Buffer, "le", 8)],
    programId
  );

  const aiDifficulty = { medium: {} };
  const aiVrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));

  try {
    const tx = await program.methods
      .createAiGame(aiDifficulty, aiVrfSeed)
      .accounts({
        game: aiGamePda,
        platformConfig,
        player: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ AI Game created successfully!");
    console.log("   Transaction:", tx);
    console.log("   Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log("   Game PDA:", aiGamePda.toString());
    console.log("   Game ID:", aiGameId.toString());

    // Wait for confirmation
    await connection.confirmTransaction(tx, "confirmed");

    // Fetch AI game state
    const aiGame = await program.account.game.fetch(aiGamePda);
    console.log("\n📊 AI Game State:");
    console.log("   Player:", aiGame.creator.toString());
    console.log("   Is AI Game:", aiGame.isAiGame);
    console.log("   Practice Mode:", aiGame.isPracticeMode);
    console.log("   Entry Fee:", aiGame.entryFee.toNumber(), "(should be 0)");
    console.log("   AI Difficulty:", Object.keys(aiGame.aiDifficulty || {})[0] || "N/A");

    console.log("\n✨ AI Game creation complete!");

  } catch (error) {
    console.error("❌ AI Game Error:", error.message);
    if (error.logs) {
      console.log("\nProgram Logs:");
      error.logs.forEach(log => console.log("  ", log));
    }
  }
}

main()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
