#!/bin/bash

set -e

echo "🚀 Magic Roulette - Devnet Deployment"
echo "======================================"
echo ""

# Load environment variables
if [ -f .env.devnet ]; then
    export $(cat .env.devnet | grep -v '^#' | xargs)
fi

# Check Solana config
echo "📋 Checking Solana Configuration..."
CURRENT_CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "Current RPC: $CURRENT_CLUSTER"

# Update to Helius devnet RPC
echo ""
echo "📝 Updating Solana config to use Helius RPC..."
solana config set --url https://brooks-dn4q23-fast-devnet.helius-rpc.com

# Check wallet
WALLET=$(solana address)
echo ""
echo "📋 Wallet Information:"
echo "Address: $WALLET"

BALANCE=$(solana balance)
echo "Balance: $BALANCE"

# Check if we have enough SOL
BALANCE_LAMPORTS=$(solana balance --lamports | awk '{print $1}')
MIN_BALANCE=2000000000  # 2 SOL minimum

if [ "$BALANCE_LAMPORTS" -lt "$MIN_BALANCE" ]; then
    echo ""
    echo "⚠️  Insufficient balance for deployment!"
    echo "Minimum required: 2 SOL"
    echo "Current balance: $(echo "scale=2; $BALANCE_LAMPORTS / 1000000000" | bc) SOL"
    echo ""
    echo "Please fund your wallet:"
    echo "1. Use devnet-pow: devnet-pow mine --target-lamports 2000000000 -ud"
    echo "2. Or use faucet: solana airdrop 2"
    echo "3. Or use web faucet: https://faucet.solana.com"
    exit 1
fi

# Build the program
echo ""
echo "🔨 Building program..."
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/magic_roulette-keypair.json)
echo ""
echo "📋 Program ID: $PROGRAM_ID"

# Update Anchor.toml with program ID
echo ""
echo "📝 Updating Anchor.toml..."
sed -i "s/magic_roulette = \".*\"/magic_roulette = \"$PROGRAM_ID\"/" Anchor.toml

# Deploy to devnet
echo ""
echo "🚀 Deploying to devnet..."
anchor deploy --provider.cluster devnet

# Verify deployment
echo ""
echo "✅ Verifying deployment..."
solana program show $PROGRAM_ID

# Update .env.devnet with deployed program ID
echo ""
echo "📝 Updating .env.devnet..."
sed -i "s/PROGRAM_ID=.*/PROGRAM_ID=$PROGRAM_ID/" .env.devnet

echo ""
echo "✨ Deployment Complete!"
echo "======================================"
echo "Program ID: $PROGRAM_ID"
echo "Network: Devnet"
echo "RPC: https://brooks-dn4q23-fast-devnet.helius-rpc.com"
echo ""
echo "Next steps:"
echo "1. Initialize platform: node scripts/init-platform-devnet.js"
echo "2. Create test games"
echo "3. Test wallet integration"
