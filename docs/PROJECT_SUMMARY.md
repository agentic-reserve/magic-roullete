# Magic Roulette - Project Summary

## Executive Overview

Magic Roulette is a high-performance Russian Roulette GameFi platform built on Solana, combining cutting-edge blockchain technologies to deliver sub-10ms gameplay, 1000x storage cost savings, and provably fair randomness with privacy guarantees.

## Key Features

### 🎮 Game Modes
- **1v1 Battles**: Two players compete, winner takes 85%
- **2v2 Team Battles**: Four players in teams, winning team splits 85%
- **Winner-Takes-All**: Loser hits the bullet, winner gets the pot

### 💰 Economic Model
- **Entry Fees**: Flexible, set by game creator
- **Distribution**: 85% winner, 5% platform, 10% treasury
- **Treasury Rewards**: Community rewards similar to ore.supply
- **Compressed Tokens**: 1000x cheaper than standard SPL tokens

### 🔒 Security & Fairness
- **VRF Randomness**: Provably fair bullet placement
- **Intel TDX Privacy**: Shot order hidden in TEE
- **On-Chain Verification**: All actions recorded
- **Automatic Distribution**: No manual intervention

### ⚡ Performance
- **Sub-10ms Gameplay**: Via MagicBlock Ephemeral Rollups
- **Gasless Transactions**: Zero fees for players during gameplay
- **Horizontal Scaling**: Unlimited concurrent games
- **Instant Finality**: Fast settlement on base layer

## Technology Stack

### Smart Contract Layer
```
Anchor 0.32.1
├─> Rust 1.85.0
├─> Solana 2.3.13
└─> Ephemeral Rollups SDK 0.6.5
```

**Key Components**:
- Game state management
- Fee distribution logic
- Delegation/commit patterns
- VRF integration

### Token Layer
```
Token-2022 (SPL Extensions)
├─> Transfer hooks
├─> Metadata extension
└─> Permanent delegate

Light Protocol ZK Compression
├─> Compressed tokens
├─> 1000x cost savings
└─> Rent-free accounts
```

**Benefits**:
- Token account: ~5,000 lamports (vs 2M for SPL)
- Mint creation: ~7,308 lamports (vs 1.4M for SPL)
- Same security as L1 Solana

### Execution Layer
```
MagicBlock Ephemeral Rollups
├─> Private ER (Intel TDX)
├─> Sub-10ms latency
├─> Gasless transactions
└─> Privacy guarantees

VRF (Verifiable Random Function)
├─> Provably fair randomness
├─> On-chain verification
└─> Tamper-proof
```

**Workflow**:
1. Base Layer: Initialize game, collect fees
2. Delegate to ER: Transfer to high-speed execution
3. Private Gameplay: Execute shots in Intel TDX
4. Commit Results: Finalize on base layer
5. Distribute Funds: Automatic payouts

### Frontend Layer
```
Next.js 15
├─> @solana/kit (modern SDK)
├─> @solana/react-hooks
├─> Light Protocol SDK
└─> Ephemeral Rollups SDK
```

**Features**:
- Wallet connection (Wallet Standard)
- Game creation and joining
- Real-time game state
- Compressed token management
- Treasury rewards claiming

## Project Structure

```
magic-roulette/
├── programs/
│   └── magic-roulette/
│       ├── src/
│       │   ├── lib.rs                    # Main program entry
│       │   ├── state.rs                  # Account structures
│       │   ├── errors.rs                 # Custom errors
│       │   └── instructions/             # Game instructions
│       │       ├── initialize_platform.rs
│       │       ├── create_game.rs
│       │       ├── join_game.rs
│       │       ├── delegate_game.rs
│       │       ├── process_vrf_result.rs
│       │       ├── take_shot.rs
│       │       ├── finalize_game.rs
│       │       └── claim_rewards.rs
│       └── Cargo.toml
│
├── app/
│   ├── src/
│   │   ├── lib/
│   │   │   └── magic-roulette-sdk.ts    # TypeScript SDK
│   │   ├── components/                   # React components
│   │   ├── hooks/                        # Custom hooks
│   │   └── app/                          # Next.js pages
│   └── package.json
│
├── tests/
│   └── magic-roulette.ts                 # Integration tests
│
├── scripts/
│   ├── initialize.ts                     # Platform setup
│   └── setup.sh                          # Environment setup
│
├── docs/
│   ├── README.md                         # Project overview
│   ├── QUICKSTART.md                     # Quick start guide
│   ├── ARCHITECTURE.md                   # System architecture
│   ├── GAME_MECHANICS.md                 # Game rules
│   ├── DEPLOYMENT.md                     # Deployment guide
│   └── PROJECT_SUMMARY.md                # This file
│
├── Anchor.toml                           # Anchor configuration
├── Cargo.toml                            # Workspace configuration
└── package.json                          # Root dependencies
```

## Account Architecture

### PlatformConfig (101 bytes)
```rust
- authority: Pubkey           // Platform admin
- treasury: Pubkey            // Treasury for rewards
- platform_fee_bps: u16       // 500 = 5%
- treasury_fee_bps: u16       // 1000 = 10%
- total_games: u64            // Game counter
- total_volume: u64           // Total wagered
- treasury_balance: u64       // Available rewards
- bump: u8
```

### Game (273 bytes)
```rust
- game_id: u64
- creator: Pubkey
- game_mode: GameMode         // 1v1 or 2v2
- status: GameStatus
- entry_fee: u64
- total_pot: u64
- team_a: [Pubkey; 2]
- team_b: [Pubkey; 2]
- team_a_count: u8
- team_b_count: u8
- bullet_chamber: u8          // 1-6 (hidden in TEE)
- current_chamber: u8
- current_turn: u8
- shots_taken: u8
- vrf_seed: [u8; 32]
- vrf_result: Option<[u8; 32]>
- winner_team: Option<u8>
- created_at: i64
- finished_at: Option<i64>
- bump: u8
```

### PlayerStats (81 bytes)
```rust
- player: Pubkey
- games_played: u64
- games_won: u64
- total_wagered: u64
- total_winnings: u64
- shots_survived: u64
- bump: u8
```

### TreasuryRewards (65 bytes)
```rust
- player: Pubkey
- claimable_amount: u64
- total_claimed: u64
- last_claim: i64
- bump: u8
```

## Game Flow

### Complete Lifecycle

```
1. CREATE GAME (Base Layer)
   ├─> Player 1 creates game
   ├─> Sets entry fee and mode
   ├─> Transfers entry fee (compressed tokens)
   └─> Game status: WaitingForPlayers

2. JOIN GAME (Base Layer)
   ├─> Player 2 joins
   ├─> Transfers matching entry fee
   ├─> Game vault holds total pot
   └─> Game status: Ready

3. DELEGATE (Base Layer → ER)
   ├─> Transfer ownership to delegation program
   ├─> Request VRF randomness
   ├─> Game moves to Private ER
   └─> Game status: Delegated

4. VRF PROCESSING (ER)
   ├─> VRF generates random number
   ├─> Bullet chamber determined (1-6)
   ├─> Chamber hidden in Intel TDX
   └─> Game status: InProgress

5. GAMEPLAY (Private ER)
   ├─> Players take turns shooting
   ├─> Each shot advances chamber
   ├─> Shot order private in TEE
   └─> Continue until bullet fires

6. WINNER DETERMINED (ER)
   ├─> Losing player hits bullet
   ├─> Winner team identified
   ├─> Final state prepared
   └─> Game status: Finished

7. COMMIT (ER → Base Layer)
   ├─> Final state written to Solana
   ├─> Winner revealed publicly
   └─> Funds ready for distribution

8. DISTRIBUTE (Base Layer)
   ├─> Winner(s): 85% of pot
   ├─> Platform: 5% of pot
   ├─> Treasury: 10% of pot
   └─> Stats updated
```

## Fee Economics

### Per-Game Breakdown

**1v1 Game (200 tokens)**
```
Total Pot: 200 tokens
├─> Winner: 170 tokens (85%)
├─> Platform: 10 tokens (5%)
└─> Treasury: 20 tokens (10%)
```

**2v2 Game (400 tokens)**
```
Total Pot: 400 tokens
├─> Team Winners: 340 tokens (85%)
│   ├─> Player 1: 170 tokens
│   └─> Player 2: 170 tokens
├─> Platform: 20 tokens (5%)
└─> Treasury: 40 tokens (10%)
```

### Platform Revenue Model

**Monthly Projections (Conservative)**
```
Month 1:  1,000 games × 100 tokens = 100K volume
          Platform: 5K tokens
          Treasury: 10K tokens

Month 6:  20,000 games × 100 tokens = 2M volume
          Platform: 100K tokens
          Treasury: 200K tokens

Month 12: 100,000 games × 100 tokens = 10M volume
          Platform: 500K tokens
          Treasury: 1M tokens
```

## Treasury Reward System

### Inspired by ore.supply

**Accumulation**:
- 10% of every game pot
- Grows with platform activity
- No manual deposits

**Distribution**:
- Based on player activity
- Weighted by games played
- Proportional to volume

**Claiming**:
- Anytime, no lockup
- Instant transfer
- Gas-efficient (compressed tokens)

### Example Calculation

```typescript
// Player with 100 games out of 10,000 total
// Treasury balance: 50,000 tokens
// Reward rate: 1% per epoch

playerReward = (100 / 10000) * 50000 * 0.01
             = 5 tokens per epoch
```

## Security Features

### Randomness
- **VRF**: Verifiable Random Function
- **Unpredictable**: Cannot be predicted
- **Verifiable**: Anyone can verify on-chain
- **Tamper-proof**: Cannot be manipulated

### Privacy
- **Intel TDX**: Trusted Execution Environment
- **Hidden State**: Shot order not visible
- **Selective Disclosure**: Only final result revealed
- **No Front-running**: Impossible to game the system

### Fund Security
- **PDA Vaults**: Program-controlled accounts
- **Automatic Distribution**: No manual intervention
- **On-Chain Verification**: All actions recorded
- **Audit Trail**: Complete transaction history

## Performance Metrics

### Expected Performance

| Metric | Value |
|--------|-------|
| Game Creation | ~400ms |
| Join Game | ~400ms |
| Delegation | ~400ms |
| Shot Execution | ~10ms |
| Finalization | ~400ms |
| Token Transfer Cost | ~5,000 lamports |
| Token Account Cost | ~5,000 lamports |

### Scalability

- **Concurrent Games**: Unlimited (horizontal scaling)
- **Players per Game**: 2-4
- **Shots per Second**: ~100 per ER instance
- **Cost per Game**: ~0.00001 SOL

## Development Status

### ✅ Completed
- [x] Smart contract architecture
- [x] Game state management
- [x] Fee distribution logic
- [x] Delegation/commit patterns
- [x] TypeScript SDK
- [x] Integration tests
- [x] Documentation

### 🚧 In Progress
- [ ] VRF integration
- [ ] Private ER (Intel TDX) setup
- [ ] Frontend UI
- [ ] Wallet integration
- [ ] Compressed token migration

### 📋 Planned
- [ ] Leaderboards
- [ ] Spectator mode
- [ ] Tournament system
- [ ] NFT rewards
- [ ] Mobile app
- [ ] Mainnet deployment

## Getting Started

### Quick Setup (10 minutes)

```bash
# 1. Clone and install
git clone <repo>
cd magic-roulette
./scripts/setup.sh

# 2. Build and deploy
anchor build
anchor deploy --provider.cluster devnet

# 3. Initialize platform
ts-node scripts/initialize.ts

# 4. Run tests
anchor test

# 5. Start frontend
cd app && npm run dev
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

## Documentation

- **[README.md](./README.md)**: Project overview
- **[QUICKSTART.md](./QUICKSTART.md)**: Get started in 10 minutes
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System design and architecture
- **[GAME_MECHANICS.md](./GAME_MECHANICS.md)**: Game rules and economics
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment guide

## Team & Contact

- **GitHub**: [Your GitHub]
- **Discord**: [Your Discord]
- **Twitter**: [Your Twitter]
- **Email**: [Your Email]

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with:
- [Solana](https://solana.com) - High-performance blockchain
- [Anchor](https://anchor-lang.com) - Solana development framework
- [Light Protocol](https://www.zkcompression.com) - ZK compression
- [MagicBlock](https://magicblock.gg) - Ephemeral Rollups
- [Helius](https://helius.dev) - RPC infrastructure

---

**Magic Roulette** - High-stakes gaming on Solana 🎰
