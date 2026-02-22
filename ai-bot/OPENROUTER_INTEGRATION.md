# OpenRouter AI Integration for Magic Roulette

## Overview

The Magic Roulette AI Bot now supports **LLM-based decision making** using OpenRouter! This provides more intelligent, explainable, and human-like AI opponents.

## Features

### 🧠 LLM-Powered AI
- Uses advanced language models for strategic reasoning
- Provides detailed explanations for every decision
- More human-like and unpredictable gameplay
- Supports multiple LLM models via OpenRouter

### 📊 Four Difficulty Levels

| Difficulty | Strategy | Technology | Win Rate | Use Case |
|------------|----------|------------|----------|----------|
| Easy | Random | Basic Logic | ~30% | Beginners |
| Medium | Probability | Math | ~50% | Intermediate |
| Hard | Monte Carlo | 10k Simulations | ~70% | Advanced |
| **LLM** | **Reasoning** | **Language Model** | **~60-80%** | **Expert** |

### 🎯 Why LLM Mode?

**Traditional AI (Monte Carlo)**:
- Fast and deterministic
- Pure probability-based
- No explanation of reasoning
- Predictable patterns

**LLM AI (OpenRouter)**:
- Strategic reasoning
- Considers game theory
- Explains every decision
- More human-like behavior
- Adapts to context

## Setup

### 1. Get OpenRouter API Key

Visit [OpenRouter](https://openrouter.ai/) and sign up for an API key.

```bash
# Free tier available!
# Pay-as-you-go pricing
# Access to 100+ models
```

### 2. Configure Environment

```bash
cd ai-bot
cp .env.example .env
```

Edit `.env`:
```bash
# Required for LLM mode
OPENROUTER_API_KEY=your-api-key-here

# Optional: Choose model (default: moonshotai/kimi-k2.5)
OPENROUTER_MODEL=moonshotai/kimi-k2.5

# Optional: Temperature 0.0-1.0 (default: 0.7)
OPENROUTER_TEMPERATURE=0.7

# Set difficulty to LLM
DIFFICULTY=LLM
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test OpenRouter Integration

```bash
npm run test
```

Expected output:
```
╔════════════════════════════════════════════╗
║   OpenRouter AI Test - Magic Roulette     ║
╚════════════════════════════════════════════╝

✅ OpenRouter AI initialized
   Model: moonshotai/kimi-k2.5
   Temperature: 0.7

🎮 Test Game State:
   Current Chamber: 3/6
   Shots Remaining: 4

📊 Test 1: Simple Decision
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Decision: SHOOT

🧠 Test 2: Decision with Reasoning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Decision: SHOOT
📝 Reasoning:
SHOOT. With a 66.67% survival probability at chamber 3 out of 6, 
the odds are favorable. The bullet could be in any of the remaining 
4 chambers, making this a calculated risk worth taking.
🔢 Reasoning Tokens: 156

📈 Test 3: Detailed Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Analysis:
Current probability analysis shows 66.67% survival chance...
[detailed strategic analysis]

✅ All tests completed!
```

### 5. Run Bot Service

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Supported Models

### Recommended Models

**1. Kimi K2.5 (Default)**
```bash
OPENROUTER_MODEL=moonshotai/kimi-k2.5
```
- Best for reasoning tasks
- Excellent strategic analysis
- Good cost/performance ratio
- ~$0.001 per decision

**2. GPT-4 Turbo**
```bash
OPENROUTER_MODEL=openai/gpt-4-turbo
```
- Highest quality reasoning
- Most human-like responses
- Premium pricing
- ~$0.01 per decision

**3. Claude 3.5 Sonnet**
```bash
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```
- Excellent strategic thinking
- Detailed explanations
- Mid-tier pricing
- ~$0.003 per decision

**4. Llama 3.1 70B**
```bash
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct
```
- Open source
- Good performance
- Lower cost
- ~$0.0005 per decision

### Budget Options

**Gemini Flash**
```bash
OPENROUTER_MODEL=google/gemini-flash-1.5
```
- Very fast
- Low cost (~$0.0001 per decision)
- Good for high-volume testing

## API Usage

### Basic Usage

```typescript
import { OpenRouterAI } from "./openrouter-ai";

const ai = new OpenRouterAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "moonshotai/kimi-k2.5",
  temperature: 0.7,
});

const gameState = {
  currentChamber: 3,
  bulletChamber: 0, // Unknown to AI
  shotsRemaining: 4,
  totalChambers: 6,
};

// Simple decision
const shouldShoot = await ai.makeDecision(gameState);
console.log("Decision:", shouldShoot ? "SHOOT" : "PASS");
```

### Decision with Reasoning

```typescript
const result = await ai.makeDecisionWithReasoning(gameState);

console.log("Decision:", result.decision ? "SHOOT" : "PASS");
console.log("Reasoning:", result.reasoning);
console.log("Reasoning Tokens:", result.reasoningTokens);
```

### Detailed Analysis

```typescript
const analysis = await ai.analyzeGameState(gameState);
console.log(analysis);
```

### Simulation Result Format

```typescript
const simResult = await ai.getSimulationResult(gameState);

console.log("Survival Probability:", simResult.survivalProbability);
console.log("Optimal Action:", simResult.optimalAction);
console.log("Confidence:", simResult.confidence);
```

## Example Output

### LLM Mode in Action

```
╔════════════════════════════════════════════╗
║   Magic Roulette AI Bot - Practice Mode   ║
║   NO REAL MONEY - Learning Mode Only      ║
║   🧠 Now with LLM AI Support!             ║
╚════════════════════════════════════════════╝

🤖 AI Bot Service Starting...
   Bot Wallet: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
   Difficulty: LLM
   🧠 LLM Mode: Enabled (OpenRouter)

🎮 Game 42
   Current Chamber: 3/6
   Shots Taken: 2

🧠 Consulting LLM AI...

LLM AI Response:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHOOT. At chamber 3 of 6 with 2 shots already taken, we have a 
66.67% survival probability. The bullet is in one of the remaining 
4 chambers. From a game theory perspective, taking the shot now 
maintains initiative and puts pressure on the opponent. The odds 
are mathematically favorable, and passing would only delay the 
inevitable confrontation with worse odds later.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 Reasoning Tokens: 187

   Decision: SHOOT
   ✅ Shot taken: a1b2c3d4...
   ✓ Click. AI Bot survived
```

## Cost Estimation

### Per Game Costs

Assuming 3-6 decisions per game:

| Model | Per Decision | Per Game | 100 Games |
|-------|-------------|----------|-----------|
| Gemini Flash | $0.0001 | $0.0005 | $0.05 |
| Llama 3.1 70B | $0.0005 | $0.0025 | $0.25 |
| Kimi K2.5 | $0.001 | $0.005 | $0.50 |
| Claude 3.5 | $0.003 | $0.015 | $1.50 |
| GPT-4 Turbo | $0.01 | $0.05 | $5.00 |

### Cost Optimization Tips

1. **Use Budget Models for Testing**
   ```bash
   OPENROUTER_MODEL=google/gemini-flash-1.5
   ```

2. **Reduce Temperature for Consistency**
   ```bash
   OPENROUTER_TEMPERATURE=0.3
   ```

3. **Cache Responses** (coming soon)
   - Store common game states
   - Reuse similar decisions

4. **Hybrid Mode** (coming soon)
   - Use Monte Carlo for simple decisions
   - Use LLM for critical moments

## Comparison: Monte Carlo vs LLM

### Monte Carlo (Hard Mode)

**Pros:**
- ✅ Fast (instant decisions)
- ✅ Free (no API costs)
- ✅ Deterministic
- ✅ Pure probability

**Cons:**
- ❌ No reasoning explanation
- ❌ Predictable patterns
- ❌ No strategic thinking
- ❌ No game theory

### LLM (OpenRouter)

**Pros:**
- ✅ Strategic reasoning
- ✅ Detailed explanations
- ✅ Human-like behavior
- ✅ Game theory awareness
- ✅ Unpredictable
- ✅ Educational value

**Cons:**
- ❌ Slower (1-3 seconds)
- ❌ API costs
- ❌ Requires internet
- ❌ Non-deterministic

## Troubleshooting

### "Invalid API Key"

```bash
# Check your .env file
cat .env | grep OPENROUTER_API_KEY

# Verify key is valid at openrouter.ai
```

### "Model not found"

```bash
# Check available models at:
# https://openrouter.ai/models

# Use a supported model
OPENROUTER_MODEL=moonshotai/kimi-k2.5
```

### "Rate limit exceeded"

```bash
# Reduce request frequency
# Or upgrade OpenRouter plan
# Or use a different model
```

### "Timeout errors"

```bash
# Increase timeout (coming soon)
# Or use a faster model
OPENROUTER_MODEL=google/gemini-flash-1.5
```

## Future Enhancements

- [ ] Response caching for common game states
- [ ] Hybrid mode (Monte Carlo + LLM)
- [ ] Multi-model ensemble
- [ ] Fine-tuned models for Russian Roulette
- [ ] Adaptive difficulty based on player skill
- [ ] Learning from past games
- [ ] Tournament mode with LLM commentary

## Resources

- **OpenRouter**: https://openrouter.ai/
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Model Comparison**: https://openrouter.ai/models
- **Pricing**: https://openrouter.ai/pricing
- **SDK GitHub**: https://github.com/OpenRouterTeam/openrouter-sdk

## License

MIT - Practice mode only, no real money gambling

---

**Built with ❤️ for Magic Roulette**
**Powered by OpenRouter 🚀**
