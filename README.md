# 🎮 Magic Roulette

Russian Roulette GameFi on Solana with MagicBlock Ephemeral Rollups

## 🎯 Overview

Magic Roulette adalah game Russian Roulette on-chain yang dibangun di Solana dengan:
- **Privacy**: Gameplay di Intel TDX secure enclaves (MagicBlock ER)
- **Speed**: Sub-10ms transaction latency
- **Gasless**: No transaction fees during gameplay
- **Fair**: Verifiable randomness via VRF

## 💰 Dua Cara Bermain

### 1️⃣ SOL Native (RECOMMENDED) ⭐

**Stake langsung dengan SOL - Simple & Fast!**

```typescript
// Create game dengan 0.5 SOL
await program.methods
  .createGameSol(
    { oneVsOne: {} },
    new BN(0.5 * LAMPORTS_PER_SOL),
    vrfSeed
  )
  .accounts({
    game: gamePda,
    platformConfig,
    creator: player.publicKey,
    gameVault: gameVaultPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([player])
  .rpc();
```

**Keuntungan:**
- ✅ Tidak perlu token khusus
- ✅ User experience terbaik
- ✅ Onboarding instant
- ✅ Lebih murah

**Lihat:** `SOL_NATIVE_GUIDE.md`

### 2️⃣ Token-based (Advanced)

**Menggunakan SPL Token-2022**

Untuk platform yang ingin:
- Token governance
- Airdrop rewards
- Tokenomics kompleks

**Lihat:** `DEPLOYMENT_GUIDE.md`

---

## 🎲 Game Modes

### 1v1 Mode
- 2 pemain
- Winner takes all (minus fees)
- Fast & intense

### 2v2 Mode
- 4 pemain (2 teams)
- Winning team splits prize
- Team strategy

### AI Practice Mode (FREE!)
- 1 pemain vs AI bot
- No entry fee
- No prizes
- Perfect for learning

---

## 💸 Prize Distribution

**Default Fees:**
- Platform Fee: 5%
- Treasury Fee: 10%
- Winner Gets: 85%

**Example (1v1 dengan 1 SOL):**
```
Player 1: 1 SOL
Player 2: 1 SOL
─────────────────
Total:    2 SOL

Distribusi:
├─ Platform (5%):  0.1 SOL
├─ Treasury (10%): 0.2 SOL
└─ Winner (85%):   1.7 SOL

Hasil:
✅ Winner: +0.7 SOL profit (70% ROI)
❌ Loser:  -1 SOL loss (100% loss)
```

**Lihat:** `PENJELASAN_HADIAH.md` (Bahasa Indonesia)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Magic Roulette                          │
├─────────────────────────────────────────────────────────────┤
│  Base Layer (Solana)          │  Ephemeral Rollup (ER)      │
│  - Create game                │  - Process VRF              │
│  - Join game                  │  - Take shots               │
│  - Delegate to ER             │  - Game logic               │
│  - Finalize & distribute      │  - Sub-10ms latency         │
│  - ~400ms finality            │  - Gasless transactions     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Solana CLI
solana --version  # 1.18.0+

# Anchor
anchor --version  # 0.32.1

# Node.js
node --version    # 18.0.0+
```

### Build

```bash
anchor build
```

### Test Locally

```bash
# Terminal 1: Start validator
solana-test-validator

# Terminal 2: Run SOL Native example
ts-node examples/sol-native-game.ts
```

### Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

---

## 📁 Project Structure

```
magic-roulette/
├── programs/magic-roulette/
│   ├── src/
│   │   ├── lib.rs                    # Main program
│   │   ├── state.rs                  # State accounts
│   │   ├── errors.rs                 # Error definitions
│   │   └── instructions/
│   │       ├── create_game_sol.rs    # SOL Native ⭐
│   │       ├── join_game_sol.rs      # SOL Native ⭐
│   │       ├── finalize_game_sol.rs  # SOL Native ⭐
│   │       ├── create_game.rs        # Token-based
│   │       ├── join_game.rs          # Token-based
│   │       └── ... (10 instructions total)
│   └── Cargo.toml
├── examples/
│   ├── sol-native-game.ts            # SOL Native example ⭐
│   ├── magicblock-integration.ts     # MagicBlock client
│   └── simple-game-flow.ts           # Token example
├── tests/
│   └── magic-roulette.ts             # Test suite
├── docs/
│   ├── SOL_NATIVE_GUIDE.md           # SOL Native guide ⭐
│   ├── SOL_NATIVE_SUMMARY.md         # SOL Native summary
│   ├── PENJELASAN_HADIAH.md          # Prize explanation (ID)
│   ├── SCHEMA_DATABASE.md            # Database schema
│   ├── DEPLOYMENT_GUIDE.md           # Deployment guide
│   └── IMPLEMENTATION_STATUS.md      # Status & roadmap
└── README.md                         # This file
```

---

## 🎮 Instructions

### SOL Native (13 instructions)

| # | Instruction | Description |
|---|------------|-------------|
| 1 | `initialize_platform` | Setup platform config |
| 2 | `create_game_sol` | Create game with SOL ⭐ |
| 3 | `join_game_sol` | Join game with SOL ⭐ |
| 4 | `delegate_game` | Delegate to ER |
| 5 | `process_vrf_result` | Process randomness |
| 6 | `take_shot` | Player takes shot |
| 7 | `finalize_game_sol` | Distribute SOL ⭐ |
| 8 | `claim_rewards` | Claim treasury rewards |
| 9 | `create_ai_game` | Create AI practice game |
| 10 | `ai_take_shot` | AI bot takes shot |
| 11 | `create_game` | Create game with token |
| 12 | `join_game` | Join game with token |
| 13 | `finalize_game` | Distribute tokens |

---

## 📊 State Accounts

### PlatformConfig
- Authority & treasury wallets
- Fee configuration (5% + 10%)
- Total games & volume tracking

### Game
- Game ID & mode (1v1, 2v2, AI)
- Players (Team A & Team B)
- Entry fee & total pot
- Game state (bullet chamber, current turn)
- VRF seed & result
- Winner & timestamps

### TreasuryRewards
- Player rewards from treasury
- Claimable amount
- Claim history

**Lihat:** `SCHEMA_DATABASE.md` untuk detail lengkap

---

## 🔒 Security Features

- ✅ Minimum entry fee validation (0.01 SOL)
- ✅ Game status checks
- ✅ Player authorization
- ✅ Cannot join own game
- ✅ Cannot join AI game
- ✅ Arithmetic overflow protection
- ✅ PDA vault security
- ✅ Practice mode (no real money)

---

## 🧪 Testing

### Run All Tests

```bash
anchor test
```

### Run Specific Example

```bash
# SOL Native (recommended)
ts-node examples/sol-native-game.ts

# Token-based
ts-node examples/simple-game-flow.ts

# MagicBlock integration
ts-node examples/magicblock-integration.ts
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `SOL_NATIVE_GUIDE.md` | Complete SOL Native guide |
| `SOL_NATIVE_SUMMARY.md` | SOL Native summary |
| `PENJELASAN_HADIAH.md` | Prize distribution (Bahasa Indonesia) |
| `SCHEMA_DATABASE.md` | Database schema & structure |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |
| `IMPLEMENTATION_STATUS.md` | Current status & roadmap |
| `examples/README.md` | Examples documentation |

---

## 🎯 Entry Fee Recommendations

### Casual Players
```
0.01 - 0.1 SOL
Low risk, good for beginners
```

### Regular Players
```
0.5 - 1 SOL
Medium risk, decent rewards
```

### High Rollers
```
5 - 10 SOL
High risk, big rewards
```

---

## 🔧 Development

### Build
```bash
anchor build
```

### Test
```bash
anchor test
```

### Deploy Devnet
```bash
anchor deploy --provider.cluster devnet
```

### Deploy Mainnet
```bash
anchor deploy --provider.cluster mainnet-beta
```

---

## 🌐 Networks

### Devnet
- **Program ID**: `JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq`
- **RPC**: `https://api.devnet.solana.com`
- **Explorer**: https://explorer.solana.com/?cluster=devnet

### Mainnet (Coming Soon)
- **Program ID**: TBA
- **RPC**: `https://api.mainnet-beta.solana.com`
- **Explorer**: https://explorer.solana.com/

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit PR

---

## 📞 Support

- **Documentation**: See docs/ folder
- **Issues**: GitHub Issues
- **Discord**: TBA

---

## ⚠️ Disclaimer

**This is gambling software. Use responsibly.**

- Understand the risks
- Only stake what you can afford to lose
- Gambling may be illegal in your jurisdiction
- No guarantees of winning
- Platform fees apply

---

## 📄 License

MIT License - see LICENSE file

---

## 🎉 Features

- ✅ SOL Native betting (simple!)
- ✅ Token-based betting (advanced)
- ✅ 1v1 & 2v2 modes
- ✅ AI practice mode (free!)
- ✅ MagicBlock ER integration
- ✅ VRF randomness
- ✅ Privacy with Intel TDX
- ✅ Sub-10ms latency
- ✅ Gasless gameplay
- ✅ Comprehensive tests
- ✅ Full documentation

---

## 🚀 Status

**Current Version**: 0.1.0
**Status**: ✅ Ready for devnet testing
**Last Updated**: 2025

---

**Built with:**
- Solana blockchain
- Anchor framework
- MagicBlock Ephemeral Rollups
- Rust & TypeScript

---

**Start playing with SOL Native today!** 🎮🎲
