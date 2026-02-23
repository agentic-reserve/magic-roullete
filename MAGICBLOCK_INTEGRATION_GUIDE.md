# Magic Roulette - MagicBlock Ephemeral Rollups Integration Guide

**Complete guide for integrating MagicBlock ER into Magic Roulette**

## 🎯 Overview

This guide shows how to integrate MagicBlock Ephemeral Rollups into Magic Roulette to achieve:
- **Sub-10ms gameplay** (vs ~400ms on Solana)
- **Gasless transactions** during gameplay
- **Verifiable randomness** via MagicBlock VRF
- **Privacy** via Intel TDX (optional)

## 📋 Current Status

### ✅ Already Implemented
- Game creation and joining
- Entry fee management
- Team assignment
- Game state management
- Prize distribution logic

### 🔄 Needs ER Integration
- Game delegation to ER
- VRF randomness processing
- Gameplay execution (taking shots)
- State commitment back to Solana

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Magic Roulette Flow                       │
├─────────────────────────────────────────────────────────────┤
│  Solana Base Layer          │  Ephemeral Rollup (ER)        │
│  ─────────────────          │  ──────────────────           │
│  1. Create game             │  4. Process VRF               │
│  2. Players join            │  5. Take shots (gasless)      │
│  3. Delegate to ER          │  6. Determine winner          │
│  7. Commit final state      │                               │
│  8. Distribute prizes       │                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Step 1: Update Dependencies

### Cargo.toml

```toml
[dependencies]
anchor-lang = "0.32.1"
anchor-spl = "0.32.1"

# Add MagicBlock dependencies
ephemeral-rollups-sdk = { version = "0.6.5", features = ["anchor", "disable-realloc"] }

[features]
default = []
test-sbf = []
```

### package.json

```json
{
  "dependencies": {
    "@solana/web3.js": "^1.95.8",
    "@coral-xyz/anchor": "^0.32.1",
    "@magicblock-labs/ephemeral-rollups-sdk": "^0.6.5",
    "@magicblock-labs/ephemeral-rollups-kit": "^0.6.5"
  }
}
```

## 🔧 Step 2: Update Program Code

### 2.1 Update lib.rs

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{delegate_account, commit_accounts, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegationProgram;

declare_id!("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");

#[ephemeral]  // CRITICAL: Enables ER support
#[program]
pub mod magic_roulette {
    use super::*;

    // ... existing instructions ...

    /// Delegate game to Ephemeral Rollup
    #[delegate]
    pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(
            game.is_full(),
            GameError::GameNotReady
        );
        
        // Update status to Delegated
        game.status = GameStatus::Delegated;
        
        msg!("🚀 Game {} delegated to Ephemeral Rollup", game.game_id);
        msg!("   Players can now take shots with sub-10ms latency");
        
        Ok(())
    }

    /// Commit game state back to Solana (without undelegating)
    #[commit]
    pub fn commit_game(ctx: Context<CommitGame>) -> Result<()> {
        msg!("💾 Game state committed to Solana");
        Ok(())
    }

    /// Undelegate and finalize game
    #[commit]
    pub fn undelegate_game(ctx: Context<UndelegateGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(
            game.status == GameStatus::Finished,
            GameError::GameNotFinished
        );
        
        msg!("✅ Game {} undelegated from ER", game.game_id);
        
        Ok(())
    }
}
```

### 2.2 Update delegate.rs

```rust
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::cpi::DelegationProgram;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct DelegateGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.is_full() @ GameError::GameNotReady
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// Delegation program
    pub delegation_program: Program<'info, DelegationProgram>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UndelegateGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.status == GameStatus::Finished @ GameError::GameNotFinished
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
}
```

### 2.3 Update process_vrf_result.rs

```rust
use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct ProcessVrfResult<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    /// VRF authority (MagicBlock VRF program)
    pub vrf_authority: Signer<'info>,
}

pub fn process_vrf_result(
    ctx: Context<ProcessVrfResult>,
    randomness: [u8; 32],
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Can process VRF in either Delegated or InProgress status
    require!(
        game.status == GameStatus::Delegated || game.status == GameStatus::InProgress,
        GameError::InvalidGameStatus
    );
    
    // Store VRF result
    game.vrf_result = randomness;
    game.vrf_fulfilled = true;
    
    // Convert randomness to chamber position (1-6)
    let random_u64 = u64::from_le_bytes([
        randomness[0], randomness[1], randomness[2], randomness[3],
        randomness[4], randomness[5], randomness[6], randomness[7],
    ]);
    game.bullet_chamber = ((random_u64 % 6) + 1) as u8;
    
    // Start game
    game.status = GameStatus::InProgress;
    
    msg!("🎲 VRF processed for game {}", game.game_id);
    msg!("   Bullet chamber: {}", game.bullet_chamber);
    msg!("   Status: InProgress");
    
    Ok(())
}
```

## 📱 Step 3: Update TypeScript Client

### 3.1 Create ER Connection Manager

```typescript
// app/src/lib/magicblock/connection-manager.ts

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
    
    // Base layer connection (Solana)
    this.baseConnection = new Connection(config.baseRpcUrl, this.commitment);
    
    // Ephemeral Rollup connection
    this.erConnection = new Connection(config.erRpcUrl, {
      commitment: this.commitment,
      confirmTransactionInitialTimeout: 60000,
    });
  }

  /**
   * Check if an account is delegated to ER
   */
  async isDelegated(pubkey: PublicKey): Promise<boolean> {
    const info = await this.baseConnection.getAccountInfo(pubkey);
    return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
  }

  /**
   * Get the appropriate connection for an account
   */
  async getConnectionForAccount(pubkey: PublicKey): Promise<Connection> {
    const delegated = await this.isDelegated(pubkey);
    return delegated ? this.erConnection : this.baseConnection;
  }

  /**
   * Create provider for base layer
   */
  createBaseProvider(wallet: Wallet): AnchorProvider {
    return new AnchorProvider(this.baseConnection, wallet, {
      commitment: this.commitment,
    });
  }

  /**
   * Create provider for ER
   */
  createERProvider(wallet: Wallet): AnchorProvider {
    return new AnchorProvider(this.erConnection, wallet, {
      commitment: this.commitment,
      skipPreflight: true, // CRITICAL for ER
    });
  }
}

// Default configurations
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
```

### 3.2 Create Game Delegation Service

```typescript
// app/src/lib/magicblock/game-delegation.ts

import { PublicKey, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import {
  createDelegateInstruction,
  createUndelegateInstruction,
  createCommitInstruction,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import { MagicBlockConnectionManager } from "./connection-manager";

export class GameDelegationService {
  constructor(
    private readonly connectionManager: MagicBlockConnectionManager,
    private readonly program: Program,
    private readonly programId: PublicKey
  ) {}

  /**
   * Delegate game to Ephemeral Rollup
   */
  async delegateGame(
    gameId: number,
    payer: PublicKey
  ): Promise<string> {
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(gameId.toString().padStart(8, "0"))],
      this.programId
    );

    // Check if already delegated
    const isDelegated = await this.connectionManager.isDelegated(gamePda);
    if (isDelegated) {
      throw new Error("Game is already delegated");
    }

    // Create delegation instruction
    const delegateIx = createDelegateInstruction({
      payer,
      delegatedAccount: gamePda,
      ownerProgram: this.programId,
      validUntil: 0, // No expiration
    });

    // Create delegate_game instruction
    const delegateGameIx = await this.program.methods
      .delegateGame()
      .accounts({
        game: gamePda,
        payer,
      })
      .instruction();

    // Send transaction on base layer
    const tx = new Transaction().add(delegateIx, delegateGameIx);
    const signature = await this.connectionManager.baseConnection.sendTransaction(
      tx,
      [/* signers */],
      { skipPreflight: false }
    );

    await this.connectionManager.baseConnection.confirmTransaction(signature);

    return signature;
  }

  /**
   * Commit game state back to Solana
   */
  async commitGame(
    gameId: number,
    payer: PublicKey
  ): Promise<string> {
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(gameId.toString().padStart(8, "0"))],
      this.programId
    );

    // Create commit instruction
    const commitIx = createCommitInstruction({
      payer,
      accounts: [gamePda],
    });

    // Create commit_game instruction
    const commitGameIx = await this.program.methods
      .commitGame()
      .accounts({
        game: gamePda,
        payer,
      })
      .instruction();

    // Send transaction on base layer
    const tx = new Transaction().add(commitIx, commitGameIx);
    const signature = await this.connectionManager.baseConnection.sendTransaction(
      tx,
      [/* signers */]
    );

    await this.connectionManager.baseConnection.confirmTransaction(signature);

    return signature;
  }

  /**
   * Undelegate game and return to base layer
   */
  async undelegateGame(
    gameId: number,
    payer: PublicKey
  ): Promise<string> {
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(gameId.toString().padStart(8, "0"))],
      this.programId
    );

    // Create undelegate instruction
    const undelegateIx = createUndelegateInstruction({
      payer,
      delegatedAccount: gamePda,
    });

    // Create undelegate_game instruction
    const undelegateGameIx = await this.program.methods
      .undelegateGame()
      .accounts({
        game: gamePda,
        payer,
      })
      .instruction();

    // Send transaction on base layer
    const tx = new Transaction().add(undelegateIx, undelegateGameIx);
    const signature = await this.connectionManager.baseConnection.sendTransaction(
      tx,
      [/* signers */]
    );

    await this.connectionManager.baseConnection.confirmTransaction(signature);

    return signature;
  }
}
```

### 3.3 Create VRF Integration

```typescript
// app/src/lib/magicblock/vrf-service.ts

import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { MagicBlockConnectionManager } from "./connection-manager";

// MagicBlock VRF Program ID (devnet)
export const VRF_PROGRAM_ID = new PublicKey("VRFxKvvxZ8YqQqQqQqQqQqQqQqQqQqQqQqQqQqQq");

export class VRFService {
  constructor(
    private readonly connectionManager: MagicBlockConnectionManager,
    private readonly program: Program
  ) {}

  /**
   * Request VRF randomness for a game
   */
  async requestRandomness(
    gameId: number,
    payer: PublicKey
  ): Promise<string> {
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(gameId.toString().padStart(8, "0"))],
      this.program.programId
    );

    // Send request on ER (gasless)
    const signature = await this.program.methods
      .requestVrfRandomness()
      .accounts({
        game: gamePda,
        payer,
      })
      .rpc({ skipPreflight: true });

    return signature;
  }

  /**
   * Process VRF result (called by VRF oracle)
   */
  async processVrfResult(
    gameId: number,
    randomness: number[],
    vrfAuthority: PublicKey
  ): Promise<string> {
    const [gamePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(gameId.toString().padStart(8, "0"))],
      this.program.programId
    );

    // Process on ER
    const signature = await this.program.methods
      .processVrfResult(randomness)
      .accounts({
        game: gamePda,
        vrfAuthority,
      })
      .rpc({ skipPreflight: true });

    return signature;
  }
}
```

## 🎮 Step 4: Update Game Flow

### 4.1 Complete Game Flow Script

```typescript
// scripts/test-er-game-flow.ts

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { MagicBlockConnectionManager, DEVNET_CONFIG } from "../app/src/lib/magicblock/connection-manager";
import { GameDelegationService } from "../app/src/lib/magicblock/game-delegation";
import { VRFService } from "../app/src/lib/magicblock/vrf-service";

async function main() {
  console.log("🎮 Magic Roulette - Complete ER Game Flow");
  console.log("==========================================\n");

  // Setup
  const wallet = /* your wallet */;
  const connectionManager = new MagicBlockConnectionManager(DEVNET_CONFIG);
  
  // Load program
  const idl = /* load IDL */;
  const programId = new PublicKey(idl.address);
  
  const baseProvider = connectionManager.createBaseProvider(wallet);
  const erProvider = connectionManager.createERProvider(wallet);
  
  const baseProgram = new Program(idl, baseProvider);
  const erProgram = new Program(idl, erProvider);
  
  // Services
  const delegationService = new GameDelegationService(
    connectionManager,
    baseProgram,
    programId
  );
  const vrfService = new VRFService(connectionManager, erProgram);

  // STEP 1: Create game on base layer
  console.log("STEP 1: Create Game (Base Layer)");
  const gameId = /* create game */;
  console.log("✅ Game created:", gameId);

  // STEP 2: Players join on base layer
  console.log("\nSTEP 2: Players Join (Base Layer)");
  /* players join */
  console.log("✅ Players joined");

  // STEP 3: Delegate to ER
  console.log("\nSTEP 3: Delegate to ER");
  const delegateSig = await delegationService.delegateGame(gameId, wallet.publicKey);
  console.log("✅ Delegated:", delegateSig);

  // STEP 4: Request VRF on ER
  console.log("\nSTEP 4: Request VRF (ER - Gasless)");
  const vrfSig = await vrfService.requestRandomness(gameId, wallet.publicKey);
  console.log("✅ VRF requested:", vrfSig);

  // Wait for VRF oracle to process
  await new Promise(resolve => setTimeout(resolve, 5000));

  // STEP 5: Play game on ER (gasless)
  console.log("\nSTEP 5: Play Game (ER - Gasless)");
  let gameFinished = false;
  let shotCount = 0;

  while (!gameFinished && shotCount < 12) {
    const takeShotSig = await erProgram.methods
      .takeShot()
      .accounts({ /* accounts */ })
      .rpc({ skipPreflight: true });
    
    console.log(`Shot #${shotCount + 1}:`, takeShotSig);
    
    // Check game status
    const game = await erProgram.account.game.fetch(/* gamePda */);
    gameFinished = game.status.finished;
    shotCount++;
  }

  console.log("✅ Game finished!");

  // STEP 6: Commit final state
  console.log("\nSTEP 6: Commit State (Base Layer)");
  const commitSig = await delegationService.commitGame(gameId, wallet.publicKey);
  console.log("✅ State committed:", commitSig);

  // STEP 7: Undelegate
  console.log("\nSTEP 7: Undelegate (Base Layer)");
  const undelegateSig = await delegationService.undelegateGame(gameId, wallet.publicKey);
  console.log("✅ Undelegated:", undelegateSig);

  // STEP 8: Distribute prizes
  console.log("\nSTEP 8: Distribute Prizes (Base Layer)");
  const finalizeSig = await baseProgram.methods
    .finalizeGameSol()
    .accounts({ /* accounts */ })
    .rpc();
  console.log("✅ Prizes distributed:", finalizeSig);

  console.log("\n🎉 Complete game flow executed successfully!");
}

main();
```

## 📊 Performance Comparison

| Operation | Base Solana | With ER | Improvement |
|-----------|-------------|---------|-------------|
| Game Creation | ~400ms | ~400ms | Same (base layer) |
| Player Join | ~400ms | ~400ms | Same (base layer) |
| Delegation | ~400ms | ~400ms | One-time cost |
| VRF Request | ~400ms | ~10ms | **40x faster** |
| Take Shot | ~400ms | ~10ms | **40x faster** |
| Game Completion | ~400ms | ~10ms | **40x faster** |
| Undelegation | ~400ms | ~400ms | One-time cost |
| Prize Distribution | ~400ms | ~400ms | Same (base layer) |

**Total Game Time:**
- Without ER: ~3.2 seconds (8 operations × 400ms)
- With ER: ~1.2 seconds (4 base + 4 ER × 10ms)
- **Improvement: 2.7x faster + gasless gameplay**

## 🔐 Security Considerations

1. **Delegation Safety**
   - Only delegate when game is full
   - Verify all players joined before delegation
   - Set appropriate delegation timeout

2. **VRF Security**
   - Use MagicBlock VRF for verifiable randomness
   - Store VRF seed on-chain
   - Verify VRF proof before processing

3. **State Commitment**
   - Commit state periodically during long games
   - Always commit before undelegation
   - Verify state consistency after commit

4. **Access Control**
   - Only game creator can delegate
   - Only VRF authority can process randomness
   - Only authorized players can take shots

## 🚀 Deployment Checklist

- [ ] Update Cargo.toml with ER dependencies
- [ ] Add `#[ephemeral]` macro to program
- [ ] Update delegate_game instruction
- [ ] Add commit_game instruction
- [ ] Update undelegate_game instruction
- [ ] Update process_vrf_result for ER
- [ ] Install TypeScript ER SDK
- [ ] Create connection manager
- [ ] Create delegation service
- [ ] Create VRF service
- [ ] Update game flow scripts
- [ ] Test on devnet
- [ ] Deploy to mainnet

## 📚 Resources

- **MagicBlock Docs**: https://docs.magicblock.gg
- **ER SDK**: https://github.com/magicblock-labs/ephemeral-rollups-sdk
- **VRF SDK**: https://github.com/magicblock-labs/ephemeral-vrf
- **Examples**: https://github.com/magicblock-labs/magicblock-engine-examples
- **Discord**: https://discord.com/invite/MBkdC3gxcv

## 🆘 Support

For questions or issues:
1. Check the troubleshooting section in docs
2. Review example projects
3. Ask in MagicBlock Discord
4. Open an issue on GitHub

---

**Ready to integrate MagicBlock ER into Magic Roulette!** 🚀
