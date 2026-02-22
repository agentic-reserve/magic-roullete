use anchor_lang::prelude::*;
use crate::state::Game;

/// Request VRF randomness
#[derive(Accounts)]
pub struct RequestVrfRandomness<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub game: Account<'info, Game>,
}

/// VRF callback context
#[derive(Accounts)]
pub struct VrfCallback<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
}
