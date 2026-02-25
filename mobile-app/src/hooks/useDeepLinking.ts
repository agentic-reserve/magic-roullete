/**
 * Deep Linking Hook
 * Task 9.3: Implement deep linking
 * 
 * Handles deep links for:
 * - Game invites: magicroulette://invite/{inviteCode}
 * - Specific game modes: magicroulette://mode/{gameMode}
 * - Direct game access: magicroulette://game/{gameId}
 * - Lobby navigation: magicroulette://lobby
 * - Universal links: https://magicroulette.com/play/*
 * 
 * Requirements: 5.7
 */
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface DeepLinkRoute {
  type: 'home' | 'lobby' | 'game' | 'invite' | 'mode' | 'create';
  params: Record<string, string>;
}

export interface RootStackParamList {
  Home: undefined;
  GameLobby: { inviteCode?: string; gameMode?: string } | undefined;
  CreateGame: { gameMode?: string } | undefined;
  GamePlay: { gameId: string };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Hook for handling deep links
 * Supports both custom scheme (magicroulette://) and universal links (https://magicroulette.com)
 */
export function useDeepLinking() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Handle initial URL (app opened from deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('[DeepLink] Initial URL:', url);
        handleDeepLink(url);
      }
    }).catch(error => {
      console.error('[DeepLink] Error getting initial URL:', error);
    });

    // Handle URL while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[DeepLink] Received URL:', url);
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Parse and handle deep link URL
   */
  const handleDeepLink = (url: string) => {
    try {
      const route = parseDeepLink(url);
      console.log('[DeepLink] Parsed route:', route);

      switch (route.type) {
        case 'game':
          // Navigate to specific game
          if (route.params.gameId) {
            navigation.navigate('GamePlay', { gameId: route.params.gameId });
          } else {
            console.warn('[DeepLink] Game ID missing in game route');
            navigation.navigate('Home');
          }
          break;

        case 'invite':
          // Navigate to lobby with invite code
          if (route.params.inviteCode) {
            navigation.navigate('GameLobby', { inviteCode: route.params.inviteCode });
          } else {
            console.warn('[DeepLink] Invite code missing in invite route');
            navigation.navigate('GameLobby');
          }
          break;

        case 'mode':
          // Navigate to create game with specific mode
          if (route.params.gameMode) {
            navigation.navigate('CreateGame', { gameMode: route.params.gameMode });
          } else {
            console.warn('[DeepLink] Game mode missing in mode route');
            navigation.navigate('CreateGame');
          }
          break;

        case 'lobby':
          // Navigate to game lobby
          navigation.navigate('GameLobby');
          break;

        case 'create':
          // Navigate to create game screen
          navigation.navigate('CreateGame');
          break;

        case 'home':
        default:
          // Navigate to home screen
          navigation.navigate('Home');
          break;
      }
    } catch (error) {
      console.error('[DeepLink] Error handling deep link:', error);
      // Fallback to home on error
      navigation.navigate('Home');
    }
  };

  /**
   * Parse deep link URL into route object
   * 
   * Supported formats:
   * - magicroulette://game/{gameId}
   * - magicroulette://invite/{inviteCode}
   * - magicroulette://mode/{gameMode}
   * - magicroulette://lobby
   * - magicroulette://create
   * - https://magicroulette.com/play/game/{gameId}
   * - https://magicroulette.com/play/invite/{inviteCode}
   * - https://magicroulette.com/play/mode/{gameMode}
   * - https://magicroulette.com/play/lobby
   */
  const parseDeepLink = (url: string): DeepLinkRoute => {
    // Handle custom scheme (magicroulette://)
    const customSchemeMatch = url.match(/magicroulette:\/\/(\w+)\/?(.*)/);
    if (customSchemeMatch) {
      const [, type, params] = customSchemeMatch;
      return {
        type: type as DeepLinkRoute['type'],
        params: parseParams(params),
      };
    }

    // Handle universal links (https://magicroulette.com/play/*)
    const universalLinkMatch = url.match(/https?:\/\/magicroulette\.com\/play\/(\w+)\/?(.*)/);
    if (universalLinkMatch) {
      const [, type, params] = universalLinkMatch;
      return {
        type: type as DeepLinkRoute['type'],
        params: parseParams(params),
      };
    }

    // Default to home if no match
    return { type: 'home', params: {} };
  };

  /**
   * Parse URL parameters
   * Handles both path segments and query strings
   */
  const parseParams = (paramString: string): Record<string, string> => {
    if (!paramString) {
      return {};
    }

    const params: Record<string, string> = {};

    // Handle path segments (e.g., "12345" in /game/12345)
    const pathSegments = paramString.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      // First segment is typically the ID or code
      const firstSegment = pathSegments[0];
      
      // Determine parameter name based on context
      if (firstSegment.match(/^\d+$/)) {
        params.gameId = firstSegment;
      } else if (firstSegment.match(/^[a-zA-Z0-9-_]+$/)) {
        params.inviteCode = firstSegment;
      } else if (firstSegment.match(/^(1v1|2v2|practice)$/i)) {
        params.gameMode = firstSegment.toLowerCase();
      }
    }

    // Handle query strings (e.g., ?inviteCode=abc123&gameMode=1v1)
    const queryMatch = paramString.match(/\?(.+)/);
    if (queryMatch) {
      const queryString = queryMatch[1];
      const queryParams = new URLSearchParams(queryString);
      
      queryParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return params;
  };
}

/**
 * Helper function to generate deep link URLs
 * Useful for sharing game invites or creating links
 */
export function generateDeepLink(type: DeepLinkRoute['type'], params?: Record<string, string>): string {
  const baseUrl = 'magicroulette://';
  
  switch (type) {
    case 'game':
      return `${baseUrl}game/${params?.gameId || ''}`;
    
    case 'invite':
      return `${baseUrl}invite/${params?.inviteCode || ''}`;
    
    case 'mode':
      return `${baseUrl}mode/${params?.gameMode || ''}`;
    
    case 'lobby':
      return `${baseUrl}lobby`;
    
    case 'create':
      return `${baseUrl}create`;
    
    case 'home':
    default:
      return baseUrl;
  }
}

/**
 * Helper function to generate universal link URLs
 * For web sharing and dApp Store integration
 */
export function generateUniversalLink(type: DeepLinkRoute['type'], params?: Record<string, string>): string {
  const baseUrl = 'https://magicroulette.com/play';
  
  switch (type) {
    case 'game':
      return `${baseUrl}/game/${params?.gameId || ''}`;
    
    case 'invite':
      return `${baseUrl}/invite/${params?.inviteCode || ''}`;
    
    case 'mode':
      return `${baseUrl}/mode/${params?.gameMode || ''}`;
    
    case 'lobby':
      return `${baseUrl}/lobby`;
    
    case 'create':
      return `${baseUrl}/create`;
    
    case 'home':
    default:
      return baseUrl;
  }
}
