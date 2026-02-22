use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct DelegateGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.is_full() @ GameError::GameNotReady
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
}
