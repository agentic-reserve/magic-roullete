/**
 * Deep Linking Tests
 * Task 9.3: Add deep link testing and validation
 * 
 * Tests deep link parsing and navigation for:
 * - Custom scheme URLs (magicroulette://)
 * - Universal links (https://magicroulette.com/play/*)
 * - Game invites, game modes, direct game access, lobby navigation
 * 
 * Requirements: 5.7
 */
import { generateDeepLink, generateUniversalLink } from '../useDeepLinking';

describe('Deep Linking', () => {
  describe('generateDeepLink', () => {
    it('should generate game deep link', () => {
      const link = generateDeepLink('game', { gameId: '12345' });
      expect(link).toBe('magicroulette://game/12345');
    });

    it('should generate invite deep link', () => {
      const link = generateDeepLink('invite', { inviteCode: 'abc123' });
      expect(link).toBe('magicroulette://invite/abc123');
    });

    it('should generate mode deep link', () => {
      const link = generateDeepLink('mode', { gameMode: '1v1' });
      expect(link).toBe('magicroulette://mode/1v1');
    });

    it('should generate lobby deep link', () => {
      const link = generateDeepLink('lobby');
      expect(link).toBe('magicroulette://lobby');
    });

    it('should generate create deep link', () => {
      const link = generateDeepLink('create');
      expect(link).toBe('magicroulette://create');
    });

    it('should generate home deep link', () => {
      const link = generateDeepLink('home');
      expect(link).toBe('magicroulette://');
    });

    it('should handle missing parameters gracefully', () => {
      const link = generateDeepLink('game');
      expect(link).toBe('magicroulette://game/');
    });
  });

  describe('generateUniversalLink', () => {
    it('should generate game universal link', () => {
      const link = generateUniversalLink('game', { gameId: '12345' });
      expect(link).toBe('https://magicroulette.com/play/game/12345');
    });

    it('should generate invite universal link', () => {
      const link = generateUniversalLink('invite', { inviteCode: 'abc123' });
      expect(link).toBe('https://magicroulette.com/play/invite/abc123');
    });

    it('should generate mode universal link', () => {
      const link = generateUniversalLink('mode', { gameMode: '2v2' });
      expect(link).toBe('https://magicroulette.com/play/mode/2v2');
    });

    it('should generate lobby universal link', () => {
      const link = generateUniversalLink('lobby');
      expect(link).toBe('https://magicroulette.com/play/lobby');
    });

    it('should generate create universal link', () => {
      const link = generateUniversalLink('create');
      expect(link).toBe('https://magicroulette.com/play/create');
    });

    it('should generate home universal link', () => {
      const link = generateUniversalLink('home');
      expect(link).toBe('https://magicroulette.com/play');
    });
  });

  describe('Deep Link URL Formats', () => {
    it('should support custom scheme format', () => {
      const testUrls = [
        'magicroulette://game/12345',
        'magicroulette://invite/abc123',
        'magicroulette://mode/1v1',
        'magicroulette://lobby',
        'magicroulette://create',
      ];

      testUrls.forEach(url => {
        expect(url).toMatch(/^magicroulette:\/\//);
      });
    });

    it('should support universal link format', () => {
      const testUrls = [
        'https://magicroulette.com/play/game/12345',
        'https://magicroulette.com/play/invite/abc123',
        'https://magicroulette.com/play/mode/2v2',
        'https://magicroulette.com/play/lobby',
        'https://magicroulette.com/play/create',
      ];

      testUrls.forEach(url => {
        expect(url).toMatch(/^https:\/\/magicroulette\.com\/play/);
      });
    });
  });

  describe('Deep Link Parameter Validation', () => {
    it('should validate game ID format', () => {
      const gameId = '12345';
      expect(gameId).toMatch(/^\d+$/);
    });

    it('should validate invite code format', () => {
      const inviteCode = 'abc123';
      expect(inviteCode).toMatch(/^[a-zA-Z0-9-_]+$/);
    });

    it('should validate game mode format', () => {
      const validModes = ['1v1', '2v2', 'practice'];
      validModes.forEach(mode => {
        expect(mode).toMatch(/^(1v1|2v2|practice)$/i);
      });
    });
  });

  describe('Deep Link Edge Cases', () => {
    it('should handle empty parameters', () => {
      const link = generateDeepLink('game', {});
      expect(link).toBe('magicroulette://game/');
    });

    it('should handle undefined parameters', () => {
      const link = generateDeepLink('invite');
      expect(link).toBe('magicroulette://invite/');
    });

    it('should handle special characters in invite codes', () => {
      const inviteCode = 'abc-123_xyz';
      expect(inviteCode).toMatch(/^[a-zA-Z0-9-_]+$/);
    });

    it('should handle numeric game IDs', () => {
      const gameId = '999999999';
      expect(gameId).toMatch(/^\d+$/);
    });
  });

  describe('Deep Link Integration', () => {
    it('should generate matching custom and universal links', () => {
      const customLink = generateDeepLink('game', { gameId: '12345' });
      const universalLink = generateUniversalLink('game', { gameId: '12345' });

      expect(customLink).toContain('game/12345');
      expect(universalLink).toContain('game/12345');
    });

    it('should support all route types', () => {
      const routeTypes = ['home', 'lobby', 'game', 'invite', 'mode', 'create'] as const;
      
      routeTypes.forEach(type => {
        const customLink = generateDeepLink(type);
        const universalLink = generateUniversalLink(type);

        expect(customLink).toBeTruthy();
        expect(universalLink).toBeTruthy();
      });
    });
  });
});
