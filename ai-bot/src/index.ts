import { Keypair, PublicKey } from "@solana/web3.js";
import { AiBotService } from "./bot-service";
import { AiDifficulty } from "./monte-carlo";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

/**
 * Main entry point for AI Bot Service
 * 
 * This bot plays against humans in PRACTICE MODE ONLY.
 * No real money involved - purely for learning and practice.
 * 
 * Now supports LLM-based AI using OpenRouter!
 */

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║   Magic Roulette AI Bot - Practice Mode   ║");
  console.log("║   NO REAL MONEY - Learning Mode Only      ║");
  console.log("║   🧠 Now with LLM AI Support!             ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log("");

  // Load configuration
  const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
  const PROGRAM_ID = new PublicKey(
    process.env.PROGRAM_ID || "JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq"
  );
  const BOT_KEYPAIR_PATH = process.env.BOT_KEYPAIR_PATH || "./bot-keypair.json";
  const DIFFICULTY = process.env.DIFFICULTY || "Medium";

  // Load bot keypair
  let botKeypair: Keypair;
  try {
    const keypairData = JSON.parse(fs.readFileSync(BOT_KEYPAIR_PATH, "utf-8"));
    botKeypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
  } catch (error) {
    console.error("❌ Error loading bot keypair:", error);
    console.log("💡 Generate a keypair: solana-keygen new -o bot-keypair.json");
    process.exit(1);
  }

  // Parse difficulty
  let aiDifficulty: AiDifficulty;
  switch (DIFFICULTY.toLowerCase()) {
    case "easy":
      aiDifficulty = AiDifficulty.Easy;
      break;
    case "medium":
      aiDifficulty = AiDifficulty.Medium;
      break;
    case "hard":
      aiDifficulty = AiDifficulty.Hard;
      break;
    case "llm":
      aiDifficulty = AiDifficulty.LLM;
      break;
    default:
      aiDifficulty = AiDifficulty.Medium;
  }

  // Load OpenRouter config if LLM mode
  let openRouterConfig;
  if (aiDifficulty === AiDifficulty.LLM) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENROUTER_API_KEY required for LLM mode");
      console.log("💡 Add to .env: OPENROUTER_API_KEY=your-key-here");
      process.exit(1);
    }
    
    openRouterConfig = {
      apiKey,
      model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5",
      temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || "0.7"),
    };
  }

  // Load IDL
  const idl = JSON.parse(
    fs.readFileSync("../target/idl/magic_roulette.json", "utf-8")
  );

  // Create and start bot service
  const botService = new AiBotService(
    RPC_URL,
    PROGRAM_ID,
    botKeypair,
    aiDifficulty,
    idl,
    openRouterConfig
  );

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down gracefully...");
    botService.stop();
    process.exit(0);
  });

  // Start the bot
  await botService.start();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
