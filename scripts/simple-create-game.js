const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  console.log("🎮 Create Test Game");
  console.log("===================\n");

  // Setup
  const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json")))
  );
  
  console.log("Wallet:", walletKeypair.publicKey.toString());

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

  // Create 1v1 SOL game
  console.log("\n📝 Creating 1v1 Game (SOL-based)...");
  
  // Get platform config to get total_games
  const config = await program.account.platformConfig.fetch(platformConfig);
  const gameId = config.totalGames;
  
  console.log("Next Game ID:", gameId.toString());
  
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    programId
  );
  
  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    programId
  );

  const gameMode = { oneVsOne: {} };
  const entryFee = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
  const vrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));

  try {
    const tx = await program.methods
      .createGameSol(gameMode, entryFee, vrfSeed)
      .accounts({
        game: gamePda,
        platformConfig,
        creator: walletKeypair.publicKey,
        gameVault: gameVault,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Game created!");
    console.log("   TX:", tx);
    console.log("   Game PDA:", gamePda.toString());
    console.log("   Game ID:", gameId.toString());
    console.log("   Entry Fee:", entryFee.toNumber() / LAMPORTS_PER_SOL, "SOL");

    // Wait and fetch
    await new Promise(resolve => setTimeout(resolve, 2000));

    const game = await program.account.game.fetch(gamePda);
    console.log("\n📊 Game State:");
    console.log("   Creator:", game.creator.toString());
    console.log("   Mode: 1v1");
    console.log("   Team A:", game.teamACount);
    console.log("   Team B:", game.teamBCount);
    console.log("   Status:", Object.keys(game.status)[0]);
    console.log("   AI Game:", game.isAiGame);
    console.log("   Practice:", game.isPracticeMode);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.log("\nLogs:");
      error.logs.forEach(log => console.log("  ", log));
    }
  }

  // Create AI Practice Game
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
        player: walletKeypair.publicKey,
        payer: walletKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ AI Game created!");
    console.log("   TX:", tx);
    console.log("   Game PDA:", aiGamePda.toString());

    await new Promise(resolve => setTimeout(resolve, 2000));

    const aiGame = await program.account.game.fetch(aiGamePda);
    console.log("\n📊 AI Game State:");
    console.log("   Player:", aiGame.creator.toString());
    console.log("   AI Game:", aiGame.isAiGame);
    console.log("   Practice:", aiGame.isPracticeMode);
    console.log("   Entry Fee:", aiGame.entryFee.toNumber(), "(free)");

  } catch (error) {
    console.error("❌ AI Game Error:", error.message);
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
