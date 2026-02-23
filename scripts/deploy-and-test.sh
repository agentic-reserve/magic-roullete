#!/bin/bash

# Magic Roulette - Complete Deployment and Testing Script
# This script handles: Build -> Deploy -> Test -> Verify

set -e  # Exit on error

echo "🚀 Magic Roulette - Deployment & Testing Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
CLUSTER="localnet"
RPC_URL="http://localhost:8899"
PROGRAM_NAME="magic_roulette"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Cluster: $CLUSTER"
echo "   RPC URL: $RPC_URL"
echo "   Program: $PROGRAM_NAME"
echo ""

# Step 1: Check Solana CLI
echo -e "${BLUE}1️⃣  Checking Solana CLI...${NC}"
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first.${NC}"
    exit 1
fi

SOLANA_VERSION=$(solana --version | awk '{print $2}')
echo -e "${GREEN}✅ Solana CLI found: $SOLANA_VERSION${NC}"
echo ""

# Step 2: Check local validator
echo -e "${BLUE}2️⃣  Checking local validator...${NC}"
if ! solana cluster-version --url $RPC_URL &> /dev/null; then
    echo -e "${YELLOW}⚠️  Local validator not running${NC}"
    echo "   Starting local validator..."
    
    # Start validator in background
    solana-test-validator \
        --reset \
        --quiet \
        --bpf-program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb BPFLoaderUpgradeab1e11111111111111111111111 \
        > validator.log 2>&1 &
    
    VALIDATOR_PID=$!
    echo "   Validator PID: $VALIDATOR_PID"
    
    # Wait for validator to be ready
    echo "   Waiting for validator to be ready..."
    sleep 10
    
    # Verify validator is running
    if ! solana cluster-version --url $RPC_URL &> /dev/null; then
        echo -e "${RED}❌ Failed to start validator${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Local validator is running${NC}"
solana config get
echo ""

# Step 3: Check wallet balance
echo -e "${BLUE}3️⃣  Checking wallet balance...${NC}"
WALLET_ADDRESS=$(solana address)
BALANCE=$(solana balance --url $RPC_URL | awk '{print $1}')

echo "   Wallet: $WALLET_ADDRESS"
echo "   Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 10" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance, requesting airdrop...${NC}"
    solana airdrop 100 --url $RPC_URL
    sleep 2
    BALANCE=$(solana balance --url $RPC_URL | awk '{print $1}')
    echo "   New balance: $BALANCE SOL"
fi

echo -e "${GREEN}✅ Wallet funded${NC}"
echo ""

# Step 4: Install dependencies
echo -e "${BLUE}4️⃣  Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   Running npm install..."
    npm install
else
    echo "   Dependencies already installed"
fi
echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Step 5: Build program
echo -e "${BLUE}5️⃣  Building Anchor program...${NC}"
echo "   This may take a few minutes..."

if anchor build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/$PROGRAM_NAME-keypair.json)
echo "   Program ID: $PROGRAM_ID"
echo ""

# Step 6: Deploy program
echo -e "${BLUE}6️⃣  Deploying program to $CLUSTER...${NC}"

if anchor deploy --provider.cluster $CLUSTER; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
    echo "   Program ID: $PROGRAM_ID"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
echo ""

# Step 7: Verify deployment
echo -e "${BLUE}7️⃣  Verifying deployment...${NC}"

if solana program show $PROGRAM_ID --url $RPC_URL &> /dev/null; then
    echo -e "${GREEN}✅ Program deployed and verified${NC}"
    solana program show $PROGRAM_ID --url $RPC_URL
else
    echo -e "${RED}❌ Program verification failed${NC}"
    exit 1
fi
echo ""

# Step 8: Run tests
echo -e "${BLUE}8️⃣  Running comprehensive tests...${NC}"
echo ""

if anchor test --skip-local-validator --skip-build --skip-deploy; then
    echo ""
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
echo ""

# Step 9: Generate IDL
echo -e "${BLUE}9️⃣  Generating IDL...${NC}"

if [ -f "target/idl/$PROGRAM_NAME.json" ]; then
    echo "   IDL location: target/idl/$PROGRAM_NAME.json"
    echo "   IDL size: $(wc -c < target/idl/$PROGRAM_NAME.json) bytes"
    echo -e "${GREEN}✅ IDL generated${NC}"
else
    echo -e "${YELLOW}⚠️  IDL not found${NC}"
fi
echo ""

# Step 10: Summary
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "📝 Deployment Summary:"
echo "   Program ID: $PROGRAM_ID"
echo "   Cluster: $CLUSTER"
echo "   RPC URL: $RPC_URL"
echo "   Wallet: $WALLET_ADDRESS"
echo "   Balance: $(solana balance --url $RPC_URL)"
echo ""
echo "🔗 Useful Commands:"
echo "   View logs: solana logs $PROGRAM_ID --url $RPC_URL"
echo "   Check program: solana program show $PROGRAM_ID --url $RPC_URL"
echo "   Run tests: anchor test --skip-local-validator"
echo ""
echo "📚 Next Steps:"
echo "   1. Test MagicBlock ER integration on devnet"
echo "   2. Configure VRF plugin"
echo "   3. Setup Kamino lending integration"
echo "   4. Enable Light Protocol compression"
echo "   5. Deploy to mainnet"
echo ""
echo -e "${GREEN}✅ Ready for production!${NC}"
echo ""
