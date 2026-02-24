# Magic Roulette - Deployment Guide

**Status:** ✅ Code Ready for Deployment  
**Build Status:** ✅ Cargo Build Passing  
**Security:** ✅ All Critical Issues Fixed

---

## Prerequisites

### 1. Install/Update Solana CLI

```bash
# Install Solana CLI (if not installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Or update existing installation
solana-install update

# Verify installation
solana --version
# Should show: solana-cli 1.18.x or higher
```

### 2. Install/Update Anchor

```bash
# Install Anchor (if not installed)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installation
anchor --version
# Should show: anchor-cli 0.30.x or higher
```

### 3. Configure Solana for Devnet

```bash
# Set to devnet
solana config set --url devnet

# Create/check wallet
solana-keygen new --outfile ~/.config/solana/id.json
# Or use existing: solana address

# Get devnet SOL (airdrop)
solana airdrop 2
solana balance
```

---

## Deployment Steps

### Step 1: Build the Program

```bash
# Clean previous builds
anchor clean

# Build the program
anchor build

# This creates:
# - target/deploy/magic_roulette.so (program binary)
# - target/idl/magic_roulette.json (IDL for clients)
```

### Step 2: Get Program ID

```bash
# Get the program ID from the keypair
solana address -k target/deploy/magic_roulette-keypair.json

# Example output: HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
```

### Step 3: Update Program ID in Code

Update the program ID in two places:

**File: `programs/magic-roulette/src/lib.rs`**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**File: `Anchor.toml`**
```toml
[programs.devnet]
magic_roulette = "YOUR_PROGRAM_ID_HERE"
```

### Step 4: Rebuild with Correct Program ID

```bash
# Rebuild with updated program ID
anchor build
```

### Step 5: Deploy to Devnet

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# This will:
# 1. Upload the program binary
# 2. Create the program account
# 3. Set you as the upgrade authority
```

### Step 6: Verify Deployment

```bash
# Check program account
solana program show YOUR_PROGRAM_ID

# Should show:
# - Program Id: YOUR_PROGRAM_ID
# - Owner: BPFLoaderUpgradeable
# - ProgramData Address: ...
# - Authority: YOUR_WALLET
# - Last Deployed In Slot: ...
# - Data Length: ... bytes
```

---

## Update MagicBlock Program IDs

Before testing, update the placeholder program IDs in `programs/magic-roulette/src/constants.rs`:

```rust
// Get these from MagicBlock documentation
pub const MAGICBLOCK_VRF_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    // Replace with actual MagicBlock VRF program ID
]);

pub const MAGICBLOCK_DELEGATION_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    // Replace with actual MagicBlock delegation program ID
]);
```

**Where to find MagicBlock program IDs:**
- MagicBlock Documentation: https://docs.magicblock.gg/
- MagicBlock Discord: Ask in #developers channel
- MagicBlock GitHub: Check example code

After updating, rebuild and redeploy:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

---

## Initialize Platform

After deployment, initialize the platform configuration:

```bash
# Run initialization script
anchor run initialize-devnet

# Or manually with anchor client
```

**Create initialization script: `scripts/initialize-platform.ts`**

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;

  // Platform configuration PDA
  const [platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  // Initialize platform
  const tx = await program.methods
    .initializePlatform(
      500,  // 5% platform fee
      1000  // 10% treasury fee
    )
    .accounts({
      platformConfig,
      authority: provider.wallet.publicKey,
      treasury: provider.wallet.publicKey, // Use your wallet for now
      platformMint: anchor.web3.PublicKey.default, // Update with actual mint
    })
    .rpc();

  console.log("✅ Platform initialized!");
  console.log("   Transaction:", tx);
  console.log("   Platform Config:", platformConfig.toString());
}

main().catch(console.error);
```

Run it:
```bash
ts-node scripts/initialize-platform.ts
```

---

## Testing on Devnet

### Test 1: Create a Game

```typescript
// scripts/test-create-game.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;

  const [platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  // Get total games count
  const platform = await program.account.platformConfig.fetch(platformConfig);
  const gameId = platform.totalGames;

  const [game] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [gameVault] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), game.toBuffer()],
    program.programId
  );

  // Create game with SOL
  const tx = await program.methods
    .createGameSol(
      { oneVsOne: {} },  // Game mode
      new anchor.BN(10_000_000),  // 0.01 SOL entry fee
      Array(32).fill(0)  // VRF seed
    )
    .accounts({
      game,
      platformConfig,
      creator: provider.wallet.publicKey,
      gameVault,
    })
    .rpc();

  console.log("✅ Game created!");
  console.log("   Transaction:", tx);
  console.log("   Game ID:", gameId.toString());
  console.log("   Game PDA:", game.toString());
}

main().catch(console.error);
```

### Test 2: Join a Game

```typescript
// scripts/test-join-game.ts
// Similar structure - join an existing game
```

---

## Monitoring & Debugging

### View Program Logs

```bash
# Watch program logs in real-time
solana logs YOUR_PROGRAM_ID

# Or view specific transaction
solana confirm -v TRANSACTION_SIGNATURE
```

### Check Account Data

```bash
# View game account
solana account GAME_PDA_ADDRESS

# View platform config
solana account PLATFORM_CONFIG_PDA
```

### Common Issues

**Issue: "Insufficient funds"**
```bash
# Get more devnet SOL
solana airdrop 2
```

**Issue: "Program account not found"**
```bash
# Verify deployment
solana program show YOUR_PROGRAM_ID
```

**Issue: "Account already in use"**
```bash
# Close and recreate account, or use different seed
```

---

## Upgrade Program

After making changes:

```bash
# Rebuild
anchor build

# Upgrade (not redeploy)
anchor upgrade target/deploy/magic_roulette.so --program-id YOUR_PROGRAM_ID --provider.cluster devnet

# Verify upgrade
solana program show YOUR_PROGRAM_ID
# Check "Last Deployed In Slot" - should be recent
```

---

## Cost Estimates

### Devnet (Free)
- Deployment: Free (devnet SOL)
- Transactions: Free (devnet SOL)
- Testing: Unlimited

### Mainnet
- Program Deployment: ~5-10 SOL (one-time)
- Program Account Rent: ~15 SOL (refundable)
- Transaction Fees: ~0.000005 SOL per transaction
- Account Creation: ~0.002 SOL per account

---

## Security Checklist Before Mainnet

- [ ] External security audit completed
- [ ] All audit findings resolved
- [ ] Comprehensive test suite passing
- [ ] Bug bounty program launched
- [ ] MagicBlock program IDs updated with mainnet values
- [ ] Kamino program ID verified for mainnet
- [ ] Emergency pause mechanism tested
- [ ] Upgrade authority secured (multisig recommended)
- [ ] Monitoring and alerting set up
- [ ] Documentation complete

---

## Next Steps After Deployment

1. **Test All Flows**
   - Create games (1v1, 2v2, AI)
   - Join games
   - Delegate to ER
   - Play games
   - Finalize and distribute prizes

2. **Test Security Validations**
   - Try to use wrong program IDs (should fail)
   - Try to inject fake VRF (should fail)
   - Try to steal prizes (should fail)
   - Try to bypass pause (should fail)

3. **Performance Testing**
   - Create multiple games
   - Test concurrent gameplay
   - Measure transaction times
   - Test ER latency

4. **Integration Testing**
   - MagicBlock ER delegation
   - VRF randomness generation
   - Kamino loan integration
   - Token-2022 transfers

5. **Frontend Development**
   - Connect to deployed program
   - Test wallet integration
   - Build game UI
   - Add real-time updates

---

## Useful Commands

```bash
# Check Solana config
solana config get

# Check wallet balance
solana balance

# Get devnet SOL
solana airdrop 2

# View program
solana program show YOUR_PROGRAM_ID

# View account
solana account ACCOUNT_ADDRESS

# Watch logs
solana logs YOUR_PROGRAM_ID

# Deploy
anchor deploy --provider.cluster devnet

# Upgrade
anchor upgrade target/deploy/magic_roulette.so --program-id YOUR_PROGRAM_ID

# Test
anchor test --skip-local-validator

# Build IDL
anchor idl init --filepath target/idl/magic_roulette.json YOUR_PROGRAM_ID
```

---

## Support & Resources

- **Solana Docs:** https://docs.solana.com/
- **Anchor Docs:** https://www.anchor-lang.com/
- **MagicBlock Docs:** https://docs.magicblock.gg/
- **Kamino Docs:** https://docs.kamino.finance/
- **Solana Discord:** https://discord.gg/solana
- **Anchor Discord:** https://discord.gg/anchorlang

---

**Deployment Guide Version:** 1.0  
**Last Updated:** February 23, 2026  
**Status:** Ready for Devnet Deployment
