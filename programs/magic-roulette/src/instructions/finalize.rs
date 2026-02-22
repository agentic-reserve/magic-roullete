use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::state::*;

#[derive(Accounts)]
pub struct FinalizeGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Box<Account<'info, Game>>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump
    )]
    pub platform_config: Box<Account<'info, PlatformConfig>>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    // Token accounts
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        mut,
        token::mint = mint,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = platform_config.authority
    )]
    pub platform_vault: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = platform_config.treasury
    )]
    pub treasury_vault: InterfaceAccount<'info, TokenAccount>,
    
    // Winner accounts (up to 2 for 2v2)
    /// CHECK: Winner 1
    #[account(mut)]
    pub winner1: AccountInfo<'info>,
    
    /// CHECK: Winner 1 token account
    #[account(mut)]
    pub winner1_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// CHECK: Winner 2 (optional for 2v2)
    #[account(mut)]
    pub winner2: AccountInfo<'info>,
    
    /// CHECK: Winner 2 token account (optional)
    #[account(mut)]
    pub winner2_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
}
