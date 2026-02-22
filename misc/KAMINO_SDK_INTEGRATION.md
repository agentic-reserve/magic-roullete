# Kamino SDK Integration Guide

**Status**: Ready for Implementation
**Date**: 2025-02-21

---

## 🎯 Overview

This guide covers integrating the real Kamino Lend SDK into Magic Roulette for actual borrowing/lending functionality.

---

## 📦 Step 1: Add Kamino Dependencies

### Update Cargo.toml

```toml
[dependencies]
anchor-lang = "0.32.1"
anchor-spl = "0.32.1"
ephemeral-rollups-sdk = { version = "0.6.5", features = ["anchor", "disable-realloc"] }

# Kamino Lend SDK
kamino-lending = { git = "https://github.com/Kamino-Finance/klend", branch = "master" }
```

---

## 🔧 Step 2: Update create_game_with_loan.rs

Replace the simulated implementation with real Kamino CPI calls:

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use kamino_lending::{
    cpi::accounts::{DepositReserveLiquidity, BorrowObligationLiquidity},
    program::KaminoLending,
    state::{Reserve, Obligation},
};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
#[instruction(game_mode: GameMode, entry_fee: u64, collateral_amount: u64)]
pub struct CreateGameWithLoan<'info> {
    #[account(
        init,
        payer = player,
        space = Game::LEN,
        seeds = [b"game", platform_config.total_games.to_le_bytes().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    /// Game vault PDA - holds SOL for this game
    /// CHECK: PDA for holding SOL
    #[account(
        mut,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: AccountInfo<'info>,
    
    // Kamino Lend accounts
    /// Kamino lending market
    /// CHECK: Validated by Kamino program
    pub lending_market: AccountInfo<'info>,
    
    /// SOL reserve account
    #[account(mut)]
    pub reserve: Account<'info, Reserve>,
    
    /// Reserve liquidity supply (where borrowed SOL comes from)
    /// CHECK: Validated by Kamino program
    #[account(mut)]
    pub reserve_liquidity_supply: AccountInfo<'info>,
    
    /// Reserve collateral mint
    /// CHECK: Validated by Kamino program
    #[account(mut)]
    pub reserve_collateral_mint: AccountInfo<'info>,
    
    /// Player's obligation account (loan account)
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + std::mem::size_of::<Obligation>(),
        seeds = [
            b"obligation",
            lending_market.key().as_ref(),
            player.key().as_ref(),
        ],
        bump
    )]
    pub obligation: Account<'info, Obligation>,
    
    /// Player's collateral token account
    /// CHECK: Validated by Kamino program
    #[account(mut)]
    pub player_collateral_account: AccountInfo<'info>,
    
    /// Obligation collateral account
    /// CHECK: Validated by Kamino program
    #[account(mut)]
    pub obligation_collateral: AccountInfo<'info>,
    
    /// Kamino lending program
    pub kamino_program: Program<'info, KaminoLending>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_game_with_loan(
    ctx: Context<CreateGameWithLoan>,
    game_mode: GameMode,
    entry_fee: u64,
    collateral_amount: u64,
    vrf_seed: [u8; 32],
) -> Result<()> {
    // Validate entry fee (minimum 0.01 SOL)
    require!(entry_fee >= 10_000_000, GameError::InsufficientEntryFee);
    
    // Validate collateral ratio (minimum 110%)
    let required_collateral = entry_fee
        .checked_mul(110)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_div(100)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    require!(
        collateral_amount >= required_collateral,
        GameError::InsufficientCollateral
    );
    
    // Step 1: Deposit collateral to Kamino
    msg!("💰 Depositing {} lamports as collateral", collateral_amount);
    
    let deposit_cpi_accounts = DepositReserveLiquidity {
        owner: ctx.accounts.player.to_account_info(),
        reserve: ctx.accounts.reserve.to_account_info(),
        reserve_liquidity_supply: ctx.accounts.reserve_liquidity_supply.to_account_info(),
        reserve_collateral_mint: ctx.accounts.reserve_collateral_mint.to_account_info(),
        lending_market: ctx.accounts.lending_market.to_account_info(),
        user_source_liquidity: ctx.accounts.player.to_account_info(),
        user_destination_collateral: ctx.accounts.player_collateral_account.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
    };
    
    let deposit_cpi_ctx = CpiContext::new(
        ctx.accounts.kamino_program.to_account_info(),
        deposit_cpi_accounts,
    );
    
    kamino_lending::cpi::deposit_reserve_liquidity(
        deposit_cpi_ctx,
        collateral_amount,
    )?;
    
    msg!("✅ Collateral deposited");
    
    // Step 2: Borrow SOL from Kamino
    msg!("💸 Borrowing {} lamports", entry_fee);
    
    let borrow_cpi_accounts = BorrowObligationLiquidity {
        owner: ctx.accounts.player.to_account_info(),
        obligation: ctx.accounts.obligation.to_account_info(),
        lending_market: ctx.accounts.lending_market.to_account_info(),
        reserve: ctx.accounts.reserve.to_account_info(),
        reserve_liquidity_supply: ctx.accounts.reserve_liquidity_supply.to_account_info(),
        obligation_collateral: ctx.accounts.obligation_collateral.to_account_info(),
        user_destination_liquidity: ctx.accounts.game_vault.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
    };
    
    let borrow_cpi_ctx = CpiContext::new(
        ctx.accounts.kamino_program.to_account_info(),
        borrow_cpi_accounts,
    );
    
    kamino_lending::cpi::borrow_obligation_liquidity(
        borrow_cpi_ctx,
        entry_fee,
    )?;
    
    msg!("✅ SOL borrowed and transferred to game vault");
    
    // Step 3: Initialize game
    let game = &mut ctx.accounts.game;
    let platform_config = &mut ctx.accounts.platform_config;
    
    game.game_id = platform_config.total_games;
    game.creator = ctx.accounts.player.key();
    game.game_mode = game_mode;
    game.status = GameStatus::WaitingForPlayers;
    game.entry_fee = entry_fee;
    game.total_pot = entry_fee;
    
    // AI settings
    game.is_ai_game = false;
    game.ai_difficulty = None;
    game.ai_player = None;
    game.is_practice_mode = false;
    
    // Kamino loan settings
    game.has_loan = true;
    game.loan_obligation = Some(ctx.accounts.obligation.key());
    game.collateral_amount = collateral_amount;
    game.loan_amount = entry_fee;
    
    // Initialize teams
    game.team_a = [ctx.accounts.player.key(), Pubkey::default()];
    game.team_b = [Pubkey::default(), Pubkey::default()];
    game.team_a_count = 1;
    game.team_b_count = 0;
    
    // Initialize game state
    game.bullet_chamber = 0;
    game.current_chamber = 1;
    game.current_turn = 0;
    game.shots_taken = 0;
    
    // VRF
    game.vrf_seed = vrf_seed;
    game.vrf_result = None;
    
    // Metadata
    game.winner_team = None;
    game.created_at = Clock::get()?.unix_timestamp;
    game.finished_at = None;
    game.bump = ctx.bumps.game;
    
    platform_config.total_games += 1;
    
    msg!("🎮 Game {} created with Kamino loan", game.game_id);
    msg!("   Entry fee: {} SOL (borrowed)", entry_fee as f64 / 1e9);
    msg!("   Collateral: {} SOL", collateral_amount as f64 / 1e9);
    msg!("   Obligation: {}", ctx.accounts.obligation.key());
    
    Ok(())
}
```

---

## 🏆 Step 3: Update finalize_game_with_loan.rs

Add real loan repayment logic:

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use kamino_lending::{
    cpi::accounts::{RepayObligationLiquidity, WithdrawObligationCollateral},
    program::KaminoLending,
    state::{Reserve, Obligation},
};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct FinalizeGameWithLoan<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    /// Game vault PDA
    /// CHECK: PDA validated by seeds
    #[account(
        mut,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: AccountInfo<'info>,
    
    // Kamino accounts
    /// CHECK: Kamino lending market
    pub lending_market: AccountInfo<'info>,
    
    /// SOL reserve
    #[account(mut)]
    pub reserve: Account<'info, Reserve>,
    
    /// Reserve liquidity supply
    /// CHECK: Validated by Kamino
    #[account(mut)]
    pub reserve_liquidity_supply: AccountInfo<'info>,
    
    /// Player's obligation
    #[account(mut)]
    pub obligation: Account<'info, Obligation>,
    
    /// Obligation collateral account
    /// CHECK: Validated by Kamino
    #[account(mut)]
    pub obligation_collateral: AccountInfo<'info>,
    
    /// Player's collateral token account
    /// CHECK: Validated by Kamino
    #[account(mut)]
    pub player_collateral_account: AccountInfo<'info>,
    
    /// Kamino program
    pub kamino_program: Program<'info, KaminoLending>,
    
    // Winner accounts
    /// CHECK: Winner 1
    #[account(mut)]
    pub winner1: AccountInfo<'info>,
    
    /// CHECK: Winner 2 (optional)
    #[account(mut)]
    pub winner2: AccountInfo<'info>,
    
    // Platform vaults
    /// CHECK: Platform fee vault
    #[account(mut)]
    pub platform_vault: AccountInfo<'info>,
    
    /// CHECK: Treasury vault
    #[account(mut)]
    pub treasury_vault: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn finalize_game_with_loan(ctx: Context<FinalizeGameWithLoan>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let platform_config = &ctx.accounts.platform_config;
    
    // Validate game status
    require!(
        game.status == GameStatus::Finished,
        GameError::GameNotInProgress
    );
    
    require!(
        game.winner_team.is_some(),
        GameError::GameNotInProgress
    );
    
    // Skip practice mode
    if game.is_practice_mode {
        game.status = GameStatus::Cancelled;
        return Ok(());
    }
    
    // Validate winners
    let winning_team = game.winner_team.unwrap();
    let expected_winner1 = if winning_team == 0 {
        game.team_a[0]
    } else {
        game.team_b[0]
    };
    
    require!(
        ctx.accounts.winner1.key() == expected_winner1,
        GameError::InvalidWinner
    );
    
    // Calculate distribution
    let total_pot = game.total_pot;
    let vault_balance = ctx.accounts.game_vault.lamports();
    
    require!(
        vault_balance >= total_pot,
        GameError::InsufficientVaultBalance
    );
    
    let platform_fee = (total_pot as u128 * platform_config.platform_fee_bps as u128 / 10000) as u64;
    let treasury_fee = (total_pot as u128 * platform_config.treasury_fee_bps as u128 / 10000) as u64;
    let mut winner_amount = total_pot - platform_fee - treasury_fee;
    
    let winner_count = if winning_team == 0 {
        game.team_a_count as usize
    } else {
        game.team_b_count as usize
    };
    
    // Handle Kamino loan repayment
    if game.has_loan {
        let winner_is_borrower = (winning_team == 0 && game.team_a[0] == game.creator)
            || (winning_team == 1 && game.team_b[0] == game.creator);
        
        if winner_is_borrower {
            // Winner borrowed - repay loan
            let loan_amount = game.loan_amount;
            
            // Get actual interest from obligation
            let obligation = &ctx.accounts.obligation;
            let borrowed_amount_with_interest = obligation.borrows[0].borrowed_amount_wads;
            let total_repayment = borrowed_amount_with_interest;
            
            require!(
                winner_amount >= total_repayment,
                GameError::InsufficientWinningsForRepayment
            );
            
            msg!("💰 Repaying Kamino loan: {} lamports", total_repayment);
            
            // Repay loan via CPI
            let game_key = game.key();
            let seeds = &[
                b"game_vault",
                game_key.as_ref(),
                &[ctx.bumps.game_vault],
            ];
            let signer = &[&seeds[..]];
            
            let repay_cpi_accounts = RepayObligationLiquidity {
                owner: ctx.accounts.winner1.to_account_info(),
                obligation: ctx.accounts.obligation.to_account_info(),
                lending_market: ctx.accounts.lending_market.to_account_info(),
                reserve: ctx.accounts.reserve.to_account_info(),
                reserve_liquidity_supply: ctx.accounts.reserve_liquidity_supply.to_account_info(),
                user_source_liquidity: ctx.accounts.game_vault.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            };
            
            let repay_cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.kamino_program.to_account_info(),
                repay_cpi_accounts,
                signer,
            );
            
            kamino_lending::cpi::repay_obligation_liquidity(
                repay_cpi_ctx,
                total_repayment,
            )?;
            
            msg!("✅ Loan repaid");
            
            // Withdraw collateral back to winner
            let withdraw_cpi_accounts = WithdrawObligationCollateral {
                owner: ctx.accounts.winner1.to_account_info(),
                obligation: ctx.accounts.obligation.to_account_info(),
                lending_market: ctx.accounts.lending_market.to_account_info(),
                reserve: ctx.accounts.reserve.to_account_info(),
                obligation_collateral: ctx.accounts.obligation_collateral.to_account_info(),
                user_destination_collateral: ctx.accounts.player_collateral_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            };
            
            let withdraw_cpi_ctx = CpiContext::new(
                ctx.accounts.kamino_program.to_account_info(),
                withdraw_cpi_accounts,
            );
            
            kamino_lending::cpi::withdraw_obligation_collateral(
                withdraw_cpi_ctx,
                game.collateral_amount,
            )?;
            
            msg!("✅ Collateral returned to winner");
            
            // Reduce winner amount by repayment
            winner_amount = winner_amount - total_repayment;
            
            msg!("💰 Net winnings: {} SOL", winner_amount as f64 / 1e9);
        } else {
            // Borrower lost - collateral liquidated by Kamino
            msg!("❌ Borrower lost - collateral liquidated");
        }
    }
    
    // Distribute prizes
    let per_winner = winner_amount / winner_count as u64;
    
    let game_key = game.key();
    let seeds = &[
        b"game_vault",
        game_key.as_ref(),
        &[ctx.bumps.game_vault],
    ];
    let signer = &[&seeds[..]];
    
    // Platform fee
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.platform_vault.to_account_info(),
            },
            signer,
        ),
        platform_fee,
    )?;
    
    // Treasury fee
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.treasury_vault.to_account_info(),
            },
            signer,
        ),
        treasury_fee,
    )?;
    
    // Winner(s)
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.winner1.to_account_info(),
            },
            signer,
        ),
        per_winner,
    )?;
    
    if winner_count == 2 {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.game_vault.to_account_info(),
                    to: ctx.accounts.winner2.to_account_info(),
                },
                signer,
            ),
            per_winner,
        )?;
    }
    
    game.status = GameStatus::Cancelled;
    
    msg!("🏆 Game finalized");
    msg!("   Each winner: {} SOL", per_winner as f64 / 1e9);
    
    Ok(())
}
```

---

## 📝 Step 4: Testing

Create test file `tests/kamino-integration.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { KaminoMarket } from "@kamino-finance/klend-sdk";

describe("Kamino Integration", () => {
  const connection = new Connection("https://api.devnet.solana.com");
  const wallet = anchor.Wallet.local();
  const program = anchor.workspace.MagicRoulette;
  
  // Kamino devnet market
  const KAMINO_MARKET = new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF");
  
  it("creates game with real Kamino loan", async () => {
    // Load Kamino market
    const market = await KaminoMarket.load(connection, KAMINO_MARKET);
    const solReserve = market.getReserveBySymbol("SOL");
    
    // Create game with loan
    const entryFee = new BN(0.1 * LAMPORTS_PER_SOL);
    const collateral = new BN(0.11 * LAMPORTS_PER_SOL);
    
    const tx = await program.methods
      .createGameWithLoan(
        { oneVsOne: {} },
        entryFee,
        collateral,
        Array.from(Keypair.generate().publicKey.toBytes())
      )
      .accounts({
        lendingMarket: KAMINO_MARKET,
        reserve: solReserve.address,
        // ... other accounts
      })
      .rpc();
    
    console.log("Game created with Kamino loan:", tx);
  });
});
```

---

## 🚀 Deployment Steps

1. **Update Cargo.toml** with Kamino dependency
2. **Replace simulated code** with real CPI calls
3. **Test on devnet** with real Kamino market
4. **Audit** the integration
5. **Deploy to mainnet**

---

## ⚠️ Important Notes

1. **Kamino Program IDs**:
   - Devnet: `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD`
   - Mainnet: `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD`

2. **Reserve Addresses**: Get from Kamino SDK
   ```typescript
   const market = await KaminoMarket.load(connection, marketAddress);
   const solReserve = market.getReserveBySymbol("SOL");
   ```

3. **Obligation Account**: Must be initialized before borrowing

4. **Interest Calculation**: Use Kamino's obligation state for accurate interest

5. **Liquidation**: Kamino handles automatically if collateral ratio drops

---

## 📚 Resources

- [Kamino Docs](https://docs.kamino.finance)
- [K-Lend SDK](https://github.com/Kamino-Finance/klend-sdk)
- [Kamino Devnet Market](https://app.kamino.finance/?cluster=devnet)

---

**Status**: Ready to implement real Kamino SDK integration! 🚀
