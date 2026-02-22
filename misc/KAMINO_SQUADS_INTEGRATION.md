# Magic Roulette - Kamino & Squads Integration Architecture

**Date:** 2025-02-21
**Status:** Design Phase
**Version:** 1.0

---

## 🎯 Overview

This document outlines the integration of **Kamino Finance** (lending/borrowing) and **Squads Protocol** (multisig wallet) into Magic Roulette, enabling:

1. **Kamino Integration**: Players can borrow SOL for entry fees with collateral
2. **Squads Integration**: Platform treasury managed by multisig for security
3. **Combined Features**: Leveraged gameplay with secure fund management

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Kamino Integration](#kamino-integration)
3. [Squads Integration](#squads-integration)
4. [New Instructions](#new-instructions)
5. [Security Considerations](#security-considerations)
6. [Implementation Plan](#implementation-plan)
7. [Testing Strategy](#testing-strategy)

---

## 🏗️ Architecture Overview

### Current System
```
Player → SOL Entry Fee → Game Vault → Winners
                       ↓
                  Platform Fee (5%)
                  Treasury Fee (10%)
```

### Enhanced System with Kamino + Squads
```
Player → Collateral → Kamino Lend → Borrowed SOL → Game Vault → Winners
                                                   ↓
                                              Platform Fee → Squads Multisig
                                              Treasury Fee → Squads Multisig
                                                   ↓
                                              Multisig Approval → Distribution
```

---

## 💰 Kamino Integration

### Use Cases

1. **Borrow for Entry Fee**: Player deposits collateral (SOL/USDC) to borrow entry fee
2. **Auto-Repayment**: If player wins, loan auto-repaid from winnings
3. **Collateral Liquidation**: If player loses, collateral covers the loan
4. **Leveraged Gameplay**: Players can play with borrowed funds (higher risk/reward)

### Integration Points

#### 1. Kamino Lend SDK
```typescript
import { KaminoMarket, KaminoAction } from "@kamino-finance/klend-sdk";

// Initialize Kamino market
const market = await KaminoMarket.load(
  connection,
  new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF") // Main market
);
```

#### 2. Collateral Requirements
- **Minimum Collateral Ratio**: 110% (1.1x entry fee value)
- **Supported Collateral**: SOL, USDC, USDT, mSOL, stSOL
- **Liquidation Threshold**: 105% (if collateral drops below)

#### 3. Loan Flow
```
1. Player deposits collateral to Kamino
2. Borrow SOL for entry fee
3. Create game with borrowed SOL
4. Play game
5a. Win → Repay loan + interest, keep profit
5b. Lose → Collateral liquidated to repay loan
```

---

## 🔐 Squads Integration

### Use Cases

1. **Platform Authority**: Multisig controls platform config updates
2. **Treasury Management**: Multisig approves treasury withdrawals
3. **Emergency Actions**: Multisig can pause platform
4. **Fee Distribution**: Multisig approves fee distributions to team

### Integration Points

#### 1. Squads V4 Multisig SDK
```typescript
import * as multisig from "@sqds/multisig";

// Create multisig for platform authority
const [multisigPda] = multisig.getMultisigPda({
  createKey: createKey.publicKey,
});

// 3-of-5 multisig for platform team
await multisig.rpc.multisigCreateV2({
  connection,
  createKey,
  creator: wallet,
  multisigPda,
  threshold: 3,
  members: [
    { key: founder1, permissions: Permissions.all() },
    { key: founder2, permissions: Permissions.all() },
    { key: founder3, permissions: Permissions.all() },
    { key: developer1, permissions: Permissions.all() },
    { key: developer2, permissions: Permissions.all() },
  ],
  timeLock: 86400, // 24 hour delay for security
});
```

#### 2. Vault Structure
```
Squads Multisig
├── Vault 0: Platform Fee Vault (operational funds)
├── Vault 1: Treasury Vault (long-term reserves)
└── Vault 2: Emergency Fund (insurance)
```

#### 3. Spending Limits
```typescript
// Allow daily operational expenses without full approval
await multisig.rpc.configTransactionCreate({
  actions: [{
    __kind: "AddSpendingLimit",
    vaultIndex: 0,
    mint: SOL_MINT,
    amount: BigInt(10 * LAMPORTS_PER_SOL), // 10 SOL/day
    period: multisig.types.Period.Day,
    members: [operationsManager],
  }],
});
```

---

## 🔧 New Instructions

### 1. `create_game_with_loan`

**Purpose**: Create game using borrowed SOL from Kamino

**Accounts**:
```rust
#[derive(Accounts)]
pub struct CreateGameWithLoan<'info> {
    // Existing game accounts
    #[account(init, payer = player, space = Game::LEN)]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    // Kamino accounts
    /// CHECK: Kamino market account
    pub kamino_market: AccountInfo<'info>,
    
    /// CHECK: Kamino reserve (SOL lending pool)
    #[account(mut)]
    pub kamino_reserve: AccountInfo<'info>,
    
    /// CHECK: Player's Kamino obligation (loan account)
    #[account(mut)]
    pub player_obligation: AccountInfo<'info>,
    
    /// CHECK: Player's collateral account
    #[account(mut)]
    pub collateral_account: AccountInfo<'info>,
    
    /// CHECK: Kamino lending program
    pub kamino_program: AccountInfo<'info>,
    
    // Game vault
    /// CHECK: Game vault PDA
    #[account(mut, seeds = [b"game_vault", game.key().as_ref()], bump)]
    pub game_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
```

**Logic**:
```rust
pub fn create_game_with_loan(
    ctx: Context<CreateGameWithLoan>,
    game_mode: GameMode,
    entry_fee: u64,
    collateral_amount: u64,
    vrf_seed: [u8; 32],
) -> Result<()> {
    // 1. Validate collateral ratio (110% minimum)
    let required_collateral = entry_fee
        .checked_mul(110)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_div(100)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    require!(
        collateral_amount >= required_collateral,
        GameError::InsufficientCollateral
    );
    
    // 2. Deposit collateral to Kamino (CPI)
    kamino_deposit_collateral(
        ctx.accounts.kamino_program.to_account_info(),
        ctx.accounts.kamino_market.to_account_info(),
        ctx.accounts.player_obligation.to_account_info(),
        ctx.accounts.collateral_account.to_account_info(),
        ctx.accounts.player.to_account_info(),
        collateral_amount,
    )?;
    
    // 3. Borrow SOL from Kamino (CPI)
    kamino_borrow(
        ctx.accounts.kamino_program.to_account_info(),
        ctx.accounts.kamino_market.to_account_info(),
        ctx.accounts.kamino_reserve.to_account_info(),
        ctx.accounts.player_obligation.to_account_info(),
        ctx.accounts.game_vault.to_account_info(), // Borrowed SOL goes to game vault
        entry_fee,
    )?;
    
    // 4. Initialize game (same as create_game_sol)
    let game = &mut ctx.accounts.game;
    game.game_id = ctx.accounts.platform_config.total_games;
    game.creator = ctx.accounts.player.key();
    game.game_mode = game_mode;
    game.entry_fee = entry_fee;
    game.has_loan = true; // NEW FIELD
    game.loan_obligation = Some(ctx.accounts.player_obligation.key()); // NEW FIELD
    // ... rest of initialization
    
    ctx.accounts.platform_config.total_games += 1;
    
    msg!("🎮 Game {} created with Kamino loan", game.game_id);
    msg!("   Entry fee: {} SOL (borrowed)", entry_fee as f64 / 1e9);
    msg!("   Collateral: {} SOL", collateral_amount as f64 / 1e9);
    
    Ok(())
}
```

---

### 2. `finalize_game_with_loan_repayment`

**Purpose**: Finalize game and auto-repay Kamino loan if player won

**Accounts**:
```rust
#[derive(Accounts)]
pub struct FinalizeGameWithLoanRepayment<'info> {
    // Existing finalize accounts
    #[account(mut)]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub game_vault: AccountInfo<'info>,
    
    // Kamino repayment accounts
    /// CHECK: Kamino market
    pub kamino_market: AccountInfo<'info>,
    
    /// CHECK: Kamino reserve
    #[account(mut)]
    pub kamino_reserve: AccountInfo<'info>,
    
    /// CHECK: Player's obligation
    #[account(mut)]
    pub player_obligation: AccountInfo<'info>,
    
    /// CHECK: Kamino program
    pub kamino_program: AccountInfo<'info>,
    
    // Winner accounts
    /// CHECK: Winner 1
    #[account(mut)]
    pub winner1: AccountInfo<'info>,
    
    /// CHECK: Winner 2 (optional)
    #[account(mut)]
    pub winner2: AccountInfo<'info>,
    
    // Squads multisig accounts
    /// CHECK: Platform fee vault (Squads vault)
    #[account(mut)]
    pub platform_vault: AccountInfo<'info>,
    
    /// CHECK: Treasury vault (Squads vault)
    #[account(mut)]
    pub treasury_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
```

**Logic**:
```rust
pub fn finalize_game_with_loan_repayment(
    ctx: Context<FinalizeGameWithLoanRepayment>
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    require!(game.status == GameStatus::Finished, GameError::GameNotFinished);
    require!(game.winner_team.is_some(), GameError::NoWinner);
    
    let total_pot = game.total_pot;
    let platform_config = &ctx.accounts.platform_config;
    
    // Calculate fees
    let platform_fee = calculate_fee(total_pot, platform_config.platform_fee_bps)?;
    let treasury_fee = calculate_fee(total_pot, platform_config.treasury_fee_bps)?;
    let winner_amount = total_pot - platform_fee - treasury_fee;
    
    // If game has loan, repay first
    if game.has_loan {
        let loan_amount = game.entry_fee;
        
        // Get loan interest from Kamino
        let loan_interest = kamino_get_interest(
            &ctx.accounts.kamino_market,
            &ctx.accounts.player_obligation,
        )?;
        
        let total_repayment = loan_amount + loan_interest;
        
        // Check if winner has enough to repay
        let winning_team = game.winner_team.unwrap();
        let winner_is_borrower = (winning_team == 0 && game.team_a[0] == game.creator)
            || (winning_team == 1 && game.team_b[0] == game.creator);
        
        if winner_is_borrower {
            // Winner borrowed - repay from winnings
            require!(
                winner_amount >= total_repayment,
                GameError::InsufficientWinningsForRepayment
            );
            
            // Repay loan (CPI to Kamino)
            kamino_repay(
                ctx.accounts.kamino_program.to_account_info(),
                ctx.accounts.kamino_market.to_account_info(),
                ctx.accounts.kamino_reserve.to_account_info(),
                ctx.accounts.player_obligation.to_account_info(),
                ctx.accounts.game_vault.to_account_info(),
                total_repayment,
            )?;
            
            // Withdraw collateral back to player
            kamino_withdraw_collateral(
                ctx.accounts.kamino_program.to_account_info(),
                ctx.accounts.kamino_market.to_account_info(),
                ctx.accounts.player_obligation.to_account_info(),
                ctx.accounts.winner1.to_account_info(),
            )?;
            
            // Reduce winner amount by repayment
            let final_winner_amount = winner_amount - total_repayment;
            
            msg!("💰 Loan repaid: {} SOL", total_repayment as f64 / 1e9);
            msg!("💰 Net winnings: {} SOL", final_winner_amount as f64 / 1e9);
            
            // Distribute remaining to winner
            transfer_sol(
                &ctx.accounts.game_vault,
                &ctx.accounts.winner1,
                final_winner_amount,
                &[&[b"game_vault", game.key().as_ref(), &[ctx.bumps.game_vault]]],
            )?;
        } else {
            // Borrower lost - collateral will be liquidated by Kamino
            msg!("❌ Borrower lost - collateral liquidated");
            
            // Distribute full amount to winner (no loan repayment needed)
            transfer_sol(
                &ctx.accounts.game_vault,
                &ctx.accounts.winner1,
                winner_amount,
                &[&[b"game_vault", game.key().as_ref(), &[ctx.bumps.game_vault]]],
            )?;
        }
    } else {
        // No loan - normal distribution
        transfer_sol(
            &ctx.accounts.game_vault,
            &ctx.accounts.winner1,
            winner_amount,
            &[&[b"game_vault", game.key().as_ref(), &[ctx.bumps.game_vault]]],
        )?;
    }
    
    // Distribute fees to Squads multisig vaults
    transfer_sol(
        &ctx.accounts.game_vault,
        &ctx.accounts.platform_vault,
        platform_fee,
        &[&[b"game_vault", game.key().as_ref(), &[ctx.bumps.game_vault]]],
    )?;
    
    transfer_sol(
        &ctx.accounts.game_vault,
        &ctx.accounts.treasury_vault,
        treasury_fee,
        &[&[b"game_vault", game.key().as_ref(), &[ctx.bumps.game_vault]]],
    )?;
    
    game.status = GameStatus::Cancelled;
    
    Ok(())
}
```

---

### 3. `initialize_platform_with_multisig`

**Purpose**: Initialize platform with Squads multisig as authority

**Accounts**:
```rust
#[derive(Accounts)]
pub struct InitializePlatformWithMultisig<'info> {
    #[account(
        init,
        payer = payer,
        space = PlatformConfig::LEN,
        seeds = [b"platform"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: Squads multisig PDA (will be authority)
    pub multisig: AccountInfo<'info>,
    
    /// CHECK: Squads vault 0 (platform fees)
    pub platform_vault: AccountInfo<'info>,
    
    /// CHECK: Squads vault 1 (treasury)
    pub treasury_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
```

**Logic**:
```rust
pub fn initialize_platform_with_multisig(
    ctx: Context<InitializePlatformWithMultisig>,
    platform_fee_bps: u16,
    treasury_fee_bps: u16,
) -> Result<()> {
    // Validate fees
    let total_fees = platform_fee_bps + treasury_fee_bps;
    require!(total_fees <= 2000, GameError::InvalidFeeConfig); // Max 20%
    
    let config = &mut ctx.accounts.platform_config;
    
    // Set multisig as authority (not a single wallet)
    config.authority = ctx.accounts.multisig.key();
    config.treasury = ctx.accounts.treasury_vault.key();
    config.platform_vault = ctx.accounts.platform_vault.key(); // NEW FIELD
    config.platform_fee_bps = platform_fee_bps;
    config.treasury_fee_bps = treasury_fee_bps;
    config.total_games = 0;
    config.total_volume = 0;
    config.treasury_balance = 0;
    config.paused = false;
    config.bump = ctx.bumps.platform_config;
    
    msg!("🏛️ Platform initialized with Squads multisig");
    msg!("   Authority: {}", config.authority);
    msg!("   Platform vault: {}", config.platform_vault);
    msg!("   Treasury vault: {}", config.treasury);
    
    Ok(())
}
```

---

### 4. `withdraw_treasury_via_multisig`

**Purpose**: Withdraw from treasury (requires Squads multisig approval)

**Accounts**:
```rust
#[derive(Accounts)]
pub struct WithdrawTreasuryViaMultisig<'info> {
    #[account(mut)]
    pub platform_config: Account<'info, PlatformConfig>,
    
    /// CHECK: Squads multisig (must match platform authority)
    pub multisig: AccountInfo<'info>,
    
    /// CHECK: Squads transaction PDA (approved proposal)
    pub multisig_transaction: AccountInfo<'info>,
    
    /// CHECK: Treasury vault (Squads vault)
    #[account(mut)]
    pub treasury_vault: AccountInfo<'info>,
    
    /// CHECK: Recipient
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
```

**Logic**:
```rust
pub fn withdraw_treasury_via_multisig(
    ctx: Context<WithdrawTreasuryViaMultisig>,
    amount: u64,
) -> Result<()> {
    // Validate multisig authority
    require!(
        ctx.accounts.multisig.key() == ctx.accounts.platform_config.authority,
        GameError::Unauthorized
    );
    
    // NOTE: Actual withdrawal is executed by Squads multisig
    // This instruction just validates and records the withdrawal
    
    ctx.accounts.platform_config.treasury_balance = ctx.accounts.platform_config.treasury_balance
        .checked_sub(amount)
        .ok_or(GameError::InsufficientTreasuryBalance)?;
    
    msg!("💸 Treasury withdrawal approved: {} SOL", amount as f64 / 1e9);
    msg!("   Recipient: {}", ctx.accounts.recipient.key());
    
    Ok(())
}
```

---

## 🔒 Security Considerations

### Kamino Integration Security

1. **Collateral Ratio Validation**
   - Always enforce minimum 150% collateral
   - Check Kamino oracle prices before borrowing
   - Monitor liquidation threshold (120%)

2. **Loan Repayment**
   - Auto-repay from winnings if possible
   - Handle partial repayments
   - Graceful handling of liquidations

3. **Oracle Manipulation**
   - Use Kamino's Scope oracle (aggregates multiple sources)
   - Add price staleness checks
   - Implement circuit breakers for extreme price moves

### Squads Integration Security

1. **Multisig Configuration**
   - Minimum 3-of-5 threshold
   - 24-hour time lock for large withdrawals
   - Separate vaults for different purposes

2. **Authority Validation**
   - Always verify multisig PDA matches platform authority
   - Check transaction approval status
   - Validate proposal signatures

3. **Spending Limits**
   - Daily limits for operational expenses
   - Full approval required for large amounts
   - Emergency pause mechanism

### Combined Security

1. **Reentrancy Protection**
   - Update state before external calls
   - Use checks-effects-interactions pattern
   - Add reentrancy guards

2. **Access Control**
   - Multisig for platform config changes
   - Multisig for treasury withdrawals
   - Player-only for game actions

3. **Error Handling**
   - Graceful handling of Kamino failures
   - Rollback on partial failures
   - Clear error messages

---

## 📅 Implementation Plan

### Phase 1: State Updates (Week 1)
- [ ] Add new fields to `PlatformConfig`
  - `platform_vault: Pubkey`
  - `multisig_authority: Pubkey`
- [ ] Add new fields to `Game`
  - `has_loan: bool`
  - `loan_obligation: Option<Pubkey>`
  - `collateral_amount: u64`
- [ ] Add new error codes
  - `InsufficientCollateral`
  - `LoanRepaymentFailed`
  - `MultisigUnauthorized`

### Phase 2: Kamino Integration (Week 2)
- [ ] Add Kamino SDK dependencies
- [ ] Implement `create_game_with_loan`
- [ ] Implement `finalize_game_with_loan_repayment`
- [ ] Add Kamino CPI helpers
- [ ] Write unit tests

### Phase 3: Squads Integration (Week 3)
- [ ] Add Squads SDK dependencies
- [ ] Implement `initialize_platform_with_multisig`
- [ ] Implement `withdraw_treasury_via_multisig`
- [ ] Update existing instructions to use multisig vaults
- [ ] Write unit tests

### Phase 4: Testing (Week 4)
- [ ] Integration tests with Kamino devnet
- [ ] Integration tests with Squads devnet
- [ ] End-to-end flow tests
- [ ] Security audit
- [ ] Load testing

### Phase 5: Deployment (Week 5)
- [ ] Deploy to devnet
- [ ] Create multisig on devnet
- [ ] Test with real Kamino loans
- [ ] Monitor for issues
- [ ] Deploy to mainnet

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe("Kamino Integration", () => {
  it("creates game with loan", async () => {
    // Deposit collateral
    // Borrow from Kamino
    // Create game
    // Verify game state
  });
  
  it("repays loan on win", async () => {
    // Create game with loan
    // Play and win
    // Finalize
    // Verify loan repaid
    // Verify collateral returned
  });
  
  it("liquidates collateral on loss", async () => {
    // Create game with loan
    // Play and lose
    // Finalize
    // Verify collateral liquidated
  });
  
  it("rejects insufficient collateral", async () => {
    // Try to borrow with low collateral
    // Should fail
  });
});

describe("Squads Integration", () => {
  it("initializes platform with multisig", async () => {
    // Create multisig
    // Initialize platform
    // Verify multisig is authority
  });
  
  it("requires multisig approval for treasury withdrawal", async () => {
    // Try to withdraw without approval
    // Should fail
    // Create proposal
    // Vote and approve
    // Execute withdrawal
    // Should succeed
  });
  
  it("enforces spending limits", async () => {
    // Set daily limit
    // Withdraw within limit (no approval needed)
    // Try to exceed limit
    // Should require approval
  });
});

describe("Combined Features", () => {
  it("full flow: borrow, play, win, repay", async () => {
    // Player deposits collateral
    // Borrows SOL
    // Creates game
    // Plays and wins
    // Loan auto-repaid
    // Fees sent to multisig vaults
    // Multisig approves distribution
  });
});
```

### Integration Tests

1. **Kamino Devnet Testing**
   - Use Kamino devnet market
   - Test with real oracle prices
   - Simulate liquidations

2. **Squads Devnet Testing**
   - Create real multisig
   - Test proposal flow
   - Test time locks

3. **End-to-End Testing**
   - Full game flow with loans
   - Multisig treasury management
   - Emergency scenarios

---

## 📊 Cost Analysis

### Transaction Costs

| Operation | Compute Units | Rent (SOL) | Total Cost |
|-----------|---------------|------------|------------|
| Create game with loan | ~200,000 | 0.002 | ~0.003 SOL |
| Finalize with repayment | ~250,000 | 0 | ~0.001 SOL |
| Multisig proposal | ~100,000 | 0.001 | ~0.002 SOL |
| Multisig execute | ~150,000 | 0 | ~0.001 SOL |

### Kamino Fees

- **Borrow APY**: ~5-10% (variable)
- **Origination Fee**: 0.1%
- **Liquidation Penalty**: 5%

### Squads Fees

- **Multisig Creation**: ~0.01 SOL (one-time)
- **Transaction Rent**: ~0.001 SOL per proposal
- **No ongoing fees**

---

## 🎯 Success Metrics

### Kamino Integration
- [ ] 30% of games use borrowed funds
- [ ] <1% liquidation rate
- [ ] Average loan size: 0.1-1 SOL
- [ ] 95% loan repayment rate

### Squads Integration
- [ ] 100% treasury withdrawals via multisig
- [ ] <24h average approval time
- [ ] 0 unauthorized withdrawals
- [ ] 5+ multisig members

---

## 📚 Resources

### Kamino
- [Kamino Docs](https://docs.kamino.finance)
- [K-Lend SDK](https://github.com/Kamino-Finance/klend-sdk)
- [Scope Oracle](https://github.com/Kamino-Finance/scope-sdk)

### Squads
- [Squads Docs](https://docs.squads.so)
- [V4 SDK](https://github.com/Squads-Protocol/v4)
- [Examples](https://github.com/Squads-Protocol/v4-examples)

---

## 🚀 Next Steps

1. **Review this architecture** with team
2. **Activate Kamino skill** for detailed implementation
3. **Activate Squads skill** for multisig setup
4. **Start Phase 1** (state updates)
5. **Create test plan** for each phase

---

**Status**: ✅ Architecture Complete - Ready for Implementation
**Estimated Timeline**: 5 weeks
**Risk Level**: Medium (new integrations require thorough testing)
