# Magic Roulette Quick Start Guide

Get your Russian Roulette GameFi up and running in 10 minutes.

## Prerequisites

Install required tools:

```bash
# Solana CLI (2.3.13)
sh -c "$(curl -sSfL https://release.solana.com/v2.3.13/install)"

# Rust (1.85.0)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Anchor (0.32.1)
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Node.js (24.10.0)
# Download from https://nodejs.org/
```

## Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo>
cd magic-roulette

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Update Program ID

After building, update the program ID in these files:

```bash
# Get your program ID
solana address -k target/deploy/magic_roulette-keypair.json

# Update in:
# - Anchor.toml (line 9)
# - programs/magic-roulette/src/lib.rs (line 11)
# - app/src/lib/magic-roulette-sdk.ts (line 9)
```

### 3. Rebuild and Deploy

```bash
# Rebuild with new program ID
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### 4. Initialize Platform

```bash
# Run initialization script
ts-node scripts/initialize.ts
```

This creates:
- Platform configuration
- Treasury account
- Token-2022 mint
- Configuration files

## Test (2 minutes)

```bash
# Run integration tests
anchor test

# Expected output:
# ✓ Initializes platform
# ✓ Creates a 1v1 game
# ✓ Player 2 joins the game
# ✓ Checks game vault balance
```

## Run Frontend (3 minutes)

```bash
cd app

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

## Create Your First Game

### Using SDK

```typescript
import { MagicRouletteSDK, GameMode } from "./lib/magic-roulette-sdk";

// Initialize SDK
const sdk = new MagicRouletteSDK(
  "https://api.devnet.solana.com",
  "https://devnet-router.magicblock.app",
  wallet,
  idl
);

// Create compressed token mint
const { mint } = await sdk.createCompressedMint(payer, 9);

// Mint tokens to players
await sdk.mintCompressedTokens(payer, mint, player1.publicKey, 1000e9);
await sdk.mintCompressedTokens(payer, mint, player2.publicKey, 1000e9);

// Create game
const { game, gameId } = await sdk.createGame(
  player1,
  GameMode.OneVsOne,
  100e9, // 100 tokens entry fee
  mint
);

// Player 2 joins
await sdk.joinGame(player2, gameId, mint);

// Delegate to ER
await sdk.delegateGame(player1, gameId);

// Play game (in ER)
await sdk.takeShot(player1, gameId);
await sdk.takeShot(player2, gameId);
// ... continue until winner
```

### Using CLI

```bash
# Create game
anchor run create-game -- \
  --mode 1v1 \
  --entry-fee 100 \
  --mint <MINT_ADDRESS>

# Join game
anchor run join-game -- \
  --game-id 0 \
  --player <PLAYER_PUBKEY>

# Delegate to ER
anchor run delegate-game -- \
  --game-id 0

# Take shot
anchor run take-shot -- \
  --game-id 0 \
  --player <PLAYER_PUBKEY>
```

## Verify Setup

### Check Platform Config

```bash
# View platform configuration
solana account <PLATFORM_CONFIG_ADDRESS> --output json

# Should show:
# - authority
# - treasury
# - platform_fee_bps: 500 (5%)
# - treasury_fee_bps: 1000 (10%)
```

### Check Game State

```bash
# View game account
solana account <GAME_ADDRESS> --output json

# Should show:
# - game_id
# - creator
# - game_mode
# - status
# - entry_fee
# - total_pot
```

### Check Compressed Tokens

```typescript
// Get compressed balance
const balance = await sdk.getCompressedBalance(
  player.publicKey,
  mint
);
console.log("Balance:", balance.toString());
```

## Common Issues

### "Program not found"
- Ensure you deployed: `anchor deploy`
- Check program ID matches in all files
- Verify cluster: `solana config get`

### "Insufficient funds"
- Airdrop SOL: `solana airdrop 2`
- Check balance: `solana balance`

### "Token account not found"
- Create token account first
- Use Token-2022 program ID
- Verify mint address

### "Delegation failed"
- Ensure game is full
- Check ER endpoint is reachable
- Verify delegation program ID

## Next Steps

### 1. Integrate Light Protocol

```bash
# Install Light Protocol CLI
npm install -g @lightprotocol/zk-compression-cli

# Create compressed mint
light create-mint --decimals 9 --cluster devnet
```

### 2. Setup MagicBlock VRF

- Visit https://docs.magicblock.gg/VRF
- Request VRF access
- Integrate VRF callback

### 3. Enable Private ER (Intel TDX)

- Contact MagicBlock for PER access
- Update ER endpoint to TEE validator
- Test private gameplay

### 4. Deploy Frontend

```bash
cd app

# Build for production
npm run build

# Deploy to Vercel/Netlify
vercel deploy
# or
netlify deploy
```

## Development Workflow

### Daily Development

```bash
# 1. Make changes to program
vim programs/magic-roulette/src/lib.rs

# 2. Build and test
anchor build
anchor test

# 3. Deploy changes
anchor deploy --provider.cluster devnet

# 4. Update frontend
cd app
npm run dev
```

### Testing Locally

```bash
# Start local validator
solana-test-validator

# In another terminal
anchor test --skip-local-validator
```

### Debugging

```bash
# View program logs
solana logs <PROGRAM_ID>

# View transaction details
solana confirm -v <TRANSACTION_SIGNATURE>

# Check account data
solana account <ACCOUNT_ADDRESS> --output json-compact
```

## Resources

### Documentation
- [Architecture](./ARCHITECTURE.md) - System design
- [Game Mechanics](./GAME_MECHANICS.md) - Game rules
- [Deployment](./DEPLOYMENT.md) - Production deployment

### External Links
- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Light Protocol](https://www.zkcompression.com)
- [MagicBlock](https://docs.magicblock.gg)

### Community
- Discord: [Your Discord]
- Twitter: [Your Twitter]
- GitHub: [Your GitHub]

## Support

Need help? Check:
1. [Troubleshooting Guide](./DEPLOYMENT.md#troubleshooting)
2. [GitHub Issues](https://github.com/your-repo/issues)
3. [Discord Community](https://discord.gg/your-server)

## What's Next?

- [ ] Complete frontend UI
- [ ] Add wallet integration
- [ ] Implement leaderboards
- [ ] Add spectator mode
- [ ] Create tournament system
- [ ] Deploy to mainnet

Happy building! 🎰
