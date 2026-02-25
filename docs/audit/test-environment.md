# Test Environment Setup

## Overview

This document provides comprehensive instructions for setting up the Magic Roulette test environment for security auditing. The environment includes devnet deployment, test accounts, and all necessary tools for testing smart contracts, VRF integration, and DeFi integrations.

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **Rust**: 1.85.0 or higher
- **Solana CLI**: 1.18.x
- **Anchor CLI**: 0.32.1
- **Git**: Latest version

### Installation

```bash
# Install Node.js (if not installed)
# Visit: https://nodejs.org/

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli

# Verify installations
node --version
rustc --version
solana --version
anchor --version
```

## Repository Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd magic-roulette

# Install dependencies
npm install
```

### 2. Build Smart Contracts

```bash
# Build Anchor program
anchor build

# Verify build
ls -la target/deploy/
# Should see: magic_roulette.so
```

### 3. Generate Program Keypair

```bash
# Generate program keypair (if not exists)
solana-keygen new -o target/deploy/magic_roulette-keypair.json

# Get program ID
solana address -k target/deploy/magic_roulette-keypair.json
# Should output: HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
```

## Devnet Configuration

### 1. Configure Solana CLI for Devnet

```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Verify configuration
solana config get
# Should show: RPC URL: https://api.devnet.solana.com
```

### 2. Create Test Wallets

```bash
# Create test wallet 1 (game creator)
solana-keygen new -o test-player1.json

# Create test wallet 2 (game joiner)
solana-keygen new -o test-player2.json

# Get addresses
solana address -k test-player1.json
solana address -k test-player2.json
```

### 3. Fund Test Wallets

```bash
# Airdrop SOL to test wallets
solana airdrop 10 -k test-player1.json
solana airdrop 10 -k test-player2.json

# Verify balances
solana balance -k test-player1.json
solana balance -k test-player2.json
```

## Program Deployment

### 1. Deploy to Devnet

```bash
# Deploy program
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
```

### 2. Initialize Platform

```bash
# Run initialization script
node scripts/init-platform-devnet.js

# Expected output:
# ✅ Platform initialized
# Platform config: <address>
# Authority: <address>
# Platform fee: 5%
# Treasury fee: 10%
```

### 3. Verify Deployment

```bash
# Check program account
solana account HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam

# Check platform config account
solana account <platform-config-address>
```

## Test Token Setup

### 1. Create Test Token Mint

```bash
# Create token mint (Token-2022)
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# Get mint address
# Save for later use
```

### 2. Create Token Accounts

```bash
# Create token account for player 1
spl-token create-account <mint-address> --owner test-player1.json

# Create token account for player 2
spl-token create-account <mint-address> --owner test-player2.json

# Mint tokens to players
spl-token mint <mint-address> 1000 <player1-token-account>
spl-token mint <mint-address> 1000 <player2-token-account>

# Verify balances
spl-token balance <mint-address> --owner test-player1.json
spl-token balance <mint-address> --owner test-player2.json
```

## Running Tests

### 1. Unit Tests

```bash
# Run all unit tests
anchor test --skip-local-validator

# Run specific test file
anchor test --skip-local-validator tests/magic-roulette.ts

# Expected output:
# ✅ Initialize platform
# ✅ Create game
# ✅ Join game
# ✅ Take shot
# ✅ Finalize game
```

### 2. Integration Tests

```bash
# Run integration tests
npm run test:integration

# Expected output:
# ✅ Complete game flow
# ✅ VRF integration
# ✅ Kamino integration
# ✅ Squads integration
# ✅ MagicBlock integration
```

### 3. Security Tests

```bash
# Run security-specific tests
npm run test:security

# Expected output:
# ✅ Access control tests
# ✅ Arithmetic overflow tests
# ✅ Reentrancy tests
# ✅ VRF manipulation tests
```

## Testing Game Flow

### 1. Create Game

```bash
# Create game with test player 1
node scripts/create-test-game-devnet.js

# Expected output:
# ✅ Game created
# Game ID: 0
# Entry fee: 1 SOL
# Status: WaitingForPlayers
```

### 2. Join Game

```bash
# Join game with test player 2
node scripts/test-join-game.js

# Expected output:
# ✅ Player joined game
# Game ID: 0
# Status: Ready
```

### 3. Delegate to Ephemeral Rollup

```bash
# Delegate game to ER
node scripts/test-delegate-game.js

# Expected output:
# ✅ Game delegated to ER
# Game ID: 0
# Status: Delegated
```

### 4. Execute Shots (On ER)

```bash
# Execute shots on Ephemeral Rollup
node scripts/test-game-simulation.js

# Expected output:
# ✅ Shot 1: Click! Player 1 survives
# ✅ Shot 2: Click! Player 2 survives
# ✅ Shot 3: BANG! Player 1 eliminated
# 🏆 Winner: Player 2
```

### 5. Finalize Game

```bash
# Finalize game and distribute winnings
node scripts/test-finalize-game.js

# Expected output:
# ✅ Game finalized
# Platform fee: 0.05 SOL
# Treasury fee: 0.1 SOL
# Winner prize: 0.85 SOL
```

## Testing VRF Integration

### 1. Request VRF Randomness

```bash
# Request VRF randomness
node scripts/test-vrf-request.js

# Expected output:
# ✅ VRF randomness requested
# Game ID: 0
# VRF pending: true
```

### 2. Simulate VRF Callback

```bash
# Simulate VRF callback (for testing)
node scripts/test-vrf-callback.js

# Expected output:
# ✅ VRF callback received
# Randomness: [random bytes]
# Bullet chamber: 3
```

## Testing Kamino Integration

### 1. Create Game with Loan

```bash
# Create game with Kamino loan
node scripts/test-kamino-loan.js

# Expected output:
# ✅ Kamino loan created
# Entry fee: 1 SOL
# Collateral: 1.1 SOL
# Loan ID: <obligation-id>
```

### 2. Finalize with Loan Repayment

```bash
# Finalize game and repay loan
node scripts/test-kamino-repayment.js

# Expected output:
# ✅ Loan repaid: 1.01 SOL (principal + interest)
# ✅ Remaining distributed to winner
```

## Testing Squads Integration

### 1. Initialize with Multisig

```bash
# Initialize platform with Squads multisig
node scripts/test-squads-init.js

# Expected output:
# ✅ Platform initialized with multisig
# Multisig: <multisig-address>
# Threshold: 3 of 5
```

### 2. Create Governance Proposal

```bash
# Create governance proposal
node scripts/test-squads-proposal.js

# Expected output:
# ✅ Proposal created
# Proposal ID: <transaction-id>
# Approvals: 0/3
```

## Testing MagicBlock Integration

### 1. Delegate Account

```bash
# Delegate game account to ER
node scripts/test-magicblock-delegate.js

# Expected output:
# ✅ Account delegated to ER
# Game ID: 0
# ER endpoint: https://devnet.magicblock.app
```

### 2. Execute on ER

```bash
# Execute shots on ER
node scripts/test-magicblock-execute.js

# Expected output:
# ✅ Shot executed on ER (gasless)
# Latency: 8ms
```

### 3. Commit State

```bash
# Commit state back to base layer
node scripts/test-magicblock-commit.js

# Expected output:
# ✅ State committed to L1
# Final status: Finished
# Winner: Team A
```

## Environment Variables

### Required Environment Variables

Create `.env` file in project root:

```bash
# Solana Configuration
SOLANA_NETWORK=devnet
RPC_ENDPOINT=https://api.devnet.solana.com

# Program IDs
PROGRAM_ID=HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
MAGICBLOCK_DELEGATION_PROGRAM_ID=<magicblock-program-id>

# Test Accounts
TEST_PLAYER1_KEYPAIR=./test-player1.json
TEST_PLAYER2_KEYPAIR=./test-player2.json

# Token Configuration
TEST_TOKEN_MINT=<test-token-mint-address>

# Kamino Configuration (optional)
KAMINO_MARKET=<kamino-market-address>
KAMINO_RESERVE=<kamino-reserve-address>

# Squads Configuration (optional)
SQUADS_MULTISIG=<squads-multisig-address>
```

## Troubleshooting

### Common Issues

#### 1. Insufficient SOL Balance

```bash
# Error: Insufficient funds
# Solution: Airdrop more SOL
solana airdrop 10 -k test-player1.json
```

#### 2. Program Not Deployed

```bash
# Error: Program account not found
# Solution: Deploy program
anchor deploy --provider.cluster devnet
```

#### 3. Account Not Found

```bash
# Error: Account does not exist
# Solution: Initialize platform
node scripts/init-platform-devnet.js
```

#### 4. Transaction Timeout

```bash
# Error: Transaction confirmation timeout
# Solution: Increase timeout or retry
# Add to Anchor.toml:
[provider]
timeout = 60000
```

### Debug Mode

```bash
# Enable debug logging
export RUST_LOG=debug
export ANCHOR_LOG=debug

# Run tests with debug output
anchor test --skip-local-validator
```

## Auditor Access

### Provided Resources

1. **Test Accounts**: `test-player1.json`, `test-player2.json`
2. **Program ID**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
3. **RPC Endpoint**: `https://api.devnet.solana.com`
4. **Test Scripts**: All scripts in `scripts/` directory
5. **Documentation**: All docs in `docs/` directory

### Auditor Workflow

1. **Setup Environment**: Follow setup instructions above
2. **Review Code**: Read smart contract code in `programs/magic-roulette/src/`
3. **Run Tests**: Execute all test suites
4. **Manual Testing**: Use test scripts to interact with program
5. **Security Testing**: Attempt exploit scenarios
6. **Report Findings**: Document vulnerabilities and recommendations

## Support

### Technical Support

- **Documentation**: See `docs/` directory
- **GitHub Issues**: <repository-issues-url>
- **Technical Lead**: <contact-email>

### Additional Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [MagicBlock Documentation](https://docs.magicblock.gg/)
- [Kamino Documentation](https://docs.kamino.finance/)
- [Squads Documentation](https://docs.squads.so/)

## Conclusion

This test environment provides a complete setup for auditing Magic Roulette smart contracts. All necessary tools, test accounts, and scripts are provided for comprehensive security testing.

**Next Steps**: Review [Audit Scope](./audit-scope.md) and [Smart Contract Instructions](./smart-contract-instructions.md) to begin audit.
