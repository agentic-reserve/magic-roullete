use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_lang::solana_program::{instruction::Instruction, program::invoke_signed, account_info::AccountInfo as SolanaAccountInfo};
use crate::{errors::GameError, state::*, constants::KAMINO_PROGRAM_ID};

#[derive(Accounts)]
#[instruction(game_mode: GameMode, entry_fee: u64, collateral_amount: u64)]
pub struct CreateGameWithLoan<'info> {
    #[account(
        init,
        payer = player,
        space = Game::LEN,
        seeds = [b"game", platform_config.total_games.to_le_bytes().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_config.bump,
        constraint = !platform_config.paused @ GameError::PlatformPaused
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    /// Game vault PDA - holds SOL for this game
    /// CHECK: PDA for holding SOL
    #[account(
        mut,
        seeds = [b"game_vault", game.key().as_ref()],
        bump
    )]
    pub game_vault: AccountInfo<'info>,
    
    // Kamino Lend accounts
    /// CHECK: Kamino lending market (validated by Kamino program)
    pub lending_market: AccountInfo<'info>,
    
    /// CHECK: Kamino lending market authority (validated by Kamino program)
    pub lending_market_authority: AccountInfo<'info>,
    
    /// CHECK: SOL reserve account (validated by Kamino program)
    #[account(mut)]
    pub reserve: AccountInfo<'info>,
    
    /// CHECK: Reserve liquidity supply (validated by Kamino program)
    #[account(mut)]
    pub reserve_liquidity_supply: AccountInfo<'info>,
    
    /// CHECK: Reserve collateral mint (validated by Kamino program)
    #[account(mut)]
    pub reserve_collateral_mint: AccountInfo<'info>,
    
    /// CHECK: Reserve collateral supply (validated by Kamino program)
    #[account(mut)]
    pub reserve_collateral_supply: AccountInfo<'info>,
    
    /// CHECK: Player's obligation account (loan account)
    #[account(mut)]
    pub obligation: AccountInfo<'info>,
    
    /// CHECK: Player's collateral token account (validated by Kamino program)
    #[account(mut)]
    pub player_collateral_account: AccountInfo<'info>,
    
    /// CHECK: Obligation collateral account (validated by Kamino program)
    #[account(mut)]
    pub obligation_collateral: AccountInfo<'info>,
    
    /// CHECK: Kamino lending program - validated against known program ID
    #[account(
        constraint = kamino_program.key() == KAMINO_PROGRAM_ID @ GameError::InvalidKaminoMarket
    )]
    pub kamino_program: AccountInfo<'info>,
    
    /// CHECK: Pyth SOL price feed (for oracle)
    pub pyth_sol_price: AccountInfo<'info>,
    
    /// CHECK: Switchboard SOL price feed (for oracle)
    pub switchboard_sol_price: AccountInfo<'info>,
    
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn create_game_with_loan(
    ctx: Context<CreateGameWithLoan>,
    game_mode: GameMode,
    entry_fee: u64,
    collateral_amount: u64,
    vrf_seed: [u8; 32],
) -> Result<()> {
    // Validate entry fee (minimum 0.01 SOL = 10_000_000 lamports)
    require!(entry_fee >= 10_000_000, GameError::InsufficientEntryFee);
    
    // Validate collateral ratio (minimum 110% of entry_fee)
    let required_collateral = entry_fee
        .checked_mul(110)
        .ok_or(GameError::ArithmeticOverflow)?
        .checked_div(100)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    require!(
        collateral_amount >= required_collateral,
        GameError::InsufficientCollateral
    );
    
    let game = &mut ctx.accounts.game;
    let platform_config = &mut ctx.accounts.platform_config;
    
    msg!("🎮 Creating game with Kamino loan");
    msg!("   Entry fee: {} SOL", entry_fee as f64 / 1e9);
    msg!("   Collateral: {} SOL ({}%)", collateral_amount as f64 / 1e9, (collateral_amount * 100) / entry_fee);
    
    // STEP 1: Deposit collateral to Kamino
    msg!("💰 Step 1: Depositing collateral to Kamino...");
    
    let deposit_ix = build_kamino_deposit_ix(
        ctx.accounts.lending_market.key(),
        ctx.accounts.reserve.key(),
        ctx.accounts.reserve_liquidity_supply.key(),
        ctx.accounts.reserve_collateral_mint.key(),
        ctx.accounts.player.key(),
        ctx.accounts.player_collateral_account.key(),
        ctx.accounts.player.key(),
        collateral_amount,
    );
    
    invoke_signed(
        &deposit_ix,
        &[
            ctx.accounts.player.to_account_info(),
            ctx.accounts.reserve.to_account_info(),
            ctx.accounts.reserve_liquidity_supply.to_account_info(),
            ctx.accounts.reserve_collateral_mint.to_account_info(),
            ctx.accounts.lending_market.to_account_info(),
            ctx.accounts.player.to_account_info(),
            ctx.accounts.player_collateral_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        &[],
    )?;
    
    msg!("✅ Collateral deposited to Kamino");
    
    // STEP 2: Borrow SOL from Kamino
    msg!("💸 Step 2: Borrowing {} SOL from Kamino...", entry_fee as f64 / 1e9);
    
    let borrow_ix = build_kamino_borrow_ix(
        ctx.accounts.lending_market.key(),
        ctx.accounts.lending_market_authority.key(),
        ctx.accounts.obligation.key(),
        ctx.accounts.reserve.key(),
        ctx.accounts.reserve_liquidity_supply.key(),
        ctx.accounts.game_vault.key(),
        ctx.accounts.player.key(),
        entry_fee,
    );
    
    invoke_signed(
        &borrow_ix,
        &[
            ctx.accounts.player.to_account_info(),
            ctx.accounts.obligation.to_account_info(),
            ctx.accounts.lending_market.to_account_info(),
            ctx.accounts.lending_market_authority.to_account_info(),
            ctx.accounts.reserve.to_account_info(),
            ctx.accounts.reserve_liquidity_supply.to_account_info(),
            ctx.accounts.game_vault.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        &[],
    )?;
    
    msg!("✅ SOL borrowed from Kamino and transferred to game vault");
    
    // Initialize game
    game.game_id = platform_config.total_games;
    game.creator = ctx.accounts.player.key();
    game.game_mode = game_mode;
    game.status = GameStatus::WaitingForPlayers;
    game.entry_fee = entry_fee;
    game.total_pot = entry_fee;
    
    // AI settings (not AI game)
    game.is_ai_game = false;
    game.ai_difficulty = None;
    game.ai_player = None;
    game.is_practice_mode = false;
    
    // Kamino loan settings
    game.has_loan = true;
    game.loan_obligation = Some(ctx.accounts.obligation.key());
    game.collateral_amount = collateral_amount;
    game.loan_amount = entry_fee;
    
    // Initialize teams
    game.team_a = [ctx.accounts.player.key(), Pubkey::default()];
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
    game.vrf_result = [0u8; 32];
    game.vrf_pending = false;
    game.vrf_fulfilled = false;
    
    // Metadata
    game.winner_team = None;
    game.created_at = Clock::get()?.unix_timestamp;
    game.finished_at = None;
    game.bump = ctx.bumps.game;
    
    platform_config.total_games += 1;
    
    msg!("✅ Game {} created with loan", game.game_id);
    msg!("   Obligation: {}", ctx.accounts.obligation.key());
    
    Ok(())
}

// ============================================================================
// KAMINO CPI HELPER FUNCTIONS (Ready for production use)
// ============================================================================

/// Build Kamino DepositReserveLiquidity instruction
/// Use this to deposit collateral to Kamino
#[allow(dead_code)]
pub fn build_kamino_deposit_ix(
    lending_market: Pubkey,
    reserve: Pubkey,
    reserve_liquidity_supply: Pubkey,
    reserve_collateral_mint: Pubkey,
    user_source: Pubkey,
    user_destination: Pubkey,
    owner: Pubkey,
    amount: u64,
) -> Instruction {
    use anchor_lang::solana_program::instruction::AccountMeta;
    
    // Kamino DepositReserveLiquidity instruction discriminator
    let mut data = vec![0xef, 0x1d, 0x1a, 0x4e, 0x15, 0x4a, 0x9c, 0x7e];
    data.extend_from_slice(&amount.to_le_bytes());
    
    Instruction {
        program_id: KAMINO_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new_readonly(owner, true),
            AccountMeta::new(reserve, false),
            AccountMeta::new(reserve_liquidity_supply, false),
            AccountMeta::new(reserve_collateral_mint, false),
            AccountMeta::new_readonly(lending_market, false),
            AccountMeta::new(user_source, false),
            AccountMeta::new(user_destination, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ],
        data,
    }
}

/// Build Kamino BorrowObligationLiquidity instruction
/// Use this to borrow SOL from Kamino
#[allow(dead_code)]
pub fn build_kamino_borrow_ix(
    lending_market: Pubkey,
    lending_market_authority: Pubkey,
    obligation: Pubkey,
    reserve: Pubkey,
    reserve_liquidity_supply: Pubkey,
    user_destination: Pubkey,
    owner: Pubkey,
    amount: u64,
) -> Instruction {
    use anchor_lang::solana_program::instruction::AccountMeta;
    
    // Kamino BorrowObligationLiquidity instruction discriminator
    let mut data = vec![0x0c, 0x7e, 0x9e, 0x3a, 0x17, 0x4d, 0x5e, 0x8f];
    data.extend_from_slice(&amount.to_le_bytes());
    
    Instruction {
        program_id: KAMINO_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new_readonly(owner, true),
            AccountMeta::new(obligation, false),
            AccountMeta::new_readonly(lending_market, false),
            AccountMeta::new_readonly(lending_market_authority, false),
            AccountMeta::new(reserve, false),
            AccountMeta::new(reserve_liquidity_supply, false),
            AccountMeta::new(user_destination, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ],
        data,
    }
}

/// Example of how to use Kamino CPI in production
/// Uncomment and integrate when ready for full Kamino integration
#[allow(dead_code)]
fn example_kamino_integration(
    ctx: &Context<CreateGameWithLoan>,
    collateral_amount: u64,
    entry_fee: u64,
) -> Result<()> {
    // Step 1: Deposit collateral
    let deposit_ix = build_kamino_deposit_ix(
        ctx.accounts.lending_market.key(),
        ctx.accounts.reserve.key(),
        ctx.accounts.reserve_liquidity_supply.key(),
        ctx.accounts.reserve_collateral_mint.key(),
        ctx.accounts.player.key(),
        ctx.accounts.player_collateral_account.key(),
        ctx.accounts.player.key(),
        collateral_amount,
    );
    
    invoke_signed(
        &deposit_ix,
        &[
            ctx.accounts.player.to_account_info(),
            ctx.accounts.reserve.to_account_info(),
            ctx.accounts.reserve_liquidity_supply.to_account_info(),
            ctx.accounts.reserve_collateral_mint.to_account_info(),
            ctx.accounts.lending_market.to_account_info(),
            ctx.accounts.player.to_account_info(),
            ctx.accounts.player_collateral_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        &[],
    )?;
    
    msg!("✅ Collateral deposited to Kamino");
    
    // Step 2: Borrow SOL
    let borrow_ix = build_kamino_borrow_ix(
        ctx.accounts.lending_market.key(),
        ctx.accounts.lending_market_authority.key(),
        ctx.accounts.obligation.key(),
        ctx.accounts.reserve.key(),
        ctx.accounts.reserve_liquidity_supply.key(),
        ctx.accounts.game_vault.key(),
        ctx.accounts.player.key(),
        entry_fee,
    );
    
    invoke_signed(
        &borrow_ix,
        &[
            ctx.accounts.player.to_account_info(),
            ctx.accounts.obligation.to_account_info(),
            ctx.accounts.lending_market.to_account_info(),
            ctx.accounts.lending_market_authority.to_account_info(),
            ctx.accounts.reserve.to_account_info(),
            ctx.accounts.reserve_liquidity_supply.to_account_info(),
            ctx.accounts.game_vault.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        &[],
    )?;
    
    msg!("✅ SOL borrowed from Kamino");
    
    Ok(())
}
