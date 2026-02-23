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
    /// CHECK: Token-2022 mint
    pub mint: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: Creator's token account
    pub creator_token_account: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: Game vault token account
    pub game_vault: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token2022>,
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
    
    // VRF (MagicBlock VRF Plugin)
    game.vrf_seed = vrf_seed;
    game.vrf_result = [0u8; 32];
    game.vrf_pending = false;
    game.vrf_fulfilled = false;
    
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
        get_mint_decimals(&ctx.accounts.mint)?,
    )?;
    
    platform_config.total_games += 1;
    
    msg!("Game {} created: {:?} mode, {} entry fee", 
        game.game_id, game_mode, entry_fee);
    
    Ok(())
}
