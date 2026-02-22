use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum GameMode {
    OneVsOne,
    TwoVsTwo,
    HumanVsAi,  // New: Human vs AI mode
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayers,
    Delegated,
    InProgress,
    Finished,
    Cancelled,
}

#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub platform_mint: Pubkey,  // Official platform token
    pub platform_fee_bps: u16,  // 500 = 5%
    pub treasury_fee_bps: u16,  // 1000 = 10%
    pub total_games: u64,
    pub total_volume: u64,
    pub treasury_balance: u64,
    pub paused: bool,  // Emergency pause
    
    // Squads multisig integration
    pub multisig_authority: Option<Pubkey>,  // Squads multisig PDA (if using multisig)
    pub platform_vault: Option<Pubkey>,      // Squads vault 0 (platform fees)
    pub treasury_vault: Option<Pubkey>,      // Squads vault 1 (treasury)
    
    pub bump: u8,
}

impl PlatformConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 2 + 2 + 8 + 8 + 8 + 1 
        + (1 + 32) + (1 + 32) + (1 + 32)  // Squads fields
        + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum AiDifficulty {
    Easy,      // Random play
    Medium,    // Basic probability
    Hard,      // Monte Carlo simulation
}

#[account]
pub struct Game {
    pub game_id: u64,
    pub creator: Pubkey,
    pub game_mode: GameMode,
    pub status: GameStatus,
    pub entry_fee: u64,
    pub total_pot: u64,
    
    // AI settings (Practice mode - no real money)
    pub is_ai_game: bool,
    pub ai_difficulty: Option<AiDifficulty>,
    pub ai_player: Option<Pubkey>,  // Bot wallet address
    pub is_practice_mode: bool,  // True for AI games (no entry fee, no prizes)
    
    // Kamino loan integration
    pub has_loan: bool,                      // True if creator borrowed from Kamino
    pub loan_obligation: Option<Pubkey>,     // Kamino obligation account
    pub collateral_amount: u64,              // Amount of collateral deposited
    pub loan_amount: u64,                    // Amount borrowed from Kamino
    
    // Players (max 4 for 2v2)
    pub team_a: [Pubkey; 2],
    pub team_b: [Pubkey; 2],
    pub team_a_count: u8,
    pub team_b_count: u8,
    
    // Game state
    pub bullet_chamber: u8,  // 1-6, set by VRF
    pub current_chamber: u8, // Current position
    pub current_turn: u8,    // Which player's turn
    pub shots_taken: u8,
    
    // VRF (MagicBlock VRF Plugin)
    pub vrf_seed: [u8; 32],
    pub vrf_result: [u8; 32],
    pub vrf_pending: bool,
    pub vrf_fulfilled: bool,
    
    // Results
    pub winner_team: Option<u8>, // 0 = team_a, 1 = team_b
    pub created_at: i64,
    pub finished_at: Option<i64>,
    
    pub bump: u8,
}

impl Game {
    pub const LEN: usize = 8 + 8 + 32 + 1 + 1 + 8 + 8 
        + 1 + (1 + 1) + (1 + 32) + 1  // AI fields + practice mode
        + 1 + (1 + 32) + 8 + 8  // Kamino loan fields
        + (32 * 4) + 1 + 1 
        + 1 + 1 + 1 + 1 
        + 32 + 32 + 1 + 1  // VRF fields (seed, result, pending, fulfilled)
        + (1 + 1) + 8 + (1 + 8) 
        + 1;

    pub fn is_full(&self) -> bool {
        match self.game_mode {
            GameMode::OneVsOne => self.team_a_count == 1 && self.team_b_count == 1,
            GameMode::TwoVsTwo => self.team_a_count == 2 && self.team_b_count == 2,
            GameMode::HumanVsAi => self.team_a_count == 1 && self.is_ai_game,
        }
    }

    pub fn get_required_players(&self) -> u8 {
        match self.game_mode {
            GameMode::OneVsOne => 2,
            GameMode::TwoVsTwo => 4,
            GameMode::HumanVsAi => 1,  // Only human player needed
        }
    }

    pub fn get_current_player(&self) -> Pubkey {
        let team = self.current_turn % 2;
        let player_idx = (self.current_turn / 2) as usize;
        
        if team == 0 {
            self.team_a[player_idx]
        } else {
            self.team_b[player_idx]
        }
    }
}

#[account]
pub struct PlayerStats {
    pub player: Pubkey,
    pub games_played: u64,
    pub games_won: u64,
    pub total_wagered: u64,
    pub total_winnings: u64,
    pub shots_survived: u64,
    pub bump: u8,
}

impl PlayerStats {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct TreasuryRewards {
    pub player: Pubkey,
    pub claimable_amount: u64,
    pub total_claimed: u64,
    pub last_claim: i64,
    pub bump: u8,
}

impl TreasuryRewards {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1;
}
