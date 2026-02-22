use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct TakeShot<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    pub player: Signer<'info>,
}

pub fn take_shot(ctx: Context<TakeShot>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player = ctx.accounts.player.key();
    
    require!(
        game.status == GameStatus::InProgress,
        GameError::GameNotInProgress
    );
    
    require!(
        game.vrf_result.is_some(),
        GameError::VrfNotReady
    );
    
    // Verify it's player's turn
    let current_player = game.get_current_player();
    require!(
        player == current_player,
        GameError::NotYourTurn
    );
    
    // Take shot
    game.shots_taken += 1;
    
    msg!("Player {} takes shot #{}", player, game.shots_taken);
    
    // Check if bullet fired
    if game.current_chamber == game.bullet_chamber {
        // Player hit the bullet - opposing team wins
        let losing_team = game.current_turn % 2;
        game.winner_team = Some(1 - losing_team);
        game.status = GameStatus::Finished;
        game.finished_at = Some(Clock::get()?.unix_timestamp);
        
        msg!("BANG! Player {} hit the bullet!", player);
        msg!("Team {} wins!", 1 - losing_team);
    } else {
        // Safe - advance to next player
        game.current_chamber += 1;
        if game.current_chamber > 6 {
            game.current_chamber = 1;
        }
        
        game.current_turn += 1;
        
        msg!("Click. Player {} survived", player);
    }
    
    Ok(())
}
