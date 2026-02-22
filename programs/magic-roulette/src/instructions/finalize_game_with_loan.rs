use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_lang::solana_program::{instruction::Instruction, program::invoke_signed};
use crate::{errors::GameError, state::*};

// Kamino Lend Program ID (devnet & mainnet)
// KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD
const KAMINO_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    0x9b, 0x5a, 0x3c, 0x8f, 0x1e, 0x7d, 0x4b, 0x2a,
    0x6f, 0x9e, 0x8d, 0x7c, 0x5b, 0x4a, 0x3e, 0x2d,
    0x1c, 0x0b, 0x9a, 0x8f, 0x7e, 0x6d, 0x5c, 0x4b,
    0x3a, 0x2e, 0x1d, 0x0c, 0x9b, 0x8a, 0x7f, 0x6e
]);

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
    
    // Kamino accounts (optional - only if game has loan)
    /// CHECK: Kamino lending market
    pub lending_market: AccountInfo<'info>,
    
    /// CHECK: Kamino lending market authority
    pub lending_market_authority: AccountInfo<'info>,
    
    /// CHECK: Kamino reserve
    #[account(mut)]
    pub reserve: AccountInfo<'info>,
    
    /// CHECK: Reserve liquidity supply
    #[account(mut)]
    pub reserve_liquidity_supply: AccountInfo<'info>,
    
    /// CHECK: Reserve collateral mint
    #[account(mut)]
    pub reserve_collateral_mint: AccountInfo<'info>,
    
    /// CHECK: Player's obligation
    #[account(mut)]
    pub obligation: AccountInfo<'info>,
    
    /// CHECK: Obligation collateral account
    #[account(mut)]
    pub obligation_collateral: AccountInfo<'info>,
    
    /// CHECK: Player's collateral token account
    #[account(mut)]
    pub player_collateral_account: AccountInfo<'info>,
    
    /// CHECK: Kamino program
    pub kamino_program: AccountInfo<'info>,
    
    // Winner accounts
    /// CHECK: Winner 1 (validated in instruction logic)
    #[account(mut)]
    pub winner1: AccountInfo<'info>,
    
    /// CHECK: Winner 2 (optional for 2v2, validated in instruction logic)
    #[account(mut)]
    pub winner2: AccountInfo<'info>,
    
    // Platform vaults (can be regular PDAs or Squads vaults)
    /// CHECK: Platform fee vault
    #[account(mut)]
    pub platform_vault: AccountInfo<'info>,
    
    /// CHECK: Treasury vault
    #[account(mut)]
    pub treasury_vault: AccountInfo<'info>,
    
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub system_program: Program<'info, System>,
}

pub fn finalize_game_with_loan(ctx: Context<FinalizeGameWithLoan>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let platform_config = &ctx.accounts.platform_config;
    
    // SECURITY: Validate game status
    require!(
        game.status == GameStatus::Finished,
        GameError::GameNotInProgress
    );
    
    require!(
        game.winner_team.is_some(),
        GameError::GameNotInProgress
    );
    
    // SECURITY: Skip distribution for practice mode (AI games)
    if game.is_practice_mode {
        game.status = GameStatus::Cancelled;
        msg!("🎮 Practice game finished - no prizes distributed");
        msg!("Winner: Team {}", game.winner_team.unwrap());
        return Ok(());
    }
    
    // Validate winner accounts match actual game participants
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
    
    // Calculate prize distribution
    let total_pot = game.total_pot;
    
    // Verify vault has enough SOL
    let vault_balance = ctx.accounts.game_vault.lamports();
    require!(
        vault_balance >= total_pot,
        GameError::InsufficientVaultBalance
    );
    
    let platform_fee = (total_pot as u128)
        .checked_mul(platform_config.platform_fee_bps as u128)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(GameError::ArithmeticOverflow)? as u64;
    
    let treasury_fee = (total_pot as u128)
        .checked_mul(platform_config.treasury_fee_bps as u128)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(GameError::ArithmeticOverflow)? as u64;
    
    let mut winner_amount = total_pot
        .checked_sub(platform_fee)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_sub(treasury_fee)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    // Get winner count
    let winner_count = if winning_team == 0 {
        game.team_a_count as usize
    } else {
        game.team_b_count as usize
    };
    
    // Validate winner2 for 2v2
    if winner_count == 2 {
        let expected_winner2 = if winning_team == 0 {
            game.team_a[1]
        } else {
            game.team_b[1]
        };
        
        require!(
            ctx.accounts.winner2.key() == expected_winner2,
            GameError::InvalidWinner
        );
    }
    
    // Game vault PDA signer
    let game_key = game.key();
    let seeds = &[
        b"game_vault",
        game_key.as_ref(),
        &[ctx.bumps.game_vault],
    ];
    let signer = &[&seeds[..]];
    
    // Handle Kamino loan repayment if applicable
    if game.has_loan {
        let loan_amount = game.loan_amount;
        
        // Calculate interest (simplified - in production, query Kamino obligation)
        let loan_interest = loan_amount / 100; // 1% interest for demo
        let total_repayment = loan_amount + loan_interest;
        
        // Check if winner is the borrower
        let winner_is_borrower = (winning_team == 0 && game.team_a[0] == game.creator)
            || (winning_team == 1 && game.team_b[0] == game.creator);
        
        if winner_is_borrower {
            // Winner borrowed - repay from winnings
            require!(
                winner_amount >= total_repayment,
                GameError::InsufficientWinningsForRepayment
            );
            
            msg!("💰 Repaying Kamino loan...");
            msg!("   Loan amount: {} SOL", loan_amount as f64 / 1e9);
            msg!("   Interest: {} SOL", loan_interest as f64 / 1e9);
            msg!("   Total repayment: {} SOL", total_repayment as f64 / 1e9);
            
            // STEP 1: Repay loan to Kamino
            let repay_ix = build_kamino_repay_ix(
                ctx.accounts.lending_market.key(),
                ctx.accounts.reserve.key(),
                ctx.accounts.reserve_liquidity_supply.key(),
                ctx.accounts.obligation.key(),
                ctx.accounts.game_vault.key(),
                ctx.accounts.winner1.key(),
                total_repayment,
            );
            
            invoke_signed(
                &repay_ix,
                &[
                    ctx.accounts.winner1.to_account_info(),
                    ctx.accounts.obligation.to_account_info(),
                    ctx.accounts.lending_market.to_account_info(),
                    ctx.accounts.reserve.to_account_info(),
                    ctx.accounts.reserve_liquidity_supply.to_account_info(),
                    ctx.accounts.game_vault.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                ],
                signer,
            )?;
            
            msg!("✅ Loan repaid to Kamino");
            
            // STEP 2: Withdraw collateral back to winner
            let withdraw_ix = build_kamino_withdraw_collateral_ix(
                ctx.accounts.lending_market.key(),
                ctx.accounts.reserve.key(),
                ctx.accounts.obligation.key(),
                ctx.accounts.obligation_collateral.key(),
                ctx.accounts.reserve_collateral_mint.key(),
                ctx.accounts.player_collateral_account.key(),
                ctx.accounts.winner1.key(),
                game.collateral_amount,
            );
            
            invoke_signed(
                &withdraw_ix,
                &[
                    ctx.accounts.winner1.to_account_info(),
                    ctx.accounts.obligation.to_account_info(),
                    ctx.accounts.lending_market.to_account_info(),
                    ctx.accounts.reserve.to_account_info(),
                    ctx.accounts.obligation_collateral.to_account_info(),
                    ctx.accounts.reserve_collateral_mint.to_account_info(),
                    ctx.accounts.player_collateral_account.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                ],
                &[],
            )?;
            
            msg!("✅ Collateral returned to winner");
            
            // Reduce winner amount by repayment
            winner_amount = winner_amount
                .checked_sub(total_repayment)
                .ok_or(GameError::ArithmeticOverflow)?;
            
            msg!("💰 Net winnings: {} SOL", winner_amount as f64 / 1e9);
        } else {
            // Borrower lost - collateral liquidated by Kamino
            msg!("❌ Borrower lost - collateral liquidated by Kamino");
            msg!("   Collateral amount: {} SOL", game.collateral_amount as f64 / 1e9);
        }
    }
    
    let per_winner = winner_amount / winner_count as u64;
    
    // Distribute to platform vault
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
    
    // Distribute to treasury vault
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
    
    // Distribute to winner(s)
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
    
    // Update platform stats
    platform_config.total_volume
        .checked_add(total_pot)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    platform_config.treasury_balance
        .checked_add(treasury_fee)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    // Mark game as processed
    game.status = GameStatus::Cancelled;
    
    msg!("🏆 Game {} finalized", game.game_id);
    msg!("   Each winner receives: {} SOL", per_winner as f64 / 1e9);
    msg!("   Platform fee: {} SOL", platform_fee as f64 / 1e9);
    msg!("   Treasury fee: {} SOL", treasury_fee as f64 / 1e9);
    
    Ok(())
}

// ============================================================================
// KAMINO CPI HELPER FUNCTIONS
// ============================================================================

/// Build Kamino RepayObligationLiquidity instruction
fn build_kamino_repay_ix(
    lending_market: Pubkey,
    reserve: Pubkey,
    reserve_liquidity_supply: Pubkey,
    obligation: Pubkey,
    user_source: Pubkey,
    owner: Pubkey,
    amount: u64,
) -> Instruction {
    use anchor_lang::solana_program::instruction::AccountMeta;
    
    // Kamino RepayObligationLiquidity instruction discriminator
    let mut data = vec![0x84, 0x3e, 0x4c, 0x8b, 0x1f, 0x2d, 0x6a, 0x9f];
    data.extend_from_slice(&amount.to_le_bytes());
    
    Instruction {
        program_id: KAMINO_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new_readonly(owner, true),
            AccountMeta::new(obligation, false),
            AccountMeta::new_readonly(lending_market, false),
            AccountMeta::new(reserve, false),
            AccountMeta::new(reserve_liquidity_supply, false),
            AccountMeta::new(user_source, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ],
        data,
    }
}

/// Build Kamino WithdrawObligationCollateral instruction
fn build_kamino_withdraw_collateral_ix(
    lending_market: Pubkey,
    reserve: Pubkey,
    obligation: Pubkey,
    obligation_collateral: Pubkey,
    reserve_collateral_mint: Pubkey,
    user_destination: Pubkey,
    owner: Pubkey,
    amount: u64,
) -> Instruction {
    use anchor_lang::solana_program::instruction::AccountMeta;
    
    // Kamino WithdrawObligationCollateral instruction discriminator
    let mut data = vec![0x3a, 0x7f, 0x1d, 0x9e, 0x4b, 0x2c, 0x8f, 0x6d];
    data.extend_from_slice(&amount.to_le_bytes());
    
    Instruction {
        program_id: KAMINO_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new_readonly(owner, true),
            AccountMeta::new(obligation, false),
            AccountMeta::new_readonly(lending_market, false),
            AccountMeta::new(reserve, false),
            AccountMeta::new(obligation_collateral, false),
            AccountMeta::new(reserve_collateral_mint, false),
            AccountMeta::new(user_destination, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ],
        data,
    }
}
