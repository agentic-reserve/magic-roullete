// Suppress warnings from macro-generated code
#![allow(unexpected_cfgs)]
#![allow(unused_imports)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_spl::token_2022::{Token2022, transfer_checked, TransferChecked};
use anchor_spl::token_2022::spl_token_2022::state::Mint as MintState;
use ephemeral_rollups_sdk::anchor::ephemeral;
use ephemeral_rollups_sdk::anchor::DelegationProgram;
use ephemeral_rollups_sdk::anchor::delegate;
use ephemeral_rollups_sdk::anchor::commit;
use ephemeral_vrf_sdk::anchor::vrf;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::{GameMode, AiDifficulty, GameStatus}; // GameStatus used in delegate_game and finalize_game

// Helper function to get mint decimals
fn get_mint_decimals(mint_account: &AccountInfo) -> Result<u8> {
    let mint_data = mint_account.try_borrow_data()?;
    let mint = MintState::unpack(&mint_data)?;
    Ok(mint.decimals)
}

declare_id!("HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam");

#[ephemeral]  // CRITICAL: Enables MagicBlock Ephemeral Rollups support
#[program]
pub mod magic_roulette {
    use super::*;

    /// Initialize platform configuration
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        platform_fee_bps: u16,
        treasury_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_platform(ctx, platform_fee_bps, treasury_fee_bps)
    }

    /// Create a new game (1v1 or 2v2)
    pub fn create_game(
        ctx: Context<CreateGame>,
        game_mode: GameMode,
        entry_fee: u64,
        vrf_seed: [u8; 32],
    ) -> Result<()> {
        instructions::create_game(ctx, game_mode, entry_fee, vrf_seed)
    }

    /// Join an existing game
    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        instructions::join_game(ctx)
    }

    /// Delegate game to Ephemeral Rollup (handled by MagicBlock SDK on client)
    pub fn delegate_game(_ctx: Context<DelegateGame>) -> Result<()> {
        msg!("Game delegated to Ephemeral Rollup");
        msg!("Game will execute with sub-10ms latency and gasless transactions");
        Ok(())
    }

    /// Request VRF randomness for game (executed on ER)
    pub fn request_vrf_randomness(ctx: Context<RequestVrfRandomness>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(!game.vrf_pending, errors::GameError::VrfRequestPending);
        game.vrf_pending = true;
        msg!("VRF randomness requested for game {}", game.game_id);
        Ok(())
    }

    /// VRF callback - receives verifiable randomness
    pub fn request_vrf_randomness_callback(ctx: Context<VrfCallback>, randomness: [u8; 32]) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        // Store randomness in game state
        game.vrf_result = randomness;
        game.vrf_pending = false;
        game.vrf_fulfilled = true;
        
        msg!("VRF randomness received for game {}", game.game_id);
        msg!("Randomness: {:?}", &randomness[0..8]);
        
        Ok(())
    }

    /// Process VRF randomness result (legacy - kept for compatibility)
    pub fn process_vrf_result(ctx: Context<ProcessVrfResult>, randomness: [u8; 32]) -> Result<()> {
        instructions::process_vrf_result(ctx, randomness)
    }

    /// Player takes a shot (executed in Private ER)
    pub fn take_shot(ctx: Context<TakeShot>) -> Result<()> {
        instructions::take_shot(ctx)
    }

    /// Commit game state from ER to base layer (handled by MagicBlock SDK on client)
    pub fn commit_game(_ctx: Context<CommitGame>) -> Result<()> {
        msg!("Game state committed to base layer");
        Ok(())
    }

    /// Undelegate game from ER and return to base layer (handled by MagicBlock SDK on client)
    pub fn undelegate_game(_ctx: Context<UndelegateGame>) -> Result<()> {
        msg!("Game undelegated from Ephemeral Rollup");
        Ok(())
    }

    /// Finalize game and distribute winnings
    pub fn finalize_game(ctx: Context<FinalizeGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let platform_config = &mut ctx.accounts.platform_config;
        
        // SECURITY: Validate game status
        require!(
            game.status == GameStatus::Finished,
            errors::GameError::GameNotInProgress
        );
        
        require!(
            game.winner_team.is_some(),
            errors::GameError::GameNotInProgress
        );
        
        // SECURITY: Skip distribution for practice mode (AI games)
        if game.is_practice_mode {
            game.status = GameStatus::Cancelled;
            msg!("🎮 Practice game finished - no prizes distributed");
            msg!("Winner: Team {}", game.winner_team.unwrap());
            return Ok(());
        }
        
        // NOTE: State commit from ER is handled by MagicBlock SDK on client side
        // using createCommitInstruction() or createUndelegateInstruction()
        
        // Calculate prize distribution
        let total_pot = game.total_pot;
        
        let platform_fee = (total_pot as u128)
            .checked_mul(platform_config.platform_fee_bps as u128)
            .ok_or(errors::GameError::ArithmeticOverflow)?
            .checked_div(10000)
            .ok_or(errors::GameError::ArithmeticOverflow)? as u64;
        
        let treasury_fee = (total_pot as u128)
            .checked_mul(platform_config.treasury_fee_bps as u128)
            .ok_or(errors::GameError::ArithmeticOverflow)?
            .checked_div(10000)
            .ok_or(errors::GameError::ArithmeticOverflow)? as u64;
        
        let winner_amount = total_pot
            .checked_sub(platform_fee)
            .ok_or(errors::GameError::ArithmeticOverflow)?
            .checked_sub(treasury_fee)
            .ok_or(errors::GameError::ArithmeticOverflow)?;
        
        // Get winner count
        let winning_team = game.winner_team.unwrap();
        let winner_count = if winning_team == 0 {
            game.team_a_count as usize
        } else {
            game.team_b_count as usize
        };
        
        let per_winner = winner_amount / winner_count as u64;
        
        // Game vault PDA signer (if needed)
        // Note: game_vault might not be a PDA, using direct authority instead
        let game_id_bytes = game.game_id.to_le_bytes();
        let seeds = &[
            b"game",
            game_id_bytes.as_ref(),
            &[game.bump],
        ];
        let signer = &[&seeds[..]];
        
        // Distribute to platform
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.game_vault.to_account_info(),
                    to: ctx.accounts.platform_vault.to_account_info(),
                    authority: ctx.accounts.game_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                signer,
            ),
            platform_fee,
            get_mint_decimals(&ctx.accounts.mint)?,
        )?;
        
        // Distribute to treasury
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.game_vault.to_account_info(),
                    to: ctx.accounts.treasury_vault.to_account_info(),
                    authority: ctx.accounts.game_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                signer,
            ),
            treasury_fee,
            get_mint_decimals(&ctx.accounts.mint)?,
        )?;
        
        // Distribute to winner(s)
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.game_vault.to_account_info(),
                    to: ctx.accounts.winner1_token_account.to_account_info(),
                    authority: ctx.accounts.game_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                signer,
            ),
            per_winner,
            get_mint_decimals(&ctx.accounts.mint)?,
        )?;
        
        if winner_count == 2 {
            transfer_checked(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    TransferChecked {
                        from: ctx.accounts.game_vault.to_account_info(),
                        to: ctx.accounts.winner2_token_account.to_account_info(),
                        authority: ctx.accounts.game_vault.to_account_info(),
                        mint: ctx.accounts.mint.to_account_info(),
                    },
                    signer,
                ),
                per_winner,
                get_mint_decimals(&ctx.accounts.mint)?,
            )?;
        }
        
        // Update platform stats
        platform_config.total_volume = platform_config.total_volume
            .checked_add(total_pot)
            .ok_or(errors::GameError::ArithmeticOverflow)?;
        
        platform_config.treasury_balance = platform_config.treasury_balance
            .checked_add(treasury_fee)
            .ok_or(errors::GameError::ArithmeticOverflow)?;
        
        // Mark game as processed
        game.status = GameStatus::Cancelled;
        
        msg!("Game {} finalized", game.game_id);
        msg!("Each winner receives: {}", per_winner);
        msg!("Platform fee: {}", platform_fee);
        msg!("Treasury fee: {}", treasury_fee);
        
        Ok(())
    }

    /// Claim rewards from treasury
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        instructions::claim_rewards(ctx)
    }

    /// Create AI practice game (FREE - no entry fee, no prizes)
    pub fn create_ai_game(
        ctx: Context<CreateAiGame>,
        ai_difficulty: AiDifficulty,
        vrf_seed: [u8; 32],
    ) -> Result<()> {
        instructions::create_ai_game(ctx, ai_difficulty, vrf_seed)
    }

    /// AI bot takes a shot
    pub fn ai_take_shot(ctx: Context<AiTakeShot>) -> Result<()> {
        instructions::ai_take_shot(ctx)
    }

    // ========================================================================
    // SOL BETTING INSTRUCTIONS
    // ========================================================================

    /// Create a new game with SOL betting (native Solana)
    pub fn create_game_sol(
        ctx: Context<CreateGameSol>,
        game_mode: GameMode,
        entry_fee: u64,
        vrf_seed: [u8; 32],
    ) -> Result<()> {
        instructions::create_game_sol(ctx, game_mode, entry_fee, vrf_seed)
    }

    /// Join an existing game with SOL
    pub fn join_game_sol(ctx: Context<JoinGameSol>) -> Result<()> {
        instructions::join_game_sol(ctx)
    }

    /// Finalize game and distribute SOL winnings
    pub fn finalize_game_sol(ctx: Context<FinalizeGameSol>) -> Result<()> {
        instructions::finalize_game_sol(ctx)
    }

    // ========================================================================
    // KAMINO INTEGRATION INSTRUCTIONS
    // ========================================================================

    /// Create a new game with Kamino loan (borrow SOL for entry fee)
    pub fn create_game_with_loan(
        ctx: Context<CreateGameWithLoan>,
        game_mode: GameMode,
        entry_fee: u64,
        collateral_amount: u64,
        vrf_seed: [u8; 32],
    ) -> Result<()> {
        instructions::create_game_with_loan(ctx, game_mode, entry_fee, collateral_amount, vrf_seed)
    }

    /// Finalize game and auto-repay Kamino loan from winnings
    pub fn finalize_game_with_loan(ctx: Context<FinalizeGameWithLoan>) -> Result<()> {
        instructions::finalize_game_with_loan(ctx)
    }

    // ========================================================================
    // SQUADS MULTISIG INTEGRATION INSTRUCTIONS
    // ========================================================================

    /// Initialize platform with Squads multisig as authority
    pub fn initialize_platform_with_multisig(
        ctx: Context<InitializePlatformWithMultisig>,
        platform_fee_bps: u16,
        treasury_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_platform_with_multisig(ctx, platform_fee_bps, treasury_fee_bps)
    }
}
