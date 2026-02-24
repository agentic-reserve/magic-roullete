#!/bin/bash

# Magic Roulette - MagicBlock Upgrade Script
# This script upgrades the deployed program with MagicBlock features

set -e  # Exit on error

PROGRAM_ID="HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam"
CLUSTER="devnet"
BACKUP_DIR="backups"

echo "🚀 Magic Roulette - MagicBlock Upgrade Script"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pre-flight checks
echo "📋 Step 1: Pre-flight checks..."
echo ""

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Solana CLI found${NC}"

# Check Anchor CLI
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Anchor CLI found${NC}"

# Check network
CURRENT_CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "   Current cluster: $CURRENT_CLUSTER"

# Check wallet
WALLET_ADDRESS=$(solana address)
echo "   Wallet address: $WALLET_ADDRESS"

# Check balance
BALANCE=$(solana balance --url $CLUSTER | awk '{print $1}')
echo "   Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 0.5" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance. You may need more SOL for upgrade.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Step 2: Backup current state
echo "💾 Step 2: Backing up current state..."
echo ""

mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup program binary
echo "   Backing up program binary..."
solana program dump $PROGRAM_ID \
    "$BACKUP_DIR/magic_roulette_$TIMESTAMP.so" \
    --url $CLUSTER

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Program binary backed up${NC}"
else
    echo -e "${RED}❌ Failed to backup program binary${NC}"
    exit 1
fi

# Backup IDL
echo "   Backing up IDL..."
anchor idl fetch $PROGRAM_ID \
    --provider.cluster $CLUSTER > "$BACKUP_DIR/idl_$TIMESTAMP.json" 2>/dev/null || true

if [ -f "$BACKUP_DIR/idl_$TIMESTAMP.json" ]; then
    echo -e "${GREEN}✅ IDL backed up${NC}"
else
    echo -e "${YELLOW}⚠️  IDL backup skipped (may not exist yet)${NC}"
fi

echo ""

# Step 3: Build program
echo "🔨 Step 3: Building program with MagicBlock features..."
echo ""

# Clean previous build
echo "   Cleaning previous build..."
anchor clean

# Build
echo "   Building program..."
anchor build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Verify program ID
BUILT_PROGRAM_ID=$(solana address -k target/deploy/magic_roulette-keypair.json)
if [ "$BUILT_PROGRAM_ID" != "$PROGRAM_ID" ]; then
    echo -e "${RED}❌ Program ID mismatch!${NC}"
    echo "   Expected: $PROGRAM_ID"
    echo "   Got: $BUILT_PROGRAM_ID"
    exit 1
fi
echo -e "${GREEN}✅ Program ID verified${NC}"

# Check binary size
BINARY_SIZE=$(ls -lh target/deploy/magic_roulette.so | awk '{print $5}')
echo "   Binary size: $BINARY_SIZE"

echo ""

# Step 4: Confirm upgrade
echo "⚠️  Step 4: Confirm upgrade"
echo ""
echo "   Program ID: $PROGRAM_ID"
echo "   Cluster: $CLUSTER"
echo "   Wallet: $WALLET_ADDRESS"
echo "   Binary size: $BINARY_SIZE"
echo ""
read -p "Proceed with upgrade? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Upgrade cancelled."
    exit 0
fi

echo ""

# Step 5: Upgrade program
echo "🚀 Step 5: Upgrading program..."
echo ""

anchor upgrade target/deploy/magic_roulette.so \
    --program-id $PROGRAM_ID \
    --provider.cluster $CLUSTER

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Program upgraded successfully${NC}"
else
    echo -e "${RED}❌ Program upgrade failed${NC}"
    echo ""
    echo "To rollback, run:"
    echo "solana program deploy $BACKUP_DIR/magic_roulette_$TIMESTAMP.so \\"
    echo "  --program-id target/deploy/magic_roulette-keypair.json \\"
    echo "  --upgrade-authority ~/.config/solana/id.json \\"
    echo "  --url $CLUSTER"
    exit 1
fi

echo ""

# Step 6: Update IDL
echo "📝 Step 6: Updating IDL..."
echo ""

anchor idl upgrade $PROGRAM_ID \
    --filepath target/idl/magic_roulette.json \
    --provider.cluster $CLUSTER

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ IDL updated successfully${NC}"
else
    echo -e "${YELLOW}⚠️  IDL update failed (may need to init first)${NC}"
    echo "   Trying to initialize IDL..."
    
    anchor idl init $PROGRAM_ID \
        --filepath target/idl/magic_roulette.json \
        --provider.cluster $CLUSTER
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ IDL initialized successfully${NC}"
    else
        echo -e "${RED}❌ IDL initialization failed${NC}"
    fi
fi

echo ""

# Step 7: Verify upgrade
echo "✅ Step 7: Verifying upgrade..."
echo ""

# Check program info
echo "   Fetching program info..."
solana program show $PROGRAM_ID --url $CLUSTER

echo ""

# Fetch and check IDL
echo "   Checking for new instructions..."
anchor idl fetch $PROGRAM_ID \
    --provider.cluster $CLUSTER > /tmp/current_idl.json 2>/dev/null || true

if [ -f /tmp/current_idl.json ]; then
    if grep -q "delegate_game" /tmp/current_idl.json; then
        echo -e "${GREEN}✅ delegate_game instruction found${NC}"
    else
        echo -e "${YELLOW}⚠️  delegate_game instruction not found${NC}"
    fi
    
    if grep -q "commit_game" /tmp/current_idl.json; then
        echo -e "${GREEN}✅ commit_game instruction found${NC}"
    else
        echo -e "${YELLOW}⚠️  commit_game instruction not found${NC}"
    fi
    
    if grep -q "undelegate_game" /tmp/current_idl.json; then
        echo -e "${GREEN}✅ undelegate_game instruction found${NC}"
    else
        echo -e "${YELLOW}⚠️  undelegate_game instruction not found${NC}"
    fi
fi

echo ""

# Step 8: Summary
echo "🎉 Upgrade Complete!"
echo "===================="
echo ""
echo "Program ID: $PROGRAM_ID"
echo "Cluster: $CLUSTER"
echo "Backup location: $BACKUP_DIR/"
echo ""
echo "Next steps:"
echo "1. Test new instructions with: ts-node scripts/test-magicblock-upgrade.ts"
echo "2. Update mobile app client code"
echo "3. Test end-to-end flow"
echo ""
echo "Backup files:"
echo "- Program: $BACKUP_DIR/magic_roulette_$TIMESTAMP.so"
echo "- IDL: $BACKUP_DIR/idl_$TIMESTAMP.json"
echo ""
echo "To rollback if needed:"
echo "solana program deploy $BACKUP_DIR/magic_roulette_$TIMESTAMP.so \\"
echo "  --program-id target/deploy/magic_roulette-keypair.json \\"
echo "  --upgrade-authority ~/.config/solana/id.json \\"
echo "  --url $CLUSTER"
echo ""
echo -e "${GREEN}✅ All done!${NC}"
