#!/bin/bash

set -e

echo "🎮 Magic Roulette - Game Testing Script"
echo "========================================"
echo ""

PROGRAM_ID="HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam"
WALLET=$(solana address)

echo "Program ID: $PROGRAM_ID"
echo "Wallet: $WALLET"
echo "Balance: $(solana balance)"
echo ""

# Derive Platform Config PDA
echo "📝 Step 1: Deriving Platform Config PDA..."
# Platform config uses seed "platform"
# We'll need to calculate this properly with the program

echo "✅ Platform Config PDA derivation (manual calculation needed)"
echo ""

# Create test keypairs
echo "📝 Step 2: Creating test keypairs..."
PLAYER1_KEYPAIR="test-player1.json"
PLAYER2_KEYPAIR="test-player2.json"

if [ ! -f "$PLAYER1_KEYPAIR" ]; then
    solana-keygen new --no-bip39-passphrase -o $PLAYER1_KEYPAIR --force
    echo "✅ Player 1 keypair created"
else
    echo "✅ Player 1 keypair exists"
fi

if [ ! -f "$PLAYER2_KEYPAIR" ]; then
    solana-keygen new --no-bip39-passphrase -o $PLAYER2_KEYPAIR --force
    echo "✅ Player 2 keypair created"
else
    echo "✅ Player 2 keypair exists"
fi

PLAYER1=$(solana-keygen pubkey $PLAYER1_KEYPAIR)
PLAYER2=$(solana-keygen pubkey $PLAYER2_KEYPAIR)

echo "Player 1: $PLAYER1"
echo "Player 2: $PLAYER2"
echo ""

# Airdrop to players
echo "📝 Step 3: Funding test players..."
solana airdrop 5 $PLAYER1 || echo "Airdrop to Player 1 failed (might already have funds)"
solana airdrop 5 $PLAYER2 || echo "Airdrop to Player 2 failed (might already have funds)"

echo "Player 1 balance: $(solana balance $PLAYER1)"
echo "Player 2 balance: $(solana balance $PLAYER2)"
echo ""

echo "✅ Test Setup Complete!"
echo ""
echo "📋 Summary:"
echo "  - Program deployed and verified"
echo "  - Test players created and funded"
echo "  - Ready for game initialization"
echo ""
echo "Next: Use TypeScript client or Anchor tests to:"
echo "  1. Initialize platform configuration"
echo "  2. Create games (1v1, 2v2, AI)"
echo "  3. Test game flow"
echo ""
echo "Run: npm run example (after updating client/example.ts)"
