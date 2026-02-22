/**
 * OpenRouter AI Integration for Magic Roulette
 * 
 * Uses LLM reasoning to make strategic decisions in Russian Roulette.
 * This provides a more human-like and explainable AI opponent.
 */

import { OpenRouter } from "@openrouter/sdk";
import { GameState, SimulationResult } from "./monte-carlo";

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}

export class OpenRouterAI {
  private client: OpenRouter;
  private model: string;
  private temperature: number;

  constructor(config: OpenRouterConfig) {
    this.client = new OpenRouter({
      apiKey: config.apiKey,
    });
    
    // Default to Kimi K2.5 for reasoning capabilities
    this.model = config.model || "moonshotai/kimi-k2.5";
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Make decision using LLM reasoning
   */
  public async makeDecision(gameState: GameState): Promise<boolean> {
    const prompt = this.buildPrompt(gameState);
    
    try {
      const response = await this.client.chat.send({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert Russian Roulette strategist. Analyze the game state and make the optimal decision.
You must respond with ONLY "SHOOT" or "PASS" followed by a brief explanation.
Be strategic, calculate probabilities, and explain your reasoning clearly.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 500,
      });

      const decision = this.parseDecision(response.choices[0]?.message?.content || "");
      return decision;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      // Fallback to probability-based decision
      return this.fallbackDecision(gameState);
    }
  }

  /**
   * Make decision with streaming for real-time reasoning
   */
  public async makeDecisionWithReasoning(gameState: GameState): Promise<{
    decision: boolean;
    reasoning: string;
    reasoningTokens?: number;
  }> {
    const prompt = this.buildPrompt(gameState);
    
    try {
      const stream = await this.client.chat.send({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert Russian Roulette strategist. Analyze the game state and make the optimal decision.
You must respond with ONLY "SHOOT" or "PASS" followed by a brief explanation.
Be strategic, calculate probabilities, and explain your reasoning clearly.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: 500,
        stream: true,
      });

      let fullResponse = "";
      let reasoningTokens = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
        }
        
        // Get reasoning tokens from final chunk
        if (chunk.usage?.reasoningTokens) {
          reasoningTokens = chunk.usage.reasoningTokens;
        }
      }

      const decision = this.parseDecision(fullResponse);
      
      return {
        decision,
        reasoning: fullResponse,
        reasoningTokens,
      };
    } catch (error) {
      console.error("OpenRouter API error:", error);
      return {
        decision: this.fallbackDecision(gameState),
        reasoning: "API error - using fallback probability-based decision",
      };
    }
  }

  /**
   * Build prompt for LLM
   */
  private buildPrompt(gameState: GameState): string {
    const { currentChamber, shotsRemaining, totalChambers } = gameState;
    const shotsTaken = totalChambers - shotsRemaining;
    
    // Calculate basic probability
    const remainingChambers = totalChambers - currentChamber + 1;
    const survivalProbability = ((remainingChambers - 1) / remainingChambers) * 100;

    return `
Russian Roulette Game Analysis:

Current Situation:
- Total Chambers: ${totalChambers}
- Current Chamber: ${currentChamber}
- Shots Already Taken: ${shotsTaken}
- Shots Remaining: ${shotsRemaining}
- Survival Probability (this shot): ${survivalProbability.toFixed(2)}%

Context:
- The revolver has ${totalChambers} chambers with 1 bullet
- We are currently at chamber ${currentChamber}
- ${shotsTaken} shots have been fired without hitting the bullet
- There are ${shotsRemaining} chambers left to check

Your Task:
Analyze this situation strategically. Consider:
1. The probability of survival if you shoot now
2. The risk vs reward of passing to the opponent
3. Psychological factors and game theory
4. The optimal strategy given the current state

Respond with ONLY:
- "SHOOT" or "PASS"
- Followed by 1-2 sentences explaining your reasoning

Example: "SHOOT. With ${survivalProbability.toFixed(0)}% survival probability and only ${shotsRemaining} chambers remaining, the odds are in our favor."
`.trim();
  }

  /**
   * Parse LLM response to extract decision
   */
  private parseDecision(response: string): boolean {
    const normalized = response.toUpperCase().trim();
    
    // Check for explicit SHOOT or PASS
    if (normalized.startsWith("SHOOT")) {
      return true;
    }
    if (normalized.startsWith("PASS")) {
      return false;
    }
    
    // Check for keywords in response
    if (normalized.includes("SHOOT") && !normalized.includes("DON'T SHOOT")) {
      return true;
    }
    if (normalized.includes("PASS") || normalized.includes("DON'T SHOOT")) {
      return false;
    }
    
    // Default to probability-based if unclear
    console.warn("Unclear LLM response, using fallback");
    return Math.random() > 0.5;
  }

  /**
   * Fallback decision using basic probability
   */
  private fallbackDecision(gameState: GameState): boolean {
    const { currentChamber, totalChambers, shotsRemaining } = gameState;
    const remainingChambers = totalChambers - currentChamber + 1;
    const survivalProbability = (remainingChambers - 1) / remainingChambers;
    
    // Shoot if survival probability > 50%
    return survivalProbability > 0.5;
  }

  /**
   * Get detailed analysis without making a decision
   */
  public async analyzeGameState(gameState: GameState): Promise<string> {
    const prompt = `
Analyze this Russian Roulette game state and provide strategic insights:

Current Situation:
- Total Chambers: ${gameState.totalChambers}
- Current Chamber: ${gameState.currentChamber}
- Shots Remaining: ${gameState.shotsRemaining}

Provide:
1. Probability analysis
2. Strategic considerations
3. Risk assessment
4. Recommended action with reasoning

Be concise but thorough.
`.trim();

    try {
      const response = await this.client.chat.send({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert game theorist and probability analyst."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || "Analysis unavailable";
    } catch (error) {
      console.error("OpenRouter API error:", error);
      return "Analysis unavailable due to API error";
    }
  }

  /**
   * Convert to SimulationResult format for compatibility
   */
  public async getSimulationResult(gameState: GameState): Promise<SimulationResult> {
    const result = await this.makeDecisionWithReasoning(gameState);
    
    // Calculate basic probability for the result
    const { currentChamber, totalChambers, shotsRemaining } = gameState;
    const remainingChambers = totalChambers - currentChamber + 1;
    const survivalProbability = (remainingChambers - 1) / remainingChambers;
    
    return {
      survivalProbability,
      optimalAction: result.decision ? 'shoot' : 'pass',
      confidence: 0.85, // LLM-based decisions have high confidence
      simulations: result.reasoningTokens || 0, // Use reasoning tokens as "simulations"
    };
  }
}

/**
 * Example usage:
 * 
 * const ai = new OpenRouterAI({
 *   apiKey: process.env.OPENROUTER_API_KEY!,
 *   model: "moonshotai/kimi-k2.5",
 *   temperature: 0.7,
 * });
 * 
 * const gameState = {
 *   currentChamber: 3,
 *   bulletChamber: 0, // Unknown to AI
 *   shotsRemaining: 4,
 *   totalChambers: 6,
 * };
 * 
 * // Simple decision
 * const shouldShoot = await ai.makeDecision(gameState);
 * 
 * // Decision with reasoning
 * const result = await ai.makeDecisionWithReasoning(gameState);
 * console.log("Decision:", result.decision ? "SHOOT" : "PASS");
 * console.log("Reasoning:", result.reasoning);
 * console.log("Reasoning Tokens:", result.reasoningTokens);
 * 
 * // Detailed analysis
 * const analysis = await ai.analyzeGameState(gameState);
 * console.log(analysis);
 */
