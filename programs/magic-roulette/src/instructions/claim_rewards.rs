use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_spl::token_2022::{Token2022, transfer_checked, TransferChecked};
use anchor_spl::token_2022::spl_token_2022::state::Mint as MintState;
use crate::{errors::GameError, state::*};

// Helper function to get mint decimals
fn get_mint_decimals(mint_account: &AccountInfo) -> Result<u8> {
    let mint_data = mint_account.try_borrow_data()?;
    let mint = MintState::unpack(&mint_data)?;
    Ok(mint.decimals)
}

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
    /// CHECK: Token-2022 mint
    pub mint: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: Treasury vault token account
    pub treasury_vault: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: Player's token account
    pub player_token_account: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token2022>,
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
        get_mint_decimals(&ctx.accounts.mint)?,
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
