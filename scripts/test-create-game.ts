import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";

async function main() {
  // Set up provider with Helius RPC
  const connection = new anchor.web3.Connection(
    "https://brooks-dn4q23-fast-devnet.helius-rpc.com",
    "confirmed"
  );
  
  const wallet = anchor.Wallet.local();
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

  const [platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  console.log("\n📊 Fetching platform config...");
  const platform = await program.account.platformConfig.fetch(platformConfig);
  const gameId = platform.totalGames;

  const [game] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [gameVault] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), game.toBuffer()],
    program.programId
  );

  console.log("\n🎮 Creating 1v1 Game...");
  console.log("   Game ID:", gameId.toString());
  console.log("   Game PDA:", game.toString());
  console.log("   Game Vault:", gameVault.toString());
  console.log("   Entry Fee: 0.01 SOL");
  console.log("   Creator:", provider.wallet.publicKey.toString());

  try {
    const tx = await program.methods
      .createGameSol(
        { oneVsOne: {} },  // Game mode
        new anchor.BN(10_000_000),  // 0.01 SOL entry fee
        Array(32).fill(0)  // VRF seed
      )
      .accountsPartial({
        game,
        platformConfig,
        creator: provider.wallet.publicKey,
        gameVault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Game created successfully!");
    console.log("   Transaction:", tx);
    console.log("   Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    
    // Fetch and display game state
    const gameState = await program.account.game.fetch(game);
    console.log("\n🎲 Game State:");
    console.log("   Game ID:", gameState.gameId.toString());
    console.log("   Creator:", gameState.creator.toString());
    console.log("   Mode:", Object.keys(gameState.gameMode)[0]);
    console.log("   Status:", Object.keys(gameState.status)[0]);
    console.log("   Entry Fee:", gameState.entryFee.toNumber() / 1e9, "SOL");
    console.log("   Total Pot:", gameState.totalPot.toNumber() / 1e9, "SOL");
    console.log("   Team A Count:", gameState.teamACount);
    console.log("   Team B Count:", gameState.teamBCount);
    console.log("   Is Full:", gameState.teamACount === 1 && gameState.teamBCount === 1);
    
  } catch (error: any) {
    console.error("\n❌ Error creating game:");
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
