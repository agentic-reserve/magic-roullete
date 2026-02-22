pub mod initialize_platform;
pub mod create_game;
pub mod join_game;
pub mod delegate;
pub mod process_vrf_result;
pub mod take_shot;
pub mod finalize;
pub mod claim_rewards;
pub mod create_ai_game;
pub mod ai_take_shot;

// SOL betting versions
pub mod create_game_sol;
pub mod join_game_sol;
pub mod finalize_game_sol;

// Kamino integration
pub mod create_game_with_loan;
pub mod finalize_game_with_loan;

// Squads integration
pub mod initialize_platform_multisig;

pub use initialize_platform::*;
pub use create_game::*;
pub use join_game::*;
pub use delegate::*;
pub use process_vrf_result::*;
pub use take_shot::*;
pub use finalize::*;
pub use claim_rewards::*;
pub use create_ai_game::*;
pub use ai_take_shot::*;

// SOL betting exports
pub use create_game_sol::*;
pub use join_game_sol::*;
pub use finalize_game_sol::*;

// Kamino exports
pub use create_game_with_loan::*;
pub use finalize_game_with_loan::*;

// Squads exports
pub use initialize_platform_multisig::*;
