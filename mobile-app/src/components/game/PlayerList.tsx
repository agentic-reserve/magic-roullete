import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface Player {
  publicKey: string;
  isAlive: boolean;
  shotsTaken: number;
}

interface PlayerListProps {
  players: Player[];
  currentTurn?: string;
}

export function PlayerList({ players, currentTurn }: PlayerListProps) {
  const renderPlayer = ({ item }: { item: Player }) => (
    <View 
      style={[
        styles.playerCard,
        currentTurn === item.publicKey && styles.playerCardActive,
        !item.isAlive && styles.playerCardEliminated,
      ]}
    >
      <View style={styles.playerInfo}>
        <Text style={styles.playerAddress}>
          {item.publicKey.slice(0, 6)}...{item.publicKey.slice(-6)}
        </Text>
        <Text style={styles.playerShots}>Shots: {item.shotsTaken}</Text>
      </View>
      
      <View style={styles.playerStatus}>
        {currentTurn === item.publicKey && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>TURN</Text>
          </View>
        )}
        {!item.isAlive && (
          <Text style={styles.eliminatedText}>❌</Text>
        )}
        {item.isAlive && currentTurn !== item.publicKey && (
          <Text style={styles.aliveText}>✓</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Players</Text>
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.publicKey}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  playerCardActive: {
    borderColor: '#9945FF',
    backgroundColor: '#1a1a2a',
  },
  playerCardEliminated: {
    opacity: 0.5,
  },
  playerInfo: {
    flex: 1,
  },
  playerAddress: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playerShots: {
    color: '#999',
    fontSize: 14,
  },
  playerStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnIndicator: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  turnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eliminatedText: {
    fontSize: 24,
  },
  aliveText: {
    color: '#14F195',
    fontSize: 24,
  },
});
