# Squads Protocol Integration Documentation

## Overview

Magic Roulette integrates with Squads Protocol to implement decentralized governance through a 3-of-5 multisig for treasury management and platform authority. This ensures that no single entity has unilateral control over platform funds or critical operations.

**Squads Protocol**: Solana's leading multisig and governance solution
**Integration Type**: Multisig authority, treasury management, governance proposals
**Multisig Configuration**: 3-of-5 threshold (3 signatures required out of 5 members)

## Squads Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            Squads Multisig Governance Flow                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Platform Initialization with Multisig                   │
│     ├─ Create Squads multisig (3-of-5)                      │
│     ├─ Set multisig as platform authority                   │
│     ├─ Create Squads vaults (platform, treasury)            │
│     └─ Transfer authority to multisig                       │
│                                                              │
│  2. Treasury Management                                     │
│     ├─ Platform fees → Squads vault 0 (platform)            │
│     ├─ Treasury fees → Squads vault 1 (treasury)            │
│     └─ Multisig controls fund distribution                  │
│                                                              │
│  3. Governance Proposal Creation                            │
│     ├─ Member creates proposal (e.g., fee change)           │
│     ├─ Proposal stored in Squads transaction                │
│     └─ Awaits approval from 3 members                       │
│                                                              │
│  4. Proposal Approval                                       │
│     ├─ Members review proposal                              │
│     ├─ Members approve/reject                               │
│     └─ Threshold reached (3/5)                              │
│                                                              │
│  5. Proposal Execution                                      │
│     ├─ Execute approved transaction                         │
│     ├─ Update platform configuration                        │
│     └─ Emit governance event                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Squads Instructions

### 1. `initialize_platform_with_multisig`

Initializes the platform with Squads multisig as authority.

**Parameters**:
- `platform_fee_bps: u16` - Platform fee in basis points (500 = 5%)
- `treasury_fee_bps: u16` - Treasury fee in basis points (1000 = 10%)

**Accounts**:
- `authority` (signer, mut) - Initial authority (transfers to multisig)
- `platform_config` (init, pda) - Platform configuration
- `multisig_authority` - Squads multisig PDA
- `platform_vault` - Squads vault 0 (platform fees)
- `treasury_vault` - Squads vault 1 (treasury)
- `squads_program` - Squads Protocol program
- `system_program` - System program

**Validation**:
- Multisig PDA must be valid Squads multisig
- Vaults must be owned by multisig
- Fee parameters must be valid (< 10000 bps)
- Initial authority must sign

**State Changes**:
- Creates `PlatformConfig` with multisig authority
- Sets `is_multisig = true`
- Links Squads vaults for fee distribution
- Transfers authority to multisig

**Security Considerations**:
- ✅ Multisig PDA validation
- ✅ Vault ownership verification
- ✅ Decentralized governance enabled
- ⚠️ **AUDIT FOCUS**: Multisig PDA derivation correctness
- ⚠️ **AUDIT FOCUS**: Authority transfer security

```rust
pub fn initialize_platform_with_multisig(
    ctx: Context<InitializePlatformWithMultisig>,
    platform_fee_bps: u16,
    treasury_fee_bps: u16,
) -> Result<()> {
    // SECURITY: Validate fee parameters
    require!(
        platform_fee_bps < 10000 && treasury_fee_bps < 10000,
        errors::GameError::InvalidFeePercentage
    );
    
    // SECURITY: Validate multisig PDA
    let multisig = &ctx.accounts.multisig_authority;
    require!(
        multisig.owner == &squads_mpl::ID,
        errors::GameError::InvalidMultisig
    );
    
    // SECURITY: Validate vaults are owned by multisig
    require!(
        ctx.accounts.platform_vault.owner == multisig.key,
        errors::GameError::InvalidVault
    );
    require!(
        ctx.accounts.treasury_vault.owner == multisig.key,
        errors::GameError::InvalidVault
    );
    
    // Initialize platform config
    let platform_config = &mut ctx.accounts.platform_config;
    platform_config.authority = multisig.key();
    platform_config.platform_fee_bps = platform_fee_bps;
    platform_config.treasury_fee_bps = treasury_fee_bps;
    platform_config.is_multisig = true;
    platform_config.multisig_address = multisig.key();
    platform_config.platform_vault = ctx.accounts.platform_vault.key();
    platform_config.treasury_vault = ctx.accounts.treasury_vault.key();
    
    msg!("Platform initialized with Squads multisig");
    msg!("Multisig: {}", multisig.key());
    msg!("Platform vault: {}", ctx.accounts.platform_vault.key());
    msg!("Treasury vault: {}", ctx.accounts.treasury_vault.key());
    
    Ok(())
}
```

## Squads Multisig Configuration

### Multisig Setup

**Configuration**:
- **Threshold**: 3 of 5 (60% approval required)
- **Members**: 5 authorized signers
- **Vaults**: 2 vaults (platform fees, treasury)

**Member Roles**:
1. **Core Team Member 1** - Technical lead
2. **Core Team Member 2** - Operations lead
3. **Core Team Member 3** - Security lead
4. **Community Representative** - Elected by community
5. **External Advisor** - Independent security expert

### Vault Structure

**Vault 0: Platform Fees**
- Receives 5% of game pot
- Used for operational expenses
- Controlled by multisig

**Vault 1: Treasury**
- Receives 10% of game pot
- Used for rewards and development
- Controlled by multisig

## Governance Operations

### 1. Fee Parameter Changes

**Proposal**: Change platform or treasury fee percentages

**Process**:
1. Member creates Squads transaction with new fee parameters
2. Transaction calls `update_platform_fees` instruction
3. 3 members approve transaction
4. Transaction executed, fees updated

**Security**:
- ✅ Requires 3-of-5 approval
- ✅ Fee limits enforced (< 10000 bps)
- ✅ Transparent on-chain governance

### 2. Treasury Withdrawals

**Proposal**: Withdraw funds from treasury vault

**Process**:
1. Member creates Squads transaction for withdrawal
2. Transaction specifies recipient and amount
3. 3 members approve transaction
4. Funds transferred from treasury vault

**Security**:
- ✅ Requires 3-of-5 approval
- ✅ All withdrawals on-chain and auditable
- ✅ No single-party control

### 3. Authority Updates

**Proposal**: Update platform authority or add/remove multisig members

**Process**:
1. Member creates Squads transaction for authority change
2. Transaction updates multisig configuration
3. 3 members approve transaction
4. Authority updated

**Security**:
- ✅ Requires 3-of-5 approval
- ✅ Prevents unauthorized authority changes
- ✅ Multisig remains in control

## Squads Security Properties

### 1. Decentralized Control

**Property**: No single entity can control platform funds or operations.

**Mechanism**:
- 3-of-5 threshold requires majority approval
- All operations require multisig approval
- Transparent on-chain governance

**Attack Vectors Mitigated**:
- ❌ Single-party fund theft (requires 3 signatures)
- ❌ Unauthorized fee changes (requires 3 signatures)
- ❌ Malicious authority updates (requires 3 signatures)

### 2. Treasury Security

**Property**: Platform and treasury funds are secured by multisig.

**Mechanism**:
- Fees distributed to Squads vaults
- Vaults controlled by multisig
- Withdrawals require 3-of-5 approval

**Fund Flow**:
```
Game Finalization
├─ Platform fee (5%) → Squads vault 0
├─ Treasury fee (10%) → Squads vault 1
└─ Winner prize (85%) → Winner account

Treasury Withdrawal (requires 3/5 approval)
├─ Create Squads transaction
├─ 3 members approve
└─ Funds transferred from vault
```

### 3. Governance Transparency

**Property**: All governance actions are transparent and auditable.

**Mechanism**:
- All proposals stored on-chain
- All approvals recorded on-chain
- All executions emit events

**Auditability**:
- Anyone can view pending proposals
- Anyone can view approval history
- Anyone can verify execution

## Squads Integration Security Audit Focus

### Critical

1. **Multisig PDA Validation**
   - Verify multisig PDA derivation is correct
   - Check multisig ownership validation
   - Ensure no unauthorized multisig substitution

2. **Vault Ownership Verification**
   - Verify vaults are owned by multisig
   - Check vault PDA derivation
   - Ensure no unauthorized vault access

3. **Authority Transfer Security**
   - Verify authority transfer to multisig is irreversible
   - Check no backdoor authority mechanisms
   - Ensure multisig has full control

### High

4. **Fee Distribution to Vaults**
   - Verify fees are sent to correct vaults
   - Check vault addresses are validated
   - Ensure no fee misdirection

5. **Governance Proposal Validation**
   - Verify proposal parameters are validated
   - Check threshold enforcement (3/5)
   - Ensure no proposal bypass mechanisms

### Medium

6. **Multisig Configuration**
   - Verify 3-of-5 threshold is enforced
   - Check member list is correct
   - Ensure no unauthorized member additions

## Squads CPI Calls

### 1. Create Multisig Transaction

```rust
// CPI to Squads: create_transaction
squads_mpl::cpi::create_transaction(
    CpiContext::new(
        ctx.accounts.squads_program.to_account_info(),
        squads_mpl::cpi::accounts::CreateTransaction {
            multisig: ctx.accounts.multisig_authority.to_account_info(),
            transaction: ctx.accounts.squads_transaction.to_account_info(),
            creator: ctx.accounts.creator.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    ),
    transaction_data,
)?;
```

### 2. Approve Transaction

```rust
// CPI to Squads: approve_transaction
squads_mpl::cpi::approve_transaction(
    CpiContext::new(
        ctx.accounts.squads_program.to_account_info(),
        squads_mpl::cpi::accounts::ApproveTransaction {
            multisig: ctx.accounts.multisig_authority.to_account_info(),
            transaction: ctx.accounts.squads_transaction.to_account_info(),
            member: ctx.accounts.member.to_account_info(),
        },
    ),
)?;
```

### 3. Execute Transaction

```rust
// CPI to Squads: execute_transaction
squads_mpl::cpi::execute_transaction(
    CpiContext::new(
        ctx.accounts.squads_program.to_account_info(),
        squads_mpl::cpi::accounts::ExecuteTransaction {
            multisig: ctx.accounts.multisig_authority.to_account_info(),
            transaction: ctx.accounts.squads_transaction.to_account_info(),
            member: ctx.accounts.member.to_account_info(),
        },
    ),
)?;
```

## Testing Recommendations

### Unit Tests

1. Test platform initialization with multisig
2. Test fee distribution to Squads vaults
3. Test multisig PDA validation
4. Test vault ownership verification
5. Test authority transfer to multisig

### Integration Tests

1. Test complete governance flow (create → approve → execute)
2. Test fee parameter change via multisig
3. Test treasury withdrawal via multisig
4. Test concurrent governance proposals
5. Test multisig with 3/5 threshold

### Security Tests

1. Attempt to initialize with invalid multisig
2. Attempt to send fees to non-multisig vaults
3. Attempt to bypass multisig approval
4. Attempt to execute proposal with < 3 approvals
5. Verify authority cannot be changed without multisig

## Known Limitations

1. **Squads Dependency**: System relies on Squads Protocol availability
   - **Mitigation**: Squads is battle-tested and widely used
   - **Monitoring**: Track Squads program health

2. **Governance Delay**: Proposals require time for approval
   - **Mitigation**: Emergency procedures for critical issues
   - **Recommendation**: Define governance timelines

3. **Member Coordination**: Requires 3 members to coordinate
   - **Mitigation**: Clear communication channels
   - **Recommendation**: Regular governance meetings

## Conclusion

The Squads Protocol integration provides decentralized governance through a 3-of-5 multisig for treasury management and platform authority. The system ensures no single entity has unilateral control over platform funds or operations. The main security considerations are multisig PDA validation, vault ownership verification, and authority transfer security.

**Audit Recommendation**: Focus on multisig PDA validation, vault ownership verification, and authority transfer security to ensure decentralized control.
