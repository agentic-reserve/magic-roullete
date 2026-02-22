import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";
import { PublicKey, Keypair } from "@solana/web3.js";
import fs from "fs";

/**
 * Deployment script for Magic Roulette
 * 
 * Steps:
 * 1. Deploy program to devnet
 * 2. Initialize platform configuration
 * 3. Create platform token mint
 * 4. Set up treasury
 */

async function main() {
  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;
  
  console.log("🎮 Magic Roulette Deployment Script");
  console.log("=====================================");
  console.log("Program ID:", program.programId.toString());
  console.log("Network:", provider.connection.rpcEndpoint);
  console.log("Deployer:", provider.wallet.publicKey.toString());
  console.log("");

  // Step 1: Verify program is deployed
  const programInfo = await provider.connection.getAccountInfo(program.programId);
  if (!programInfo) {
    console.error("❌ Program not deployed! Run 'anchor deploy' first.");
    process.exit(1);
  }
  console.log("✅ Program deployed");

  // Step 2: Derive platform config PDA
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );
  console.log("Platform Config PDA:", platformConfig.toString());

  // Step 3: Check if platform is already initialized
  try {
    const config = await program.account.platformConfig.fetch(platformConfig);
    console.log("✅ Platform already initialized");
    console.log("   Authority:", config.authority.toString());
    console.log("   Treasury:", config.treasury.toString());
    console.log("   Platform Fee:", config.platformFeeBps / 100, "%");
    console.log("   Treasury Fee:", config.treasuryFeeBps / 100, "%");
    console.log("   Total Games:", config.totalGames.toString());
    console.log("   Total Volume:", config.totalVolume.toString());
    console.log("");
    console.log("🎉 Deployment complete!");
    return;
  } catch (error) {
    console.log("⏳ Platform not initialized, proceeding with setup...");
  }

  // Step 4: Initialize platform (if not already done)
  console.log("");
  console.log("📝 Platform Initialization Required");
  console.log("=====================================");
  console.log("Before initializing, you need to:");
  console.log("1. Create a platform token mint (SPL Token-2022)");
  console.log("2. Set up a treasury wallet");
  console.log("3. Configure platform and treasury fee percentages");
  console.log("");
  console.log("Example initialization command:");
  console.log(`
  const platformFeeBps = 500;  // 5%
  const treasuryFeeBps = 1000; // 10%
  
  await program.methods
    .initializePlatform(platformFeeBps, treasuryFeeBps)
    .accounts({
      platformConfig: platformConfig,
      authority: provider.wallet.publicKey,
      treasury: treasuryWallet.publicKey,
      platformMint: platformMint.publicKey,
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  `);
  
  console.log("");
  console.log("💡 Next Steps:");
  console.log("1. Create platform token mint");
  console.log("2. Run initialization with proper parameters");
  console.log("3. Test game creation on devnet");
  console.log("4. Set up MagicBlock Ephemeral Rollup integration");
  console.log("5. Configure VRF for randomness");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
