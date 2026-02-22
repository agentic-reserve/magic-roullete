use anchor_lang::prelude::*;
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct InitializePlatformWithMultisig<'info> {
    #[account(
        init,
        payer = payer,
        space = PlatformConfig::LEN,
        seeds = [b"platform"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: Squads multisig PDA (will be authority)
    /// This should be created separately using Squads SDK
    pub multisig: AccountInfo<'info>,
    
    /// CHECK: Squads vault 0 (platform fees)
    /// Derived from multisig with index 0
    pub platform_vault: AccountInfo<'info>,
    
    /// CHECK: Squads vault 1 (treasury)
    /// Derived from multisig with index 1
    pub treasury_vault: AccountInfo<'info>,
    
    /// Platform mint (for token-based games)
    /// CHECK: Can be any mint or default pubkey for SOL-only
    pub platform_mint: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_platform_with_multisig(
    ctx: Context<InitializePlatformWithMultisig>,
    platform_fee_bps: u16,
    treasury_fee_bps: u16,
) -> Result<()> {
    // Validate fees (max 20% total)
    let total_fees = platform_fee_bps
        .checked_add(treasury_fee_bps)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    require!(total_fees <= 2000, GameError::InvalidFeeConfig);
    
    let config = &mut ctx.accounts.platform_config;
    
    // Set multisig as authority (not a single wallet)
    config.authority = ctx.accounts.multisig.key();
    config.treasury = ctx.accounts.treasury_vault.key();
    config.platform_mint = ctx.accounts.platform_mint.key();
    config.platform_fee_bps = platform_fee_bps;
    config.treasury_fee_bps = treasury_fee_bps;
    config.total_games = 0;
    config.total_volume = 0;
    config.treasury_balance = 0;
    config.paused = false;
    
    // Squads multisig integration
    config.multisig_authority = Some(ctx.accounts.multisig.key());
    config.platform_vault = Some(ctx.accounts.platform_vault.key());
    config.treasury_vault = Some(ctx.accounts.treasury_vault.key());
    
    config.bump = ctx.bumps.platform_config;
    
    msg!("🏛️ Platform initialized with Squads multisig");
    msg!("   Authority: {} (Squads Multisig)", config.authority);
    msg!("   Platform vault: {}", ctx.accounts.platform_vault.key());
    msg!("   Treasury vault: {}", ctx.accounts.treasury_vault.key());
    msg!("   Platform fee: {}%", platform_fee_bps as f64 / 100.0);
    msg!("   Treasury fee: {}%", treasury_fee_bps as f64 / 100.0);
    msg!("   Total fee: {}%", total_fees as f64 / 100.0);
    msg!("");
    msg!("⚠️ IMPORTANT: All treasury withdrawals require multisig approval");
    msg!("   Use Squads SDK to create proposals and execute transactions");
    
    Ok(())
}
