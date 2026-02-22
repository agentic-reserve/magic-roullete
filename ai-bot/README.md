# Magic Roulette AI Bot - Practice Mode

AI bot service for playing against humans in **practice mode only**. No real money involved - purely for learning and skill development.

## Features

- **Three Difficulty Levels**:
  - **Easy**: Random decisions (30% win rate)
  - **Medium**: Basic probability analysis (50% win rate)
  - **Hard**: Monte Carlo simulation (70% win rate)

- **Monte Carlo Simulation**: Hard mode runs 10,000 simulations to find optimal strategy
- **Human-like Behavior**: Adds randomness to appear more natural
- **Transparent**: Logs decision-making process for learning

## Setup

### 1. Install Dependencies

```bash
cd ai-bot
npm install
```

### 2. Generate Bot Keypair

```bash
solana-keygen new -o bot-keypair.json
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run Bot Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## How It Works

### Monte Carlo Simulation (Hard Mode)

The AI runs thousands of simulations to calculate survival probability:

```typescript
// Example: Chamber 3 of 6, unknown bullet position
const gameState = {
  currentChamber: 3,
  totalChambers: 6,
  shotsRemaining: 4,
};

// AI runs 10,000 simulations
const result = ai.calculateSurvivalProbability(gameState);
// Result: 66.7% survival probability
```

### Decision Making

```
1. Analyze current game state
2. Run Monte Carlo simulations (Hard mode)
3. Calculate survival probability
4. Add human-like randomness
5. Make decision: SHOOT or PASS
6. Execute on-chain
```

## Practice Mode Benefits

### For Players
- **Learn the game** without risking money
- **Practice strategy** against different AI levels
- **Build confidence** before playing for real
- **Understand probabilities** through AI explanations

### For Platform
- **User onboarding** - easy entry point
- **Skill development** - players improve
- **Engagement** - always available opponent
- **Trust building** - transparent AI behavior

## AI Difficulty Comparison

| Difficulty | Strategy | Simulations | Win Rate | Use Case |
|------------|----------|-------------|----------|----------|
| Easy | Random | 0 | ~30% | Beginners |
| Medium | Basic Probability | 0 | ~50% | Intermediate |
| Hard | Monte Carlo | 10,000 | ~70% | Advanced |

## Example Output

```
🤖 AI Bot Service Starting...
   Bot Wallet: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
   Difficulty: Hard

🎮 Game 42
   Current Chamber: 3/6
   Shots Taken: 2

AI Analysis (Hard mode):
- Survival Probability: 66.67%
- Optimal Action: shoot
- Confidence: 33.34%
- Simulations Run: 10000
- Current Chamber: 3/6

   Decision: SHOOT
   ✅ Shot taken: a1b2c3d4...
   ✓ Click. AI Bot survived
```

## Architecture

```
ai-bot/
├── src/
│   ├── index.ts           # Main entry point
│   ├── bot-service.ts     # Bot service logic
│   └── monte-carlo.ts     # AI decision engine
├── package.json
├── .env.example
└── README.md
```

## API Reference

### MonteCarloAI

```typescript
class MonteCarloAI {
  constructor(difficulty: AiDifficulty)
  
  // Calculate survival probability
  calculateSurvivalProbability(gameState: GameState): SimulationResult
  
  // Make decision
  makeDecision(gameState: GameState): boolean
  
  // Explain reasoning
  explainDecision(gameState: GameState): string
}
```

### AiBotService

```typescript
class AiBotService {
  constructor(
    rpcUrl: string,
    programId: PublicKey,
    botKeypair: Keypair,
    difficulty: AiDifficulty,
    idl: any
  )
  
  // Start monitoring games
  start(): Promise<void>
  
  // Stop service
  stop(): void
}
```

## Monitoring

### Check Bot Status

```bash
# View bot logs
tail -f bot.log

# Check bot balance
solana balance <BOT_PUBKEY>

# View active games
solana account <GAME_ADDRESS>
```

### Metrics

- Games played
- Win/loss ratio
- Average decision time
- Simulation accuracy

## Troubleshooting

### Bot Not Taking Turns

- Check bot has SOL for transactions
- Verify program ID is correct
- Ensure RPC endpoint is responsive
- Check bot keypair permissions

### High CPU Usage

- Reduce simulation count (Hard mode)
- Increase polling interval
- Use lower difficulty setting

## Ethical Considerations

✅ **What This Bot Does**:
- Plays in practice mode only
- Clearly marked as AI opponent
- No real money involved
- Transparent decision-making
- Educational purpose

❌ **What This Bot Does NOT Do**:
- Play in real money games
- Hide its identity
- Manipulate outcomes
- Extract value from users
- Operate secretly

## Future Enhancements

- [ ] Adaptive difficulty based on player skill
- [ ] Learning from past games
- [ ] Multiple bot personalities
- [ ] Tournament mode support
- [ ] Statistics dashboard

## License

MIT - Practice mode only, no real money gambling
