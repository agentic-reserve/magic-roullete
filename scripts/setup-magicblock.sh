#!/bin/bash

# Magic Roulette - MagicBlock Setup Script
# This script helps you set up MagicBlock Ephemeral Rollups integration

set -e

echo "🎮 Magic Roulette - MagicBlock Setup"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in project root
if [ ! -f "Anchor.toml" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

echo "📦 Step 1: Installing Dependencies"
echo "-----------------------------------"

# Update Cargo.toml
echo "Updating Cargo.toml..."
if ! grep -q "ephemeral-rollups-sdk" programs/magic-roulette/Cargo.toml; then
    echo "Adding ephemeral-rollups-sdk to Cargo.toml..."
    # Backup original
    cp programs/magic-roulette/Cargo.toml programs/magic-roulette/Cargo.toml.backup
    
    # Add dependency (you'll need to manually verify this)
    echo ""
    echo -e "${YELLOW}⚠️  Manual step required:${NC}"
    echo "Add this to programs/magic-roulette/Cargo.toml [dependencies]:"
    echo ""
    echo 'ephemeral-rollups-sdk = { version = "0.6.5", features = ["anchor", "disable-realloc"] }'
    echo ""
    read -p "Press Enter when done..."
fi

# Install TypeScript dependencies
echo ""
echo "Installing TypeScript dependencies..."
if [ -f "package.json" ]; then
    npm install --save @magicblock-labs/ephemeral-rollups-sdk@^0.6.5
    npm install --save @magicblock-labs/ephemeral-rollups-kit@^0.6.5
    echo -e "${GREEN}✅ TypeScript dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  No package.json found, skipping npm install${NC}"
fi

echo ""
echo "📝 Step 2: Creating Integration Files"
echo "--------------------------------------"

# Create MagicBlock directory structure
mkdir -p app/src/lib/magicblock

# Create connection manager
if [ ! -f "app/src/lib/magicblock/connection-manager.ts" ]; then
    echo "Creating connection-manager.ts..."
    cat > app/src/lib/magicblock/connection-manager.ts << 'EOF'
import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { DELEGATION_PROGRAM_ID } from "@magicblock-labs/ephemeral-rollups-sdk";

export interface ConnectionConfig {
  baseRpcUrl: string;
  erRpcUrl: string;
  commitment?: Commitment;
}

export class MagicBlockConnectionManager {
  public readonly baseConnection: Connection;
  public readonly erConnection: Connection;
  private readonly commitment: Commitment;

  constructor(config: ConnectionConfig) {
    this.commitment = config.commitment || "confirmed";
    this.baseConnection = new Connection(config.baseRpcUrl, this.commitment);
    this.erConnection = new Connection(config.erRpcUrl, {
      commitment: this.commitment,
      confirmTransactionInitialTimeout: 60000,
    });
  }

  async isDelegated(pubkey: PublicKey): Promise<boolean> {
    const info = await this.baseConnection.getAccountInfo(pubkey);
    return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
  }

  async getConnectionForAccount(pubkey: PublicKey): Promise<Connection> {
    const delegated = await this.isDelegated(pubkey);
    return delegated ? this.erConnection : this.baseConnection;
  }

  createBaseProvider(wallet: Wallet): AnchorProvider {
    return new AnchorProvider(this.baseConnection, wallet, {
      commitment: this.commitment,
    });
  }

  createERProvider(wallet: Wallet): AnchorProvider {
    return new AnchorProvider(this.erConnection, wallet, {
      commitment: this.commitment,
      skipPreflight: true,
    });
  }
}

export const DEVNET_CONFIG: ConnectionConfig = {
  baseRpcUrl: "https://api.devnet.solana.com",
  erRpcUrl: "https://devnet.magicblock.app",
  commitment: "confirmed",
};

export const MAINNET_CONFIG: ConnectionConfig = {
  baseRpcUrl: "https://api.mainnet-beta.solana.com",
  erRpcUrl: "https://mainnet.magicblock.app",
  commitment: "confirmed",
};
EOF
    echo -e "${GREEN}✅ Created connection-manager.ts${NC}"
fi

echo ""
echo "🔧 Step 3: Program Updates Required"
echo "------------------------------------"
echo ""
echo "You need to manually update your Rust program:"
echo ""
echo "1. Add to programs/magic-roulette/src/lib.rs:"
echo "   use ephemeral_rollups_sdk::anchor::{delegate_account, commit_accounts, ephemeral};"
echo "   use ephemeral_rollups_sdk::cpi::DelegationProgram;"
echo ""
echo "2. Add #[ephemeral] macro before #[program]:"
echo "   #[ephemeral]"
echo "   #[program]"
echo "   pub mod magic_roulette {"
echo ""
echo "3. Update delegate_game instruction with #[delegate] macro"
echo "4. Add commit_game instruction with #[commit] macro"
echo "5. Update undelegate_game instruction with #[commit] macro"
echo ""
echo "See MAGICBLOCK_INTEGRATION_GUIDE.md for complete code examples"
echo ""

echo "📚 Step 4: Documentation"
echo "------------------------"
echo ""
echo "Complete integration guide: MAGICBLOCK_INTEGRATION_GUIDE.md"
echo "MagicBlock docs: https://docs.magicblock.gg"
echo "Examples: https://github.com/magicblock-labs/magicblock-engine-examples"
echo ""

echo "🎯 Step 5: Next Steps"
echo "---------------------"
echo ""
echo "1. Review MAGICBLOCK_INTEGRATION_GUIDE.md"
echo "2. Update your Rust program code"
echo "3. Rebuild your program: anchor build"
echo "4. Test on devnet"
echo "5. Deploy to mainnet"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "For support, join MagicBlock Discord: https://discord.com/invite/MBkdC3gxcv"
