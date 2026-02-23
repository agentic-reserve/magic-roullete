# Quick Multisig Setup - Magic Roulette

## 🎯 Current Status

✅ **Member 1**: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`  
⏳ **Member 2**: Need wallet address  
⏳ **Deployment**: Not yet deployed

---

## 🚀 3-Step Deployment

### 1️⃣ Both Members Configured ✅

✅ **Member 1**: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`  
✅ **Member 2**: `8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9`

### 2️⃣ Run Deployment Script

```bash
# Install SDK
npm install @sqds/multisig

# Copy the deployment script from MULTISIG_ADDRESSES.md (lines 90-180)
# Save it as: scripts/deploy-multisig-magic-roulette.ts
# Then run:
ts-node scripts/deploy-multisig-magic-roulette.ts
```

**Note**: Both member addresses are already configured in the script!

### 3️⃣ Save These Addresses

After deployment, you'll get:

```
Multisig PDA: _________________________________
Platform Vault: _________________________________
Treasury Vault: _________________________________
```

---

## 📋 What You Need

- [x] Member 1 wallet address: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`
- [x] Member 2 wallet address: `8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9`
- [ ] Wallet with SOL for fees (~0.1 SOL)
- [ ] Node.js and TypeScript installed
- [ ] `@sqds/multisig` package installed

---

## 🔐 Multisig Config

- **Type**: 2-of-2 (both must sign)
- **Time Lock**: 1 hour
- **Network**: Devnet → Mainnet
- **Program**: `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`

---

## 💰 Fee Distribution

Every game automatically sends:
- 85% → Winners
- 5% → Platform Vault
- 10% → Treasury Vault

To withdraw from vaults:
1. Member 1 creates proposal
2. Member 2 approves
3. Wait 1 hour
4. Execute withdrawal

---

## 📚 Full Documentation

- **Complete Guide**: `MULTISIG_ADDRESSES.md`
- **Status & Testing**: `MULTISIG_STATUS.md`
- **Code Example**: `examples/kamino-squads-example.ts`
- **Website**: https://magicroullete.com
- **Docs**: https://docs.magicroulette.com

---

## 📞 Contact

- **Email**: magicroulettesol@gmail.com
- **Twitter**: https://x.com/mgcrouletteapp
- **GitHub**: https://github.com/magicroulette-game/magic-roullete

---

## ⚠️ Important

- Keys are backed up securely
- Test on devnet first
- Cannot change members after deployment
- Both members needed to access funds
