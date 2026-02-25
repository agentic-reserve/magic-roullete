# User Journey Optimization - Magic Roulette

**Status**: Draft  
**Priority**: Critical  
**Target**: Hackathon Submission  
**Timeline**: 48 hours

---

## Objective

Optimize the complete user journey from discovery to retention to maximize hackathon evaluation scores (Stickiness 25%, UX 25%, Innovation 25%, Presentation 25%).

---

## User Journey Map

### 1. Discovery (Landing Page)
**Goal**: Convert visitor to player in <30 seconds

**Requirements**:
- Clear value proposition: "Russian Roulette with real SOL stakes"
- Live stats: Active games, total volume, recent winners
- Social proof: Player count, testimonials
- Single CTA: "Enter Saloon" / "Play Now"
- Mobile-optimized hero section

**Success Metrics**:
- Click-through rate >40%
- Time to CTA <10 seconds

---

### 2. Onboarding (First Session)
**Goal**: Get user to complete first game

**Flow**:
1. Connect wallet (1-click, multiple providers)
2. Welcome modal with 3-step tutorial
3. Free AI practice game (no SOL required)
4. Prompt for first real game (0.01 SOL)

**Requirements**:
- Wallet connection: Phantom, Solflare, Backpack
- Tutorial: Interactive, skippable, 3 screens max
- AI game: Instant start, no waiting
- Faucet link: For devnet SOL
- First game incentive: "Win 2x your stake"

**Success Metrics**:
- Wallet connection rate >80%
- Tutorial completion >60%
- First game completion >50%

---

### 3. Core Usage Loop
**Goal**: Maximize games played per session

**Flow**:
1. Browse active games (filter: All/1v1/2v2)
2. Join game or create new
3. Gameplay: Take turns, real-time updates
4. Result: Win/lose, instant payout
5. Next action: Play again, view stats, leave

**Requirements**:
- Game lobby: Real-time updates via WebSocket
- Create game: 2 clicks max (mode + fee)
- Gameplay: <5 second turns, clear feedback
- Results: Animated, share-worthy
- Quick rematch: "Play Again" button

**Friction Reducers**:
- Kamino lending: Borrow SOL for entry fee
- AI opponents: No waiting for players
- Low stakes: 0.01 SOL minimum
- Fast finality: Instant payouts

**Success Metrics**:
- Games per session >3
- Session duration >10 minutes
- Win rate ~50% (fair gameplay)

---

### 4. Retention (Return Visits)
**Goal**: Daily active users

**Hooks**:
- Leaderboard: Top winners (daily/weekly/all-time)
- Daily challenge: "Win 3 games today"
- Treasury rewards: Stake for passive income
- Social: Challenge friends, share wins
- Progression: Win rate badge, volume tier

**Requirements**:
- Leaderboard page: Real-time rankings
- Stats page: Personal performance
- Notifications: Game invites, challenges
- Rewards system: Claimable from treasury
- Social sharing: Twitter, Discord

**Success Metrics**:
- Day 1 retention >40%
- Day 7 retention >20%
- Daily sessions >2

---

## Technical Implementation

### Phase 1: Core Journey (24h)
1. Landing page redesign
2. Onboarding flow (tutorial + AI game)
3. Gameplay polish (animations, feedback)
4. Results screen (share, rematch)

### Phase 2: Retention Features (24h)
1. Leaderboard implementation
2. Stats page with charts
3. Daily challenges system
4. Social sharing integration

---

## Design Requirements

### Landing Page
- Hero: Full-screen, Wild West theme
- Value prop: Above fold, <10 words
- Stats: Live counters (games, volume, players)
- CTA: Primary button, high contrast
- Mobile: Touch-optimized, fast load

### Onboarding
- Tutorial: 3 slides, visual, interactive
- AI game: Same UI as real games
- Progress: Step indicator (1/3, 2/3, 3/3)
- Skip: Always available, top-right

### Game Lobby
- Cards: Game mode, entry fee, players
- Filters: All/1v1/2v2, active state
- Create: Modal, 2 inputs (mode, fee)
- Empty state: "Create first game" CTA

### Gameplay
- Chamber: 6 circles, current highlighted
- Action: Large "Pull Trigger" button
- Feedback: Animation on shot (safe/hit)
- Turn indicator: "Your turn" / "Waiting"
- Exit: Confirm modal

### Results
- Winner: Full-screen celebration
- Stats: Entry fee, prize, win rate
- Actions: Play again, view stats, share
- Animation: Confetti, sound effects

### Leaderboard
- Tabs: Daily, weekly, all-time
- Columns: Rank, player, wins, volume
- Highlight: Current user row
- Refresh: Pull to refresh

### Stats
- Overview: Games, wins, losses, volume
- Charts: Win rate over time, stake distribution
- Badges: Win streak, volume tier
- History: Recent games list

---

## Mobile Optimization

### Touch Targets
- Minimum: 44x44px
- Spacing: 8px between interactive elements
- Buttons: Full-width on mobile

### Gestures
- Swipe: Navigate between tabs
- Pull: Refresh game lobby
- Long press: Game details

### Performance
- Load time: <2 seconds
- Animations: 60fps
- Bundle size: <500KB

---

## Evaluation Alignment

### Stickiness & PMF (25%)
- Daily challenges
- Leaderboard competition
- Social features
- Progression system

### User Experience (25%)
- Smooth onboarding
- Fast gameplay
- Clear feedback
- Mobile-optimized

### Innovation (25%)
- Kamino lending integration
- MagicBlock Ephemeral Rollups
- AI practice mode
- Real-time multiplayer

### Presentation (25%)
- Demo video: 2-minute walkthrough
- Pitch deck: Problem, solution, demo
- GitHub: Clean commits, documentation
- Live demo: Smooth, rehearsed

---

## Success Criteria

**Must Have**:
- [ ] Landing page with clear CTA
- [ ] Wallet connection flow
- [ ] Tutorial (3 screens)
- [ ] AI practice game
- [ ] Real game creation
- [ ] Gameplay with animations
- [ ] Results screen
- [ ] Leaderboard
- [ ] Stats page

**Nice to Have**:
- [ ] Daily challenges
- [ ] Social sharing
- [ ] Treasury rewards
- [ ] Friend system
- [ ] Push notifications

**Demo Requirements**:
- [ ] 2-minute video
- [ ] Live walkthrough
- [ ] GitHub documentation
- [ ] Pitch deck (3 slides)

---

## Timeline

**Day 1 (24h)**:
- 0-6h: Landing page + onboarding
- 6-12h: Gameplay polish
- 12-18h: Results + leaderboard
- 18-24h: Stats page + testing

**Day 2 (24h)**:
- 0-6h: Mobile optimization
- 6-12h: Demo video production
- 12-18h: Pitch deck creation
- 18-24h: Final testing + deployment

---

## Risks & Mitigations

**Risk**: Users don't understand gameplay  
**Mitigation**: Interactive tutorial, AI practice mode

**Risk**: No players to join games  
**Mitigation**: AI opponents, low stakes to attract players

**Risk**: High entry barrier (SOL required)  
**Mitigation**: Kamino lending, faucet link, 0.01 SOL minimum

**Risk**: Poor mobile experience  
**Mitigation**: Mobile-first design, touch optimization

**Risk**: Demo fails during presentation  
**Mitigation**: Pre-recorded video backup, rehearsed walkthrough

---

## Next Steps

1. Review and approve spec
2. Create implementation tasks
3. Assign priorities
4. Begin Phase 1 development
