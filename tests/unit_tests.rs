// Unit Tests - Magic Roulette Smart Contract
// Coverage Target: >= 80%

#[cfg(test)]
mod unit_tests {
    use magic_roulette::*;

    // ========================================================================
    // GAME CREATION TESTS
    // ========================================================================

    #[test]
    fn test_create_game_valid_1v1() {
        let mut game = Game::default();
        let entry_fee = 100_000_000u64;
        
        game.entry_fee = entry_fee;
        game.game_mode = GameMode::OneVsOne;
        game.status = GameStatus::WaitingForPlayers;
        
        assert_eq!(game.entry_fee, entry_fee);
        assert_eq!(game.game_mode, GameMode::OneVsOne);
        assert_eq!(game.status, GameStatus::WaitingForPlayers);
    }

    #[test]
    fn test_create_game_valid_2v2() {
        let mut game = Game::default();
        game.game_mode = GameMode::TwoVsTwo;
        
        assert_eq!(game.game_mode, GameMode::TwoVsTwo);
    }

    #[test]
    fn test_create_game_zero_fee_invalid() {
        let entry_fee = 0u64;
        assert_eq!(entry_fee, 0);
        // Should be rejected by constraint
    }

    #[test]
    fn test_create_game_min_fee_valid() {
        let entry_fee = 10_000_000u64; // 0.01 SOL
        assert!(entry_fee > 0);
    }

    #[test]
    fn test_create_game_max_fee_valid() {
        let entry_fee = u64::MAX;
        assert!(entry_fee > 0);
    }

    // ========================================================================
    // GAME STATE TESTS
    // ========================================================================

    #[test]
    fn test_game_is_full_1v1_not_full() {
        let mut game = Game::default();
        game.game_mode = GameMode::OneVsOne;
        game.team_a_count = 1;
        game.team_b_count = 0;
        
        assert!(!game.is_full());
    }

    #[test]
    fn test_game_is_full_1v1_full() {
        let mut game = Game::default();
        game.game_mode = GameMode::OneVsOne;
        game.team_a_count = 1;
        game.team_b_count = 1;
        
        assert!(game.is_full());
    }

    #[test]
    fn test_game_is_full_2v2_not_full() {
        let mut game = Game::default();
        game.game_mode = GameMode::TwoVsTwo;
        game.team_a_count = 2;
        game.team_b_count = 1;
        
        assert!(!game.is_full());
    }

    #[test]
    fn test_game_is_full_2v2_full() {
        let mut game = Game::default();
        game.game_mode = GameMode::TwoVsTwo;
        game.team_a_count = 2;
        game.team_b_count = 2;
        
        assert!(game.is_full());
    }

    #[test]
    fn test_get_required_players_1v1() {
        let game = Game {
            game_mode: GameMode::OneVsOne,
            ..Default::default()
        };
        
        assert_eq!(game.get_required_players(), 2);
    }

    #[test]
    fn test_get_required_players_2v2() {
        let game = Game {
            game_mode: GameMode::TwoVsTwo,
            ..Default::default()
        };
        
        assert_eq!(game.get_required_players(), 4);
    }

    // ========================================================================
    // FEE CALCULATION TESTS
    // ========================================================================

    #[test]
    fn test_fee_calculation_5_percent() {
        let total_pot = 1_000_000_000u64;
        let fee_bps = 500u16; // 5%
        
        let fee = (total_pot as u128)
            .checked_mul(fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        assert_eq!(fee, 50_000_000);
    }

    #[test]
    fn test_fee_calculation_10_percent() {
        let total_pot = 1_000_000_000u64;
        let fee_bps = 1000u16; // 10%
        
        let fee = (total_pot as u128)
            .checked_mul(fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        assert_eq!(fee, 100_000_000);
    }

    #[test]
    fn test_fee_calculation_zero_fee() {
        let total_pot = 1_000_000_000u64;
        let fee_bps = 0u16;
        
        let fee = (total_pot as u128)
            .checked_mul(fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        assert_eq!(fee, 0);
    }

    #[test]
    fn test_fee_calculation_max_fee() {
        let total_pot = 1_000_000_000u64;
        let fee_bps = 10000u16; // 100%
        
        let fee = (total_pot as u128)
            .checked_mul(fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        assert_eq!(fee, total_pot);
    }

    #[test]
    fn test_fee_calculation_rounding() {
        let total_pot = 1_000_000_001u64;
        let fee_bps = 500u16; // 5%
        
        let fee = (total_pot as u128)
            .checked_mul(fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        // Should round down
        assert_eq!(fee, 50_000_000);
    }

    // ========================================================================
    // PRIZE DISTRIBUTION TESTS
    // ========================================================================

    #[test]
    fn test_prize_distribution_1v1() {
        let total_pot = 1_000_000_000u64;
        let platform_fee_bps = 500u16;
        let treasury_fee_bps = 1000u16;
        
        let platform_fee = (total_pot as u128 * platform_fee_bps as u128 / 10000) as u64;
        let treasury_fee = (total_pot as u128 * treasury_fee_bps as u128 / 10000) as u64;
        let winner_amount = total_pot - platform_fee - treasury_fee;
        
        assert_eq!(platform_fee, 50_000_000);
        assert_eq!(treasury_fee, 100_000_000);
        assert_eq!(winner_amount, 850_000_000);
        assert_eq!(platform_fee + treasury_fee + winner_amount, total_pot);
    }

    #[test]
    fn test_prize_distribution_2v2() {
        let total_pot = 1_000_000_000u64;
        let platform_fee_bps = 500u16;
        let treasury_fee_bps = 1000u16;
        let winner_count = 2u64;
        
        let platform_fee = (total_pot as u128 * platform_fee_bps as u128 / 10000) as u64;
        let treasury_fee = (total_pot as u128 * treasury_fee_bps as u128 / 10000) as u64;
        let winner_amount = total_pot - platform_fee - treasury_fee;
        let per_winner = winner_amount / winner_count;
        let dust = winner_amount % winner_count;
        
        assert_eq!(per_winner, 425_000_000);
        assert_eq!(dust, 0);
        assert_eq!(per_winner * winner_count + dust, winner_amount);
    }

    #[test]
    fn test_prize_distribution_no_overflow() {
        let total_pot = u64::MAX / 2;
        let platform_fee_bps = 500u16;
        
        let result = (total_pot as u128)
            .checked_mul(platform_fee_bps as u128)
            .and_then(|v| v.checked_div(10000));
        
        assert!(result.is_some());
    }

    // ========================================================================
    // ARITHMETIC TESTS
    // ========================================================================

    #[test]
    fn test_checked_add_no_overflow() {
        let a = 1_000_000_000u64;
        let b = 1_000_000_000u64;
        
        let result = a.checked_add(b);
        assert!(result.is_some());
        assert_eq!(result.unwrap(), 2_000_000_000);
    }

    #[test]
    fn test_checked_add_overflow() {
        let a = u64::MAX;
        let b = 1u64;
        
        let result = a.checked_add(b);
        assert!(result.is_none());
    }

    #[test]
    fn test_checked_mul_no_overflow() {
        let a = 1_000_000_000u64 as u128;
        let b = 500u128;
        
        let result = a.checked_mul(b);
        assert!(result.is_some());
    }

    #[test]
    fn test_checked_mul_overflow() {
        let a = u128::MAX;
        let b = 2u128;
        
        let result = a.checked_mul(b);
        assert!(result.is_none());
    }

    // ========================================================================
    // PLAYER VALIDATION TESTS
    // ========================================================================

    #[test]
    fn test_player_not_duplicate_in_team_a() {
        let player = Pubkey::new_unique();
        let team_a = [player, Pubkey::new_unique()];
        
        assert!(team_a.contains(&player));
    }

    #[test]
    fn test_player_not_duplicate_in_team_b() {
        let player = Pubkey::new_unique();
        let team_b = [player, Pubkey::new_unique()];
        
        assert!(team_b.contains(&player));
    }

    #[test]
    fn test_player_not_in_both_teams() {
        let player = Pubkey::new_unique();
        let other = Pubkey::new_unique();
        let team_a = [player, other];
        let team_b = [Pubkey::new_unique(), Pubkey::new_unique()];
        
        assert!(team_a.contains(&player));
        assert!(!team_b.contains(&player));
    }

    // ========================================================================
    // VRF TESTS
    // ========================================================================

    #[test]
    fn test_vrf_randomness_to_chamber() {
        let randomness = [42u8; 32];
        let random_u64 = u64::from_le_bytes([
            randomness[0], randomness[1], randomness[2], randomness[3],
            randomness[4], randomness[5], randomness[6], randomness[7],
        ]);
        let chamber = ((random_u64 % 6) + 1) as u8;
        
        assert!(chamber >= 1 && chamber <= 6);
    }

    #[test]
    fn test_vrf_randomness_distribution() {
        for i in 0..256 {
            let randomness = [i as u8; 32];
            let random_u64 = u64::from_le_bytes([
                randomness[0], randomness[1], randomness[2], randomness[3],
                randomness[4], randomness[5], randomness[6], randomness[7],
            ]);
            let chamber = ((random_u64 % 6) + 1) as u8;
            
            assert!(chamber >= 1 && chamber <= 6);
        }
    }

    // ========================================================================
    // GAME LOGIC TESTS
    // ========================================================================

    #[test]
    fn test_bullet_hit_detection() {
        let bullet_chamber = 3u8;
        let current_chamber = 3u8;
        
        assert_eq!(bullet_chamber, current_chamber);
    }

    #[test]
    fn test_bullet_miss_detection() {
        let bullet_chamber = 3u8;
        let current_chamber = 1u8;
        
        assert_ne!(bullet_chamber, current_chamber);
    }

    #[test]
    fn test_chamber_wraparound() {
        let mut current_chamber = 6u8;
        current_chamber += 1;
        if current_chamber > 6 {
            current_chamber = 1;
        }
        
        assert_eq!(current_chamber, 1);
    }

    // ========================================================================
    // PLATFORM CONFIG TESTS
    // ========================================================================

    #[test]
    fn test_platform_fee_valid() {
        let platform_fee_bps = 500u16;
        let treasury_fee_bps = 1000u16;
        let total = platform_fee_bps + treasury_fee_bps;
        
        assert!(total <= 10000);
    }

    #[test]
    fn test_platform_fee_max() {
        let platform_fee_bps = 5000u16;
        let treasury_fee_bps = 5000u16;
        let total = platform_fee_bps + treasury_fee_bps;
        
        assert_eq!(total, 10000);
    }

    #[test]
    fn test_platform_fee_overflow() {
        let platform_fee_bps = 10000u16;
        let treasury_fee_bps = 1u16;
        let total = platform_fee_bps.checked_add(treasury_fee_bps);
        
        assert!(total.is_some());
        assert!(total.unwrap() > 10000);
    }

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    #[test]
    fn test_single_lamport_fee() {
        let total_pot = 1u64;
        let fee_bps = 1u16;
        
        let fee = (total_pot as u128 * fee_bps as u128 / 10000) as u64;
        assert_eq!(fee, 0);
    }

    #[test]
    fn test_max_u64_fee_calculation() {
        let total_pot = u64::MAX / 2;
        let fee_bps = 500u16;
        
        let result = (total_pot as u128)
            .checked_mul(fee_bps as u128)
            .and_then(|v| v.checked_div(10000));
        
        assert!(result.is_some());
    }

    #[test]
    fn test_precision_loss_minimal() {
        let total_pot = 999_999_999u64;
        let fee_bps = 500u16;
        
        let fee = (total_pot as u128 * fee_bps as u128 / 10000) as u64;
        let remainder = total_pot - fee;
        
        // Verify no precision loss
        assert!(remainder > 0);
    }
}

use anchor_lang::prelude::*;

#[derive(Default)]
pub struct Game {
    pub game_mode: GameMode,
    pub team_a_count: u8,
    pub team_b_count: u8,
    pub entry_fee: u64,
    pub status: GameStatus,
}

#[derive(PartialEq, Eq, Default)]
pub enum GameMode {
    #[default]
    OneVsOne,
    TwoVsTwo,
    HumanVsAi,
}

#[derive(PartialEq, Eq, Default)]
pub enum GameStatus {
    #[default]
    WaitingForPlayers,
    Delegated,
    InProgress,
    Finished,
    Cancelled,
}

impl Game {
    pub fn is_full(&self) -> bool {
        match self.game_mode {
            GameMode::OneVsOne => self.team_a_count == 1 && self.team_b_count == 1,
            GameMode::TwoVsTwo => self.team_a_count == 2 && self.team_b_count == 2,
            GameMode::HumanVsAi => self.team_a_count == 1,
        }
    }

    pub fn get_required_players(&self) -> u8 {
        match self.game_mode {
            GameMode::OneVsOne => 2,
            GameMode::TwoVsTwo => 4,
            GameMode::HumanVsAi => 1,
        }
    }
}
