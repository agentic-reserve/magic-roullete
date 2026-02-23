const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { TOKEN_2022_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");

async function main() {
  console.log("🚀 Magic Roulette - Platform Initialization");
  console.log("==========================================\n");

  // Setup connection
  const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");
  
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
  const idlPath = "./target/idl/magic_roulette.json";
  
  if (!fs.existsSync(idlPath)) {
    console.error("❌ IDL file not found. Run 'anchor build' first.");
    process.exit(1);
  }
  
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const program = new anchor.Program(idl, provider);

  console.log("Program ID:", programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

  // Derive Platform Config PDA
  const [platformConfig, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );
  
  console.log("Platform Config PDA:", platformConfig.toString());
  console.log("Bump:", bump, "\n");

  // Check if platform is already initialized
  try {
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("✅ Platform already initialized!");
    console.log("   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Paused:", config.paused);
    console.log("\n✨ Platform is ready for game creation!");
    return;
  } catch (error) {
    console.log("Platform not initialized yet. Initializing...\n");
  }

  // Create a dummy mint for platform token (Token-2022)
  const mintKeypair = Keypair.generate();
  console.log("Creating platform token mint:", mintKeypair.publicKey.toString());
  
  // Create treasury keypair
  const treasury = Keypair.generate();
  console.log("Treasury:", treasury.publicKey.toString(), "\n");

  // Initialize platform
  const platformFeeBps = 500;  // 5%
  const treasuryFeeBps = 1000; // 10%

  try {
    console.log("Sending initialize_platform transaction...");
    const tx = await program.methods
      .initializePlatform(platformFeeBps, treasuryFeeBps)
      .accounts({
        platformConfig: platformConfig,
        authority: wallet.publicKey,
        treasury: treasury.publicKey,
        platformMint: mintKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Platform initialized successfully!");
    console.log("   Transaction:", tx);
    console.log("   Platform Config:", platformConfig.toString());
    console.log("   Platform Fee:", platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", treasuryFeeBps / 100, "%\n");

    // Fetch and display config
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("📊 Platform Configuration:");
    console.log("   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Mint:", config.platformMint.toString());
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Total Volume:", config.totalVolume.toString());
    console.log("   Treasury Balance:", config.treasuryBalance.toString());
    console.log("   Paused:", config.paused);
    console.log("   Bump:", config.bump);

    console.log("\n✨ Platform initialization complete!");
    console.log("Ready to create games!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.log("\nProgram Logs:");
      error.logs.forEach(log => console.log("  ", log));
    }
    throw error;
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
