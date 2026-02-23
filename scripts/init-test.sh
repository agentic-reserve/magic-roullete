#!/bin/bash

echo "🚀 Magic Roulette - Initialize & Test"
echo "====================================="
echo ""

# Get program info
echo "📋 Program Information:"
PROGRAM_ID="HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam"
echo "Program ID: $PROGRAM_ID"

solana program show $PROGRAM_ID

echo ""
echo "📋 Wallet Information:"
WALLET=$(solana address)
echo "Wallet: $WALLET"

BALANCE=$(solana balance)
echo "Balance: $BALANCE"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Run 'anchor test --skip-local-validator' to test the program"
echo "2. Or use the TypeScript client in client/example.ts"
echo "3. Or interact directly with 'solana program invoke'"
