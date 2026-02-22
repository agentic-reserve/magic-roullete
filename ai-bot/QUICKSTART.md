# Quick Start: OpenRouter AI Bot

Get your LLM-powered AI bot running in 5 minutes!

## Step 1: Get OpenRouter API Key (2 minutes)

1. Visit https://openrouter.ai/
2. Sign up (free tier available)
3. Go to "Keys" section
4. Create new API key
5. Copy the key

## Step 2: Configure Bot (1 minute)

```bash
cd ai-bot

# Create .env file
cp .env.example .env

# Edit .env and add your key
nano .env
```

Add this to `.env`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
DIFFICULTY=LLM
RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
```

## Step 3: Install & Test (2 minutes)

```bash
# Install dependencies
npm install

# Test OpenRouter connection
npm run test
```

You should see:
```
✅ OpenRouter AI initialized
✅ Decision: SHOOT
📝 Reasoning: [LLM explanation]
✅ All tests completed!
```

## Step 4: Generate Bot Keypair (Optional)

```bash
# Generate new keypair
solana-keygen new -o bot-keypair.json

# Or use existing keypair
cp ~/.config/solana/id.json bot-keypair.json

# Fund it with devnet SOL
solana airdrop 2 $(solana-keygen pubkey bot-keypair.json) --url devnet
```

## Step 5: Run Bot

```bash
# Start the bot
npm run dev
```

You should see:
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

Monitoring for games...
```

## That's It! 🎉

Your LLM-powered AI bot is now running and will automatically play against humans in practice mode.

## Quick Commands

```bash
# Test OpenRouter
npm run test

# Run bot (development)
npm run dev

# Build for production
npm run build

# Run production
npm start

# Check bot balance
solana balance $(solana-keygen pubkey bot-keypair.json) --url devnet
```

## Troubleshooting

### "Invalid API Key"
- Check your `.env` file
- Verify key at openrouter.ai

### "Program not found"
- Make sure program is deployed
- Check PROGRAM_ID in `.env`

### "Insufficient funds"
- Airdrop devnet SOL to bot wallet
- `solana airdrop 2 <BOT_PUBKEY> --url devnet`

## Next Steps

- Read `OPENROUTER_INTEGRATION.md` for advanced features
- Try different models (GPT-4, Claude, Llama)
- Adjust temperature for different behaviors
- Monitor costs at openrouter.ai/activity

## Support

- OpenRouter: https://openrouter.ai/docs
- Magic Roulette: See main README.md
- Issues: Create GitHub issue

---

**Happy Gaming! 🎮🧠**
