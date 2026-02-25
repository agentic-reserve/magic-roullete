# Deep Linking Implementation Guide

**Task 9.3: Implement deep linking**  
**Requirements: 5.7**

This guide documents the deep linking implementation for Magic Roulette mobile app, enabling seamless navigation from external sources like the Solana dApp Store, web browsers, and shared links.

## Overview

Deep linking allows users to open the Magic Roulette app directly to specific screens or content, bypassing the home screen. This is critical for:

- **dApp Store Integration**: Launch specific game modes from the store
- **Game Invites**: Share direct links to join games
- **Marketing Campaigns**: Direct users to specific features
- **User Experience**: Reduce friction in navigation

## Supported URL Schemes

### 1. Custom Scheme (magicroulette://)

Primary scheme for native app deep linking:

```
magicroulette://game/{gameId}
magicroulette://invite/{inviteCode}
magicroulette://mode/{gameMode}
magicroulette://lobby
magicroulette://create
```

### 2. Universal Links (https://magicroulette.com/play/*)

Web-compatible links that work across platforms:

```
https://magicroulette.com/play/game/{gameId}
https://magicroulette.com/play/invite/{inviteCode}
https://magicroulette.com/play/mode/{gameMode}
https://magicroulette.com/play/lobby
https://magicroulette.com/play/create
```

## Deep Link Routes

### Game Access
**Purpose**: Direct access to a specific game  
**Format**: `magicroulette://game/{gameId}`  
**Example**: `magicroulette://game/12345`  
**Navigation**: Opens GamePlayScreen with gameId parameter

### Game Invites
**Purpose**: Join a game via invite code  
**Format**: `magicroulette://invite/{inviteCode}`  
**Example**: `magicroulette://invite/abc123`  
**Navigation**: Opens GameLobbyScreen with inviteCode parameter

### Game Modes
**Purpose**: Create game with specific mode  
**Format**: `magicroulette://mode/{gameMode}`  
**Example**: `magicroulette://mode/1v1`  
**Valid Modes**: `1v1`, `2v2`, `practice`  
**Navigation**: Opens CreateGameScreen with gameMode pre-selected

### Lobby Navigation
**Purpose**: Browse available games  
**Format**: `magicroulette://lobby`  
**Navigation**: Opens GameLobbyScreen

### Create Game
**Purpose**: Start game creation flow  
**Format**: `magicroulette://create`  
**Navigation**: Opens CreateGameScreen

## Configuration

### app.json

Deep linking is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "magicroulette",
    "ios": {
      "bundleIdentifier": "com.magicroulette.app",
      "associatedDomains": [
        "applinks:magicroulette.com"
      ]
    },
    "android": {
      "package": "com.magicroulette.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "magicroulette.com",
              "pathPrefix": "/play"
            },
            {
              "scheme": "magicroulette"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### iOS Associated Domains

For universal links on iOS, add an `apple-app-site-association` file to your web server at:

```
https://magicroulette.com/.well-known/apple-app-site-association
```

Content:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.magicroulette.app",
        "paths": ["/play/*"]
      }
    ]
  }
}
```

### Android App Links

For universal links on Android, add an `assetlinks.json` file to your web server at:

```
https://magicroulette.com/.well-known/assetlinks.json
```

Content:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.magicroulette.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

## Implementation

### useDeepLinking Hook

The `useDeepLinking` hook handles all deep link parsing and navigation:

```typescript
import { useDeepLinking } from './src/hooks/useDeepLinking';

function Navigation() {
  // Initialize deep linking
  useDeepLinking();

  return (
    <Stack.Navigator>
      {/* Your screens */}
    </Stack.Navigator>
  );
}
```

### Generating Deep Links

Use helper functions to generate deep links programmatically:

```typescript
import { generateDeepLink, generateUniversalLink } from './src/hooks/useDeepLinking';

// Custom scheme
const gameLink = generateDeepLink('game', { gameId: '12345' });
// Result: magicroulette://game/12345

// Universal link
const inviteLink = generateUniversalLink('invite', { inviteCode: 'abc123' });
// Result: https://magicroulette.com/play/invite/abc123
```

## Testing Deep Links

### iOS Simulator

```bash
xcrun simctl openurl booted "magicroulette://game/12345"
```

### Android Emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d "magicroulette://game/12345" com.magicroulette.app
```

### Physical Devices

1. Send the deep link via email, SMS, or messaging app
2. Tap the link to open the app
3. Verify correct screen navigation

### Universal Links Testing

1. Host the association files on your web server
2. Open Safari (iOS) or Chrome (Android)
3. Navigate to `https://magicroulette.com/play/game/12345`
4. Verify app opens instead of web page

## dApp Store Integration

### Listing Configuration

When submitting to Solana dApp Store, configure deep links in your app metadata:

```json
{
  "deepLinks": {
    "scheme": "magicroulette",
    "universalLinks": "https://magicroulette.com/play",
    "examples": [
      "magicroulette://lobby",
      "magicroulette://mode/1v1",
      "https://magicroulette.com/play/game/12345"
    ]
  }
}
```

### Store Launch Links

The dApp Store can launch your app with specific deep links:

- **Featured Game Mode**: `magicroulette://mode/1v1`
- **Lobby**: `magicroulette://lobby`
- **Create Game**: `magicroulette://create`

## Error Handling

The deep linking implementation includes robust error handling:

1. **Invalid URLs**: Fallback to home screen
2. **Missing Parameters**: Navigate to parent screen (e.g., lobby instead of specific game)
3. **Malformed Links**: Log error and show home screen
4. **Network Issues**: Queue navigation until app is ready

## Security Considerations

1. **Parameter Validation**: All parameters are validated before navigation
2. **Authentication**: Deep links respect wallet connection state
3. **Authorization**: Game access requires proper permissions
4. **Rate Limiting**: Prevent deep link spam attacks

## Analytics

Track deep link usage for optimization:

```typescript
// Log deep link events
analytics.track('deep_link_opened', {
  type: route.type,
  params: route.params,
  source: 'dapp_store' | 'share' | 'web',
});
```

## Troubleshooting

### Deep Links Not Working on iOS

1. Verify `scheme` is set in `app.json`
2. Check `associatedDomains` configuration
3. Ensure `apple-app-site-association` file is accessible
4. Rebuild app after configuration changes

### Deep Links Not Working on Android

1. Verify `intentFilters` in `app.json`
2. Check `assetlinks.json` file is accessible
3. Verify SHA256 fingerprint matches your app
4. Test with `adb shell am start` command

### Universal Links Opening in Browser

1. Verify association files are properly hosted
2. Check file content type is `application/json`
3. Ensure no redirects on association file URLs
4. Test with Apple's validator: https://search.developer.apple.com/appsearch-validation-tool/

### Navigation Not Working

1. Check navigation stack is properly configured
2. Verify screen names match exactly
3. Ensure `useDeepLinking` is called inside `NavigationContainer`
4. Check console logs for parsing errors

## Best Practices

1. **Always provide fallback**: Navigate to home if deep link fails
2. **Validate parameters**: Check format and existence before navigation
3. **Log deep link events**: Track usage for analytics
4. **Test thoroughly**: Test all deep link formats on both platforms
5. **Document examples**: Provide clear examples for each deep link type
6. **Handle edge cases**: Empty parameters, special characters, etc.

## Future Enhancements

Potential improvements for deep linking:

1. **Query Parameters**: Support `?param=value` format
2. **Deferred Deep Links**: Track attribution for new installs
3. **Dynamic Links**: Firebase Dynamic Links integration
4. **Branch Integration**: Advanced deep linking with Branch.io
5. **QR Codes**: Generate QR codes for deep links

## References

- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Solana dApp Store Documentation](https://docs.solanamobile.com/dapp-publishing/intro)

## Support

For deep linking issues or questions:

1. Check console logs for error messages
2. Review this guide for troubleshooting steps
3. Test with provided testing commands
4. Contact development team with specific error details
