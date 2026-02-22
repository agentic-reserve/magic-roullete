use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked, TransferChecked};
use crate::{errors::GameError, state::*};

#[derive(Accounts)]
#[instruction(game_mode: GameMode, entry_fee: u64)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = creator,
        space = Game::LEN,
        seeds = [b"game", platform_config.total_games.to_le_bytes().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    // Token-2022 accounts for entry fee
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        mut,
        token::mint = mint,
        token::authority = creator
    )]
    pub creator_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = mint,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn create_game(
    ctx: Context<CreateGame>,
    game_mode: GameMode,
    entry_fee: u64,
    vrf_seed: [u8; 32],
) -> Result<()> {
    require!(entry_fee > 0, GameError::InsufficientEntryFee);
    
    let game = &mut ctx.accounts.game;
    let platform_config = &mut ctx.accounts.platform_config;
    
    // Initialize game
    game.game_id = platform_config.total_games;
    game.creator = ctx.accounts.creator.key();
    game.game_mode = game_mode;
    game.status = GameStatus::WaitingForPlayers;
    game.entry_fee = entry_fee;
    game.total_pot = entry_fee;
    
    // Initialize teams
    game.team_a = [ctx.accounts.creator.key(), Pubkey::default()];
    game.team_b = [Pubkey::default(), Pubkey::default()];
    game.team_a_count = 1;
    game.team_b_count = 0;
    
    // Initialize game state
    game.bullet_chamber = 0;
    game.current_chamber = 1;
    game.current_turn = 0;
    game.shots_taken = 0;
    
    // VRF
    game.vrf_seed = vrf_seed;
    game.vrf_result = None;
    
    // Metadata
    game.winner_team = None;
    game.created_at = Clock::get()?.unix_timestamp;
    game.finished_at = None;
    game.bump = ctx.bumps.game;
    
    // Transfer entry fee to game vault
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.creator_token_account.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        entry_fee,
        ctx.accounts.mint.decimals,
    )?;
    
    platform_config.total_games += 1;
    
    msg!("Game {} created: {:?} mode, {} entry fee", 
        game.game_id, game_mode, entry_fee);
    
    Ok(())
}
