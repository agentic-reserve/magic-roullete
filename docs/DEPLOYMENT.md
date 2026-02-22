# Magic Roulette Deployment Guide

## Prerequisites

Ensure you have the correct versions installed:

```bash
solana --version  # Should be 2.3.13
rustc --version   # Should be 1.85.0
anchor --version  # Should be 0.32.1
node --version    # Should be 24.10.0
```

## Step 1: Build the Program

```bash
# Install dependencies
npm install

# Build the Anchor program
anchor build

# Get the program ID
solana address -k target/deploy/magic_roulette-keypair.json
```

Update the program ID in:
- `Anchor.toml` (programs.devnet section)
- `programs/magic-roulette/src/lib.rs` (declare_id! macro)
- `app/src/lib/magic-roulette-sdk.ts` (MAGIC_ROULETTE_PROGRAM_ID)

Rebuild after updating:
```bash
anchor build
```

## Step 2: Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Airdrop SOL for deployment (if needed)
solana airdrop 5

# Deploy the program
anchor deploy --provider.cluster devnet
```

## Step 3: Create Token-2022 Mint with Light Protocol

```bash
# Install Light Protocol CLI
npm install -g @lightprotocol/zk-compression-cli

# Create compressed token mint
light create-mint \
  --decimals 9 \
  --mint-authority YOUR_WALLET \
  --cluster devnet
```

Save the mint address for initialization.

## Step 4: Initialize Platform

Create a script `scripts/initialize.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { MagicRouletteSDK } from "../app/src/lib/magic-roulette-sdk";
import idl from "../target/idl/magic_roulette.json";

async function main() {
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet;
  
  const sdk = new MagicRouletteSDK(
    "https://devnet.helius-rpc.com?api-key=YOUR_KEY",
    "https://devnet-router.magicblock.app",
    wallet,
    idl
  );
  
  const treasury = Keypair.generate();
  console.log("Treasury:", treasury.publicKey.toBase58());
  
  const { tx, platformConfig } = await sdk.initializePlatform(
    wallet.payer,
    treasury.publicKey,
    500,  // 5% platform fee
    1000  // 10% treasury fee
  );
  
  console.log("Platform initialized:", tx);
  console.log("Platform config:", platformConfig.toBase58());
}

main();
```

Run:
```bash
ts-node scripts/initialize.ts
```

## Step 5: Setup MagicBlock VRF

1. Visit https://docs.magicblock.gg/VRF/getting-started
2. Request VRF access for your program
3. Integrate VRF callback in `process_vrf_result` instruction

## Step 6: Configure Private Ephemeral Rollup (PER)

For Intel TDX privacy:

1. Contact MagicBlock team for PER access
2. Configure PER endpoint in your app
3. Update ER connection URL to use TEE validator:
   ```typescript
   const erConnection = new Connection(
     "https://devnet.magicblock.app/tee"
   );
   ```

## Step 7: Deploy Frontend

```bash
cd app

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_RPC_ENDPOINT=https://devnet.helius-rpc.com?api-key=YOUR_KEY
NEXT_PUBLIC_ER_ENDPOINT=https://devnet-router.magicblock.app
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID
NEXT_PUBLIC_MINT=YOUR_COMPRESSED_MINT
EOF

# Build and deploy
npm run build
npm run start
```

## Step 8: Testing

Run integration tests:

```bash
# Run Anchor tests
anchor test

# Test with LiteSVM (fast)
cargo test-sbf

# Test delegation flow
npm run test:delegation
```

## Environment Variables

### Backend (.env)
```env
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
PROGRAM_ID=YourProgramId
MINT=YourCompressedMint
TREASURY=YourTreasuryPubkey
```

### Frontend (app/.env.local)
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://devnet.helius-rpc.com?api-key=YOUR_KEY
NEXT_PUBLIC_ER_ENDPOINT=https://devnet-router.magicblock.app
NEXT_PUBLIC_PROGRAM_ID=YourProgramId
NEXT_PUBLIC_MINT=YourCompressedMint
NEXT_PUBLIC_CLUSTER=devnet
```

## Monitoring

### Check Platform Stats
```bash
solana account PLATFORM_CONFIG_ADDRESS --output json
```

### Check Game State
```bash
solana account GAME_ADDRESS --output json
```

### Monitor ER Delegation
```bash
# Check if account is delegated
solana account GAME_ADDRESS | grep Owner
# Should show: Owner: SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7
```

## Troubleshooting

### Program Deployment Fails
- Ensure you have enough SOL (5+ SOL for deployment)
- Check program size: `ls -lh target/deploy/magic_roulette.so`
- If too large, optimize with `cargo build-sbf --release`

### Token-2022 Issues
- Verify Token-2022 program ID: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Check mint authority matches your wallet
- Ensure token accounts are created with Token-2022 program

### Light Protocol Errors
- Verify Helius RPC has ZK Compression enabled
- Check compressed token pool exists for mint
- Ensure sufficient compute units for proof verification

### Ephemeral Rollup Issues
- Verify delegation status before ER operations
- Use separate connections for base layer and ER
- Enable `skipPreflight: true` for ER transactions
- Check ER validator is online: https://status.magicblock.app

## Production Checklist

- [ ] Audit smart contract code
- [ ] Test all game scenarios (1v1, 2v2)
- [ ] Verify fee calculations
- [ ] Test VRF randomness integration
- [ ] Validate delegation/commit flow
- [ ] Load test with multiple concurrent games
- [ ] Setup monitoring and alerts
- [ ] Configure rate limiting
- [ ] Enable mainnet RPC endpoints
- [ ] Update program ID to mainnet deployment
- [ ] Verify treasury security
- [ ] Document emergency procedures

## Mainnet Deployment

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Deploy (requires ~10 SOL)
anchor deploy --provider.cluster mainnet

# Initialize platform
ts-node scripts/initialize.ts --cluster mainnet

# Update frontend env
NEXT_PUBLIC_CLUSTER=mainnet-beta
```

## Support

- MagicBlock Discord: https://discord.gg/magicblock
- Light Protocol Discord: https://discord.gg/lightprotocol
- Helius Discord: https://discord.gg/helius
