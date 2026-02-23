# Magic Roulette - Quick Start

**⚡ Get testing in 5 minutes!**

## Prerequisites Check

```bash
# Verify installations
solana --version          # Should show 3.1.9 or higher
anchor --version          # Should show 0.32.1 or higher
node --version            # Should show v18+ or v20+

# Verify you're on localnet
solana config get        # RPC URL should be http://localhost:8899

# Check your balance
solana balance           # Should show 500000000 SOL
```

## 🚀 Quick Start (3 Steps)

### Step 1: Start Validator (New Terminal)

```bash
solana-test-validator \
  --bpf-program HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  target/deploy/magic_roulette.so \
  --reset
```

**Keep this terminal open!**

### Step 2: Verify Setup (Main Terminal)

```bash
node scripts/test-connection.js
```

Expected: All ✅ checks pass

### Step 3: Run Tests

```bash
# Create games (1v1 + AI)
node scripts/simple-create-game.js

# Test joining a game
node scripts/test-join-game.js
```

## 📊 Expected Results

### After `simple-create-game.js`:
- ✅ 1v1 game created (0.1 SOL entry fee)
- ✅ AI practice game created (free)
- ✅ Both games show in platform

### After `test-join-game.js`:
- ✅ Test player created and funded
- ✅ Player joins game successfully
- ✅ Game status changes to "ready"
- ✅ Total pot shows 0.2 SOL

## 🐛 Troubleshooting

### "Connection refused"
→ Start the validator (Step 1)

### "Account does not exist"
→ Run: `node scripts/simple-init.js`

### "No games exist"
→ Run: `node scripts/simple-create-game.js`

## 📚 Full Documentation

- **Complete Testing:** `TESTING_GUIDE.md`
- **Next Steps:** `NEXT_STEPS.md`
- **Current Status:** `CURRENT_STATUS.md`
- **This Session:** `SESSION_SUMMARY.md`

## 🎯 What's Next?

After basic tests pass:
1. Test VRF processing
2. Test taking shots
3. Test prize distribution
4. Deploy to devnet
5. Build frontend

## 💡 Quick Commands

```bash
# Check platform status
node scripts/test-connection.js

# Create new games
node scripts/simple-create-game.js

# Test joining
node scripts/test-join-game.js

# View validator logs
tail -f test-ledger/validator.log

# Stop validator
# Press Ctrl+C in validator terminal
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `scripts/test-connection.js` | Verify setup |
| `scripts/simple-init.js` | Initialize platform |
| `scripts/simple-create-game.js` | Create games |
| `scripts/test-join-game.js` | Test joining |
| `TESTING_GUIDE.md` | Full testing guide |

## ⚙️ Configuration

- **Network:** Localnet
- **RPC:** http://localhost:8899
- **Program ID:** `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Wallet:** `BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq`
- **Platform Fee:** 5%
- **Treasury Fee:** 10%

---

**Ready to test?** Start with Step 1! 🚀
