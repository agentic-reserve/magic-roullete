use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct FinalizeGameSol<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// Game vault PDA - holds SOL for this game
    /// CHECK: PDA for holding SOL
    #[account(
        mut,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: AccountInfo<'info>,
    
    /// Platform authority wallet (receives platform fee)
    /// CHECK: Validated against platform_config
    #[account(
        mut,
        constraint = platform_authority.key() == platform_config.authority @ GameError::Unauthorized
    )]
    pub platform_authority: AccountInfo<'info>,
    
    /// Treasury wallet (receives treasury fee)
    /// CHECK: Validated against platform_config
    #[account(
        mut,
        constraint = treasury.key() == platform_config.treasury @ GameError::Unauthorized
    )]
    pub treasury: AccountInfo<'info>,
    
    // Winner accounts (up to 2 for 2v2)
    /// CHECK: Winner 1
    #[account(mut)]
    pub winner1: AccountInfo<'info>,
    
    /// CHECK: Winner 2 (optional for 2v2)
    #[account(mut)]
    pub winner2: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn finalize_game_sol(ctx: Context<FinalizeGameSol>) -> Result<()> {
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
    
    // SECURITY: Validate winner accounts match actual game participants
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
    
    // Calculate prize distribution
    let total_pot = game.total_pot;
    
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
    
    let winner_amount = total_pot
        .checked_sub(platform_fee)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_sub(treasury_fee)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    let per_winner = winner_amount / winner_count as u64;
    
    // Game vault PDA signer
    let game_key = game.key();
    let bump = ctx.bumps.game_vault;
    let seeds = &[
        b"game_vault",
        game_key.as_ref(),
        &[bump],
    ];
    let signer = &[&seeds[..]];
    
    // SECURITY: Verify vault has enough SOL (including rent exemption)
    let vault_balance = ctx.accounts.game_vault.lamports();
    let rent_exempt_minimum = Rent::get()?.minimum_balance(0);
    
    require!(
        vault_balance >= total_pot + rent_exempt_minimum,
        GameError::InsufficientVaultBalance
    );
    
    msg!("💰 Finalizing game {}", game.game_id);
    msg!("   Total pot: {} SOL", total_pot as f64 / 1_000_000_000.0);
    msg!("   Platform fee: {} SOL", platform_fee as f64 / 1_000_000_000.0);
    msg!("   Treasury fee: {} SOL", treasury_fee as f64 / 1_000_000_000.0);
    msg!("   Winner amount: {} SOL", winner_amount as f64 / 1_000_000_000.0);
    msg!("   Per winner: {} SOL", per_winner as f64 / 1_000_000_000.0);
    
    // EFFECTS: Update state before interactions
    let platform_config = &mut ctx.accounts.platform_config;
    platform_config.total_volume = platform_config.total_volume
        .checked_add(total_pot)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    platform_config.treasury_balance = platform_config.treasury_balance
        .checked_add(treasury_fee)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    game.status = GameStatus::Cancelled;
    game.finished_at = Some(Clock::get()?.unix_timestamp);
    
    // INTERACTIONS: Distribute funds
    // Distribute to platform
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.platform_authority.to_account_info(),
            },
            signer,
        ),
        platform_fee,
    )?;
    
    // Distribute to treasury
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
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
    
    msg!("✅ Game finalized successfully!");
    msg!("🎉 Prizes distributed!");
    
    Ok(())
}
