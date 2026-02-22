use anchor_lang::prelude::*;

// MagicBlock VRF Program ID (Devnet)
// TODO: Update with actual VRF program ID from MagicBlock
declare_id!("11111111111111111111111111111111");

// Minimum entry fee (0.1 tokens with 9 decimals)
pub const MIN_ENTRY_FEE: u64 = 100_000_000;

// Maximum entry fee (1000 tokens with 9 decimals)
pub const MAX_ENTRY_FEE: u64 = 1_000_000_000_000;

// Game expiry time (24 hours)
pub const GAME_EXPIRY_SECONDS: i64 = 86400;
