import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface Game {
  id: string;
  entryFee: number;
  gameMode: '1v1' | '2v2' | 'AI practice';
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
}

interface GameCardProps {
  game: Game;
  onJoin?: () => void;
}

export function GameCard({ game, onJoin }: GameCardProps) {
  const getStatusColor = () => {
    switch (game.status) {
      case 'waiting': return '#14F195';
      case 'active': return '#9945FF';
      case 'finished': return '#666';
      default: return '#666';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.entryFee}>{game.entryFee} SOL</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{game.status}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.gameMode}>{game.gameMode}</Text>
        <Text style={styles.players}>
          {game.playerCount}/{game.maxPlayers} players
        </Text>
      </View>

      {game.status === 'waiting' && onJoin && (
        <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
          <Text style={styles.joinButtonText}>Join Game</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryFee: {
    color: '#14F195',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    marginBottom: 12,
  },
  gameMode: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  players: {
    color: '#999',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
