#!/bin/bash

# Script to update MagicBlock program IDs
# Run this after getting the correct IDs from MagicBlock documentation

echo "🔍 Fetching MagicBlock Program IDs..."
echo ""
echo "📚 MagicBlock Resources:"
echo "   Documentation: https://docs.magicblock.gg/"
echo "   Discord: https://discord.gg/magicblock"
echo "   GitHub: https://github.com/magicblock-labs"
echo ""
echo "⚠️  You need to manually update the following constants in:"
echo "   programs/magic-roulette/src/constants.rs"
echo ""
echo "Required Program IDs:"
echo "   1. MAGICBLOCK_VRF_PROGRAM_ID (VRF Plugin)"
echo "   2. MAGICBLOCK_DELEGATION_PROGRAM_ID (Ephemeral Rollups)"
echo ""
echo "Current placeholder values:"
echo "   VRF: 0x00...01"
echo "   Delegation: 0x00...02"
echo ""
echo "After updating, rebuild and redeploy:"
echo "   cargo build-sbf"
echo "   solana program deploy target/deploy/magic_roulette.so \\"
echo "     --program-id target/deploy/magic_roulette-keypair.json \\"
echo "     --upgrade-authority ~/.config/solana/id.json"
echo ""
