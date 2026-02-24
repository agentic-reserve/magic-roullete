use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::DelegationProgram;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct DelegateGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// Game account to delegate
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.status == GameStatus::WaitingForPlayers 
            @ GameError::InvalidGameStatus
    )]
    pub game: Account<'info, Game>,
    
    /// Platform config for permission check
    #[account(
        seeds = [b"platform_config"],
        bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    pub delegation_program: Program<'info, DelegationProgram>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: MagicBlock program
    pub magic_program: AccountInfo<'info>,
    
    /// CHECK: MagicBlock context
    #[account(mut)]
    pub magic_context: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UndelegateGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.status == GameStatus::Finished @ GameError::GameNotFinished
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: MagicBlock program
    pub magic_program: AccountInfo<'info>,
    
    /// CHECK: MagicBlock context
    #[account(mut)]
    pub magic_context: AccountInfo<'info>,
}
