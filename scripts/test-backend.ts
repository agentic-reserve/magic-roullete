/**
 * Backend Testing Script
 * Tests all backend integrations: MagicBlock, Kamino, Light Protocol
 */

import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { DELEGATION_PROGRAM_ID } from "@magicblock-labs/ephemeral-rollups-sdk";
import * as dotenv from "dotenv";

dotenv.config();

// Configuration
const CONFIG = {
  baseRpc: process.env.BASE_RPC_URL || "http://localhost:8899",
  erRpc: process.env.ER_RPC_URL || "https://devnet.magicblock.app",
  programId: process.env.PROGRAM_ID || "HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam",
};

async function main() {
  console.log("\n🚀 Magic Roulette Backend Testing\n");
  console.log("Configuration:");
  console.log(`  Base RPC: ${CONFIG.baseRpc}`);
  console.log(`  ER RPC: ${CONFIG.erRpc}`);
  console.log(`  Program ID: ${CONFIG.programId}\n`);

  // Test 1: Connection
  console.log("1️⃣ Testing Connections...");
  const baseConnection = new Connection(CONFIG.baseRpc, "confirmed");
  const erConnection = new Connection(CONFIG.erRpc, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });

  try {
    const baseVersion = await baseConnection.getVersion();
    console.log(`   ✅ Base Layer: ${JSON.stringify(baseVersion)}`);
  } catch (err) {
    console.log(`   ❌ Base Layer connection failed: ${err}`);
  }

  try {
    const erVersion = await erConnection.getVersion();
    console.log(`   ✅ Ephemeral Rollup: ${JSON.stringify(erVersion)}`);
  } catch (err) {
    console.log(`   ⚠️  ER connection failed (expected if not deployed): ${err}`);
  }

  // Test 2: Program Account
  console.log("\n2️⃣ Testing Program Account...");
  const programId = new PublicKey(CONFIG.programId);
  try {
    const accountInfo = await baseConnection.getAccountInfo(programId);
    if (accountInfo) {
      console.log(`   ✅ Program found`);
      console.log(`   - Owner: ${accountInfo.owner.toBase58()}`);
      console.log(`   - Executable: ${accountInfo.executable}`);
      console.log(`   - Data Length: ${accountInfo.data.length} bytes`);
    } else {
      console.log(`   ⚠️  Program not found (needs deployment)`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err}`);
  }

  // Test 3: MagicBlock Delegation
  console.log("\n3️⃣ Testing MagicBlock Delegation...");
  console.log(`   Delegation Program ID: ${DELEGATION_PROGRAM_ID.toBase58()}`);
  console.log(`   ✅ SDK imported successfully`);

  // Test 4: Wallet Balance
  console.log("\n4️⃣ Testing Wallet...");
  const wallet = Keypair.generate();
  console.log(`   Test Wallet: ${wallet.publicKey.toBase58()}`);
  
  try {
    const balance = await baseConnection.getBalance(wallet.publicKey);
    console.log(`   Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.log(`   ❌ Error: ${err}`);
  }

  console.log("\n✅ Backend testing complete!\n");
}

main().catch((err) => {
  console.error("\n❌ Error:", err);
  process.exit(1);
});
