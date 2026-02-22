import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { MonteCarloAI, AiDifficulty } from "./monte-carlo";
import { OpenRouterAI } from "./openrouter-ai";

/**
 * AI Bot Service for Magic Roulette Practice Mode
 * 
 * This service monitors games and plays against humans in practice mode.
 * NO REAL MONEY - Practice mode only for learning.
 * 
 * Now supports LLM-based AI using OpenRouter for more intelligent decisions.
 */

export class AiBotService {
  private connection: Connection;
  private program: Program;
  private botWallet: Keypair;
  private ai: MonteCarloAI;
  private llmAi?: OpenRouterAI;
  private difficulty: AiDifficulty;
  private isRunning: boolean = false;

  constructor(
    rpcUrl: string,
    programId: PublicKey,
    botKeypair: Keypair,
    difficulty: AiDifficulty,
    idl: any,
    openRouterConfig?: { apiKey: string; model?: string; temperature?: number }
  ) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.botWallet = botKeypair;
    this.difficulty = difficulty;
    
    const wallet = new Wallet(botKeypair);
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });
    
    this.program = new Program(idl, programId, provider);
    this.ai = new MonteCarloAI(difficulty);
    
    // Initialize LLM AI if in LLM mode
    if (difficulty === AiDifficulty.LLM && openRouterConfig) {
      this.llmAi = new OpenRouterAI(openRouterConfig);
    }
  }

  /**
   * Start monitoring for AI games
   */
  public async start() {
    console.log("🤖 AI Bot Service Starting...");
    console.log("   Bot Wallet:", this.botWallet.publicKey.toBase58());
    console.log("   Difficulty:", AiDifficulty[this.difficulty]);
    
    if (this.difficulty === AiDifficulty.LLM) {
      if (this.llmAi) {
        console.log("   🧠 LLM Mode: Enabled (OpenRouter)");
      } else {
        console.error("   ❌ LLM Mode: Disabled (missing API key)");
        console.log("   💡 Add OPENROUTER_API_KEY to .env file");
        process.exit(1);
      }
    }
    
    console.log("");
    
    this.isRunning = true;
    
    // Monitor for games where it's AI's turn
    this.monitorGames();
  }

  /**
   * Stop the bot service
   */
  public stop() {
    console.log("🛑 AI Bot Service Stopping...");
    this.isRunning = false;
  }

  /**
   * Monitor games and take turns when needed
   */
  private async monitorGames() {
    while (this.isRunning) {
      try {
        // Fetch all AI games where it's bot's turn
        const games = await this.fetchAiGames();
        
        for (const game of games) {
          if (this.isAiTurn(game)) {
            await this.takeTurn(game);
          }
        }
        
        // Wait before next check
        await this.sleep(2000); // Check every 2 seconds
      } catch (error) {
        console.error("Error in monitoring loop:", error);
        await this.sleep(5000); // Wait longer on error
      }
    }
  }

  /**
   * Fetch all active AI games
   */
  private async fetchAiGames(): Promise<any[]> {
    try {
      const games = await this.program.account.game.all([
        {
          memcmp: {
            offset: 8 + 8 + 32 + 1 + 1 + 8 + 8, // Offset to is_ai_game field
            bytes: "2", // true
          },
        },
      ]);
      
      return games
        .map(g => g.account)
        .filter(g => g.status.inProgress && !g.status.finished);
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  }

  /**
   * Check if it's AI's turn
   */
  private isAiTurn(game: any): boolean {
    const currentPlayer = this.getCurrentPlayer(game);
    return currentPlayer.equals(this.botWallet.publicKey);
  }

  /**
   * Get current player from game state
   */
  private getCurrentPlayer(game: any): PublicKey {
    const team = game.currentTurn % 2;
    const playerIdx = Math.floor(game.currentTurn / 2);
    
    if (team === 0) {
      return game.teamA[playerIdx];
    } else {
      return game.teamB[playerIdx];
    }
  }

  /**
   * AI takes its turn
   */
  private async takeTurn(game: any) {
    try {
      console.log(`\n🎮 Game ${game.gameId.toString()}`);
      console.log(`   Current Chamber: ${game.currentChamber}/6`);
      console.log(`   Shots Taken: ${game.shotsTaken}`);
      
      // Prepare game state for AI (without knowing bullet position)
      const gameState = {
        currentChamber: game.currentChamber,
        bulletChamber: 0, // AI doesn't know this
        shotsRemaining: 6 - game.shotsTaken,
        totalChambers: 6,
      };

      let shouldShoot: boolean;
      let reasoning: string = "";

      // Use LLM AI if in LLM mode
      if (this.difficulty === AiDifficulty.LLM && this.llmAi) {
        console.log("🧠 Consulting LLM AI...");
        const result = await this.llmAi.makeDecisionWithReasoning(gameState);
        shouldShoot = result.decision;
        reasoning = result.reasoning;
        
        console.log("\nLLM AI Response:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(reasoning);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        if (result.reasoningTokens) {
          console.log(`🔢 Reasoning Tokens: ${result.reasoningTokens}`);
        }
      } else {
        // Use Monte Carlo AI
        shouldShoot = this.ai.makeDecision(gameState);
        reasoning = this.ai.explainDecision(gameState);
        console.log(reasoning);
      }
      
      console.log(`\n   Decision: ${shouldShoot ? 'SHOOT' : 'PASS'}`);
      
      if (shouldShoot) {
        // Take shot on-chain
        const [gameAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("game"), game.gameId.toArrayLike(Buffer, "le", 8)],
          this.program.programId
        );

        const tx = await this.program.methods
          .aiTakeShot()
          .accounts({
            game: gameAccount,
            aiBot: this.botWallet.publicKey,
          })
          .signers([this.botWallet])
          .rpc();

        console.log(`   ✅ Shot taken: ${tx.slice(0, 8)}...`);
        
        // Check result
        const updatedGame = await this.program.account.game.fetch(gameAccount);
        if (updatedGame.status.finished) {
          const winner = updatedGame.winnerTeam === 0 ? "Human" : "AI";
          console.log(`   🏁 Game Over! Winner: ${winner}`);
        } else {
          console.log(`   ✓ Click. AI Bot survived`);
        }
      }
      
      // Small delay between actions
      await this.sleep(1000);
    } catch (error) {
      console.error("Error taking turn:", error);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Example usage:
 * 
 * const botKeypair = Keypair.fromSecretKey(...);
 * const service = new AiBotService(
 *   "https://api.devnet.solana.com",
 *   programId,
 *   botKeypair,
 *   AiDifficulty.Hard,
 *   idl
 * );
 * 
 * await service.start();
 */
