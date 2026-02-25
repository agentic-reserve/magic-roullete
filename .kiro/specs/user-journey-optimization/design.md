# Design Document: User Journey Optimization

## Overview

This design transforms Magic Roulette from a basic game lobby into a comprehensive gaming experience optimized for the Solana mobile hackathon. The system addresses critical gaps in user acquisition, onboarding, engagement, and retention through a mobile-first approach that maximizes stickiness and product-market fit.

The design follows a progressive disclosure pattern, introducing features gradually as users advance through their journey. The architecture separates concerns into distinct layers: presentation (React Native/Expo), state management (React Context), business logic (custom hooks), and blockchain interaction (Solana Web3.js + Anchor).

### Key Design Principles

1. **Mobile-First**: All interactions optimized for touch with 44px+ targets
2. **Progressive Disclosure**: Features revealed as users advance
3. **Immediate Feedback**: <100ms visual responses, <200ms state updates
4. **Accessibility**: WCAG 2.1 AA compliance for color contrast and touch targets
5. **Performance**: Lighthouse score >90, smooth 60fps animations
6. **Frictionless Onboarding**: Tutorial with AI opponent, no SOL required initially

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  (React Native Components + Framer Motion Animations)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   State Management                       │
│     (React Context + Custom Hooks + Local Storage)      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic                         │
│  (Game Logic + Stats Tracking + Achievement System)     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Blockchain Layer                        │
│        (Solana Web3.js + Anchor + Smart Contract)       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → Component event handler
2. **Component** → Custom hook (business logic)
3. **Hook** → Context state update + blockchain transaction
4. **Context** → Re-render affected components
5. **Component** → Framer Motion animation
6. **Blockchain** → WebSocket event → Context update

### Technology Stack

- **Frontend**: React Native 0.76.5 + Expo 52
- **Web**: React 18 + Vite + Framer Motion
- **Wallet**: Solana Mobile Wallet Adapter + Wallet Adapter React
- **Blockchain**: Solana Web3.js 1.95.8 + Anchor 0.32.1
- **State**: React Context API + AsyncStorage
- **Animations**: Framer Motion (web) + React Native Animated (mobile)
- **Icons**: Custom SVG components (replacing emojis)
- **Testing**: Jest + React Testing Library + Property-based testing

## Components and Interfaces

### 1. Landing Page System

**Purpose**: Convert visitors to players through clear value proposition and social proof.

**Components**:

```typescript
// LandingPage.tsx
interface LandingPageProps {
  onGetStarted: () => void;
}

interface ValueProposition {
  headline: string;
  subheadline: string;
  features: Feature[];
  socialProof: SocialProof;
}

interface Feature {
  icon: SVGComponent;
  title: string;
  description: string;
}

interface SocialProof {
  activePlayers: number;
  totalGamesPlayed: number;
  recentWins: RecentWin[];
}

interface RecentWin {
  playerAddress: string; // Truncated
  amount: number;
  timestamp: Date;
}
```

**Layout Structure**:
- Hero section: Value prop + CTA (viewport 1)
- Features section: 3-column grid (desktop), stacked (mobile)
- Social proof: Live stats + recent wins ticker
- Final CTA: Sticky bottom bar on mobile

**Performance Requirements**:
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.0s
- Cumulative Layout Shift: <0.1

### 2. Onboarding Flow System

**Purpose**: Guide new users from wallet connection through first game with minimal friction.

**State Machine**:

```typescript
type OnboardingState = 
  | 'wallet_prompt'
  | 'wallet_connecting'
  | 'wallet_connected'
  | 'tutorial_intro'
  | 'tutorial_active'
  | 'tutorial_complete'
  | 'first_game_prompt'
  | 'onboarding_complete';

interface OnboardingContext {
  state: OnboardingState;
  progress: number; // 0-100
  completedSteps: OnboardingStep[];
  canSkip: boolean;
  skipConfirmation: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  skipped: boolean;
}
```

**Persistence**:
```typescript
interface OnboardingProgress {
  userId: string; // Wallet address
  currentState: OnboardingState;
  completedSteps: string[];
  tutorialCompleted: boolean;
  firstGameCompleted: boolean;
  lastUpdated: Date;
}
```

### 3. Tutorial System

**Purpose**: Teach game mechanics through interactive simulation with AI opponent.

**Architecture**:

```typescript
interface TutorialSystem {
  steps: TutorialStep[];
  currentStep: number;
  aiOpponent: AIOpponent;
  simulatedGame: SimulatedGame;
}

interface TutorialStep {
  id: string;
  type: 'explanation' | 'interaction' | 'observation';
  title: string;
  description: string;
  highlightElements: string[]; // CSS selectors
  requiredAction?: UserAction;
  aiAction?: AIAction;
  validation: () => boolean;
}

interface AIOpponent {
  name: string;
  avatar: SVGComponent;
  personality: 'cautious' | 'aggressive' | 'balanced';
  makeDecision: (gameState: GameState) => Decision;
}

interface SimulatedGame {
  state: GameState;
  isSimulated: true;
  usesRealSOL: false;
  players: [Player, AIOpponent];
}

type UserAction = 
  | { type: 'click'; target: string }
  | { type: 'input'; target: string; value: any }
  | { type: 'wait'; duration: number };

type AIAction = {
  type: 'join' | 'shoot' | 'pass' | 'leave';
  delay: number; // ms
  explanation: string; // Shown to user
};
```

**Tutorial Flow**:
1. Welcome + game concept explanation
2. UI walkthrough (highlight key elements)
3. Simulated game: User joins
4. Simulated game: User's turn (guided)
5. Simulated game: AI's turn (explained)
6. Simulated game: Complete round
7. Results explanation + stats intro
8. Transition to real game prompt

### 4. Leaderboard System

**Purpose**: Display competitive rankings and drive engagement through social comparison.

**Data Model**:

```typescript
interface LeaderboardEntry {
  rank: number;
  playerAddress: string;
  displayName: string;
  avatar?: string;
  stats: PlayerStats;
  trend: 'up' | 'down' | 'stable';
  trendChange: number;
}

interface PlayerStats {
  totalWins: number;
  totalGames: number;
  winRate: number;
  totalSOLWon: number;
  totalSOLWagered: number;
  biggestWin: number;
  currentStreak: number;
  longestStreak: number;
}

interface LeaderboardConfig {
  metric: 'wins' | 'winRate' | 'totalSOL' | 'streak';
  timeframe: 'daily' | 'weekly' | 'allTime';
  limit: number;
}
```

**Ranking Algorithm**:
```typescript
function calculateRank(
  metric: LeaderboardConfig['metric'],
  stats: PlayerStats
): number {
  switch (metric) {
    case 'wins':
      return stats.totalWins;
    case 'winRate':
      // Minimum 10 games to qualify
      return stats.totalGames >= 10 ? stats.winRate : 0;
    case 'totalSOL':
      return stats.totalSOLWon;
    case 'streak':
      return stats.currentStreak;
  }
}
```

**UI Components**:
- LeaderboardHeader: Metric selector + timeframe tabs
- LeaderboardList: Virtualized list (react-window)
- LeaderboardEntry: Rank badge + player info + stats
- CurrentPlayerHighlight: Sticky position indicator
- LeaderboardEmpty: Encouragement to play

### 5. Stats Tracking System

**Purpose**: Record and display comprehensive player performance data.

**Storage Strategy**:

```typescript
interface StatsStorage {
  // On-chain (source of truth)
  blockchain: {
    totalGames: number;
    totalWins: number;
    totalSOLWagered: number;
    totalSOLWon: number;
  };
  
  // Off-chain (derived + cached)
  localStorage: {
    gameHistory: GameRecord[];
    achievements: Achievement[];
    dailyChallenges: DailyChallenge[];
    streakData: StreakData;
    lastSync: Date;
  };
}

interface GameRecord {
  gameId: string;
  timestamp: Date;
  players: string[];
  wager: number;
  result: 'win' | 'loss';
  position: number;
  rounds: number;
  duration: number;
}

interface StreakData {
  current: number;
  longest: number;
  lastPlayDate: Date;
  milestones: StreakMilestone[];
}

interface StreakMilestone {
  days: number;
  reached: boolean;
  reachedDate?: Date;
  reward?: Reward;
}
```

**Sync Strategy**:
1. On app launch: Fetch blockchain data
2. On game complete: Update both stores
3. On stats view: Show cached + fetch latest
4. Conflict resolution: Blockchain wins

### 6. Daily Challenge System

**Purpose**: Provide time-limited objectives to drive daily engagement.

**Challenge Types**:

```typescript
interface DailyChallenge {
  id: string;
  date: Date;
  type: ChallengeType;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: Reward;
  expiresAt: Date;
  completed: boolean;
}

type ChallengeType =
  | { type: 'win_games'; count: number }
  | { type: 'play_games'; count: number }
  | { type: 'win_streak'; count: number }
  | { type: 'wager_amount'; amount: number }
  | { type: 'win_position'; position: number; count: number }
  | { type: 'play_timeframe'; startHour: number; endHour: number };

interface Reward {
  type: 'xp' | 'achievement' | 'cosmetic' | 'badge';
  value: number | string;
  displayName: string;
  icon: SVGComponent;
}
```

**Generation Algorithm**:
```typescript
function generateDailyChallenges(
  playerStats: PlayerStats,
  date: Date
): DailyChallenge[] {
  // Seed RNG with date for consistency
  const seed = date.toISOString().split('T')[0];
  const rng = seededRandom(seed);
  
  // Generate 3 challenges of varying difficulty
  return [
    generateEasyChallenge(rng, playerStats),
    generateMediumChallenge(rng, playerStats),
    generateHardChallenge(rng, playerStats),
  ];
}

function generateEasyChallenge(
  rng: SeededRandom,
  stats: PlayerStats
): DailyChallenge {
  // Easy: Play 1-3 games
  const count = rng.range(1, 3);
  return {
    type: { type: 'play_games', count },
    target: count,
    reward: { type: 'xp', value: 100 * count },
  };
}
```

### 7. Achievement System

**Purpose**: Recognize milestones and provide long-term progression goals.

**Achievement Categories**:

```typescript
interface Achievement {
  id: string;
  category: AchievementCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  description: string;
  icon: SVGComponent;
  unlocked: boolean;
  unlockedDate?: Date;
  progress: number;
  requirement: number;
  hidden: boolean; // Secret achievements
}

type AchievementCategory =
  | 'first_steps'    // Tutorial, first game, etc.
  | 'wins'           // Win milestones
  | 'games_played'   // Participation milestones
  | 'streaks'        // Consecutive day milestones
  | 'high_roller'    // Large wager milestones
  | 'lucky'          // Specific game outcomes
  | 'social'         // Sharing, friends, etc.
  | 'special';       // Limited time, secret
```

**Predefined Achievements**:

```typescript
const ACHIEVEMENTS: Achievement[] = [
  // First Steps
  {
    id: 'first_connection',
    category: 'first_steps',
    tier: 'bronze',
    title: 'Connected',
    description: 'Connect your first wallet',
    requirement: 1,
  },
  {
    id: 'tutorial_complete',
    category: 'first_steps',
    tier: 'bronze',
    title: 'Trained',
    description: 'Complete the tutorial',
    requirement: 1,
  },
  {
    id: 'first_game',
    category: 'first_steps',
    tier: 'bronze',
    title: 'Initiate',
    description: 'Play your first real game',
    requirement: 1,
  },
  {
    id: 'first_win',
    category: 'first_steps',
    tier: 'silver',
    title: 'Victor',
    description: 'Win your first game',
    requirement: 1,
  },
  
  // Wins
  {
    id: 'win_10',
    category: 'wins',
    tier: 'bronze',
    title: 'Sharpshooter',
    description: 'Win 10 games',
    requirement: 10,
  },
  {
    id: 'win_50',
    category: 'wins',
    tier: 'silver',
    title: 'Gunslinger',
    description: 'Win 50 games',
    requirement: 50,
  },
  {
    id: 'win_100',
    category: 'wins',
    tier: 'gold',
    title: 'Legend',
    description: 'Win 100 games',
    requirement: 100,
  },
  
  // Streaks
  {
    id: 'streak_7',
    category: 'streaks',
    tier: 'silver',
    title: 'Dedicated',
    description: 'Play 7 days in a row',
    requirement: 7,
  },
  {
    id: 'streak_30',
    category: 'streaks',
    tier: 'gold',
    title: 'Committed',
    description: 'Play 30 days in a row',
    requirement: 30,
  },
  {
    id: 'streak_100',
    category: 'streaks',
    tier: 'platinum',
    title: 'Unstoppable',
    description: 'Play 100 days in a row',
    requirement: 100,
  },
];
```

### 8. UI Polish System

**Purpose**: Replace emojis with themed SVG icons and add smooth animations.

**Icon System**:

```typescript
interface IconProps {
  size?: number;
  color?: string;
  variant?: 'outline' | 'filled';
  className?: string;
}

// Wild West themed icons
const Icons = {
  Revolver: (props: IconProps) => SVGComponent,
  Sheriff: (props: IconProps) => SVGComponent,
  Target: (props: IconProps) => SVGComponent,
  Coin: (props: IconProps) => SVGComponent,
  Trophy: (props: IconProps) => SVGComponent,
  Star: (props: IconProps) => SVGComponent,
  Fire: (props: IconProps) => SVGComponent,
  Lightning: (props: IconProps) => SVGComponent,
  // ... more icons
};
```

**Animation Patterns**:

```typescript
// Framer Motion variants for web
const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  celebration: {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: [0, 1.2, 1],
      rotate: [0, 10, -10, 0],
    },
    transition: { 
      duration: 0.6,
      times: [0, 0.6, 1],
      ease: 'easeOut',
    },
  },
};

// React Native Animated for mobile
const mobileAnimations = {
  fadeIn: (animatedValue: Animated.Value) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  },
  
  slideUp: (animatedValue: Animated.Value) => {
    Animated.spring(animatedValue, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  },
};
```

**Touch Feedback**:

```typescript
interface TouchableProps {
  onPress: () => void;
  haptic?: 'light' | 'medium' | 'heavy';
  scaleOnPress?: boolean;
  children: React.ReactNode;
}

// Minimum touch target: 44x44px
const MINIMUM_TOUCH_TARGET = 44;

function Touchable({ 
  onPress, 
  haptic = 'light',
  scaleOnPress = true,
  children 
}: TouchableProps) {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    if (scaleOnPress) {
      scale.value = withSpring(0.95);
    }
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle[haptic]);
    }
  };
  
  const handlePressOut = () => {
    if (scaleOnPress) {
      scale.value = withSpring(1);
    }
  };
  
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ minWidth: MINIMUM_TOUCH_TARGET, minHeight: MINIMUM_TOUCH_TARGET }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

### 9. Social Features System

**Purpose**: Enable sharing and community building.

**Share System**:

```typescript
interface ShareContent {
  type: 'win' | 'achievement' | 'streak' | 'leaderboard';
  data: any;
  template: ShareTemplate;
}

interface ShareTemplate {
  text: string;
  image?: string; // Generated image URL
  url: string;
  hashtags: string[];
}

function generateShareContent(
  type: ShareContent['type'],
  data: any
): ShareTemplate {
  switch (type) {
    case 'win':
      return {
        text: `Just won ${data.amount} SOL in Magic Roulette! 🎰`,
        url: 'https://magicroulette.io',
        hashtags: ['MagicRoulette', 'Solana', 'GameFi'],
      };
    
    case 'achievement':
      return {
        text: `Unlocked "${data.title}" achievement in Magic Roulette!`,
        image: generateAchievementImage(data),
        url: 'https://magicroulette.io',
        hashtags: ['MagicRoulette', 'Achievement'],
      };
    
    case 'streak':
      return {
        text: `${data.days} day streak in Magic Roulette! 🔥`,
        url: 'https://magicroulette.io',
        hashtags: ['MagicRoulette', 'Streak'],
      };
  }
}
```

**Activity Feed**:

```typescript
interface ActivityFeedItem {
  id: string;
  type: 'win' | 'achievement' | 'milestone';
  playerAddress: string;
  displayName: string;
  timestamp: Date;
  data: any;
}

interface ActivityFeed {
  items: ActivityFeedItem[];
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

// Real-time updates via WebSocket
function useActivityFeed(): ActivityFeed {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const ws = useWebSocket();
  
  useEffect(() => {
    ws.on('activity', (item: ActivityFeedItem) => {
      setItems(prev => [item, ...prev].slice(0, 50));
    });
  }, [ws]);
  
  return { items, hasMore: true, loadMore };
}
```

## Data Models

### User Profile

```typescript
interface UserProfile {
  // Identity
  walletAddress: string;
  displayName: string;
  avatar?: string;
  
  // Onboarding
  onboardingComplete: boolean;
  tutorialComplete: boolean;
  firstGameComplete: boolean;
  
  // Stats (synced from blockchain)
  stats: PlayerStats;
  
  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  
  // Engagement
  streak: StreakData;
  dailyChallenges: DailyChallenge[];
  lastActive: Date;
  
  // Preferences
  settings: UserSettings;
}

interface UserSettings {
  notifications: boolean;
  sound: boolean;
  haptics: boolean;
  theme: 'dark' | 'light';
  language: string;
}
```

### Game State (Extended)

```typescript
interface ExtendedGameState {
  // Existing game state from smart contract
  gameId: string;
  players: Player[];
  currentPlayer: number;
  chamberPosition: number;
  wager: number;
  status: GameStatus;
  
  // UI enhancements
  isSimulated: boolean;
  tutorialStep?: number;
  aiOpponent?: AIOpponent;
  
  // Analytics
  startTime: Date;
  endTime?: Date;
  rounds: number;
  actions: GameAction[];
}

interface GameAction {
  playerId: string;
  action: 'join' | 'shoot' | 'pass' | 'leave';
  timestamp: Date;
  chamberPosition: number;
  result?: 'safe' | 'eliminated';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Responsive Layout Adaptation

*For any* viewport width between 320px and 2560px, the application SHALL render with appropriate layouts and all interactive elements SHALL maintain minimum 44x44px touch targets.

**Validates: Requirements 1.5, 12.1, 12.2**

### Property 2: Wallet Connection State Transitions

*For any* wallet connection attempt, if the connection succeeds, the system SHALL transition to the tutorial phase; if it fails, the system SHALL display an error message and remain in the connection state.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 3: Tutorial Progression

*For any* tutorial step completion, the system SHALL advance to the next step and provide positive feedback, and when all steps are completed or skipped, the system SHALL transition to the game lobby.

**Validates: Requirements 3.1, 3.4, 3.6**

### Property 4: Tutorial Simulation Isolation

*For any* tutorial game session, the game SHALL be marked as simulated and SHALL NOT execute real blockchain transactions or deduct real SOL.

**Validates: Requirements 3.3**

### Property 5: Tutorial UI Highlighting

*For any* active tutorial step, the system SHALL highlight the relevant UI elements specified in that step's configuration.

**Validates: Requirements 3.2**

### Property 6: First Game Experience Idempotence

*For any* user who has completed their first game, the first game experience prompts and hints SHALL NOT be shown again in subsequent sessions.

**Validates: Requirements 4.3, 4.4**

### Property 7: Leaderboard Ranking Consistency

*For any* leaderboard metric and timeframe, players SHALL be ranked in descending order by that metric, and the displayed rank SHALL match their position in the sorted list.

**Validates: Requirements 5.1**

### Property 8: Leaderboard Current Player Highlighting

*For any* user viewing the leaderboard, if they are ranked, their entry SHALL be visually highlighted and distinguishable from other entries.

**Validates: Requirements 5.3**

### Property 9: Leaderboard Real-Time Updates

*For any* game completion, the leaderboard rankings SHALL update to reflect the new statistics within the current session.

**Validates: Requirements 5.4**

### Property 10: Leaderboard Category Switching

*For any* leaderboard category switch (daily/weekly/all-time), the displayed rankings SHALL change to reflect the selected timeframe's data.

**Validates: Requirements 5.5**

### Property 11: Stats Persistence After Game

*For any* completed game, the player's statistics (wins, losses, games played, SOL wagered) SHALL be updated and persisted to both blockchain and local storage.

**Validates: Requirements 6.1, 6.4**

### Property 12: Stats Calculation Correctness

*For any* player statistics, derived metrics (win rate, average wager, biggest win) SHALL be calculated correctly from the base statistics.

**Validates: Requirements 6.3**

### Property 13: Stats Cross-Session Persistence

*For any* user session, statistics SHALL be retrievable from storage and SHALL match the values from the previous session plus any new game outcomes.

**Validates: Requirements 6.5**

### Property 14: Daily Challenge Time-Based Generation

*For any* 24-hour period, the system SHALL generate new daily challenges at the designated time and SHALL NOT generate challenges more frequently than once per 24 hours.

**Validates: Requirements 7.1, 7.5**

### Property 15: Daily Challenge Variety

*For any* set of generated daily challenges, the challenges SHALL include different objective types (win games, play games, wager amount, etc.).

**Validates: Requirements 7.3**

### Property 16: Daily Challenge Reward Distribution

*For any* completed daily challenge, the system SHALL award the specified reward to the player and persist the reward to their profile.

**Validates: Requirements 7.4**

### Property 17: XP and Level Progression

*For any* gameplay action that grants XP, the player's XP SHALL increase, and when XP reaches the threshold, the player SHALL level up and a notification SHALL be displayed.

**Validates: Requirements 8.1, 8.2**

### Property 18: Achievement Unlock Persistence

*For any* achievement unlock, the system SHALL display a celebration animation, mark the achievement as unlocked, record the unlock timestamp, and persist this state permanently.

**Validates: Requirements 8.4**

### Property 19: Streak Increment on Consecutive Play

*For any* player who plays at least one game on consecutive calendar days, their streak counter SHALL increment by one for each consecutive day.

**Validates: Requirements 9.1, 9.2**

### Property 20: Streak Reset on Missed Day

*For any* player who does not play a game for an entire calendar day, their current streak SHALL reset to zero while their longest streak SHALL remain unchanged.

**Validates: Requirements 9.4**

### Property 21: Streak Milestone Rewards

*For any* player reaching a streak milestone (7, 30, or 100 days), the system SHALL award the associated achievement or reward.

**Validates: Requirements 9.5**

### Property 22: State Change Animations

*For any* significant state change (game start, win, loss, level up, achievement unlock), the system SHALL trigger and display the appropriate transition animation.

**Validates: Requirements 10.3**

### Property 23: Responsive Design Orientation Handling

*For any* device orientation change (portrait to landscape or vice versa), the layout SHALL adjust appropriately within one render cycle.

**Validates: Requirements 12.3**

### Property 24: Loading State Indicators

*For any* asynchronous operation (data fetch, transaction submission), the system SHALL display a loading indicator (skeleton screen or spinner) until the operation completes.

**Validates: Requirements 10.6**

### Property 25: Share Content Generation

*For any* shareable event (win, achievement, streak milestone), the system SHALL generate appropriate share content including text, hashtags, and URL.

**Validates: Requirements 11.2**

### Property 26: Social Feature Conditional Availability

*For any* platform that supports friend features, the system SHALL enable friend adding and activity viewing; for platforms without support, these features SHALL be hidden.

**Validates: Requirements 11.3**

### Property 27: Milestone Share Prompts

*For any* notable milestone achievement, the system SHALL offer the player an option to share the achievement.

**Validates: Requirements 11.4**

### Property 28: Performance - Screen Transitions

*For any* navigation between screens, the transition SHALL complete within 300ms.

**Validates: Requirements 13.2**

### Property 29: Performance - Stats Loading

*For any* stats view request, the statistics SHALL load and display within 1 second.

**Validates: Requirements 13.3**

### Property 30: Performance - Leaderboard Rendering

*For any* leaderboard view request, the initial data SHALL render within 2 seconds.

**Validates: Requirements 13.4**

### Property 31: Performance - Immediate Feedback

*For any* user action (button press, input change), visual feedback SHALL be provided within 100ms.

**Validates: Requirements 13.5**

### Property 32: Onboarding Progress Persistence

*For any* onboarding step completion, the completion status SHALL be recorded to persistent storage and SHALL be retrievable in subsequent sessions.

**Validates: Requirements 14.1, 14.3**

### Property 33: Onboarding Resume from Last Step

*For any* user returning with partial onboarding completion, the system SHALL resume from the first incomplete step rather than restarting from the beginning.

**Validates: Requirements 14.2**

### Property 34: Onboarding Completion State

*For any* user who completes all onboarding steps, the system SHALL mark them as fully onboarded and SHALL unlock all features.

**Validates: Requirements 14.4**

### Property 35: Onboarding Analytics Tracking

*For any* onboarding step transition, the system SHALL emit an analytics event with the step identifier and completion status.

**Validates: Requirements 14.5**

## Error Handling

### Error Categories

1. **Network Errors**: RPC failures, WebSocket disconnections, timeout errors
2. **Wallet Errors**: Connection failures, transaction rejections, insufficient funds
3. **Blockchain Errors**: Transaction failures, account not found, invalid state
4. **Storage Errors**: LocalStorage quota exceeded, read/write failures
5. **Validation Errors**: Invalid input, constraint violations
6. **System Errors**: Unexpected exceptions, state corruption

### Error Handling Strategy

```typescript
interface ErrorHandler {
  category: ErrorCategory;
  severity: 'critical' | 'error' | 'warning' | 'info';
  userMessage: string;
  technicalMessage: string;
  recovery: RecoveryStrategy;
  analytics: boolean;
}

type RecoveryStrategy =
  | { type: 'retry'; maxAttempts: number; backoff: 'linear' | 'exponential' }
  | { type: 'fallback'; fallbackAction: () => void }
  | { type: 'ignore' }
  | { type: 'fatal'; redirectTo: string };

// Example error handlers
const ERROR_HANDLERS: Record<string, ErrorHandler> = {
  WALLET_CONNECTION_FAILED: {
    category: 'wallet',
    severity: 'error',
    userMessage: 'Failed to connect wallet. Please try again.',
    technicalMessage: 'Wallet adapter connection rejected',
    recovery: { type: 'retry', maxAttempts: 3, backoff: 'linear' },
    analytics: true,
  },
  
  TRANSACTION_FAILED: {
    category: 'blockchain',
    severity: 'error',
    userMessage: 'Transaction failed. Please check your balance and try again.',
    technicalMessage: 'Transaction simulation failed',
    recovery: { type: 'fallback', fallbackAction: () => showTransactionHelp() },
    analytics: true,
  },
  
  STATS_LOAD_FAILED: {
    category: 'network',
    severity: 'warning',
    userMessage: 'Unable to load latest stats. Showing cached data.',
    technicalMessage: 'RPC request timeout',
    recovery: { type: 'fallback', fallbackAction: () => loadCachedStats() },
    analytics: true,
  },
  
  STORAGE_QUOTA_EXCEEDED: {
    category: 'storage',
    severity: 'warning',
    userMessage: 'Storage limit reached. Some data may not be saved.',
    technicalMessage: 'LocalStorage quota exceeded',
    recovery: { type: 'fallback', fallbackAction: () => clearOldData() },
    analytics: true,
  },
};
```

### Error UI Components

```typescript
interface ErrorBoundaryProps {
  fallback: (error: Error, reset: () => void) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

// Global error boundary for critical errors
function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <ErrorScreen
          title="Something went wrong"
          message="We're sorry, but something unexpected happened."
          action={{ label: 'Restart App', onPress: reset }}
        />
      )}
      onError={(error, errorInfo) => {
        logError(error, errorInfo);
        trackAnalytics('app_error', { error: error.message });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Inline error display for non-critical errors
function InlineError({ 
  message, 
  retry, 
  dismiss 
}: { 
  message: string; 
  retry?: () => void; 
  dismiss?: () => void;
}) {
  return (
    <View style={styles.errorContainer}>
      <Icon name="alert" color="error" />
      <Text style={styles.errorText}>{message}</Text>
      <View style={styles.errorActions}>
        {retry && (
          <Button onPress={retry} variant="outline">
            Retry
          </Button>
        )}
        {dismiss && (
          <Button onPress={dismiss} variant="text">
            Dismiss
          </Button>
        )}
      </View>
    </View>
  );
}
```

### Retry Logic

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts: number;
    backoff: 'linear' | 'exponential';
    baseDelay: number;
  }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < options.maxAttempts) {
        const delay = options.backoff === 'exponential'
          ? options.baseDelay * Math.pow(2, attempt - 1)
          : options.baseDelay * attempt;
        
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

// Usage
const stats = await withRetry(
  () => fetchPlayerStats(walletAddress),
  { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 }
);
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing Configuration

We will use **fast-check** for TypeScript/JavaScript property-based testing. Each property test will:

- Run a minimum of 100 iterations
- Reference its design document property via comment tag
- Use the format: `// Feature: user-journey-optimization, Property {number}: {property_text}`

### Test Organization

```
tests/
├── unit/
│   ├── components/
│   │   ├── LandingPage.test.tsx
│   │   ├── OnboardingFlow.test.tsx
│   │   ├── TutorialSystem.test.tsx
│   │   ├── Leaderboard.test.tsx
│   │   └── StatsTracker.test.tsx
│   ├── hooks/
│   │   ├── useOnboarding.test.ts
│   │   ├── useStats.test.ts
│   │   ├── useDailyChallenges.test.ts
│   │   └── useAchievements.test.ts
│   └── services/
│       ├── statsService.test.ts
│       ├── achievementService.test.ts
│       └── shareService.test.ts
├── property/
│   ├── onboarding.property.test.ts
│   ├── stats.property.test.ts
│   ├── leaderboard.property.test.ts
│   ├── challenges.property.test.ts
│   ├── achievements.property.test.ts
│   └── responsive.property.test.ts
└── integration/
    ├── onboarding-flow.integration.test.tsx
    ├── first-game-experience.integration.test.tsx
    └── stats-sync.integration.test.tsx
```

### Unit Test Examples

```typescript
// Unit test for specific example
describe('LandingPage', () => {
  it('should display value proposition in first viewport', () => {
    const { getByText } = render(<LandingPage />);
    expect(getByText(/Magic Roulette/i)).toBeVisible();
    expect(getByText(/High-Stakes GameFi/i)).toBeVisible();
  });
  
  it('should show wallet options when connecting', () => {
    const { getByText, getByRole } = render(<OnboardingFlow />);
    fireEvent.press(getByRole('button', { name: /connect wallet/i }));
    expect(getByText(/Phantom/i)).toBeVisible();
    expect(getByText(/Solflare/i)).toBeVisible();
  });
});

// Unit test for edge case
describe('StatsTracker', () => {
  it('should handle zero games played', () => {
    const stats = calculateDerivedStats({ 
      totalGames: 0, 
      totalWins: 0,
      totalSOLWagered: 0,
      totalSOLWon: 0,
    });
    
    expect(stats.winRate).toBe(0);
    expect(stats.averageWager).toBe(0);
  });
  
  it('should handle storage quota exceeded', async () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    
    const result = await saveStats(mockStats);
    expect(result.success).toBe(false);
    expect(result.fallbackUsed).toBe(true);
  });
});
```

### Property-Based Test Examples

```typescript
import fc from 'fast-check';

// Feature: user-journey-optimization, Property 12: Stats Calculation Correctness
describe('Stats Calculation Properties', () => {
  it('should calculate win rate correctly for any valid stats', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalGames: fc.nat(1000),
          totalWins: fc.nat(1000),
        }).filter(s => s.totalWins <= s.totalGames),
        (stats) => {
          const derived = calculateDerivedStats(stats);
          const expectedWinRate = stats.totalGames > 0 
            ? (stats.totalWins / stats.totalGames) * 100 
            : 0;
          
          expect(derived.winRate).toBeCloseTo(expectedWinRate, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: user-journey-optimization, Property 19: Streak Increment on Consecutive Play
  it('should increment streak for consecutive daily play', () => {
    fc.assert(
      fc.property(
        fc.array(fc.date(), { minLength: 2, maxLength: 100 }),
        (dates) => {
          const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
          const consecutiveDates = makeConsecutive(sortedDates);
          
          let streak = 0;
          for (const date of consecutiveDates) {
            streak = updateStreak(streak, date);
          }
          
          expect(streak).toBe(consecutiveDates.length);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: user-journey-optimization, Property 20: Streak Reset on Missed Day
  it('should reset streak when a day is missed', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialStreak: fc.nat(100),
          lastPlayDate: fc.date(),
          currentDate: fc.date(),
        }).filter(d => 
          daysBetween(d.lastPlayDate, d.currentDate) > 1
        ),
        (data) => {
          const newStreak = calculateStreak(
            data.initialStreak,
            data.lastPlayDate,
            data.currentDate
          );
          
          expect(newStreak).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: user-journey-optimization, Property 7: Leaderboard Ranking Consistency
  it('should rank players consistently by metric', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            address: fc.hexaString({ minLength: 32, maxLength: 32 }),
            totalWins: fc.nat(1000),
            winRate: fc.float({ min: 0, max: 100 }),
            totalSOLWon: fc.float({ min: 0, max: 10000 }),
          }),
          { minLength: 10, maxLength: 100 }
        ),
        fc.constantFrom('wins', 'winRate', 'totalSOL'),
        (players, metric) => {
          const leaderboard = generateLeaderboard(players, { metric, timeframe: 'allTime', limit: 100 });
          
          // Check that ranks are sequential
          leaderboard.forEach((entry, index) => {
            expect(entry.rank).toBe(index + 1);
          });
          
          // Check that players are sorted by metric
          for (let i = 1; i < leaderboard.length; i++) {
            const prev = leaderboard[i - 1];
            const curr = leaderboard[i];
            const prevValue = getMetricValue(prev.stats, metric);
            const currValue = getMetricValue(curr.stats, metric);
            expect(prevValue).toBeGreaterThanOrEqual(currValue);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: user-journey-optimization, Property 1: Responsive Layout Adaptation
  it('should maintain minimum touch targets at any viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          const { getAllByRole } = render(
            <ResponsiveContainer width={viewportWidth}>
              <GameLobby />
            </ResponsiveContainer>
          );
          
          const buttons = getAllByRole('button');
          buttons.forEach(button => {
            const { width, height } = button.getBoundingClientRect();
            expect(width).toBeGreaterThanOrEqual(44);
            expect(height).toBeGreaterThanOrEqual(44);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Test Examples

```typescript
describe('Onboarding Flow Integration', () => {
  it('should complete full onboarding flow', async () => {
    const { getByRole, getByText } = render(<App />);
    
    // Landing page
    expect(getByText(/Magic Roulette/i)).toBeVisible();
    
    // Connect wallet
    fireEvent.press(getByRole('button', { name: /get started/i }));
    fireEvent.press(getByText(/Phantom/i));
    await waitFor(() => expect(mockWallet.connect).toHaveBeenCalled());
    
    // Tutorial
    await waitFor(() => expect(getByText(/Tutorial/i)).toBeVisible());
    fireEvent.press(getByRole('button', { name: /next/i }));
    // ... complete tutorial steps
    
    // First game prompt
    await waitFor(() => expect(getByText(/Ready for your first game/i)).toBeVisible());
    fireEvent.press(getByRole('button', { name: /join game/i }));
    
    // Verify onboarding complete
    const profile = await loadUserProfile();
    expect(profile.onboardingComplete).toBe(true);
    expect(profile.tutorialComplete).toBe(true);
  });
});
```

### Performance Testing

```typescript
describe('Performance Requirements', () => {
  it('should complete screen transitions within 300ms', async () => {
    const startTime = performance.now();
    
    const { getByRole } = render(<App />);
    fireEvent.press(getByRole('button', { name: /leaderboard/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Leaderboard/i)).toBeVisible();
    });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(300);
  });
  
  it('should provide visual feedback within 100ms', () => {
    const { getByRole } = render(<GameLobby />);
    const button = getByRole('button', { name: /join/i });
    
    const startTime = performance.now();
    fireEvent.pressIn(button);
    
    // Check for visual feedback (scale animation, opacity change, etc.)
    const styles = window.getComputedStyle(button);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
    expect(styles.transform).not.toBe('none');
  });
});
```

### Test Coverage Goals

- Unit test coverage: >80% for business logic
- Property test coverage: All correctness properties implemented
- Integration test coverage: All critical user flows
- E2E test coverage: Complete onboarding + first game flow

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every PR
- Run integration tests before deployment
- Run E2E tests on staging environment
- Monitor test execution time (target: <5 minutes for full suite)
