# Magic Roulette - Multisig Deployment Status

## Current Status: READY TO DEPLOY ⚡

---

## Configured Addresses

### Member Wallets

✅ **Member 1**: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`  
✅ **Member 2**: `8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9`

**Status**: Both addresses configured! Ready to deploy.

---

## Multisig Configuration

- **Type**: Squads Protocol V4
- **Program ID**: `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`
- **Threshold**: 2-of-2 (both members must sign)
- **Time Lock**: 1 hour (3600 seconds) - adjustable
- **Network**: Devnet (for testing) → Mainnet

---

## What Happens After Deployment

Once you run the deployment script, you'll get 3 addresses:

1. **Multisig PDA** - Main authority address
2. **Platform Vault** (Index 0) - Receives 5% platform fees
3. **Treasury Vault** (Index 1) - Receives 10% treasury fees

These addresses will be automatically saved to `deployed-multisig-addresses.json`

---

## Quick Deployment Guide

### Step 1: Add Second Member Address

Update `MULTISIG_ADDRESSES.md` line 119 with the second member's wallet address:

```typescript
{ 
  key: new PublicKey("MEMBER_2_WALLET_ADDRESS"), // Replace this
  permissions: multisig.types.Permissions.all() 
},
```

### Step 2: Install Dependencies

```bash
npm install @sqds/multisig
```

### Step 3: Prepare Wallet

Make sure you have a wallet keypair file (e.g., `wallet.json`) with SOL for transaction fees:

- **Devnet**: Get free SOL from `solana airdrop 2`
- **Mainnet**: Ensure wallet has ~0.1 SOL for deployment

### Step 4: Run Deployment

Copy the deployment script from `MULTISIG_ADDRESSES.md` (lines 90-180) to a new file:

```bash
# Create the script
nano scripts/deploy-multisig-magic-roulette.ts

# Run it
ts-node scripts/deploy-multisig-magic-roulette.ts
```

### Step 5: Save Output

The script will output:
```
✅ Multisig created!
   Transaction: [signature]
   Multisig PDA: [address]

📦 Vaults:
   Platform Vault (Index 0): [address]
   Treasury Vault (Index 1): [address]

💾 Addresses saved to: deployed-multisig-addresses.json
```

### Step 6: Initialize Platform

After deployment, initialize the Magic Roulette platform with the multisig:

```bash
anchor run initialize-platform-multisig
```

---

## Testing the Multisig

### Test 1: Create a Proposal

```typescript
import * as multisig from "@sqds/multisig";

// Get transaction index
const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
  connection,
  multisigPda
);
const transactionIndex = BigInt(Number(multisigAccount.transactionIndex) + 1);

// Create a test transaction
const [transactionPda] = multisig.getTransactionPda({
  multisigPda,
  index: transactionIndex,
});

await multisig.rpc.vaultTransactionCreate({
  connection,
  feePayer: member1Wallet,
  multisigPda,
  transactionIndex,
  creator: member1Wallet.publicKey,
  vaultIndex: 1, // Treasury vault
  ephemeralSigners: 0,
  transactionMessage: /* your transaction */,
});
```

### Test 2: Approve Proposal

```typescript
// Member 1 approves
await multisig.rpc.proposalApprove({
  connection,
  feePayer: member1Wallet,
  multisigPda,
  transactionIndex,
  member: member1Wallet,
});

// Member 2 approves
await multisig.rpc.proposalApprove({
  connection,
  feePayer: member2Wallet,
  multisigPda,
  transactionIndex,
  member: member2Wallet,
});
```

### Test 3: Execute After Time Lock

```typescript
// Wait 1 hour (or your configured time lock)
// Then execute:
await multisig.rpc.vaultTransactionExecute({
  connection,
  feePayer: member1Wallet,
  multisigPda,
  transactionIndex,
  member: member1Wallet.publicKey,
});
```

---

## Fee Distribution Flow

### Automatic (On Game Finalization)

```
Game Pot (100%)
├─ 85% → Winners
├─ 5% → Platform Vault (Squads Vault 0)
└─ 10% → Treasury Vault (Squads Vault 1)
```

### Manual Withdrawal (Multisig Required)

```
Treasury Vault Balance
  ↓
Member 1 creates withdrawal proposal
  ↓
Member 2 approves proposal
  ↓
Wait 1 hour (time lock)
  ↓
Execute withdrawal
  ↓
Funds sent to recipient
```

---

## Security Checklist

- [ ] Both member wallet private keys are backed up securely
- [ ] Member wallets are stored in different locations
- [ ] Time lock duration is appropriate (1 hour = fast, 24 hours = secure)
- [ ] Test on devnet before mainnet deployment
- [ ] Verify multisig PDA is set as platform authority
- [ ] Confirm vault addresses receive fees correctly
- [ ] Document emergency procedures if a member is unavailable

---

## Important Notes

⚠️ **Immutable Configuration**: Once deployed, you CANNOT change:
- Threshold (2-of-2)
- Member addresses
- Time lock duration

⚠️ **Key Management**: If either member loses their private key:
- Funds in vaults will be LOCKED FOREVER
- No recovery mechanism exists
- Consider using hardware wallets

⚠️ **Vault Addresses**: Always send funds to VAULT addresses, not the multisig PDA:
- ✅ Send to: Platform Vault or Treasury Vault
- ❌ Don't send to: Multisig PDA (funds may be unrecoverable)

---

## Next Steps

1. ✅ Member 1 address configured: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`
2. ⏳ Add Member 2 wallet address
3. ⏳ Run deployment script on devnet
4. ⏳ Test proposal creation and approval
5. ⏳ Initialize Magic Roulette platform
6. ⏳ Test game with fee distribution
7. ⏳ Deploy to mainnet

---

## Resources

### Magic Roulette
- **Website**: https://magicroullete.com
- **Documentation**: https://docs.magicroulette.com
- **GitHub**: https://github.com/magicroulette-game/magic-roullete
- **Twitter**: https://x.com/mgcrouletteapp
- **Email**: magicroulettesol@gmail.com
- **Program ID**: `JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq`

### Squads Protocol
- **Full Documentation**: `MULTISIG_ADDRESSES.md`
- **Squads Protocol**: https://squads.so
- **Squads SDK**: https://github.com/Squads-Protocol/v4
- **Program ID**: `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`

---

## Support

For deployment assistance or questions:
- **Email**: magicroulettesol@gmail.com
- Check `MULTISIG_ADDRESSES.md` for detailed instructions
- Review `examples/kamino-squads-example.ts` for code examples
- Test thoroughly on devnet before mainnet

**Remember**: Multisig security depends on both members keeping their keys safe! 🔐
