# Deep Linking Quick Start

**Task 9.3: Implement deep linking**  
**Requirements: 5.7**

Quick reference for using deep linking in Magic Roulette mobile app.

## Quick Links

### Custom Scheme (magicroulette://)

```
magicroulette://game/12345          → Open specific game
magicroulette://invite/abc123       → Join game via invite
magicroulette://mode/1v1            → Create 1v1 game
magicroulette://mode/2v2            → Create 2v2 game
magicroulette://lobby               → Browse games
magicroulette://create              → Create new game
```

### Universal Links (https://magicroulette.com/play/*)

```
https://magicroulette.com/play/game/12345
https://magicroulette.com/play/invite/abc123
https://magicroulette.com/play/mode/1v1
https://magicroulette.com/play/lobby
https://magicroulette.com/play/create
```

## Usage in Code

### Generate Deep Links

```typescript
import { generateDeepLink, generateUniversalLink } from './src/hooks/useDeepLinking';

// Custom scheme
const gameLink = generateDeepLink('game', { gameId: '12345' });
// Result: magicroulette://game/12345

// Universal link (for sharing)
const shareLink = generateUniversalLink('invite', { inviteCode: 'abc123' });
// Result: https://magicroulette.com/play/invite/abc123
```

### Share Game Invite

```typescript
import { Share } from 'react-native';
import { generateUniversalLink } from './src/hooks/useDeepLinking';

const shareGameInvite = async (inviteCode: string) => {
  const link = generateUniversalLink('invite', { inviteCode });
  
  await Share.share({
    message: `Join my Magic Roulette game! ${link}`,
    url: link,
  });
};
```

### Navigate Programmatically

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to specific game
navigation.navigate('GamePlay', { gameId: '12345' });

// Navigate to lobby with invite
navigation.navigate('GameLobby', { inviteCode: 'abc123' });

// Navigate to create game with mode
navigation.navigate('CreateGame', { gameMode: '1v1' });
```

## Testing

### iOS Simulator

```bash
xcrun simctl openurl booted "magicroulette://game/12345"
```

### Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "magicroulette://game/12345" com.magicroulette.app
```

### Validation Script

```bash
node scripts/validate-deep-linking.js
```

## Common Use Cases

### 1. Game Invite Flow

```typescript
// Player A creates game and gets invite code
const inviteCode = await createGame({ mode: '1v1', entryFee: 0.1 });

// Generate shareable link
const inviteLink = generateUniversalLink('invite', { inviteCode });

// Share via any method
await Share.share({ message: `Join my game! ${inviteLink}` });

// Player B clicks link → App opens → GameLobbyScreen with inviteCode
```

### 2. dApp Store Launch

```typescript
// User clicks "Play 1v1" in dApp Store
// Deep link: magicroulette://mode/1v1
// App opens → CreateGameScreen with mode='1v1' pre-selected
```

### 3. Direct Game Access

```typescript
// User receives notification about active game
// Deep link: magicroulette://game/12345
// App opens → GamePlayScreen with gameId='12345'
```

## Route Parameters

| Route Type | Parameter | Format | Example |
|------------|-----------|--------|---------|
| `game` | `gameId` | Numeric string | `12345` |
| `invite` | `inviteCode` | Alphanumeric | `abc123` |
| `mode` | `gameMode` | `1v1`, `2v2`, `practice` | `1v1` |
| `lobby` | None | - | - |
| `create` | None | - | - |

## Error Handling

Deep linking automatically handles errors:

- **Invalid URL**: Navigates to home screen
- **Missing parameters**: Navigates to parent screen
- **Malformed links**: Logs error and shows home
- **Network issues**: Queues navigation until ready

## Best Practices

1. **Always use universal links for sharing** (better cross-platform support)
2. **Validate parameters before navigation** (already handled by hook)
3. **Log deep link events for analytics** (track user acquisition)
4. **Test on both iOS and Android** (behavior may differ)
5. **Provide fallback navigation** (always have a home route)

## Troubleshooting

### Deep link not opening app

1. Check app is installed
2. Verify scheme matches `app.json`
3. Rebuild app after config changes
4. Test with validation script

### Universal link opens browser instead

1. Verify association files are hosted
2. Check file is accessible (no auth required)
3. Test with Apple/Android validators
4. Ensure no redirects on association URLs

### Navigation not working

1. Check screen names match exactly
2. Verify `useDeepLinking` is inside `NavigationContainer`
3. Check console logs for errors
4. Ensure navigation stack is ready

## Support

Run validation script for detailed diagnostics:

```bash
node scripts/validate-deep-linking.js
```

Check `DEEP_LINKING_GUIDE.md` for comprehensive documentation.
