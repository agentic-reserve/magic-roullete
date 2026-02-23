use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct ProcessVrfResult<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    /// VRF authority - TODO: Add constraint when VRF program ID is known
    pub vrf_authority: Signer<'info>,
}

pub fn process_vrf_result(
    ctx: Context<ProcessVrfResult>,
    randomness: [u8; 32],
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Can process VRF in either Delegated or InProgress status (for ER compatibility)
    require!(
        game.status == GameStatus::Delegated || game.status == GameStatus::InProgress,
        GameError::InvalidGameStatus
    );
    
    // SECURITY: Store VRF result
    game.vrf_result = randomness;
    game.vrf_fulfilled = true;
    game.vrf_pending = false;
    
    // Convert randomness to chamber position (1-6)
    let random_u64 = u64::from_le_bytes([
        randomness[0], randomness[1], randomness[2], randomness[3],
        randomness[4], randomness[5], randomness[6], randomness[7],
    ]);
    game.bullet_chamber = ((random_u64 % 6) + 1) as u8;
    
    // Start game
    game.status = GameStatus::InProgress;
    
    msg!("🎲 VRF processed for game {}", game.game_id);
    msg!("   Bullet chamber: {}", game.bullet_chamber);
    msg!("   Status: InProgress");
    msg!("   Game ready for shots on Ephemeral Rollup");
    
    Ok(())
}
