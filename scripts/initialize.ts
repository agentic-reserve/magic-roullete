import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";
import { 
  Keypair, 
  PublicKey, 
  SystemProgram,
  Connection,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { 
  TOKEN_2022_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";

async function main() {
  console.log("🎰 Initializing Magic Roulette Platform");
  console.log("========================================\n");

  // Setup provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;

  console.log("📝 Program ID:", program.programId.toBase58());
  console.log("👤 Authority:", provider.wallet.publicKey.toBase58());
  console.log("");

  // Create treasury keypair
  const treasury = Keypair.generate();
  console.log("🏦 Treasury:", treasury.publicKey.toBase58());
  console.log("");

  // Airdrop to treasury for rent
  console.log("💰 Airdropping SOL to treasury...");
  const airdropSig = await provider.connection.requestAirdrop(
    treasury.publicKey,
    LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(airdropSig);
  console.log("✅ Airdrop complete\n");

  // Create Token-2022 mint
  console.log("🪙 Creating Token-2022 mint...");
  const mint = await createMint(
    provider.connection,
    provider.wallet.payer,
    provider.wallet.publicKey,
    null,
    9, // decimals
    Keypair.generate(),
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log("✅ Mint created:", mint.toBase58());
  console.log("");

  // Create treasury token account
  console.log("📦 Creating treasury token account...");
  const treasuryTokenAccount = await createAccount(
    provider.connection,
    provider.wallet.payer,
    mint,
    treasury.publicKey,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  console.log("✅ Treasury token account:", treasuryTokenAccount.toBase58());
  console.log("");

  // Initialize platform
  console.log("🚀 Initializing platform...");
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  const tx = await program.methods
    .initializePlatform(
      500,  // 5% platform fee
      1000  // 10% treasury fee
    )
    .accounts({
      platformConfig,
      authority: provider.wallet.publicKey,
      treasury: treasury.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Platform initialized!");
  console.log("📝 Transaction:", tx);
  console.log("📍 Platform Config:", platformConfig.toBase58());
  console.log("");

  // Fetch and display config
  const config = await program.account.platformConfig.fetch(platformConfig);
  console.log("📊 Platform Configuration:");
  console.log("   Authority:", config.authority.toBase58());
  console.log("   Treasury:", config.treasury.toBase58());
  console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
  console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
  console.log("   Total Games:", config.totalGames.toString());
  console.log("");

  // Save configuration
  const configData = {
    programId: program.programId.toBase58(),
    platformConfig: platformConfig.toBase58(),
    authority: provider.wallet.publicKey.toBase58(),
    treasury: treasury.publicKey.toBase58(),
    treasuryTokenAccount: treasuryTokenAccount.toBase58(),
    mint: mint.toBase58(),
    network: "devnet",
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    "config.json",
    JSON.stringify(configData, null, 2)
  );
  console.log("💾 Configuration saved to config.json");
  console.log("");

  // Create .env file for frontend
  const envContent = `
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_ER_ENDPOINT=https://devnet-router.magicblock.app
NEXT_PUBLIC_PROGRAM_ID=${program.programId.toBase58()}
NEXT_PUBLIC_PLATFORM_CONFIG=${platformConfig.toBase58()}
NEXT_PUBLIC_MINT=${mint.toBase58()}
NEXT_PUBLIC_CLUSTER=devnet
`.trim();

  fs.writeFileSync("app/.env.local", envContent);
  console.log("💾 Frontend environment saved to app/.env.local");
  console.log("");

  console.log("✅ Setup complete!");
  console.log("");
  console.log("📚 Next steps:");
  console.log("1. Run tests: anchor test");
  console.log("2. Start frontend: cd app && npm run dev");
  console.log("3. Create a game and test gameplay");
  console.log("");
  console.log("🔗 Useful links:");
  console.log("   Solana Explorer:", `https://explorer.solana.com/address/${program.programId.toBase58()}?cluster=devnet`);
  console.log("   Platform Config:", `https://explorer.solana.com/address/${platformConfig.toBase58()}?cluster=devnet`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
