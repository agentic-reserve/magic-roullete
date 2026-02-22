#!/bin/bash

# Magic Roulette Setup Script
# This script sets up the development environment for Magic Roulette

set -e

echo "🎰 Magic Roulette Setup Script"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Solana
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi
SOLANA_VERSION=$(solana --version | awk '{print $2}')
echo "✅ Solana CLI: $SOLANA_VERSION"

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust not found. Please install: https://rustup.rs/"
    exit 1
fi
RUST_VERSION=$(rustc --version | awk '{print $2}')
echo "✅ Rust: $RUST_VERSION"

# Check Anchor
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor not found. Please install: cargo install --git https://github.com/coral-xyz/anchor anchor-cli"
    exit 1
fi
ANCHOR_VERSION=$(anchor --version | awk '{print $2}')
echo "✅ Anchor: $ANCHOR_VERSION"

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install app dependencies
cd app
npm install
cd ..

echo ""
echo "🔨 Building program..."

# Build Anchor program
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/magic_roulette-keypair.json)
echo "📝 Program ID: $PROGRAM_ID"

echo ""
echo "⚙️  Configuring Solana..."

# Set to devnet
solana config set --url devnet

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💰 Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Update program ID in:"
echo "   - Anchor.toml"
echo "   - programs/magic-roulette/src/lib.rs"
echo "   - app/src/lib/magic-roulette-sdk.ts"
echo ""
echo "2. Rebuild: anchor build"
echo ""
echo "3. Deploy: anchor deploy --provider.cluster devnet"
echo ""
echo "4. Initialize platform: ts-node scripts/initialize.ts"
echo ""
echo "5. Run tests: anchor test"
echo ""
echo "6. Start frontend: cd app && npm run dev"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions"
