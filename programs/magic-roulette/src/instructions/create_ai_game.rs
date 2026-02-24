use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct CreateAiGame<'info> {
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
        bump = platform_config.bump,
        constraint = !platform_config.paused @ GameError::PlatformPaused
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    /// CHECK: AI bot wallet (platform-controlled)
    pub ai_bot: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_ai_game(
    ctx: Context<CreateAiGame>,
    ai_difficulty: AiDifficulty,
    vrf_seed: [u8; 32],
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let platform_config = &mut ctx.accounts.platform_config;
    
    // Initialize game
    game.game_id = platform_config.total_games;
    game.creator = ctx.accounts.player.key();
    game.game_mode = GameMode::HumanVsAi;
    game.status = GameStatus::WaitingForPlayers;
    game.entry_fee = 0;  // FREE - No entry fee for practice mode
    game.total_pot = 0;  // No prize pool
    
    // AI settings
    game.is_ai_game = true;
    game.ai_difficulty = Some(ai_difficulty);
    game.ai_player = Some(ctx.accounts.ai_bot.key());
    game.is_practice_mode = true;  // Practice mode - no real money
    
    // Initialize teams
    game.team_a = [ctx.accounts.player.key(), Pubkey::default()];
    game.team_b = [ctx.accounts.ai_bot.key(), Pubkey::default()];
    game.team_a_count = 1;
    game.team_b_count = 1;
    
    // Initialize game state
    game.bullet_chamber = 0;
    game.current_chamber = 1;
    game.current_turn = 0;
    game.shots_taken = 0;
    
    // VRF
    game.vrf_seed = vrf_seed;
    game.vrf_result = [0u8; 32];
    game.vrf_pending = false;
    game.vrf_fulfilled = false;
    
    // Metadata
    game.winner_team = None;
    game.created_at = Clock::get()?.unix_timestamp;
    game.finished_at = None;
    game.bump = ctx.bumps.game;
    
    platform_config.total_games += 1;
    
    msg!("🤖 AI Practice Game {} created", game.game_id);
    msg!("   Difficulty: {:?}", ai_difficulty);
    msg!("   Mode: FREE Practice (No entry fee, no prizes)");
    msg!("   Player: {}", ctx.accounts.player.key());
    msg!("   AI Bot: {}", ctx.accounts.ai_bot.key());
    
    Ok(())
}
