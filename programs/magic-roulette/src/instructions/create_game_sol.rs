use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
#[instruction(game_mode: GameMode, entry_fee: u64)]
pub struct CreateGameSol<'info> {
    #[account(
        init,
        payer = creator,
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
    pub creator: Signer<'info>,
    
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

pub fn create_game_sol(
    ctx: Context<CreateGameSol>,
    game_mode: GameMode,
    entry_fee: u64,
    vrf_seed: [u8; 32],
) -> Result<()> {
    // Validate entry fee (minimum 0.01 SOL = 10_000_000 lamports)
    require!(entry_fee >= 10_000_000, GameError::InsufficientEntryFee);
    
    let game = &mut ctx.accounts.game;
    let platform_config = &mut ctx.accounts.platform_config;
    
    // Initialize game
    game.game_id = platform_config.total_games;
    game.creator = ctx.accounts.creator.key();
    game.game_mode = game_mode;
    game.status = GameStatus::WaitingForPlayers;
    game.entry_fee = entry_fee;
    game.total_pot = entry_fee;
    
    // AI settings (not AI game)
    game.is_ai_game = false;
    game.ai_difficulty = None;
    game.ai_player = None;
    game.is_practice_mode = false;
    
    // Initialize teams
    game.team_a = [ctx.accounts.creator.key(), Pubkey::default()];
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
    
    // Transfer entry fee (SOL) to game vault
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
            },
        ),
        entry_fee,
    )?;
    
    platform_config.total_games += 1;
    
    msg!("🎮 Game {} created", game.game_id);
    msg!("   Mode: {:?}", game_mode);
    msg!("   Entry fee: {} SOL", entry_fee as f64 / 1_000_000_000.0);
    msg!("   Creator: {}", ctx.accounts.creator.key());
    
    Ok(())
}
