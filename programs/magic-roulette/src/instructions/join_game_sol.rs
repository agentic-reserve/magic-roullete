use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct JoinGameSol<'info> {
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
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    /// Game vault PDA - holds SOL for this game
    /// CHECK: PDA for holding SOL
    #[account(
        mut,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn join_game_sol(ctx: Context<JoinGameSol>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player = ctx.accounts.player.key();
    
    // SECURITY: Validate game status
    require!(
        game.status == GameStatus::WaitingForPlayers,
        GameError::GameNotReady
    );
    
    // SECURITY: Cannot join AI game
    require!(!game.is_ai_game, GameError::CannotJoinAiGame);
    
    // SECURITY: Cannot join own game
    require!(game.creator != player, GameError::CannotJoinOwnGame);
    
    // SECURITY: Check if game is full
    require!(!game.is_full(), GameError::GameFull);
    
    // SECURITY: Check if player already in game
    for i in 0..game.team_a_count as usize {
        require!(game.team_a[i] != player, GameError::PlayerAlreadyInGame);
    }
    for i in 0..game.team_b_count as usize {
        require!(game.team_b[i] != player, GameError::PlayerAlreadyInGame);
    }
    
    // Add player to appropriate team
    match game.game_mode {
        GameMode::OneVsOne => {
            // Join team B (team A already has creator)
            game.team_b[0] = player;
            game.team_b_count = 1;
        }
        GameMode::TwoVsTwo => {
            // Fill teams in order: A1, B1, A2, B2
            if game.team_a_count == 1 && game.team_b_count == 0 {
                game.team_b[0] = player;
                game.team_b_count = 1;
            } else if game.team_a_count == 1 && game.team_b_count == 1 {
                game.team_a[1] = player;
                game.team_a_count = 2;
            } else if game.team_a_count == 2 && game.team_b_count == 1 {
                game.team_b[1] = player;
                game.team_b_count = 2;
            }
        }
        GameMode::HumanVsAi => {
            return Err(GameError::CannotJoinAiGame.into());
        }
    }
    
    // Transfer entry fee (SOL) to game vault
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
            },
        ),
        game.entry_fee,
    )?;
    
    // Update total pot
    game.total_pot = game.total_pot
        .checked_add(game.entry_fee)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    msg!("👥 Player joined game {}", game.game_id);
    msg!("   Player: {}", player);
    msg!("   Entry fee: {} SOL", game.entry_fee as f64 / 1_000_000_000.0);
    msg!("   Total pot: {} SOL", game.total_pot as f64 / 1_000_000_000.0);
    msg!("   Team A: {}, Team B: {}", game.team_a_count, game.team_b_count);
    
    if game.is_full() {
        msg!("✅ Game is now FULL and ready to start!");
    }
    
    Ok(())
}
