# Magic Roulette - Mobile-First GameFi on Solana

**The fastest, fairest Russian Roulette game on Solana - Built for Solana Mobile Seeker**

🌐 **Website**: [magicroullete.com](https://magicroullete.com)  
📱 **Platform**: Solana Mobile Seeker  
🎮 **Program ID (Localnet)**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`  
📦 **GitHub**: [agentic-reserve/magic-roullete](https://github.com/agentic-reserve/magic-roullete)

[![Solana](https://img.shields.io/badge/Solana-Mainnet-green)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.32.1-blue)](https://www.anchor-lang.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Overview

Magic Roulette is a next-generation mobile-first GameFi platform that reimagines Russian Roulette with blockchain technology. Built specifically for Solana Mobile Seeker and the Solana dApp Store, we deliver provably fair, high-stakes gaming with sub-10ms latency and zero gas fees during gameplay.

### Key Features

- ⚡ **Sub-10ms Gameplay** - MagicBlock Ephemeral Rollups for instant response
- 📱 **Mobile-First** - Optimized for Solana Seeker with Mobile Wallet Adapter
- 💰 **Gasless Gaming** - Zero transaction fees during gameplay
- 🎲 **Provably Fair** - VRF-powered verifiable randomness
- 🏦 **Capital Efficient** - Kamino lending integration (110% collateral)
- 💾 **1000x Cost Savings** - Light Protocol ZK Compression
- 🗳️ **Decentralized** - Squads multisig governance
- 🚫 **Tokenless** - No platform token required, instant gameplay

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Magic Roulette Platform                    │
├─────────────────────────────────────────────────────────────┤
│  Mobile App (React Native + Expo)                          │
│  - Mobile Wallet Adapter                                    │
│  - Solana Seeker optimized                                  │
│  - Real-time WebSocket updates                              │
├─────────────────────────────────────────────────────────────┤
│  Smart Contract (Anchor 0.32.1)                             │
│  - Game logic & state management                            │
│  - Token-2022 integration                                   │
│  - Fee distribution                                         │
├─────────────────────────────────────────────────────────────┤
│  Ephemeral Rollup (MagicBlock)                              │
│  - Sub-10ms execution                                       │
│  - Gasless transactions                                     │
│  - VRF randomness                                           │
├─────────────────────────────────────────────────────────────┤
│  DeFi Integrations                                          │
│  - Kamino Finance (lending)                                 │
│  - Light Protocol (ZK Compression)                          │
│  - Squads (governance)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Solana: 3.1.9+
Rust: 1.85.0
Anchor: 0.32.1
Node: 24.10.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/agentic-reserve/magic-roullete
cd magic-roullete

# Install dependencies
npm install

# Build smart contract
anchor build
```

### Testing (Localnet)

**⚡ Quick Start (3 Steps)** - See [QUICK_START.md](QUICK_START.md)

```bash
# Step 1: Start validator (new terminal)
solana-test-validator \
  --bpf-program HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  target/deploy/magic_roulette.so \
  --reset

# Step 2: Verify setup
node scripts/test-connection.js

# Step 3: Run tests
node scripts/simple-create-game.js
node scripts/test-join-game.js
```

**📚 Complete Testing Guide** - See [TESTING_GUIDE.md](TESTING_GUIDE.md)

### Deploy to Devnet

```bash
# Switch to devnet
solana config set --url devnet

# Deploy program
anchor deploy --provider.cluster devnet

# Initialize platform
node scripts/init-platform-devnet.js
```

**📚 Devnet Deployment Guide** - See [DEVNET_DEPLOYMENT_GUIDE.md](DEVNET_DEPLOYMENT_GUIDE.md)

---

## 🎮 Game Modes

### 1v1 Mode
- Two players compete head-to-head
- Alternating turns
- Winner takes 85% of pot
- Fast-paced, high-stakes action

### 2v2 Mode
- Four players in two teams
- Team-based strategy
- Shared winnings
- Social gaming experience

### Human vs AI Mode (FREE)
- Practice mode with no entry fee
- Three difficulty levels (Easy/Medium/Hard)
- Perfect for learning mechanics
- No prizes, pure practice

---

## 💡 Technology Stack

### Smart Contract
- **Framework**: Anchor 0.32.1
- **Language**: Rust 1.85.0
- **Program ID**: `JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq`

### Mobile App
- **Framework**: React Native + Expo
- **Wallet**: Mobile Wallet Adapter
- **Distribution**: Solana dApp Store

### Infrastructure
- **Ephemeral Rollups**: MagicBlock (sub-10ms latency)
- **VRF**: MagicBlock VRF Plugin (verifiable randomness)
- **Lending**: Kamino Finance (leveraged betting)
- **Compression**: Light Protocol (1000x cost reduction)
- **Governance**: Squads Protocol (multisig)

---

## 📊 Economic Model

### Fee Structure
- **Platform Fee**: 5% (operations & development)
- **Treasury Fee**: 10% (community rewards)
- **Winner Share**: 85% (distributed to winners)

### Example (1v1 with 0.1 SOL entry)
```
Total Pot:      0.2 SOL
Platform Fee:   0.01 SOL (5%)
Treasury Fee:   0.02 SOL (10%)
Winner Gets:    0.17 SOL (85%)
```

### Revenue Projections
- **Year 1**: 1,000 daily games → ~$180K annual revenue
- **Year 2**: 5,000 daily games → ~$900K annual revenue
- **Year 3**: 20,000 daily games → ~$3.6M annual revenue

---

## 🔐 Security

### Audits
- ✅ Internal security review complete
- 🔄 External audit scheduled Q2 2026
- 💰 $50K bug bounty program

### Security Features
- Overflow protection (checked arithmetic)
- Access control validation
- Reentrancy guards
- PDA validation
- Input sanitization
- VRF tamper-proof randomness

---

## 🗺️ Roadmap

### Q1 2026 ✅
- [x] Smart contract development
- [x] MagicBlock ER + VRF integration
- [x] Kamino lending integration
- [x] Light Protocol ZK Compression
- [x] Squads multisig setup
- [x] Internal security audit

### Q2 2026 🔄
- [ ] External security audit
- [ ] Mobile app development
- [ ] Solana dApp Store submission
- [ ] Devnet beta testing
- [ ] Marketing campaign

### Q3 2026
- [ ] Mainnet launch
- [ ] Seeker device partnership
- [ ] Tournament system
- [ ] Leaderboards

### Q4 2026
- [ ] Advanced game modes
- [ ] iOS PWA
- [ ] Social features
- [ ] Global expansion

---

## 📱 Solana Mobile Integration

### Mobile Wallet Adapter
```typescript
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js';

<MobileWalletProvider
  cluster="mainnet-beta"
  appIdentity={{
    name: 'Magic Roulette',
    uri: 'https://magic-roulette.io',
    icon: 'https://magic-roulette.io/icon.png',
  }}
>
  <GameApp />
</MobileWalletProvider>
```

### Solana dApp Store
- NFT-based app publishing
- Direct distribution to Seeker users
- No Google Play/App Store restrictions

---

## 🤝 DeFi Integrations

### Kamino Finance
```typescript
// Borrow SOL for entry fee
await createGameWithLoan(
  market,
  wallet,
  entryFee: 0.1 SOL,
  collateral: 0.11 SOL  // 110% minimum
);

// Auto-repay from winnings
await finalizeGameWithLoan(market, wallet);
```

### Light Protocol ZK Compression
```typescript
// Create compressed token account (5,000 lamports vs 2M)
const { mint } = await createMint(rpc, payer, authority, 9);

// Mint compressed tokens
await mintTo(rpc, payer, mint, recipient, authority, amount);

// 1000x cost savings for high-volume gaming
```

### Squads Multisig
- **Configuration**: 2-of-2 signature requirement
- **Member 1**: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`
- **Member 2**: `8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9`
- **Status**: ✅ Ready to deploy
- **Documentation**: See `MULTISIG_STATUS.md` and `QUICK_MULTISIG_SETUP.md`
- Transparent treasury management
- Decentralized governance

---

## 📚 Documentation

### Getting Started
- **Quick Start**: [QUICK_START.md](QUICK_START.md) - Get testing in 5 minutes
- **Testing Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete testing instructions
- **Next Steps**: [NEXT_STEPS.md](NEXT_STEPS.md) - What to do next
- **Current Status**: [CURRENT_STATUS.md](CURRENT_STATUS.md) - Project status overview

### Deployment & Integration
- **Devnet Deployment**: [DEVNET_DEPLOYMENT_GUIDE.md](DEVNET_DEPLOYMENT_GUIDE.md)
- **Wallet Integration**: [WALLET_INTEGRATION_COMPLETE.md](WALLET_INTEGRATION_COMPLETE.md)
- **Alternative Testing**: [ALTERNATIVE_TESTING_GUIDE.md](ALTERNATIVE_TESTING_GUIDE.md)

### Technical Documentation
- **Whitepaper**: [misc/MAGIC_ROULETTE_WHITEPAPER.md](misc/MAGIC_ROULETTE_WHITEPAPER.md)
- **Implementation Status**: [misc/IMPLEMENTATION_STATUS.md](misc/IMPLEMENTATION_STATUS.md)
- **MagicBlock Integration**: [MAGICBLOCK_INTEGRATION_COMPLETE.md](MAGICBLOCK_INTEGRATION_COMPLETE.md)
- **MagicBlock Quick Start**: [MAGICBLOCK_QUICK_START.md](MAGICBLOCK_QUICK_START.md)
- **Multisig Setup**: [QUICK_MULTISIG_SETUP.md](QUICK_MULTISIG_SETUP.md)

### Session Notes
- **Session Summary**: [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Latest work completed

---

## 🌐 Resources

- **Website**: https://magicroullete.com
- **Documentation**: https://docs.magicroulette.com
- **GitHub**: [https://github.com/magic-roulett](https://github.com/magicroulette-game)
- **Twitter**: [text](https://x.com/mgcrouletteapp)
- **email**: magicroulettesol@gmail.com

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 📧 Contact

For inquiries, support, or partnerships:
- **Email**: magicroulettesol@gmail.com
- **Twitter**: https://x.com/mgcrouletteapp
- **Full Contact Info**: See [CONTACT.md](CONTACT.md)

---

## ⚠️ Disclaimer

Magic Roulette is a gaming platform that involves risk. Players should only wager what they can afford to lose. This is a tokenless platform - there is no token sale or investment opportunity. Revenue is generated solely through platform fees from gameplay.

---

**Built with ❤️ for Solana Mobile Seeker**
