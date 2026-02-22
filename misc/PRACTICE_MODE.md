# Practice Mode - Human vs AI

Mode latihan gratis untuk belajar bermain Russian Roulette tanpa risiko kehilangan uang.

## 🎮 Fitur Practice Mode

### Gratis 100%
- ✅ Tidak ada entry fee
- ✅ Tidak ada hadiah uang
- ✅ Tidak ada risiko finansial
- ✅ Unlimited games

### Tiga Level Kesulitan

| Level | Strategi | Win Rate | Cocok Untuk |
|-------|----------|----------|-------------|
| **Easy** | Random decisions | ~30% | Pemula yang baru belajar |
| **Medium** | Basic probability | ~50% | Player menengah |
| **Hard** | Monte Carlo simulation | ~70% | Player advanced |

### Manfaat

**Untuk Player:**
- Belajar game mechanics tanpa risiko
- Latihan strategi melawan AI
- Memahami probabilitas
- Build confidence sebelum main real money

**Untuk Platform:**
- User onboarding yang mudah
- Meningkatkan skill player
- Selalu ada lawan (24/7)
- Membangun trust

## 🤖 AI Bot Technology

### Monte Carlo Simulation (Hard Mode)

AI menggunakan simulasi Monte Carlo untuk menghitung probabilitas survival:

```typescript
// Contoh: Chamber 3 dari 6, posisi peluru tidak diketahui
const gameState = {
  currentChamber: 3,
  totalChambers: 6,
  shotsRemaining: 4,
};

// AI menjalankan 10,000 simulasi
const result = ai.calculateSurvivalProbability(gameState);
// Hasil: 66.7% survival probability
```

### Cara Kerja

```
1. Analisis game state saat ini
2. Jalankan Monte Carlo simulations (Hard mode)
3. Hitung survival probability
4. Tambahkan randomness agar terlihat human-like
5. Buat keputusan: SHOOT atau PASS
6. Execute on-chain
```

### Contoh Output

```
🎮 Game 42
   Current Chamber: 3/6
   Shots Taken: 2

AI Analysis (Hard mode):
- Survival Probability: 66.67%
- Optimal Action: shoot
- Confidence: 33.34%
- Simulations Run: 10000
- Current Chamber: 3/6

   Decision: SHOOT
   ✅ Shot taken
   ✓ Click. AI Bot survived
```

## 📊 Perbandingan Mode

### Practice Mode vs Real Money

| Aspek | Practice Mode | Real Money |
|-------|---------------|------------|
| Entry Fee | FREE | 100+ tokens |
| Prize | None | 85% pot |
| Opponent | AI Bot | Real players |
| Risk | Zero | High |
| Purpose | Learning | Earning |
| Availability | 24/7 | Depends on players |

## 🚀 Cara Bermain

### 1. Create AI Game

```typescript
import { MagicRouletteSDK, AiDifficulty } from "./lib/magic-roulette-sdk";

const sdk = new MagicRouletteSDK(rpcUrl, erUrl, wallet, idl);

// Create practice game (FREE)
const { game, gameId } = await sdk.createAiGame(
  player,
  AiDifficulty.Medium  // Easy, Medium, or Hard
);

console.log("Practice game created:", gameId);
```

### 2. Play Game

```typescript
// Game starts immediately (no waiting for players)
// Take your turn
await sdk.takeShot(player, gameId);

// AI automatically takes its turn
// Continue until someone hits the bullet
```

### 3. View Results

```typescript
const gameData = await sdk.getGame(gameId);

if (gameData.status === GameStatus.Finished) {
  const winner = gameData.winnerTeam === 0 ? "You" : "AI";
  console.log(`Game Over! Winner: ${winner}`);
  console.log("No prizes - this was practice mode");
}
```

## 🔧 Setup AI Bot Service

### 1. Install Dependencies

```bash
cd ai-bot
npm install
```

### 2. Generate Bot Keypair

```bash
solana-keygen new -o bot-keypair.json
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env:
# - RPC_URL=https://api.devnet.solana.com
# - PROGRAM_ID=YourProgramId
# - DIFFICULTY=Medium
```

### 4. Run Bot

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📈 AI Performance

### Win Rate by Difficulty

Berdasarkan 10,000 simulasi:

```
Easy Mode:
├─ Win Rate: 30%
├─ Strategy: Random
└─ Best for: Complete beginners

Medium Mode:
├─ Win Rate: 50%
├─ Strategy: Basic probability
└─ Best for: Learning players

Hard Mode:
├─ Win Rate: 70%
├─ Strategy: Monte Carlo (10k sims)
└─ Best for: Skilled players
```

### Survival Probability by Chamber

| Chamber | Survival % | AI Decision (Hard) |
|---------|------------|-------------------|
| 1/6 | 83.3% | SHOOT |
| 2/6 | 80.0% | SHOOT |
| 3/6 | 75.0% | SHOOT |
| 4/6 | 66.7% | SHOOT |
| 5/6 | 50.0% | RANDOM |
| 6/6 | 0% | PASS (if possible) |

## 🎯 Strategy Tips

### Melawan Easy AI
- Main santai, AI random
- Win rate ~70%
- Fokus belajar mechanics

### Melawan Medium AI
- AI pakai basic probability
- Win rate ~50%
- Latihan timing dan decision making

### Melawan Hard AI
- AI pakai Monte Carlo simulation
- Win rate ~30%
- Challenge untuk player advanced
- Belajar optimal strategy

## 🔒 Ethical Design

### Transparansi Penuh

✅ **Yang Dilakukan Bot:**
- Main di practice mode saja
- Jelas ditandai sebagai AI
- Tidak ada uang real
- Decision-making transparan
- Tujuan edukasi

❌ **Yang TIDAK Dilakukan Bot:**
- Main di real money games
- Menyembunyikan identitas
- Manipulasi hasil
- Mengambil uang dari user
- Beroperasi secara rahasia

### Disclosure

Setiap AI game memiliki:
- Label "PRACTICE MODE"
- Indicator "vs AI Bot"
- Difficulty level ditampilkan
- "No prizes" warning
- AI reasoning (optional)

## 📱 Frontend Integration

### Game Creation UI

```tsx
<CreateGameModal>
  <GameModeSelector>
    <Option value="1v1">1v1 (Real Money)</Option>
    <Option value="2v2">2v2 (Real Money)</Option>
    <Option value="ai" badge="FREE">
      Practice vs AI
    </Option>
  </GameModeSelector>
  
  {mode === 'ai' && (
    <DifficultySelector>
      <Option value="easy">Easy (30% win rate)</Option>
      <Option value="medium">Medium (50% win rate)</Option>
      <Option value="hard">Hard (70% win rate)</Option>
    </DifficultySelector>
  )}
  
  <Warning show={mode === 'ai'}>
    ⚠️ Practice Mode: No entry fee, no prizes
  </Warning>
</CreateGameModal>
```

### Game Display

```tsx
<GameCard game={game}>
  {game.isPracticeMode && (
    <Badge color="blue">PRACTICE MODE - FREE</Badge>
  )}
  
  <Opponent>
    {game.isAiGame ? (
      <>
        🤖 AI Bot ({game.aiDifficulty})
        <Tooltip>
          This is an AI opponent for practice.
          No real money involved.
        </Tooltip>
      </>
    ) : (
      <PlayerAvatar player={opponent} />
    )}
  </Opponent>
  
  <EntryFee>
    {game.isPracticeMode ? "FREE" : `${game.entryFee} tokens`}
  </EntryFee>
</GameCard>
```

## 📊 Analytics

### Track Practice Games

```typescript
interface PracticeStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  byDifficulty: {
    easy: { played: number; won: number };
    medium: { played: number; won: number };
    hard: { played: number; won: number };
  };
  averageShots: number;
  longestStreak: number;
}
```

### Progression System

```
Beginner: 0-10 practice games
├─ Unlock: Easy AI
└─ Goal: Learn basics

Intermediate: 11-50 practice games
├─ Unlock: Medium AI
└─ Goal: Understand probability

Advanced: 51-100 practice games
├─ Unlock: Hard AI
└─ Goal: Master strategy

Expert: 100+ practice games
├─ Unlock: Real money games
└─ Goal: Compete for prizes
```

## 🎓 Learning Resources

### In-Game Tutorials

1. **Basic Tutorial** (vs Easy AI)
   - How to play
   - Understanding chambers
   - Taking turns

2. **Probability Tutorial** (vs Medium AI)
   - Survival chances
   - Risk assessment
   - Decision making

3. **Advanced Strategy** (vs Hard AI)
   - Monte Carlo concepts
   - Optimal play
   - Psychological factors

### AI Explanations

Enable "Show AI Reasoning" untuk melihat:
- Survival probability calculations
- Decision-making process
- Simulation results
- Optimal strategy

## 🚀 Future Enhancements

### Phase 1
- [ ] Adaptive AI (learns from player)
- [ ] Multiple bot personalities
- [ ] Custom difficulty settings
- [ ] Practice tournaments

### Phase 2
- [ ] AI coaching mode
- [ ] Replay analysis
- [ ] Strategy recommendations
- [ ] Performance insights

### Phase 3
- [ ] Multiplayer practice (2v2 with AI)
- [ ] AI vs AI spectating
- [ ] Community AI challenges
- [ ] Leaderboards (practice mode)

## 📞 Support

Pertanyaan tentang practice mode?
- Discord: [Your Discord]
- Docs: [Your Docs]
- Email: [Your Email]

---

**Practice Mode** - Learn without risk, play with confidence! 🎮
