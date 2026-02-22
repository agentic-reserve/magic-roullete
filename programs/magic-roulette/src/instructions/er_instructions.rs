use anchor_lang::prelude::*;
use crate::state::Game;

/// Commit game state from ER to base layer
#[derive(Accounts)]
pub struct CommitGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub game: Account<'info, Game>,
    
    /// CHECK: Magic context
    pub magic_context: AccountInfo<'info>,
    
    /// CHECK: Magic program
    pub magic_program: AccountInfo<'info>,
}

/// Undelegate game from ER
#[derive(Accounts)]
pub struct UndelegateGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: Game account to be undelegated
    #[account(mut)]
    pub game: AccountInfo<'info>,
    
    /// CHECK: Magic context
    pub magic_context: AccountInfo<'info>,
    
    /// CHECK: Magic program
    pub magic_program: AccountInfo<'info>,
}
