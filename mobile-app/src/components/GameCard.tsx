import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameData, GameMode } from '../services/game';
import { lamportsToSol } from '../services/solana';

interface GameCardProps {
  game: GameData;
  onPress: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  const getGameModeText = (mode: GameMode) => {
    return mode === GameMode.OneVsOne ? '1v1' : '2v2';
  };

  const getPlayersText = () => {
    const maxPlayers = game.gameMode === GameMode.OneVsOne ? 2 : 4;
    return `${game.players.length}/${maxPlayers}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getGameModeText(game.gameMode)}</Text>
        </View>
        <Text style={styles.gameId}>Game #{game.gameId}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Entry Fee:</Text>
          <Text style={styles.value}>{lamportsToSol(game.entryFee)} SOL</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Players:</Text>
          <Text style={styles.value}>{getPlayersText()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Prize Pool:</Text>
          <Text style={styles.prize}>
            {lamportsToSol(game.entryFee * game.players.length)} SOL
          </Text>
        </View>

        {game.useCompressedTokens && (
          <View style={styles.compressedBadge}>
            <Text style={styles.compressedText}>⚡ Compressed Tokens</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.joinText}>Tap to Join</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gameId: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#888',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  prize: {
    color: '#14F195',
    fontSize: 16,
    fontWeight: '700',
  },
  compressedBadge: {
    backgroundColor: '#14F19520',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  compressedText: {
    color: '#14F195',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    alignItems: 'center',
  },
  joinText: {
    color: '#9945FF',
    fontSize: 14,
    fontWeight: '600',
  },
});
