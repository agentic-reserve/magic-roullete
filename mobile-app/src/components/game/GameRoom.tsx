import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Game } from './GameCard';

interface Player {
  publicKey: string;
  isAlive: boolean;
  shotsTaken: number;
}

interface GameRoomProps {
  game: Game & {
    players?: Player[];
    currentTurn?: string;
    currentPlayer?: string;
  };
  onShoot?: () => void;
  loading?: boolean;
}

export function GameRoom({ game, onShoot, loading = false }: GameRoomProps) {
  const isMyTurn = game.currentPlayer && game.currentTurn === game.currentPlayer;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Room</Text>
        <Text style={styles.entryFee}>{game.entryFee} SOL</Text>
      </View>

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>Players</Text>
        {game.players?.map((player, index) => (
          <View 
            key={player.publicKey} 
            style={[
              styles.playerCard,
              game.currentTurn === player.publicKey && styles.playerCardActive,
              !player.isAlive && styles.playerCardEliminated,
            ]}
          >
            <Text style={styles.playerAddress}>
              {player.publicKey.slice(0, 4)}...{player.publicKey.slice(-4)}
            </Text>
            <View style={styles.playerStats}>
              <Text style={styles.playerShots}>Shots: {player.shotsTaken}</Text>
              {!player.isAlive && (
                <Text style={styles.eliminatedText}>Eliminated</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {isMyTurn && (
        <View style={styles.actionSection}>
          <Text style={styles.turnIndicator}>Your Turn!</Text>
          <TouchableOpacity
            style={[styles.shootButton, loading && styles.shootButtonDisabled]}
            onPress={onShoot}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.shootButtonText}>Take Shot</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!isMyTurn && game.currentTurn && (
        <View style={styles.waitingSection}>
          <Text style={styles.waitingText}>Waiting for other player...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  entryFee: {
    color: '#14F195',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  playerCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  playerCardActive: {
    borderColor: '#9945FF',
  },
  playerCardEliminated: {
    opacity: 0.5,
  },
  playerAddress: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerShots: {
    color: '#999',
    fontSize: 14,
  },
  eliminatedText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 'auto',
  },
  turnIndicator: {
    color: '#14F195',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  shootButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shootButtonDisabled: {
    opacity: 0.5,
  },
  shootButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingSection: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  waitingText: {
    color: '#999',
    fontSize: 16,
  },
});
