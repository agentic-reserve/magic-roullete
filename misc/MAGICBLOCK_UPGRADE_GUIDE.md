# MagicBlock Upgrade Guide - Existing Deployed Program

Panduan untuk upgrade program Magic Roulette yang sudah di-deploy dengan MagicBlock Ephemeral Rollups features.

## 📋 Current Deployment Status

- **Program ID:** `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Network:** Solana Devnet
- **Status:** ✅ DEPLOYED & LIVE
- **Upgrade Authority:** BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
- **Last Deployed:** Slot 444169214
- **Size:** 700KB (683 KB)

## ⚠️ Important Notes

1. **Program sudah di-deploy** - Kita akan melakukan UPGRADE, bukan deploy baru
2. **Program ID tetap sama** - `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
3. **Upgrade authority required** - Pastikan wallet Anda adalah upgrade authority
4. **Backward compatibility** - Existing games akan tetap berfungsi
5. **New features** - Delegation, commit, undelegate instructions akan ditambahkan

## 🔍 Pre-Upgrade Checklist

### 1. Verify Upgrade Authority

```bash
# Check current program info
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet

# Verify you are the upgrade authority
solana address
# Should match: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
```

### 2. Check Balance

```bash
# Check SOL balance (need ~0.5 SOL for upgrade)
solana balance --url devnet

# Get more if needed
solana airdrop 2 --url devnet
```

### 3. Backup Current State

```bash
# Save current program binary
solana program dump HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  backup_magic_roulette_$(date +%Y%m%d).so \
  --url devnet

# Save current IDL
anchor idl fetch HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet > backup_idl_$(date +%Y%m%d).json
```

## 🔧 Step 1: Update Program Code

### 1.1 Update lib.rs

File: `programs/magic-roulette/src/lib.rs`

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

declare_id!("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");

#[ephemeral]  // ✅ ADD THIS LINE
#[program]
pub mod magic_roulette {
    use super::*;
    
    // Import delegation module
    pub use crate::instructions::delegate::*;
    
    // ... existing instructions ...
    
    // ✅ ADD NEW INSTRUCTIONS
    pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()> {
        instructions::delegate::delegate_game(ctx)
    }
    
    pub fn commit_game(ctx: Context<CommitGame>) -> Result<()> {
        instructions::delegate::commit_game(ctx)
    }
    
    pub fn undelegate_game(ctx: Context<UndelegateGame>) -> Result<()> {
        instructions::delegate::undelegate_game(ctx)
    }
}
```

### 1.2 Update state.rs

File: `programs/magic-roulette/src/state.rs`

Add new status to GameStatus enum:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayers,
    Ready,
    Delegated,        // ✅ ADD THIS
    InProgress,
    Finished,
    Cancelled,
}
```

### 1.3 Update delegate.rs

File: `programs/magic-roulette/src/instructions/delegate.rs`

Replace entire content with the implementation from `MAGICBLOCK_IMPLEMENTATION_STEPS.md` Step 1.2.

### 1.4 Update mod.rs

File: `programs/magic-roulette/src/instructions/mod.rs`

Ensure delegate module is exported:

```rust
pub mod delegate;
pub use delegate::*;
```

## 🏗️ Step 2: Build Updated Program

```bash
# Clean previous build
anchor clean

# Build with MagicBlock features
anchor build

# Verify build succeeded
ls -lh target/deploy/magic_roulette.so

# Expected output: ~700KB file
```

### Verify Program ID Matches

```bash
# Get program ID from keypair
solana address -k target/deploy/magic_roulette-keypair.json

# Should output: HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
```

## 🚀 Step 3: Upgrade Program on Devnet

### 3.1 Perform Upgrade

```bash
# Upgrade program (NOT deploy!)
solana program deploy target/deploy/magic_roulette.so \
  --program-id target/deploy/magic_roulette-keypair.json \
  --upgrade-authority ~/.config/solana/id.json \
  --url devnet

# Or using anchor
anchor upgrade target/deploy/magic_roulette.so \
  --program-id HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet
```

### 3.2 Verify Upgrade

```bash
# Check program info
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet

# Look for:
# - Last Deployed In Slot: (should be recent)
# - Data Length: (should be similar to before)
# - Authority: (should still be your wallet)
```

### 3.3 Update IDL

```bash
# Upgrade IDL
anchor idl upgrade HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --filepath target/idl/magic_roulette.json \
  --provider.cluster devnet

# Verify IDL
anchor idl fetch HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet
```

## ✅ Step 4: Verify Upgrade Success

### 4.1 Check New Instructions

```bash
# Fetch and inspect IDL
anchor idl fetch HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet > current_idl.json

# Check for new instructions
cat current_idl.json | grep -A 5 "delegate_game"
cat current_idl.json | grep -A 5 "commit_game"
cat current_idl.json | grep -A 5 "undelegate_game"
```

### 4.2 Test New Instructions

Create test script: `scripts/test-magicblock-upgrade.ts`

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MagicRoulette } from "../target/types/magic_roulette";
import { PublicKey } from "@solana/web3.js";

const DELEGATION_PROGRAM_ID = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;

  console.log("🧪 Testing MagicBlock upgrade...");
  console.log("   Program ID:", program.programId.toString());

  // 1. Create a test game
  const [platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform_config")],
    program.programId
  );

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

  console.log("\n1️⃣ Creating test game...");
  const createTx = await program.methods
    .createGameSol(
      { oneVsOne: {} },
      new anchor.BN(10_000_000), // 0.01 SOL
      Array(32).fill(0)
    )
    .accounts({
      game,
      platformConfig,
      creator: provider.wallet.publicKey,
      gameVault,
    })
    .rpc();

  console.log("   ✅ Game created:", createTx);
  console.log("   Game ID:", gameId.toString());
  console.log("   Game PDA:", game.toString());

  // 2. Test delegation
  console.log("\n2️⃣ Testing delegation...");
  try {
    const delegateTx = await program.methods
      .delegateGame()
      .accounts({
        game,
        payer: provider.wallet.publicKey,
        platformConfig,
        delegationProgram: DELEGATION_PROGRAM_ID,
      })
      .rpc();

    console.log("   ✅ Game delegated:", delegateTx);

    // Wait for delegation to propagate
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check game status
    const gameData = await program.account.game.fetch(game);
    console.log("   Game status:", gameData.status);

    if (gameData.status.hasOwnProperty('delegated')) {
      console.log("   ✅ Status updated to Delegated");
    }
  } catch (error) {
    console.error("   ❌ Delegation failed:", error);
  }

  // 3. Test commit (optional)
  console.log("\n3️⃣ Testing commit...");
  try {
    const commitTx = await program.methods
      .commitGame()
      .accounts({
        game,
        payer: provider.wallet.publicKey,
      })
      .rpc();

    console.log("   ✅ Game committed:", commitTx);
  } catch (error) {
    console.error("   ❌ Commit failed:", error);
  }

  console.log("\n✅ MagicBlock upgrade test complete!");
}

main().catch(console.error);
```

Run test:

```bash
ts-node scripts/test-magicblock-upgrade.ts
```

## 🔄 Step 5: Update Client Code

### 5.1 Update Mobile App Dependencies

```bash
cd mobile-app

# Install MagicBlock SDK
npm install @magicblock-labs/ephemeral-rollups-sdk --legacy-peer-deps

# Verify installation
npm list @magicblock-labs/ephemeral-rollups-sdk
```

### 5.2 Files Already Created ✅

These files are already created and ready to use:
- ✅ `src/services/magicblock.ts`
- ✅ `src/hooks/useMagicBlock.ts`
- ✅ `src/components/MagicBlockStatus.tsx`

### 5.3 Update Existing Services

Update `mobile-app/src/services/game.ts` to add new functions (see `MAGICBLOCK_IMPLEMENTATION_STEPS.md` Step 3.3).

## 🧪 Step 6: End-to-End Testing

### Test Sequence

1. **Create Game** (Base Layer)
   ```bash
   # Should work as before
   ```

2. **Delegate Game** (New Feature)
   ```bash
   # Test delegation to ER
   ```

3. **Join Game** (ER - Gasless)
   ```bash
   # Should be gasless on ER
   ```

4. **Take Shots** (ER - Fast)
   ```bash
   # Should be sub-10ms
   ```

5. **Commit State** (New Feature)
   ```bash
   # Test state commit
   ```

6. **Undelegate** (New Feature)
   ```bash
   # Test undelegation
   ```

7. **Finalize** (Base Layer)
   ```bash
   # Should work as before
   ```

## 📊 Upgrade Costs

### Devnet
- Upgrade transaction: ~0.003 SOL
- IDL update: ~0.001 SOL
- Testing: Free (devnet SOL)

### Mainnet (Future)
- Upgrade transaction: ~0.003 SOL
- IDL update: ~0.001 SOL
- Total: ~0.004 SOL

## 🔒 Safety Measures

### Before Upgrade

1. ✅ Backup current program binary
2. ✅ Backup current IDL
3. ✅ Test on localnet first (optional)
4. ✅ Verify upgrade authority
5. ✅ Check sufficient balance

### After Upgrade

1. ✅ Verify new instructions exist
2. ✅ Test new instructions work
3. ✅ Verify existing games still work
4. ✅ Monitor for errors
5. ✅ Update documentation

## 🐛 Troubleshooting

### Issue: "Upgrade authority mismatch"

```bash
# Check who is the upgrade authority
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet

# Make sure you're using the correct wallet
solana address
```

### Issue: "Program account not found"

```bash
# Verify program exists
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet
```

### Issue: "Insufficient funds"

```bash
# Get more devnet SOL
solana airdrop 2 --url devnet
```

### Issue: "Build failed"

```bash
# Clean and rebuild
anchor clean
cargo clean
anchor build
```

### Issue: "IDL upgrade failed"

```bash
# Try fetching first
anchor idl fetch HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet

# Then upgrade
anchor idl upgrade HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --filepath target/idl/magic_roulette.json \
  --provider.cluster devnet
```

## 📝 Rollback Plan

If upgrade fails or causes issues:

### Option 1: Redeploy Previous Version

```bash
# Deploy backup binary
solana program deploy backup_magic_roulette_YYYYMMDD.so \
  --program-id target/deploy/magic_roulette-keypair.json \
  --upgrade-authority ~/.config/solana/id.json \
  --url devnet
```

### Option 2: Close and Redeploy

```bash
# Close program (CAUTION: This will lose all data!)
solana program close HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --url devnet

# Redeploy from scratch
anchor deploy --provider.cluster devnet
```

## ✅ Post-Upgrade Checklist

- [ ] Program upgraded successfully
- [ ] IDL updated
- [ ] New instructions visible in IDL
- [ ] Test delegation works
- [ ] Test commit works
- [ ] Test undelegate works
- [ ] Existing games still work
- [ ] Client code updated
- [ ] Documentation updated
- [ ] Team notified

## 🎯 Expected Results

After successful upgrade:

| Feature | Status | Notes |
|---------|--------|-------|
| Existing Instructions | ✅ Working | Backward compatible |
| delegate_game | ✅ New | Delegates to ER |
| commit_game | ✅ New | Commits state |
| undelegate_game | ✅ New | Returns to base |
| Existing Games | ✅ Working | No impact |
| New Games | ✅ Enhanced | Can use ER |

## 📚 Next Steps

1. ✅ Upgrade program
2. ✅ Test new features
3. ⏳ Update mobile app
4. ⏳ Test end-to-end flow
5. ⏳ Monitor performance
6. ⏳ Document improvements
7. ⏳ Plan mainnet upgrade

## 🔗 Resources

- **Current Deployment**: `DEPLOYMENT_SUCCESS.md`
- **MagicBlock Integration**: `MAGICBLOCK_INTEGRATION_GUIDE.md`
- **Implementation Steps**: `MAGICBLOCK_IMPLEMENTATION_STEPS.md`
- **Quick Reference**: `MAGICBLOCK_QUICK_REFERENCE.md`

---

**Upgrade Guide Version:** 1.0  
**Program ID:** HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam  
**Status:** Ready for Upgrade  
**Last Updated:** February 24, 2026
