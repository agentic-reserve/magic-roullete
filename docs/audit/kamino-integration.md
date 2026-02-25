# Kamino Finance Integration Documentation

## Overview

Magic Roulette integrates with Kamino Finance to enable leveraged betting, allowing players to borrow funds for game entry fees using their SOL/USDC as collateral. This creates a "leverage betting" feature where players can participate in higher-stakes games without fully funding the entry fee upfront.

**Kamino Finance**: Solana's leading DeFi lending protocol
**Integration Type**: Loan creation, collateral management, auto-repayment
**Collateralization Ratio**: 110% (1.1x collateral required)

## Kamino Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Kamino Leveraged Betting Flow                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Player Initiates Leveraged Game                         │
│     ├─ Player has collateral (SOL/USDC)                     │
│     ├─ Wants to play game with higher entry fee             │
│     └─ Calls: create_game_with_loan                         │
│                                                              │
│  2. Loan Creation (Kamino)                                  │
│     ├─ Create Kamino obligation account                     │
│     ├─ Deposit collateral (110% of entry fee)               │
│     ├─ Borrow entry fee amount                              │
│     └─ Store loan_id in game state                          │
│                                                              │
│  3. Game Execution                                          │
│     ├─ Entry fee transferred to game vault                  │
│     ├─ Game proceeds normally (VRF, shots, etc.)            │
│     └─ Winner determined                                    │
│                                                              │
│  4. Game Finalization with Loan Repayment                   │
│     ├─ Calculate winnings distribution                      │
│     ├─ If winner: Repay loan from winnings                  │
│     ├─ If loser: Collateral liquidated by Kamino            │
│     └─ Remaining funds distributed to winner                │
│                                                              │
│  5. Loan Closure                                            │
│     ├─ Repay borrowed amount + interest                     │
│     ├─ Return remaining collateral to player                │
│     └─ Close Kamino obligation account                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Kamino Instructions

### 1. `create_game_with_loan`

Creates a new game with Kamino loan for entry fee.

**Parameters**:
- `game_mode: GameMode` - OneVsOne or TwoVsTwo
- `entry_fee: u64` - Entry fee amount (borrowed from Kamino)
- `collateral_amount: u64` - Collateral amount (must be ≥ 110% of entry_fee)
- `vrf_seed: [u8; 32]` - VRF seed for randomness

**Accounts**:
- `creator` (signer, mut) - Game creator
- `game` (init, pda) - Game account
- `platform_config` (mut) - Platform configuration
- `kamino_market` - Kamino lending market
- `kamino_obligation` (init) - Kamino obligation account
- `kamino_reserve` - Kamino reserve (SOL or USDC)
- `creator_collateral_account` (mut) - Creator's collateral token account
- `game_vault` (init) - Game vault for entry fees
- `kamino_program` - Kamino lending program
- `token_program` - Token-2022 program
- `system_program` - System program

**Validation**:
- Collateral amount must be ≥ 110% of entry fee
- Creator must have sufficient collateral balance
- Kamino market must be active
- Entry fee must be > 0

**State Changes**:
- Creates `Game` account with `kamino_loan_id`
- Creates Kamino obligation account
- Deposits collateral to Kamino
- Borrows entry fee from Kamino
- Transfers borrowed funds to game vault
- Sets `game.has_kamino_loan = true`

**Security Considerations**:
- ✅ Collateralization ratio enforced (110%)
- ✅ Collateral balance check before deposit
- ✅ Kamino market validation
- ⚠️ **AUDIT FOCUS**: Collateral calculation overflow protection
- ⚠️ **AUDIT FOCUS**: Kamino CPI security

```rust
pub fn create_game_with_loan(
    ctx: Context<CreateGameWithLoan>,
    game_mode: GameMode,
    entry_fee: u64,
    collateral_amount: u64,
    vrf_seed: [u8; 32],
) -> Result<()> {
    // SECURITY: Validate collateralization ratio (110%)
    let required_collateral = entry_fee
        .checked_mul(110)
        .ok_or(errors::GameError::ArithmeticOverflow)?
        .checked_div(100)
        .ok_or(errors::GameError::ArithmeticOverflow)?;
    
    require!(
        collateral_amount >= required_collateral,
        errors::GameError::InsufficientCollateral
    );
    
    // Create Kamino obligation
    // CPI to Kamino: create_obligation
    
    // Deposit collateral
    // CPI to Kamino: deposit_reserve_liquidity
    
    // Borrow entry fee
    // CPI to Kamino: borrow_obligation_liquidity
    
    // Initialize game state
    let game = &mut ctx.accounts.game;
    game.game_id = ctx.accounts.platform_config.total_games;
    game.creator = ctx.accounts.creator.key();
    game.entry_fee = entry_fee;
    game.game_mode = game_mode;
    game.has_kamino_loan = true;
    game.kamino_loan_id = Some(obligation_id);
    
    msg!("Game {} created with Kamino loan", game.game_id);
    msg!("Entry fee: {}, Collateral: {}", entry_fee, collateral_amount);
    
    Ok(())
}
```

### 2. `finalize_game_with_loan`

Finalizes game and auto-repays Kamino loan from winnings.

**Parameters**: None

**Accounts**:
- `game` (mut) - Game account
- `platform_config` (mut) - Platform configuration
- `winner` - Winner account
- `game_vault` (mut) - Game vault
- `kamino_obligation` (mut) - Kamino obligation account
- `kamino_reserve` (mut) - Kamino reserve
- `platform_vault` (mut) - Platform fee vault
- `treasury_vault` (mut) - Treasury vault
- `winner_token_account` (mut) - Winner's token account
- `kamino_program` - Kamino lending program
- `token_program` - Token-2022 program

**Validation**:
- Game must be finished
- Winner must be determined
- Kamino loan must exist (`has_kamino_loan == true`)
- Game vault must have sufficient funds

**State Changes**:
- Calculates loan repayment amount (principal + interest)
- Repays loan from game vault
- Distributes remaining winnings (platform fee, treasury, winner)
- Closes Kamino obligation
- Sets `game.status = Cancelled`

**Loan Repayment Priority**:
1. **Kamino Loan Repayment** (principal + interest)
2. **Platform Fee** (5% of remaining pot)
3. **Treasury Fee** (10% of remaining pot)
4. **Winner Prize** (85% of remaining pot)

**Security Considerations**:
- ✅ Loan repayment before fee distribution
- ✅ Arithmetic overflow protection
- ✅ Sufficient funds check before repayment
- ⚠️ **AUDIT FOCUS**: Repayment amount calculation
- ⚠️ **AUDIT FOCUS**: Fund distribution order (CEI pattern)

```rust
pub fn finalize_game_with_loan(ctx: Context<FinalizeGameWithLoan>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // SECURITY: Validate game status
    require!(
        game.status == GameStatus::Finished,
        errors::GameError::GameNotInProgress
    );
    
    require!(
        game.has_kamino_loan,
        errors::GameError::NoKaminoLoan
    );
    
    // Calculate loan repayment (principal + interest)
    // CPI to Kamino: refresh_obligation (get current debt)
    let loan_amount = get_obligation_debt(&ctx.accounts.kamino_obligation)?;
    
    // SECURITY: Check sufficient funds for repayment
    require!(
        game.total_pot >= loan_amount,
        errors::GameError::InsufficientFundsForRepayment
    );
    
    // EFFECTS: Update state before interactions
    let remaining_pot = game.total_pot
        .checked_sub(loan_amount)
        .ok_or(errors::GameError::ArithmeticOverflow)?;
    
    // Calculate fee distribution from remaining pot
    let platform_fee = (remaining_pot as u128)
        .checked_mul(ctx.accounts.platform_config.platform_fee_bps as u128)
        .ok_or(errors::GameError::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(errors::GameError::ArithmeticOverflow)? as u64;
    
    let treasury_fee = (remaining_pot as u128)
        .checked_mul(ctx.accounts.platform_config.treasury_fee_bps as u128)
        .ok_or(errors::GameError::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(errors::GameError::ArithmeticOverflow)? as u64;
    
    let winner_amount = remaining_pot
        .checked_sub(platform_fee)
        .ok_or(errors::GameError::ArithmeticOverflow)?
        .checked_sub(treasury_fee)
        .ok_or(errors::GameError::ArithmeticOverflow)?;
    
    game.status = GameStatus::Cancelled;
    
    // INTERACTIONS: Repay loan first (CEI pattern)
    // CPI to Kamino: repay_obligation_liquidity
    repay_kamino_loan(
        &ctx.accounts.kamino_program,
        &ctx.accounts.kamino_obligation,
        &ctx.accounts.kamino_reserve,
        &ctx.accounts.game_vault,
        loan_amount,
    )?;
    
    // Distribute remaining funds
    // ... (platform fee, treasury fee, winner prize)
    
    msg!("Game {} finalized with Kamino loan repayment", game.game_id);
    msg!("Loan repaid: {}", loan_amount);
    msg!("Winner receives: {}", winner_amount);
    
    Ok(())
}
```

## Kamino Security Properties

### 1. Collateralization Enforcement

**Property**: All loans must be collateralized at 110% or higher.

**Mechanism**:
- Collateral amount validated before loan creation
- Checked math prevents overflow in collateral calculation
- Kamino enforces collateralization on-chain

**Validation**:
```rust
let required_collateral = entry_fee
    .checked_mul(110)
    .ok_or(errors::GameError::ArithmeticOverflow)?
    .checked_div(100)
    .ok_or(errors::GameError::ArithmeticOverflow)?;

require!(
    collateral_amount >= required_collateral,
    errors::GameError::InsufficientCollateral
);
```

### 2. Loan Repayment Priority

**Property**: Kamino loans are repaid before any fee distribution.

**Mechanism**:
- Loan repayment is first operation in finalization
- Sufficient funds check before repayment
- Fees calculated from remaining pot after repayment

**Repayment Order**:
1. Kamino loan repayment (principal + interest)
2. Platform fee (5% of remaining)
3. Treasury fee (10% of remaining)
4. Winner prize (85% of remaining)

### 3. Liquidation Handling

**Property**: If player loses, Kamino can liquidate collateral.

**Mechanism**:
- Kamino obligation remains active if loan not repaid
- Kamino liquidators can liquidate undercollateralized positions
- Platform does not interfere with Kamino liquidation

**Scenarios**:
- **Winner**: Loan repaid from winnings, collateral returned
- **Loser**: Loan not repaid, Kamino liquidates collateral

### 4. Interest Accrual

**Property**: Interest accrues on borrowed funds according to Kamino rates.

**Mechanism**:
- Kamino calculates interest based on borrow rate
- Interest included in repayment amount
- Platform queries Kamino for current debt amount

**Interest Calculation**:
```rust
// Query Kamino for current debt (principal + accrued interest)
let loan_amount = get_obligation_debt(&kamino_obligation)?;

// Repay full amount including interest
repay_kamino_loan(loan_amount)?;
```

## Kamino Integration Security Audit Focus

### Critical

1. **Collateral Calculation Overflow**
   - Verify checked math in collateral calculation
   - Check for arithmetic overflow/underflow
   - Ensure collateralization ratio is enforced

2. **Loan Repayment Amount**
   - Verify correct debt amount queried from Kamino
   - Check interest calculation
   - Ensure sufficient funds before repayment

3. **CPI Security**
   - Verify Kamino program ID validation
   - Check account ownership validation
   - Ensure no unauthorized CPI calls

### High

4. **Fund Distribution Order**
   - Verify loan repayment before fee distribution
   - Check CEI (Checks-Effects-Interactions) pattern
   - Ensure no reentrancy vulnerabilities

5. **Insufficient Funds Handling**
   - Verify behavior when pot < loan amount
   - Check error handling for failed repayment
   - Ensure no funds locked in game vault

### Medium

6. **Kamino Account Validation**
   - Verify Kamino obligation ownership
   - Check Kamino reserve validation
   - Ensure correct Kamino market

## Kamino CPI Calls

### 1. Create Obligation

```rust
// CPI to Kamino: create_obligation
kamino_lending::cpi::init_obligation(
    CpiContext::new(
        ctx.accounts.kamino_program.to_account_info(),
        kamino_lending::cpi::accounts::InitObligation {
            obligation: ctx.accounts.kamino_obligation.to_account_info(),
            lending_market: ctx.accounts.kamino_market.to_account_info(),
            obligation_owner: ctx.accounts.creator.to_account_info(),
            clock: ctx.accounts.clock.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        },
    ),
)?;
```

### 2. Deposit Collateral

```rust
// CPI to Kamino: deposit_reserve_liquidity
kamino_lending::cpi::deposit_reserve_liquidity(
    CpiContext::new(
        ctx.accounts.kamino_program.to_account_info(),
        kamino_lending::cpi::accounts::DepositReserveLiquidity {
            source_liquidity: ctx.accounts.creator_collateral_account.to_account_info(),
            destination_collateral: ctx.accounts.kamino_collateral_account.to_account_info(),
            reserve: ctx.accounts.kamino_reserve.to_account_info(),
            reserve_liquidity_supply: ctx.accounts.kamino_liquidity_supply.to_account_info(),
            reserve_collateral_mint: ctx.accounts.kamino_collateral_mint.to_account_info(),
            lending_market: ctx.accounts.kamino_market.to_account_info(),
            user_transfer_authority: ctx.accounts.creator.to_account_info(),
            clock: ctx.accounts.clock.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        },
    ),
    collateral_amount,
)?;
```

### 3. Borrow Funds

```rust
// CPI to Kamino: borrow_obligation_liquidity
kamino_lending::cpi::borrow_obligation_liquidity(
    CpiContext::new(
        ctx.accounts.kamino_program.to_account_info(),
        kamino_lending::cpi::accounts::BorrowObligationLiquidity {
            source_liquidity: ctx.accounts.kamino_liquidity_supply.to_account_info(),
            destination_liquidity: ctx.accounts.game_vault.to_account_info(),
            borrow_reserve: ctx.accounts.kamino_reserve.to_account_info(),
            obligation: ctx.accounts.kamino_obligation.to_account_info(),
            lending_market: ctx.accounts.kamino_market.to_account_info(),
            obligation_owner: ctx.accounts.creator.to_account_info(),
            clock: ctx.accounts.clock.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        },
    ),
    entry_fee,
)?;
```

### 4. Repay Loan

```rust
// CPI to Kamino: repay_obligation_liquidity
kamino_lending::cpi::repay_obligation_liquidity(
    CpiContext::new_with_signer(
        ctx.accounts.kamino_program.to_account_info(),
        kamino_lending::cpi::accounts::RepayObligationLiquidity {
            source_liquidity: ctx.accounts.game_vault.to_account_info(),
            destination_liquidity: ctx.accounts.kamino_liquidity_supply.to_account_info(),
            repay_reserve: ctx.accounts.kamino_reserve.to_account_info(),
            obligation: ctx.accounts.kamino_obligation.to_account_info(),
            lending_market: ctx.accounts.kamino_market.to_account_info(),
            user_transfer_authority: game.to_account_info(),
            clock: ctx.accounts.clock.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        },
        signer_seeds,
    ),
    loan_amount,
)?;
```

## Testing Recommendations

### Unit Tests

1. Test loan creation with valid collateral (110%)
2. Test loan creation with insufficient collateral (< 110%)
3. Test loan repayment with sufficient winnings
4. Test loan repayment with insufficient winnings
5. Test collateral calculation overflow protection

### Integration Tests

1. Test complete leveraged game flow (create → play → win → repay)
2. Test leveraged game with loser (collateral liquidation)
3. Test concurrent leveraged games
4. Test Kamino interest accrual over time

### Security Tests

1. Attempt to create loan with < 110% collateral
2. Attempt to skip loan repayment
3. Attempt to manipulate repayment amount
4. Verify Kamino liquidation works correctly
5. Test arithmetic overflow in collateral calculation

## Known Limitations

1. **Kamino Dependency**: System relies on Kamino protocol availability
   - **Mitigation**: Fallback to standard games if Kamino unavailable
   - **Monitoring**: Track Kamino market health

2. **Interest Rate Risk**: Interest accrues during game, may exceed winnings
   - **Mitigation**: Display estimated interest to players
   - **Recommendation**: Short game duration to minimize interest

3. **Liquidation Risk**: If collateral value drops, Kamino may liquidate
   - **Mitigation**: 110% collateralization provides buffer
   - **Recommendation**: Monitor collateral health during game

## Conclusion

The Kamino Finance integration enables leveraged betting with 110% collateralization. The system prioritizes loan repayment before fee distribution and relies on Kamino for liquidation handling. The main security considerations are collateral calculation correctness, loan repayment priority, and CPI security.

**Audit Recommendation**: Focus on collateral calculation overflow protection, loan repayment amount correctness, and CPI security validation.
