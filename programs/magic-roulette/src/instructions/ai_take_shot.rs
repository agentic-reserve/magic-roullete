use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct AiTakeShot<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.is_ai_game @ GameError::InvalidGameMode
    )]
    pub game: Account<'info, Game>,
    
    /// CHECK: AI bot signer (platform-controlled)
    pub ai_bot: Signer<'info>,
}

pub fn ai_take_shot(ctx: Context<AiTakeShot>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    require!(
        game.status == GameStatus::InProgress,
        GameError::GameNotInProgress
    );
    
    require!(
        game.vrf_result.is_some(),
        GameError::VrfNotReady
    );
    
    // Verify it's AI's turn
    let current_player = game.get_current_player();
    require!(
        current_player == ctx.accounts.ai_bot.key(),
        GameError::NotYourTurn
    );
    
    // AI takes shot (decision made off-chain by AI service)
    game.shots_taken += 1;
    
    msg!("🤖 AI Bot takes shot #{}", game.shots_taken);
    
    // Check if bullet fired
    if game.current_chamber == game.bullet_chamber {
        // AI hit the bullet - Human wins!
        game.winner_team = Some(0);  // Team A (human) wins
        game.status = GameStatus::Finished;
        game.finished_at = Some(Clock::get()?.unix_timestamp);
        
        msg!("💥 AI Bot hit the bullet!");
        msg!("🎉 Human player wins! (Practice mode - no prizes)");
    } else {
        // Safe - advance to next turn
        game.current_chamber += 1;
        if game.current_chamber > 6 {
            game.current_chamber = 1;
        }
        
        game.current_turn += 1;
        
        msg!("✓ Click. AI Bot survived");
    }
    
    Ok(())
}
