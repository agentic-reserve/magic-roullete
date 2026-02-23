use anchor_lang::prelude::*;
use anchor_spl::token_2022::spl_token_2022::extension::StateWithExtensions;
use anchor_spl::token_2022::spl_token_2022::state::Mint as MintState;
use crate::{errors::GameError, state::PlatformConfig};

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = PlatformConfig::LEN,
        seeds = [b"platform"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Treasury account for platform fees
    pub treasury: AccountInfo<'info>,
    
    /// Platform token mint (Token-2022)
    /// CHECK: Token-2022 mint account
    pub platform_mint: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    platform_fee_bps: u16,
    treasury_fee_bps: u16,
) -> Result<()> {
    require!(
        platform_fee_bps + treasury_fee_bps <= 10000,
        GameError::InvalidFeeConfig
    );
    
    let platform_config = &mut ctx.accounts.platform_config;
    platform_config.authority = ctx.accounts.authority.key();
    platform_config.treasury = ctx.accounts.treasury.key();
    platform_config.platform_mint = ctx.accounts.platform_mint.key();
    platform_config.platform_fee_bps = platform_fee_bps;
    platform_config.treasury_fee_bps = treasury_fee_bps;
    platform_config.total_games = 0;
    platform_config.total_volume = 0;
    platform_config.treasury_balance = 0;
    platform_config.paused = false;
    platform_config.bump = ctx.bumps.platform_config;
    
    msg!("Platform initialized with {}% platform fee, {}% treasury fee",
        platform_fee_bps / 100,
        treasury_fee_bps / 100
    );
    
    Ok(())
}
