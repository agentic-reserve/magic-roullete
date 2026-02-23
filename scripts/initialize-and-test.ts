import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
// Import IDL directly instead of types
import idl from "../target/idl/magic_roulette.json";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  TOKEN_2022_PROGRAM_ID,
  createInitializeMint2Instruction,
  getMintLen,
  ExtensionType,
} from "@solana/spl-token";

async function main() {
  // Setup provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.MagicRoulette as Program<any>;
  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;
  
  console.log("🚀 Magic Roulette - Initialize & Test");
  console.log("=====================================");
  console.log("Program ID:", program.programId.toString());
  console.log("Payer:", payer.publicKey.toString());
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");
  
  // Step 1: Create Platform Token Mint (Token-2022)
  console.log("📝 Step 1: Creating Platform Token Mint...");
  const mintKeypair = Keypair.generate();
  const mintLen = getMintLen([]);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  
  const createMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(
      mintKeypair.publicKey,
      9, // decimals
      payer.publicKey, // mint authority
      payer.publicKey, // freeze authority
      TOKEN_2022_PROGRAM_ID
    )
  );
  
  try {
    await sendAndConfirmTransaction(connection, createMintTx, [payer.payer, mintKeypair]);
    console.log("✅ Token Mint created:", mintKeypair.publicKey.toString());
  } catch (error) {
    console.log("⚠️  Mint creation failed (might already exist):", error.message);
  }
  
  // Step 2: Initialize Platform
  console.log("\n📝 Step 2: Initializing Platform...");
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );
  
  const treasury = Keypair.generate();
  const platformFeeBps = 500;  // 5%
  const treasuryFeeBps = 1000; // 10%
  
  try {
    const tx = await program.methods
      .initializePlatform(platformFeeBps, treasuryFeeBps)
      .accounts({
        platformConfig,
        authority: payer.publicKey,
        treasury: treasury.publicKey,
        platformMint: mintKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("✅ Platform initialized!");
    console.log("   Transaction:", tx);
    console.log("   Platform Config:", platformConfig.toString());
    console.log("   Treasury:", treasury.publicKey.toString());
    console.log("   Platform Fee:", platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", treasuryFeeBps / 100, "%");
    
    // Fetch and display config
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("\n📊 Platform Config:");
    console.log("   Authority:", config.authority.toString());
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Paused:", config.paused);
    
  } catch (error) {
    if (error.message.includes("already in use")) {
      console.log("✅ Platform already initialized");
      const config = await program.account.platformConfig.fetch(platformConfig);
      console.log("   Total Games:", config.totalGames.toString());
      console.log("   Paused:", config.paused);
    } else {
      console.error("❌ Platform initialization failed:", error.message);
      throw error;
    }
  }
  
  // Step 3: Create Test Players
  console.log("\n📝 Step 3: Creating Test Players...");
  const player1 = Keypair.generate();
  const player2 = Keypair.generate();
  
  console.log("   Player 1:", player1.publicKey.toString());
  console.log("   Player 2:", player2.publicKey.toString());
  
  // Airdrop to players
  try {
    const airdrop1 = await connection.requestAirdrop(player1.publicKey, 5 * LAMPORTS_PER_SOL);
    const airdrop2 = await connection.requestAirdrop(player2.publicKey, 5 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdrop1);
    await connection.confirmTransaction(airdrop2);
    console.log("✅ Players funded with 5 SOL each");
  } catch (error) {
    console.log("⚠️  Airdrop failed:", error.message);
  }
  
  // Step 4: Create a 1v1 Game (SOL-based)
  console.log("\n📝 Step 4: Creating 1v1 Game (SOL)...");
  const gameId = new BN(Date.now());
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  
  const gameMode = { oneVsOne: {} };
  const entryFee = new BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
  const vrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));
  
  try {
    const tx = await program.methods
      .createGameSol(gameMode, entryFee, vrfSeed)
      .accounts({
        game: gamePda,
        platformConfig,
        creator: player1.publicKey,
        payer: player1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player1])
      .rpc();
    
    console.log("✅ Game created!");
    console.log("   Transaction:", tx);
    console.log("   Game PDA:", gamePda.toString());
    console.log("   Game ID:", gameId.toString());
    console.log("   Entry Fee:", entryFee.toNumber() / LAMPORTS_PER_SOL, "SOL");
    
    // Fetch game state
    const game = await program.account.game.fetch(gamePda);
    console.log("\n📊 Game State:");
    console.log("   Creator:", game.creator.toString());
    console.log("   Mode: 1v1");
    console.log("   Team A Count:", game.teamACount);
    console.log("   Team B Count:", game.teamBCount);
    console.log("   Status:", Object.keys(game.status)[0]);
    console.log("   Is AI Game:", game.isAiGame);
    console.log("   Practice Mode:", game.isPracticeMode);
    
  } catch (error) {
    console.error("❌ Game creation failed:", error.message);
    if (error.logs) {
      console.log("Logs:", error.logs);
    }
  }
  
  // Step 5: Create AI Practice Game
  console.log("\n📝 Step 5: Creating AI Practice Game...");
  const aiGameId = new BN(Date.now() + 1000);
  const [aiGamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), aiGameId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  
  const aiDifficulty = { medium: {} };
  const aiVrfSeed = Array(32).fill(0).map(() => Math.floor(Math.random() * 256));
  
  try {
    const tx = await program.methods
      .createAiGame(aiDifficulty, aiVrfSeed)
      .accounts({
        game: aiGamePda,
        platformConfig,
        player: player2.publicKey,
        payer: player2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([player2])
      .rpc();
    
    console.log("✅ AI Game created!");
    console.log("   Transaction:", tx);
    console.log("   Game PDA:", aiGamePda.toString());
    console.log("   Game ID:", aiGameId.toString());
    
    // Fetch AI game state
    const aiGame = await program.account.game.fetch(aiGamePda);
    console.log("\n📊 AI Game State:");
    console.log("   Player:", aiGame.creator.toString());
    console.log("   Is AI Game:", aiGame.isAiGame);
    console.log("   Practice Mode:", aiGame.isPracticeMode);
    console.log("   Entry Fee:", aiGame.entryFee.toNumber(), "(should be 0)");
    console.log("   AI Difficulty:", Object.keys(aiGame.aiDifficulty || {})[0] || "N/A");
    
  } catch (error) {
    console.error("❌ AI Game creation failed:", error.message);
    if (error.logs) {
      console.log("Logs:", error.logs);
    }
  }
  
  console.log("\n✨ Initialization and Testing Complete!");
  console.log("=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
