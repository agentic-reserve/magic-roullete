const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");

async function main() {
  console.log("🔍 Testing Connection & Setup");
  console.log("==============================\n");

  // Test connection
  const connection = new Connection("http://localhost:8899", "confirmed");
  
  try {
    const version = await connection.getVersion();
    console.log("✅ Connected to Solana");
    console.log("   Version:", version["solana-core"]);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n💡 Make sure local validator is running:");
    console.log("   solana-test-validator");
    process.exit(1);
  }

  // Check wallet
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  if (!fs.existsSync(walletPath)) {
    console.error("❌ Wallet not found at:", walletPath);
    process.exit(1);
  }

  const walletData = JSON.parse(fs.readFileSync(walletPath));
  const walletKeypair = require("@solana/web3.js").Keypair.fromSecretKey(
    Buffer.from(walletData)
  );
  
  console.log("\n✅ Wallet loaded");
  console.log("   Address:", walletKeypair.publicKey.toString());

  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log("   Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  // Check program
  const programId = new PublicKey("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");
  
  try {
    const programInfo = await connection.getAccountInfo(programId);
    if (programInfo) {
      console.log("\n✅ Program found");
      console.log("   Program ID:", programId.toString());
      console.log("   Data Length:", programInfo.data.length, "bytes");
      console.log("   Owner:", programInfo.owner.toString());
    } else {
      console.log("\n⚠️  Program not found");
      console.log("   Program ID:", programId.toString());
      console.log("\n💡 Deploy the program:");
      console.log("   anchor build && anchor deploy");
    }
  } catch (error) {
    console.error("❌ Error checking program:", error.message);
  }

  // Check IDL
  const idlPath = "./target/idl/magic_roulette.json";
  if (fs.existsSync(idlPath)) {
    console.log("\n✅ IDL file found");
    console.log("   Path:", idlPath);
    
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
    console.log("   Instructions:", idl.instructions.length);
    console.log("   Accounts:", idl.accounts?.length || 0);
  } else {
    console.log("\n⚠️  IDL file not found");
    console.log("   Expected:", idlPath);
    console.log("\n💡 Build the program:");
    console.log("   anchor build");
  }

  console.log("\n✨ Connection test complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
