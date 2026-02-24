const anchor = require("@coral-xyz/anchor");
const fs = require("fs");
const os = require("os");

async function main() {
  console.log("\n🚀 Initializing Magic Roulette Platform...\n");
  
  // Set up connection
  const connection = new anchor.web3.Connection(
    "https://brooks-dn4q23-fast-devnet.helius-rpc.com",
    "confirmed"
  );
  
  // Load wallet
  const walletPath = os.homedir() + "/.config/solana/id.json";
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf8")))
  );
  const wallet = new anchor.Wallet(walletKeypair);
  
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  console.log("📡 Connection established");
  console.log("   RPC:", "https://brooks-dn4q23-fast-devnet.helius-rpc.com");
  console.log("   Wallet:", wallet.publicKey.toString());
  
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("   Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL\n");

  const programId = new anchor.web3.PublicKey(
    "HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam"
  );
  
  console.log("📄 Loading program IDL...");
  const idl = JSON.parse(fs.readFileSync("./target/idl/magic_roulette.json", "utf8"));
  const program = new anchor.Program(idl, provider);

  // Platform configuration PDA
  const [platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  console.log("   Program ID:", program.programId.toString());
  console.log("   Platform Config PDA:", platformConfig.toString(), "\n");

  try {
    // Check if already initialized
    console.log("🔍 Checking if platform is already initialized...");
    try {
      const existingConfig = await program.account.platformConfig.fetch(platformConfig);
      console.log("\n⚠️  Platform already initialized!");
      console.log("   Total Games:", existingConfig.totalGames.toString());
      console.log("   Platform Fee:", existingConfig.platformFeeBps / 100, "%");
      console.log("   Treasury Fee:", existingConfig.treasuryFeeBps / 100, "%");
      console.log("   Paused:", existingConfig.paused);
      return;
    } catch (e) {
      console.log("   Platform not initialized yet, proceeding...\n");
    }

    console.log("⚙️  Initializing platform with:");
    console.log("   Platform Fee: 5%");
    console.log("   Treasury Fee: 10%");
    console.log("   Authority:", wallet.publicKey.toString());
    console.log("   Treasury:", wallet.publicKey.toString(), "\n");

    const tx = await program.methods
      .initializePlatform(
        500,  // 5% platform fee
        1000  // 10% treasury fee
      )
      .accountsPartial({
        platformConfig,
        authority: wallet.publicKey,
        treasury: wallet.publicKey,
        platformMint: anchor.web3.PublicKey.default,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Platform initialized successfully!\n");
    console.log("   Transaction:", tx);
    console.log("   Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);
    
    // Fetch and display config
    console.log("📊 Fetching platform configuration...");
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("\n   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Paused:", config.paused);
    console.log("\n🎉 Platform is ready for game creation!");
    
  } catch (error) {
    console.error("\n❌ Error initializing platform:");
    console.error(error.message || error);
    if (error.logs) {
      console.error("\n📋 Program Logs:");
      error.logs.forEach((log) => console.error("   ", log));
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
    console.error("\n❌ Script failed:", error.message);
    process.exit(1);
  });
