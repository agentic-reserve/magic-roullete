/**
 * Monte Carlo Simulation for Russian Roulette AI
 * 
 * This AI uses probability analysis to make optimal decisions in practice mode.
 * Note: This is for PRACTICE MODE ONLY - no real money involved.
 */

export enum AiDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
  LLM = 3, // OpenRouter LLM-based AI
}

export interface GameState {
  currentChamber: number;
  bulletChamber: number;  // Unknown to AI in real game
  shotsRemaining: number;
  totalChambers: number;
}

export interface SimulationResult {
  survivalProbability: number;
  optimalAction: 'shoot' | 'pass';
  confidence: number;
  simulations: number;
}

export class MonteCarloAI {
  private difficulty: AiDifficulty;
  private simulationCount: number;

  constructor(difficulty: AiDifficulty) {
    this.difficulty = difficulty;
    
    // Simulation count based on difficulty
    switch (difficulty) {
      case AiDifficulty.Easy:
        this.simulationCount = 100;
        break;
      case AiDifficulty.Medium:
        this.simulationCount = 1000;
        break;
      case AiDifficulty.Hard:
        this.simulationCount = 10000;
        break;
    }
  }

  /**
   * Calculate survival probability using Monte Carlo simulation
   */
  public calculateSurvivalProbability(gameState: GameState): SimulationResult {
    const { currentChamber, shotsRemaining, totalChambers } = gameState;
    
    // Easy mode: Random decision
    if (this.difficulty === AiDifficulty.Easy) {
      return {
        survivalProbability: Math.random(),
        optimalAction: Math.random() > 0.5 ? 'shoot' : 'pass',
        confidence: 0.3,
        simulations: 0,
      };
    }

    // Medium mode: Basic probability
    if (this.difficulty === AiDifficulty.Medium) {
      const basicProbability = this.calculateBasicProbability(
        currentChamber,
        totalChambers,
        shotsRemaining
      );
      
      return {
        survivalProbability: basicProbability,
        optimalAction: basicProbability > 0.5 ? 'shoot' : 'pass',
        confidence: 0.6,
        simulations: 0,
      };
    }

    // Hard mode: Monte Carlo simulation
    return this.runMonteCarloSimulation(gameState);
  }

  /**
   * Basic probability calculation (Medium difficulty)
   */
  private calculateBasicProbability(
    currentChamber: number,
    totalChambers: number,
    shotsRemaining: number
  ): number {
    // Probability of surviving this shot
    const remainingChambers = totalChambers - currentChamber + 1;
    const survivalChance = (remainingChambers - 1) / remainingChambers;
    
    return survivalChance;
  }

  /**
   * Monte Carlo simulation (Hard difficulty)
   * Simulates thousands of game outcomes to find optimal strategy
   */
  private runMonteCarloSimulation(gameState: GameState): SimulationResult {
    const { currentChamber, totalChambers, shotsRemaining } = gameState;
    
    let survivalCount = 0;
    const simulations = this.simulationCount;

    for (let i = 0; i < simulations; i++) {
      // Simulate random bullet position
      const simulatedBulletChamber = Math.floor(Math.random() * totalChambers) + 1;
      
      // Simulate game from current state
      let chamber = currentChamber;
      let survived = true;
      let shots = shotsRemaining;

      while (shots > 0 && survived) {
        if (chamber === simulatedBulletChamber) {
          survived = false;
          break;
        }
        
        chamber++;
        if (chamber > totalChambers) {
          chamber = 1;
        }
        shots--;
      }

      if (survived) {
        survivalCount++;
      }
    }

    const survivalProbability = survivalCount / simulations;
    
    // Decision threshold based on difficulty
    const threshold = 0.5;
    
    return {
      survivalProbability,
      optimalAction: survivalProbability > threshold ? 'shoot' : 'pass',
      confidence: Math.abs(survivalProbability - 0.5) * 2, // 0-1 scale
      simulations,
    };
  }

  /**
   * Make decision with some randomness to appear more human-like
   */
  public makeDecision(gameState: GameState): boolean {
    const result = this.calculateSurvivalProbability(gameState);
    
    // Add some randomness based on difficulty
    let randomFactor = 0;
    switch (this.difficulty) {
      case AiDifficulty.Easy:
        randomFactor = 0.4; // 40% random
        break;
      case AiDifficulty.Medium:
        randomFactor = 0.2; // 20% random
        break;
      case AiDifficulty.Hard:
        randomFactor = 0.05; // 5% random
        break;
    }

    // Sometimes make suboptimal decisions to appear human
    if (Math.random() < randomFactor) {
      return Math.random() > 0.5;
    }

    // Otherwise follow optimal strategy
    return result.optimalAction === 'shoot';
  }

  /**
   * Get AI's thought process (for debugging/transparency)
   */
  public explainDecision(gameState: GameState): string {
    const result = this.calculateSurvivalProbability(gameState);
    
    return `
AI Analysis (${AiDifficulty[this.difficulty]} mode):
- Survival Probability: ${(result.survivalProbability * 100).toFixed(2)}%
- Optimal Action: ${result.optimalAction}
- Confidence: ${(result.confidence * 100).toFixed(2)}%
- Simulations Run: ${result.simulations}
- Current Chamber: ${gameState.currentChamber}/${gameState.totalChambers}
    `.trim();
  }
}

/**
 * Example usage:
 * 
 * const ai = new MonteCarloAI(AiDifficulty.Hard);
 * const gameState = {
 *   currentChamber: 3,
 *   bulletChamber: 5, // AI doesn't know this
 *   shotsRemaining: 4,
 *   totalChambers: 6,
 * };
 * 
 * const shouldShoot = ai.makeDecision(gameState);
 * console.log(ai.explainDecision(gameState));
 */
