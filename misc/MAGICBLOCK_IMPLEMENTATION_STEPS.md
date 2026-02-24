# MagicBlock Implementation - Step-by-Step Guide

Panduan implementasi lengkap untuk mengintegrasikan MagicBlock Ephemeral Rollups dengan Permission dan Delegation Hooks.

## 📋 Prerequisites Checklist

- [x] Solana 2.3.13 installed
- [x] Rust 1.85.0 installed
- [x] Anchor 0.32.1 installed
- [x] Node 24.10.0 installed
- [x] Dependencies added to Cargo.toml

## 🔧 Step 1: Update Rust Program

### 1.1 Update lib.rs

File: `programs/magic-roulette/src/lib.rs`

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

declare_id!("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");

#[ephemeral]  // ✅ Add this macro
#[program]
pub mod magic_roulette {
    use super::*;
    
    // Import delegation instructions
    pub use crate::instructions::delegate::*;
    
    // ... existing instructions
}
```

### 1.2 Update delegate.rs

File: `programs/magic-roulette/src/instructions/delegate.rs`

Replace entire file with:

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{delegate_account, commit_accounts};
use ephemeral_rollups_sdk::cpi::DelegationProgram;
use crate::state::*;
use crate::errors::GameError;

// ============================================================================
// DELEGATE INSTRUCTION
// ============================================================================

#[derive(Accounts)]
pub struct DelegateGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// Game account to delegate
    #[account(
        mut,
        del,  // Mark for delegation
        constraint = game.status == GameStatus::WaitingForPlayers 
            || game.status == GameStatus::Ready 
            @ GameError::InvalidGameStatus
    )]
    pub game: Account<'info, Game>,
    
    /// Platform config for permission check
    #[account(
        seeds = [b"platform_config"],
        bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    pub delegation_program: Program<'info, DelegationProgram>,
    pub system_program: Program<'info, System>,
}

#[delegate]  // Auto-injects delegation accounts
pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Permission check: Only creator or platform authority
    require!(
        ctx.accounts.payer.key() == game.creator 
            || ctx.accounts.payer.key() == ctx.accounts.platform_config.authority,
        GameError::Unauthorized
    );
    
    // Update status
    game.status = GameStatus::Delegated;
    
    msg!("✅ Game {} delegated to ER", game.game_id);
    Ok(())
}

// ============================================================================
// COMMIT INSTRUCTION
// ============================================================================

#[derive(Accounts)]
pub struct CommitGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        mut,
        constraint = game.status == GameStatus::Delegated 
            || game.status == GameStatus::InProgress 
            @ GameError::InvalidGameStatus
    )]
    pub game: Account<'info, Game>,
    
    /// Magic context for commit
    /// CHECK: Validated by magic program
    pub magic_context: AccountInfo<'info>,
    
    /// Magic program
    /// CHECK: Validated by SDK
    pub magic_program: AccountInfo<'info>,
}

#[commit]  // Auto-injects commit accounts
pub fn commit_game(ctx: Context<CommitGame>) -> Result<()> {
    msg!("✅ Game {} state committed to base layer", ctx.accounts.game.game_id);
    Ok(())
}

// ============================================================================
// UNDELEGATE INSTRUCTION
// ============================================================================

#[derive(Accounts)]
pub struct UndelegateGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        mut,
        constraint = game.status == GameStatus::Finished 
            || game.status == GameStatus::Cancelled 
            @ GameError::InvalidGameStatus
    )]
    pub game: Account<'info, Game>,
    
    pub delegation_program: Program<'info, DelegationProgram>,
}

#[commit]  // Handles commit + undelegate
pub fn undelegate_game(ctx: Context<UndelegateGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Permission check
    require!(
        ctx.accounts.payer.key() == game.creator,
        GameError::Unauthorized
    );
    
    msg!("✅ Game {} undelegated from ER", game.game_id);
    Ok(())
}
```

### 1.3 Update state.rs

File: `programs/magic-roulette/src/state.rs`

Add new status:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayers,
    Ready,
    Delegated,        // ✅ Add this
    InProgress,
    Finished,
    Cancelled,
}
```

### 1.4 Build Program

```bash
# Clean build
anchor clean

# Build with MagicBlock features
anchor build

# Verify build
ls -lh target/deploy/magic_roulette.so
```

Expected output:
```
-rw-r--r-- 1 user user 450K magic_roulette.so
```

## 🚀 Step 2: Deploy/Upgrade Program

### 2.1 Check Current Program

```bash
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet
```

### 2.2 Upgrade Program

```bash
# Upgrade with new features
anchor upgrade target/deploy/magic_roulette.so \
  --program-id HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet

# Wait for confirmation
sleep 5

# Verify upgrade
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet
```

### 2.3 Generate New IDL

```bash
# Generate IDL
anchor idl init HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --filepath target/idl/magic_roulette.json \
  --provider.cluster devnet

# Or upgrade if already exists
anchor idl upgrade HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --filepath target/idl/magic_roulette.json \
  --provider.cluster devnet
```

## 💻 Step 3: Update Client Code

### 3.1 Install Dependencies

```bash
cd mobile-app

# Install MagicBlock SDK
npm install @magicblock-labs/ephemeral-rollups-sdk --legacy-peer-deps

# Verify installation
npm list @magicblock-labs/ephemeral-rollups-sdk
```

### 3.2 Files Already Created ✅

- [x] `src/services/magicblock.ts` - Connection management
- [x] `src/hooks/useMagicBlock.ts` - React hooks
- [x] `src/components/MagicBlockStatus.tsx` - UI component

### 3.3 Update game.ts Service

File: `mobile-app/src/services/game.ts`

Add imports at top:

```typescript
import {
  getBaseConnection,
  getERConnection,
  isDelegated,
  DELEGATION_PROGRAM_ID,
} from './magicblock';
```

Add new functions:

```typescript
// Delegate game to ER
export const delegateGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const program = getProgram(provider);
  const platformConfig = getPlatformConfigPDA();
  const gamePDA = getGamePDA(gameId);

  const tx = await program.methods
    .delegateGame()
    .accounts({
      game: gamePDA,
      payer: provider.wallet.publicKey,
      platformConfig,
      delegationProgram: DELEGATION_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

// Join game on ER (gasless)
export const joinGameER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  // Use ER connection
  const erConnection = getERConnection();
  const erProvider = new AnchorProvider(
    erConnection,
    provider.wallet,
    { commitment: 'confirmed', skipPreflight: true }
  );
  
  const program = getProgram(erProvider);
  const platformConfig = getPlatformConfigPDA();
  const gamePDA = getGamePDA(gameId);
  const gameVault = getGameVaultPDA(gamePDA);

  const tx = await program.methods
    .joinGameSol()
    .accounts({
      game: gamePDA,
      player: provider.wallet.publicKey,
      platformConfig,
      gameVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

// Take shot on ER (sub-10ms)
export const takeShotER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const erConnection = getERConnection();
  const erProvider = new AnchorProvider(
    erConnection,
    provider.wallet,
    { commitment: 'confirmed', skipPreflight: true }
  );
  
  const program = getProgram(erProvider);
  const gamePDA = getGamePDA(gameId);

  const tx = await program.methods
    .takeShot()
    .accounts({
      game: gamePDA,
      player: provider.wallet.publicKey,
    })
    .rpc();

  return tx;
};

// Commit game state
export const commitGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const program = getProgram(provider);
  const gamePDA = getGamePDA(gameId);

  const tx = await program.methods
    .commitGame()
    .accounts({
      game: gamePDA,
      payer: provider.wallet.publicKey,
    })
    .rpc();

  return tx;
};

// Undelegate game
export const undelegateGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const program = getProgram(provider);
  const gamePDA = getGamePDA(gameId);

  const tx = await program.methods
    .undelegateGame()
    .accounts({
      game: gamePDA,
      payer: provider.wallet.publicKey,
      delegationProgram: DELEGATION_PROGRAM_ID,
    })
    .rpc();

  return tx;
};
```

## 🎮 Step 4: Update UI Components

### 4.1 Update CreateGameScreen

File: `mobile-app/src/screens/CreateGameScreen.tsx`

Add delegation after game creation:

```typescript
import { delegateGame } from '../services/game';
import { useMagicBlock } from '../hooks/useMagicBlock';

// In component:
const { delegateGame: delegateGameHook } = useMagicBlock(provider);

const handleCreateGame = async () => {
  try {
    setLoading(true);
    
    // 1. Create game on base layer
    const tx = await createGame(provider, gameMode, entryFee);
    console.log('Game created:', tx);
    
    // 2. Get game ID from transaction
    const gameId = await getGameIdFromTx(tx);
    
    // 3. Delegate to ER
    const delegateTx = await delegateGameHook(gameId);
    console.log('Game delegated:', delegateTx);
    
    Alert.alert('Success', 'Game created and delegated to ER!');
    navigation.navigate('GamePlay', { gameId });
  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

### 4.2 Update GamePlayScreen

File: `mobile-app/src/screens/GamePlayScreen.tsx`

Add MagicBlock status and use ER functions:

```typescript
import { MagicBlockStatus } from '../components/MagicBlockStatus';
import { useMagicBlock } from '../hooks/useMagicBlock';
import { joinGameER, takeShotER } from '../services/game';

// In component:
const magicBlock = useMagicBlock(provider, gameId);

// In render:
<MagicBlockStatus
  isDelegated={magicBlock.isDelegated}
  erLatency={magicBlock.erLatency}
  isLoading={magicBlock.isLoading}
  onRefresh={magicBlock.refreshState}
/>

// Update handlers:
const handleJoinGame = async () => {
  try {
    if (magicBlock.isDelegated) {
      await joinGameER(provider, gameId);  // Gasless on ER
    } else {
      await joinGame(provider, gameId);    // Regular on base
    }
    Alert.alert('Success', 'Joined game!');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

const handleTakeShot = async () => {
  try {
    const start = Date.now();
    
    if (magicBlock.isDelegated) {
      await takeShotER(provider, gameId);  // Sub-10ms on ER
    } else {
      await takeShot(provider, gameId);    // Regular on base
    }
    
    const latency = Date.now() - start;
    console.log(`Shot latency: ${latency}ms`);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

## 🧪 Step 5: Testing

### 5.1 Start Development Server

```bash
cd mobile-app
npm run web
```

### 5.2 Test Flow

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve connection

2. **Create Game**
   - Click "Create Game"
   - Set entry fee (e.g., 0.1 SOL)
   - Confirm transaction
   - Wait for delegation (should see "Delegated" status)

3. **Join Game**
   - Second player joins
   - Should be gasless on ER
   - Check console for "0 SOL" fee

4. **Take Shots**
   - Players take turns
   - Measure latency (should be < 50ms)
   - Check console logs

5. **Finalize Game**
   - Game ends
   - Commit state
   - Undelegate
   - Distribute winnings

### 5.3 Verify Performance

```typescript
// Add to console
console.log('ER Status:', magicBlock.isDelegated);
console.log('ER Latency:', magicBlock.erLatency);
console.log('Shot Latency:', shotLatency);
```

Expected results:
- ER Latency: < 50ms
- Shot Latency: < 50ms (on ER)
- Join Game: 0 SOL fee (on ER)

## 📊 Step 6: Monitor & Optimize

### 6.1 Add Performance Monitoring

```typescript
import { useERPerformance } from '../hooks/useMagicBlock';

const { latency, startMonitoring } = useERPerformance();

useEffect(() => {
  const cleanup = startMonitoring(5000); // Monitor every 5s
  return cleanup;
}, []);
```

### 6.2 Add Error Handling

```typescript
try {
  await takeShotER(provider, gameId);
} catch (error: any) {
  if (error.message.includes('not delegated')) {
    // Fallback to base layer
    await takeShot(provider, gameId);
  } else {
    throw error;
  }
}
```

## ✅ Verification Checklist

- [ ] Program builds successfully
- [ ] Program deployed/upgraded on devnet
- [ ] IDL updated
- [ ] Client dependencies installed
- [ ] Game creation works
- [ ] Delegation works
- [ ] Join game on ER is gasless
- [ ] Take shot on ER is < 50ms
- [ ] Commit works
- [ ] Undelegate works
- [ ] Finalize works

## 🎯 Expected Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Join Game Latency | ~400ms | ~10ms | 40x faster |
| Take Shot Latency | ~400ms | ~10ms | 40x faster |
| Join Game Cost | 0.0005 SOL | FREE | 100% savings |
| Take Shot Cost | 0.0005 SOL | FREE | 100% savings |

## 🐛 Troubleshooting

### Issue: "Account not delegated"
**Solution**: Wait 2-3 seconds after delegation before using ER

### Issue: "Transaction failed on ER"
**Solution**: Use `skipPreflight: true` in ER provider

### Issue: "High latency on ER"
**Solution**: Try different region (Asia/EU/US) or use router

### Issue: "Cannot find delegation program"
**Solution**: Verify DELEGATION_PROGRAM_ID is correct

## 📚 Resources

- MagicBlock Docs: https://docs.magicblock.gg
- SDK: https://github.com/magicblock-labs/ephemeral-rollups-sdk
- Examples: https://github.com/magicblock-labs/magicblock-engine-examples

## 🚀 Next Steps

1. Test on mainnet
2. Add TEE for private games
3. Implement VRF for randomness
4. Add crank automation
5. Monitor performance metrics
