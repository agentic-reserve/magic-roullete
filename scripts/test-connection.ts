import * as anchor from "@coral-xyz/anchor";

async function main() {
  console.log("Testing connection...");
  
  const connection = new anchor.web3.Connection(
    "https://brooks-dn4q23-fast-devnet.helius-rpc.com",
    "confirmed"
  );
  
  console.log("Connection created");
  
  const slot = await connection.getSlot();
  console.log("Current slot:", slot);
  
  const walletPath = require("os").homedir() + "/.config/solana/id.json";
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(walletPath, "utf8")))
  );
  const wallet = new anchor.Wallet(walletKeypair);
  console.log("Wallet:", wallet.publicKey.toString());
  
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  
  console.log("✅ Connection test successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
