use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform_config.bump,
        constraint = !platform_config.paused @ GameError::PlatformPaused
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    // Token-2022 accounts
    #[account(
        constraint = mint.key() == platform_config.platform_mint @ GameError::InvalidMint
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = player
    )]
    pub player_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player = ctx.accounts.player.key();
    
    require!(
        game.status == GameStatus::WaitingForPlayers,
        GameError::GameNotReady
    );
    
    require!(
        player != game.creator,
        GameError::CannotJoinOwnGame
    );
    
    // SECURITY: Check if player already in game
    require!(
        !game.team_a.contains(&player) && !game.team_b.contains(&player),
        GameError::PlayerAlreadyInGame
    );
    
    // Add player to appropriate team
    let required_per_team = match game.game_mode {
        GameMode::OneVsOne => 1,
        GameMode::TwoVsTwo => 2,
        GameMode::HumanVsAi => {
            return Err(GameError::CannotJoinAiGame.into());
        }
    };
    
    // Store counts before mutation
    let team_a_count = game.team_a_count;
    let team_b_count = game.team_b_count;
    
    if team_a_count < required_per_team {
        game.team_a[team_a_count as usize] = player;
        game.team_a_count += 1;
    } else if team_b_count < required_per_team {
        game.team_b[team_b_count as usize] = player;
        game.team_b_count += 1;
    }
    
    let entry_fee = game.entry_fee;
    let game_id = game.game_id;
    
    // Transfer entry fee
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        entry_fee,
        ctx.accounts.mint.decimals,
    )?;
    
    game.total_pot = game.total_pot
        .checked_add(entry_fee)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    let is_full = game.is_full();
    
    msg!("Player {} joined game {}", player, game_id);
    
    // Check if game is ready to start
    if is_full {
        msg!("Game {} is full and ready to delegate", game_id);
    }
    
    Ok(())
}
