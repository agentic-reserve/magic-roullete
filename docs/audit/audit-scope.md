# Audit Scope Document

## Overview

This document defines the complete scope of the Magic Roulette security audit, listing all components, instructions, and integrations to be audited.

## Smart Contract Components

### Program Information
- **Program Name**: Magic Roulette
- **Program ID (Devnet)**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Language**: Rust
- **Framework**: Anchor 0.32.1
- **Lines of Code**: ~3,000 (excluding tests)

### Core Instructions (In Scope)

#### 1. Platform Initialization
- `initialize_platform` - Initialize platform with single authority
- `initialize_platform_multisig` - Initialize platform with Squads multisig

#### 2. Game Creation
- `create_game` - Create standard game with token entry fee
- `create_game_sol` - Create game with native SOL entry fee
- `create_game_with_loan` - Create game with Kamino leveraged betting
- `create_ai_game` - Create AI practice game

#### 3. Game Execution
- `join_game` - Join game with token entry fee
- `join_game_sol` - Join game with SOL entry fee
- `take_shot` - Execute player shot
- `ai_take_shot` - Execute AI opponent shot

#### 4. VRF Integration
- `vrf_instructions::request_randomness` - Request VRF randomness
- `process_vrf_result` - Process VRF callback and determine bullet chamber

#### 5. Game Finalization
- `finalize` - Finalize standard game and distribute winnings
- `finalize_game_sol` - Finalize SOL game
- `finalize_game_with_loan` - Finalize game with Kamino loan repayment

#### 6. MagicBlock Ephemeral Rollup
- `delegate` - Delegate game to Ephemeral Rollup
- `undelegate` (implicit in finalize) - Commit state back to base layer

#### 7. Rewards and Stats
- `claim_rewards` - Claim treasury rewards
- `update_player_stats` (implicit) - Update player statistics

### State Accounts (In Scope)

#### Platform State
```rust
pub struct Platform {
    pub authority: Pubkey,           // Platform authority
    pub treasury: Pubkey,            // Treasury account
    pub fee_percentage: u16,         // Platform fee (5%)
    pub treasury_percentage: u16,    // Treasury allocation (10%)
    pub total_games: u64,            // Total games created
    pub total_volume: u64,           // Total volume wagered
    pub is_multisig: bool,           // Multisig enabled
    pub multisig_address: Pubkey,    // Squads multisig address
}
```

#### Game State
```rust
pub struct Game {
    pub game_id: u64,                // Unique game ID
    pub creator: Pubkey,             // Game creator
    pub entry_fee: u64,              // Entry fee amount
    pub total_pot: u64,              // Total prize pool
    pub game_mode: GameMode,         // 1v1, 2v2, AI
    pub status: GameStatus,          // Waiting, Ready, InProgress, Finished
    pub players: Vec<Player>,        // Player list
    pub current_turn: u8,            // Current turn index
    pub bullet_chamber: Option<u8>,  // Bullet chamber (1-6, hidden)
    pub current_chamber: u8,         // Current chamber position
    pub winner: Option<Pubkey>,      // Winner address
    pub vrf_request_id: Option<u64>, // VRF request ID
    pub is_delegated: bool,          // Delegated to ER
    pub kamino_loan_id: Option<u64>, // Kamino loan ID
}
```

#### Player Stats
```rust
pub struct PlayerStats {
    pub player: Pubkey,              // Player address
    pub games_played: u64,           // Total games
    pub games_won: u64,              // Wins
    pub total_wagered: u64,          // Total wagered
    pub total_winnings: u64,         // Total winnings
}
```

### DeFi Integrations (In Scope)

#### Kamino Finance Integration
- **Loan Creation**: Creating leveraged betting positions with 110% collateralization
- **Collateral Management**: Managing SOL/USDC collateral
- **Auto-Repayment**: Automatic loan repayment from winnings
- **Liquidation Handling**: Handling undercollateralized positions

**Kamino Instructions Used**:
- `create_obligation` - Create loan obligation
- `deposit_reserve_liquidity` - Deposit collateral
- `borrow_obligation_liquidity` - Borrow funds
- `repay_obligation_liquidity` - Repay loan
- `refresh_obligation` - Update obligation state

#### Squads Protocol Integration
- **Multisig Setup**: 3-of-5 multisig for treasury management
- **Proposal Creation**: Creating governance proposals
- **Proposal Execution**: Executing approved proposals
- **Treasury Management**: Managing platform treasury

**Squads Instructions Used**:
- `create_multisig` - Create multisig account
- `create_transaction` - Create multisig transaction
- `approve_transaction` - Approve transaction
- `execute_transaction` - Execute approved transaction

### MagicBlock Ephemeral Rollup Integration (In Scope)

#### Delegation Pattern
- **Delegation**: Transferring game state to Ephemeral Rollup
- **Gasless Execution**: Shot execution with zero gas fees
- **State Commitment**: Committing final state back to base layer
- **Rollback Handling**: Handling failed commitments

**MagicBlock Components**:
- `delegate_account` - Delegate account to ER
- `undelegate_account` - Commit state back to L1
- State synchronization logic
- Error handling and rollback

### VRF Integration (In Scope)

#### Randomness Generation Flow
1. **Request Phase**: Game requests randomness via VRF oracle
2. **Callback Phase**: VRF oracle provides verifiable random value
3. **Determination Phase**: Bullet chamber calculated from random value
4. **Verification**: VRF proof verification

**VRF Components**:
- Randomness request instruction
- VRF callback processing
- Bullet chamber calculation algorithm
- VRF proof verification

## Out of Scope

The following components are **NOT** in scope for this audit:

### Frontend Applications
- Web app (Next.js)
- Mobile app (React Native)
- UI/UX components

### Backend Services
- Express.js API
- PostgreSQL database
- Redis cache
- WebSocket server

### Infrastructure
- Deployment scripts
- Monitoring services
- Analytics dashboards

### Third-Party SDKs
- Kamino Finance SDK (external)
- Squads Protocol SDK (external)
- MagicBlock SDK (external)
- VRF Oracle (external)

**Note**: While third-party SDKs are out of scope, the **integration code** that calls these SDKs is **in scope**.

## Audit Priorities

### Critical Priority (Must Audit)
1. Access control and authority validation
2. Arithmetic operations and overflow protection
3. VRF randomness manipulation resistance
4. Fund distribution logic
5. Kamino loan creation and repayment
6. Squads multisig execution
7. Reentrancy protection

### High Priority (Should Audit)
1. State transition validation
2. PDA derivation and verification
3. Error handling and edge cases
4. Ephemeral Rollup delegation safety
5. Concurrent game handling
6. Fee calculation accuracy

### Medium Priority (Nice to Audit)
1. Gas optimization opportunities
2. Code quality and best practices
3. Documentation completeness
4. Test coverage

## Testing Requirements

### Auditor Testing Environment
- **Network**: Solana Devnet
- **RPC**: `https://api.devnet.solana.com`
- **Program ID**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Test Accounts**: Provided in repository
- **Test SOL**: Available via devnet faucet

### Required Test Scenarios
1. Standard game flow (create, join, play, finalize)
2. SOL-native game flow
3. Kamino leveraged betting flow
4. VRF randomness generation
5. Multisig treasury operations
6. Ephemeral Rollup delegation
7. Edge cases and error conditions
8. Concurrent game execution
9. Exploit attempt scenarios

## Deliverables Expected

### From Auditors
1. **Initial Review Report** (Week 2-3)
   - Preliminary findings
   - Questions and clarifications
   - Architecture assessment

2. **Detailed Findings Report** (Week 4-5)
   - Vulnerability list with severity
   - Exploit scenarios
   - Proof of concept code
   - Recommendations

3. **Final Audit Report** (Week 7)
   - All findings with status (fixed/acknowledged/mitigated)
   - Re-test results
   - Security recommendations
   - Public disclosure version

### From Development Team
1. **Remediation Plan** (Week 6)
   - Fix timeline for each vulnerability
   - Implementation approach
   - Testing strategy

2. **Fix Implementation** (Week 6)
   - Code fixes for critical/high issues
   - Updated tests
   - Documentation updates

3. **Re-test Support** (Week 6-7)
   - Access to fixed code
   - Test environment
   - Technical support

## Audit Methodology

### Recommended Approach
1. **Static Analysis**: Automated code scanning
2. **Manual Review**: Line-by-line code review
3. **Architecture Analysis**: System design review
4. **Exploit Testing**: Attempt to exploit vulnerabilities
5. **Integration Testing**: Test DeFi integrations
6. **Edge Case Testing**: Boundary conditions and error paths

### Tools Recommended
- **Rust Analyzer**: Code analysis
- **Anchor CLI**: Program testing
- **Solana CLI**: On-chain interaction
- **Custom Scripts**: Exploit scenarios

## Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Preparation | Week 1 | Documentation review, environment setup |
| Initial Review | Weeks 2-3 | Static analysis, manual review, preliminary findings |
| Deep Dive | Weeks 4-5 | Exploit testing, integration testing, detailed findings |
| Remediation | Week 6 | Fix implementation, re-testing |
| Final Report | Week 7 | Final report, public disclosure |

## Contact and Support

### Technical Questions
- Review [Smart Contract Instructions](./smart-contract-instructions.md)
- Review [VRF Integration](./vrf-integration.md)
- Review [Kamino Integration](./kamino-integration.md)
- Review [Squads Integration](./squads-integration.md)

### Environment Issues
- Review [Test Environment Setup](./test-environment.md)
- Contact technical lead for access issues

### Clarifications
- Submit questions via GitHub Issues
- Schedule technical calls as needed

## Appendix

### Severity Classification

**Critical**: Fund theft, game manipulation, system compromise
- Immediate fix required
- Re-audit mandatory

**High**: Significant impact, requires immediate fix
- Fix before mainnet
- Re-test required

**Medium**: Moderate impact, fix before mainnet
- Fix during remediation phase
- Verification required

**Low**: Minor issues, best practice improvements
- Fix recommended
- No re-test required

**Informational**: Code quality, gas optimization
- Optional improvements
- No re-test required
