const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  console.log("🚀 Simple Platform Initialization");
  console.log("==================================\n");

  // Setup
  const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json")))
  );
  
  console.log("Wallet:", walletKeypair.publicKey.toString());
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

  // Load IDL
  const idl = JSON.parse(fs.readFileSync("./target/idl/magic_roulette.json", "utf8"));
  const programId = new PublicKey(idl.address);
  
  console.log("Program ID:", programId.toString());
  console.log("Instructions:", idl.instructions.map(i => i.name).join(", "));
  console.log();

  // Create provider and program
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  
  const program = new anchor.Program(idl, provider);
  
  // Derive Platform Config PDA
  const [platformConfig, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );
  
  console.log("Platform Config PDA:", platformConfig.toString());
  console.log("Bump:", bump, "\n");

  // Check if already initialized
  try {
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("✅ Platform already initialized!");
    console.log("   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Paused:", config.paused);
    return;
  } catch (error) {
    console.log("Platform not initialized. Initializing...\n");
  }

  // Create dummy mint and treasury
  const mintKeypair = Keypair.generate();
  const treasury = Keypair.generate();
  
  console.log("Platform Mint:", mintKeypair.publicKey.toString());
  console.log("Treasury:", treasury.publicKey.toString(), "\n");

  // Initialize
  const platformFeeBps = 500;  // 5%
  const treasuryFeeBps = 1000; // 10%

  try {
    console.log("Sending transaction...");
    const tx = await program.methods
      .initializePlatform(platformFeeBps, treasuryFeeBps)
      .accounts({
        platformConfig,
        authority: walletKeypair.publicKey,
        treasury: treasury.publicKey,
        platformMint: mintKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Success!");
    console.log("   TX:", tx);
    console.log("   Explorer: http://localhost:8899/tx/" + tx);
    
    // Wait and fetch
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("\n📊 Platform Config:");
    console.log("   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Paused:", config.paused);

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
