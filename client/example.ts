import { Keypair } from "@solana/web3.js";
import { MagicBlockVRFClient } from "./magicblock-client";
// import IDL from "../target/idl/magicblock_vrf.json";

async function main() {
  // Load or generate wallet
  const wallet = Keypair.generate();
  console.log("Wallet:", wallet.publicKey.toString());

  // Create client (uncomment when IDL is available)
  // const client = new MagicBlockVRFClient(wallet, IDL);

  // Initialize game
  // const { gamePda } = await client.initialize();
  // console.log("Game PDA:", gamePda.toString());

  // Delegate to ER
  // await client.delegate(gamePda);

  // Subscribe to real-time updates
  // client.subscribeToGame(gamePda, (state) => {
  //   console.log("Game updated:", {
  //     lastRoll: state.lastRoll.toString(),
  //     totalRolls: state.totalRolls.toString(),
  //   });
  // });

  // Roll dice (1-6)
  // const diceResult = await client.rollDice(gamePda);
  // console.log("Dice:", diceResult);

  // Random in range
  // const randomResult = await client.randomInRange(gamePda, 1, 100);
  // console.log("Random (1-100):", randomResult);

  // Get final state
  // const finalState = await client.getGameState(gamePda);
  // console.log("Final state:", {
  //   lastRoll: finalState.lastRoll.toString(),
  //   totalRolls: finalState.totalRolls.toString(),
  // });

  // Undelegate when done
  // await client.undelegate(gamePda);

  console.log("✓ Complete");
}

main().catch(console.error);
