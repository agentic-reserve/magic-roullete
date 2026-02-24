# MagicBlock Integration Guide - Magic Roulette

Panduan lengkap untuk mengintegrasikan MagicBlock Ephemeral Rollups dengan Permission dan Delegation Hooks ke dalam Magic Roulette.

## 📋 Overview

Magic Roulette akan menggunakan MagicBlock untuk:
- **Sub-10ms latency** untuk gameplay real-time
- **Gasless transactions** untuk UX yang seamless
- **VRF** untuk randomness yang verifiable
- **Permission & Delegation** untuk access control

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Magic Roulette Flow                       │
├─────────────────────────────────────────────────────────────┤
│  Base Layer (Solana)          │  Ephemeral Rollup (ER)      │
│  - Create game                │  - Join game (gasless)      │
│  - Delegate game account      │  - Take shots (sub-10ms)    │
│  - Initialize players         │  - Update game state        │
│  - Finalize & distribute      │  - VRF for bullet chamber   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Step 1: Dependencies (Already Added ✅)

```toml
[dependencies]
anchor-lang = "0.32.1"
ephemeral-rollups-sdk = { version = "0.6.5", features = ["anchor", "disable-realloc"] }
ephemeral-vrf-sdk = { version = "0.2", features = ["anchor"] }
```

## 🔧 Step 2: Add Permission & Delegation Hooks

### 2.1 Update lib.rs

Add MagicBlock macros and imports:

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{delegate_account, commit_accounts, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegationProgram;

declare_id!("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");

#[ephemeral]  // ✅ Enable ER support
#[program]
pub mod magic_roulette {
    use super::*;
    
    // ... existing instructions
}
```

### 2.2 Update delegate.rs

Current implementation needs permission hooks:

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::delegate_account;
use ephemeral_rollups_sdk::cpi::DelegationProgram;
use crate::state::*;
use crate::errors::GameError;

// ✅ STEP 2: Add Permission Hook
#[derive(Accounts)]
pub struct DelegateGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// Game account to delegate
    #[account(
        mut,
        del,  // ✅ Mark for delegation
        constraint = game.status == GameStatus::WaitingForPlayers 
            || game.status == GameStatus::Ready 
            @ GameError::InvalidGameStatus
    )]
    pub game: Account<'info, Game>,
    
    /// Platform config for validation
    #[account(
        seeds = [b"platform_config"],
        bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    /// Delegation program
    pub delegation_program: Program<'info, DelegationProgram>,
    
    pub system_program: Program<'info, System>,
}

// ✅ STEP 2: Implement delegation with permission check
#[delegate]  // Auto-injects delegation accounts
pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Permission check: Only creator or platform authority can delegate
    require!(
        ctx.accounts.payer.key() == game.creator 
            || ctx.accounts.payer.key() == ctx.accounts.platform_config.authority,
        GameError::Unauthorized
    );
    
    // Update game status
    game.status = GameStatus::Delegated;
    
    msg!("Game {} delegated to ER", game.game_id);
    Ok(())
}

// ✅ STEP 2: Add commit instruction
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
    msg!("Game {} state committed to base layer", ctx.accounts.game.game_id);
    Ok(())
}

// ✅ STEP 2: Add undelegate instruction
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
    
    msg!("Game {} undelegated from ER", game.game_id);
    Ok(())
}
```

### 2.3 Add Permission Checks to Game Instructions

Update `join_game_sol.rs`:

```rust
// ✅ STEP 3: Add delegation hook check
pub fn join_game_sol(ctx: Context<JoinGameSol>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Check if game is delegated (should be on ER)
    require!(
        game.status == GameStatus::Delegated || game.status == GameStatus::Ready,
        GameError::InvalidGameStatus
    );
    
    // ... rest of join logic
}
```

Update `take_shot.rs`:

```rust
// ✅ STEP 3: Enforce ER execution
pub fn take_shot(ctx: Context<TakeShot>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // This instruction should ONLY run on ER
    require!(
        game.status == GameStatus::Delegated || game.status == GameStatus::InProgress,
        GameError::InvalidGameStatus
    );
    
    // ... rest of shot logic
}
```

## 🌐 Step 3: Deploy Program

### 3.1 Build Program

```bash
# Build with MagicBlock features
anchor build

# Verify build
ls -lh target/deploy/magic_roulette.so
```

### 3.2 Deploy to Devnet

```bash
# Deploy program
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam --url devnet
```

### 3.3 Upgrade Existing Program

```bash
# Upgrade with new features
anchor upgrade target/deploy/magic_roulette.so \
  --program-id HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet
```

## 💻 Step 4: Client Implementation

### 4.1 Setup Connections

Create `mobile-app/src/services/magicblock.ts`:

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { DELEGATION_PROGRAM_ID } from '@magicblock-labs/ephemeral-rollups-sdk';

// ✅ STEP 4: Separate connections for each layer
export const BASE_RPC = 'https://api.devnet.solana.com';
export const ER_RPC = 'https://devnet.magicblock.app';  // or use router

// Create connections
export const baseConnection = new Connection(BASE_RPC, 'confirmed');
export const erConnection = new Connection(ER_RPC, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

// ER Validator (Devnet - Asia)
export const ER_VALIDATOR = new PublicKey(
  'MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57'
);

// Check if account is delegated
export async function isDelegated(pubkey: PublicKey): Promise<boolean> {
  const info = await baseConnection.getAccountInfo(pubkey);
  return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
}

// Get appropriate connection based on delegation status
export async function getConnectionForAccount(
  pubkey: PublicKey
): Promise<Connection> {
  const delegated = await isDelegated(pubkey);
  return delegated ? erConnection : baseConnection;
}
```

### 4.2 Update Game Service

Update `mobile-app/src/services/game.ts`:

```typescript
import { baseConnection, erConnection, isDelegated, ER_VALIDATOR } from './magicblock';

// ✅ STEP 5: Delegate game to ER
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

  // Wait for delegation to propagate
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return tx;
};

// ✅ STEP 5: Join game on ER (gasless)
export const joinGameER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  // Use ER connection
  const erProvider = new AnchorProvider(
    erConnection,
    provider.wallet,
    { commitment: 'confirmed', skipPreflight: true }
  );
  
  const program = getProgram(erProvider);
  const platformConfig = getPlatformConfigPDA();
  const gamePDA = getGamePDA(gameId);
  const gameVault = getGameVaultPDA(gamePDA);

  // Check if delegated
  const delegated = await isDelegated(gamePDA);
  if (!delegated) {
    throw new Error('Game must be delegated to ER first');
  }

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

// ✅ STEP 5: Take shot on ER (sub-10ms)
export const takeShotER = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  // Use ER connection
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

// ✅ STEP 5: Commit game state
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

// ✅ STEP 5: Undelegate and finalize
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

// ✅ STEP 5: Fetch game from appropriate layer
export const fetchGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<GameData> => {
  const gamePDA = getGamePDA(gameId);
  
  // Check delegation status
  const delegated = await isDelegated(gamePDA);
  
  // Use appropriate connection
  const connection = delegated ? erConnection : baseConnection;
  const fetchProvider = new AnchorProvider(
    connection,
    provider.wallet,
    { commitment: 'confirmed' }
  );
  
  const program = getProgram(fetchProvider);
  const gameData = await program.account.game.fetch(gamePDA);

  return {
    gameId: gameData.gameId,
    creator: gameData.creator,
    gameMode: gameData.gameMode,
    entryFee: gameData.entryFee.toNumber(),
    status: gameData.status,
    players: gameData.players,
    currentTurn: gameData.currentTurn,
    bulletChamber: gameData.bulletChamber,
    currentChamber: gameData.currentChamber,
    winnerTeam: gameData.winnerTeam,
    isPracticeMode: gameData.isPracticeMode,
    createdAt: gameData.createdAt.toNumber(),
  };
};
```

## 🎮 Step 5: Update UI Flow

### 5.1 Update CreateGameScreen

```typescript
// After creating game, delegate it
const handleCreateGame = async () => {
  try {
    // 1. Create game on base layer
    const tx = await createGame(provider, gameMode, entryFee);
    
    // 2. Delegate to ER
    await delegateGame(provider, gameId);
    
    Alert.alert('Success', 'Game created and delegated to ER!');
    navigation.navigate('GamePlay', { gameId });
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### 5.2 Update GamePlayScreen

```typescript
// Use ER for gameplay
const handleJoinGame = async () => {
  try {
    await joinGameER(provider, gameId);  // Gasless on ER
    Alert.alert('Success', 'Joined game!');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

const handleTakeShot = async () => {
  try {
    await takeShotER(provider, gameId);  // Sub-10ms on ER
    // Auto-refresh will show updated state
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

const handleFinalizeGame = async () => {
  try {
    // 1. Commit final state
    await commitGame(provider, gameId);
    
    // 2. Undelegate
    await undelegateGame(provider, gameId);
    
    // 3. Finalize on base layer
    await finalizeGame(provider, gameId);
    
    Alert.alert('Success', 'Game finalized!');
    navigation.navigate('Home');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

## 🔐 Step 6: Authorization (TEE Endpoint)

For private games with TEE:

```typescript
// Sign message for authorization
async function getAuthToken(wallet: any): Promise<string> {
  const message = `Authorize Magic Roulette access at ${Date.now()}`;
  const signature = await wallet.signMessage(new TextEncoder().encode(message));
  
  // Request token from TEE endpoint
  const response = await fetch('https://tee.magicblock.app/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: wallet.publicKey.toBase58(),
      message,
      signature: Buffer.from(signature).toString('base64'),
    }),
  });
  
  const { token } = await response.json();
  return token;
}
```

## 🧪 Step 7: Testing

### 7.1 Test Delegation Flow

```bash
# Test on devnet
cd mobile-app
npm run web

# Test sequence:
# 1. Create game (base layer)
# 2. Delegate game (base layer)
# 3. Join game (ER - gasless)
# 4. Take shots (ER - sub-10ms)
# 5. Commit state (base layer)
# 6. Undelegate (base layer)
# 7. Finalize (base layer)
```

### 7.2 Verify ER Performance

```typescript
// Measure latency
const start = Date.now();
await takeShotER(provider, gameId);
const latency = Date.now() - start;
console.log(`ER latency: ${latency}ms`);  // Should be < 50ms
```

## 📊 Expected Results

| Operation | Layer | Latency | Cost |
|-----------|-------|---------|------|
| Create Game | Base | ~400ms | 0.001 SOL |
| Delegate | Base | ~400ms | 0.0005 SOL |
| Join Game | ER | ~10ms | FREE |
| Take Shot | ER | ~10ms | FREE |
| Commit | Base | ~400ms | 0.0005 SOL |
| Undelegate | Base | ~400ms | 0.0005 SOL |
| Finalize | Base | ~400ms | 0.001 SOL |

## 🎯 Benefits

1. **Ultra-fast gameplay**: Sub-10ms shot execution
2. **Gasless UX**: Players don't pay for each shot
3. **Scalability**: Multiple games run in parallel on ER
4. **Security**: Final state committed to Solana base layer
5. **Verifiable randomness**: VRF for bullet chamber

## 📚 Resources

- MagicBlock Docs: https://docs.magicblock.gg
- Ephemeral Rollups SDK: https://github.com/magicblock-labs/ephemeral-rollups-sdk
- Permission Program: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- Delegation Program: `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`

## 🚀 Next Steps

1. ✅ Add dependencies (Done)
2. ⏳ Update program with permission hooks
3. ⏳ Deploy upgraded program
4. ⏳ Implement client integration
5. ⏳ Test delegation flow
6. ⏳ Measure performance improvements
