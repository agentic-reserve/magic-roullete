use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [b"rewards", player.key().as_ref()],
        bump = rewards.bump
    )]
    pub rewards: Account<'info, TreasuryRewards>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    // Token accounts
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = platform_config.treasury
    )]
    pub treasury_vault: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = player
    )]
    pub player_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let rewards = &mut ctx.accounts.rewards;
    
    require!(
        rewards.claimable_amount > 0,
        GameError::NoRewardsToClaim
    );
    
    let amount = rewards.claimable_amount;
    
    // Treasury PDA signer
    let platform_config = &ctx.accounts.platform_config;
    let seeds = &[
        b"platform".as_ref(),
        &[platform_config.bump],
    ];
    let signer = &[&seeds[..]];
    
    // Transfer rewards
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.treasury_vault.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.treasury_vault.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
            signer,
        ),
        amount,
        ctx.accounts.mint.decimals,
    )?;
    
    // Update rewards account
    rewards.total_claimed = rewards.total_claimed
        .checked_add(amount)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    rewards.claimable_amount = 0;
    rewards.last_claim = Clock::get()?.unix_timestamp;
    
    msg!("Player {} claimed {} rewards", ctx.accounts.player.key(), amount);
    
    Ok(())
}
