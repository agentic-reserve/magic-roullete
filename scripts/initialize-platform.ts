import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";

async function main() {
  // Set up provider with Helius RPC
  const connection = new anchor.web3.Connection(
    "https://brooks-dn4q23-fast-devnet.helius-rpc.com",
    "confirmed"
  );
  
  // Load wallet from Solana CLI config
  const walletPath = require("os").homedir() + "/.config/solana/id.json";
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(walletPath, "utf8")))
  );
  const wallet = new anchor.Wallet(walletKeypair);
  
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const programId = new anchor.web3.PublicKey(
    "HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam"
  );
  
  console.log("📡 Loading program IDL...");
  const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/magic_roulette.json", "utf8")
  );
  
  const program = new Program(idl, provider) as Program<MagicRoulette>;

  // Platform configuration PDA
  const [platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  console.log("\n🚀 Initializing Magic Roulette Platform...");
  console.log("   Program ID:", program.programId.toString());
  console.log("   Platform Config PDA:", platformConfig.toString());
  console.log("   Authority:", provider.wallet.publicKey.toString());

  try {
    // Check if already initialized
    try {
      const existingConfig = await program.account.platformConfig.fetch(platformConfig);
      console.log("\n⚠️  Platform already initialized!");
      console.log("   Total Games:", existingConfig.totalGames.toString());
      console.log("   Platform Fee:", existingConfig.platformFeeBps / 100, "%");
      console.log("   Treasury Fee:", existingConfig.treasuryFeeBps / 100, "%");
      return;
    } catch (e) {
      // Not initialized yet, continue
    }

    const tx = await program.methods
      .initializePlatform(
        500,  // 5% platform fee
        1000  // 10% treasury fee
      )
      .accountsPartial({
        platformConfig,
        authority: provider.wallet.publicKey,
        treasury: provider.wallet.publicKey,
        platformMint: anchor.web3.PublicKey.default,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Platform initialized successfully!");
    console.log("   Transaction:", tx);
    console.log("   Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    
    // Fetch and display config
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("\n📊 Platform Configuration:");
    console.log("   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Paused:", config.paused);
    
  } catch (error: any) {
    console.error("\n❌ Error initializing platform:");
    console.error(error.message || error);
    if (error.logs) {
      console.error("\nProgram Logs:");
      error.logs.forEach((log: string) => console.error("  ", log));
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
