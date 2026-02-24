# Smart Contract Instructions Documentation

## Overview

This document provides comprehensive documentation of all Magic Roulette smart contract instructions, including parameters, validation logic, state changes, and security considerations.

**Program ID**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`

## Instruction Categories

1. [Platform Initialization](#platform-initialization)
2. [Game Creation](#game-creation)
3. [Game Execution](#game-execution)
4. [VRF Integration](#vrf-integration)
5. [Game Finalization](#game-finalization)
6. [MagicBlock Ephemeral Rollup](#magicblock-ephemeral-rollup)
7. [Rewards and Stats](#rewards-and-stats)
8. [SOL Betting](#sol-betting)
9. [Kamino Integration](#kamino-integration)
10. [Squads Multisig](#squads-multisig)

---

## Platform Initialization

### `initialize_platform`

Initializes the platform configuration with a single authority.

**Parameters**:
- `platform_fee_bps: u16` - Platform fee in basis points (500 = 5%)
- `treasury_fee_bps: u16` - Treasury fee in basis points (1000 = 10%)

**Accounts**:
- `authority` (signer, mut) - Platform authority
- `platform_config` (init, pda) - Platform configuration account
- `treasury` - Treasury account
- `platform_mint` - Official platform token mint
- `system_program` - System program

**Validation**:
- Fee percentages must be reasonable (< 10000 bps)
- Authority must sign the transaction
- Platform config PDA must be correctly derived

**State Changes**:
- Creates `PlatformConfig` account
- Sets authority, treasury, and fee parameters
- Initializes counters (total_games, total_volume)

**Security Considerations**:
- ✅ Authority validation required
- ✅ PDA derivation prevents unauthorized initialization
- ✅ Fee limits prevent excessive fees

---

### `initialize_platform_with_multisig`

Initializes the platform with Squads Protocol multisig as authority.

**Parameters**:
- `platform_fee_bps: u16` - Platform fee in basis points
- `treasury_fee_bps: u16` - Treasury fee in basis points

**Accounts**:
- `authority` (signer, mut) - Initial authority (transfers to multisig)
- `platform_config` (init, pda) - Platform configuration
- `multisig_authority` - Squads multisig PDA
- `platform_vault` - Squads vault 0 (platform fees)
- `treasury_vault` - Squads vault 1 (treasury)
- `system_program` - System program

**Validation**:
- Multisig PDA must be valid Squads multisig
- Vaults must be owned by multisig
- Fee parameters must be valid

**State Changes**:
- Creates `PlatformConfig` with multisig authority
- Links Squads vaults for fee distribution
- Sets multisig_authority field

**Security Considerations**:
- ✅ Multisig PDA validation
- ✅ Vault ownership verification
- ✅ Decentralized governance enabled

---

## Game Creation

### `create_game`

Creates a new game with token entry fee (1v1 or 2v2).

**Parameters**:
- `game_mode: GameMode` - OneVsOne or TwoVsTwo
- `entry_fee: u64` - Entry fee amount in tokens
- `vrf_seed: [u8; 32]` - Seed for VRF randomness

**Accounts**:
- `creator` (signer, mut) - Game creator
- `game` (init, pda) - Game account
- `platform_config` (mut) - Platform configuration
- `creator_token_account` (mut) - Creator's token account
- `game_vault` (init) - Game vault for entry fees
- `mint` - Token mint
- `token_program` - Token-2022 program
- `system_program` - System program

**Validation**:
- Entry fee must be > 0
- Creator must have sufficient token balance
- Game mode must be valid
- VRF seed must be unique

**State Changes**:
- Creates `Game` account with status `WaitingForPlayers`
- Transfers entry fee from creator to game vault
- Adds creator to team_a
- Increments platform total_games counter
- Stores VRF seed for randomness generation

**Security Considerations**:
- ✅ Balance check before transfer
- ✅ PDA derivation for game account
- ✅ VRF seed stored for verifiable randomness
- ⚠️ **AUDIT FOCUS**: Entry fee validation and transfer logic

---

### `create_game_sol`

Creates a new game with native SOL entry fee.

**Parameters**:
- `game_mode: GameMode` - OneVsOne or TwoVsTwo
- `entry_fee: u64` - Entry fee in lamports
- `vrf_seed: [u8; 32]` - VRF seed

**Accounts**:
- `creator` (signer, mut) - Game creator
- `game` (init, pda) - Game accou