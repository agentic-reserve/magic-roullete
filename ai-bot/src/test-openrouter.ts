/**
 * Test OpenRouter AI Integration
 * 
 * Simple test script to verify OpenRouter SDK works correctly
 */

import { OpenRouterAI } from "./openrouter-ai";
import { GameState } from "./monte-carlo";
import * as dotenv from "dotenv";

dotenv.config();

async function testOpenRouterAI() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║   OpenRouter AI Test - Magic Roulette     ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log("");

  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY not found in .env file");
    console.log("💡 Add your OpenRouter API key to .env:");
    console.log("   OPENROUTER_API_KEY=your-key-here");
    process.exit(1);
  }

  // Initialize AI
  const ai = new OpenRouterAI({
    apiKey,
    model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5",
    temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || "0.7"),
  });

  console.log("✅ OpenRouter AI initialized");
  console.log(`   Model: ${process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5"}`);
  console.log(`   Temperature: ${process.env.OPENROUTER_TEMPERATURE || "0.7"}`);
  console.log("");

  // Test game state
  const gameState: GameState = {
    currentChamber: 3,
    bulletChamber: 0, // Unknown to AI
    shotsRemaining: 4,
    totalChambers: 6,
  };

  console.log("🎮 Test Game State:");
  console.log(`   Current Chamber: ${gameState.currentChamber}/${gameState.totalChambers}`);
  console.log(`   Shots Remaining: ${gameState.shotsRemaining}`);
  console.log("");

  // Test 1: Simple decision
  console.log("📊 Test 1: Simple Decision");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  try {
    const decision = await ai.makeDecision(gameState);
    console.log(`✅ Decision: ${decision ? "SHOOT" : "PASS"}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log("");

  // Test 2: Decision with reasoning
  console.log("🧠 Test 2: Decision with Reasoning");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  try {
    const result = await ai.makeDecisionWithReasoning(gameState);
    console.log(`✅ Decision: ${result.decision ? "SHOOT" : "PASS"}`);
    console.log(`📝 Reasoning:\n${result.reasoning}`);
    if (result.reasoningTokens) {
      console.log(`🔢 Reasoning Tokens: ${result.reasoningTokens}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log("");

  // Test 3: Detailed analysis
  console.log("📈 Test 3: Detailed Analysis");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  try {
    const analysis = await ai.analyzeGameState(gameState);
    console.log(`✅ Analysis:\n${analysis}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log("");

  // Test 4: Simulation result format
  console.log("🎯 Test 4: Simulation Result Format");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  try {
    const simResult = await ai.getSimulationResult(gameState);
    console.log(`✅ Survival Probability: ${(simResult.survivalProbability * 100).toFixed(2)}%`);
    console.log(`   Optimal Action: ${simResult.optimalAction}`);
    console.log(`   Confidence: ${(simResult.confidence * 100).toFixed(2)}%`);
    console.log(`   Reasoning Tokens: ${simResult.simulations}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log("");

  console.log("✅ All tests completed!");
}

// Run tests
testOpenRouterAI().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
