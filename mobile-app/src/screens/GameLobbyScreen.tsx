import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useActiveGames } from '../hooks/useGame';
import { GameCard } from '../components/game';

interface GameLobbyScreenProps {
  navigation: any;
}

export const GameLobbyScreen: React.FC<GameLobbyScreenProps> = ({ navigation }) => {
  const { games, loading, error, refreshGames } = useActiveGames();
  const [filterMode, setFilterMode] = useState<'all' | '1v1' | '2v2' | 'AI practice'>('all');
  const [filterFee, setFilterFee] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const handleGamePress = (gameId: number) => {
    navigation.navigate('GamePlay', { gameId });
  };

  // Filter games based on selected filters
  const filteredGames = useMemo(() => {
    let filtered = [...games];

    // Filter by game mode
    if (filterMode !== 'all') {
      filtered = filtered.filter(game => game.gameMode === filterMode);
    }

    // Filter by entry fee
    if (filterFee !== 'all') {
      filtered = filtered.filter(game => {
        if (filterFee === 'low') return game.entryFee < 0.1;
        if (filterFee === 'medium') return game.entryFee >= 0.1 && game.entryFee < 1;
        if (filterFee === 'high') return game.entryFee >= 1;
        return true;
      });
    }

    return filtered;
  }, [games, filterMode, filterFee]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Game Lobby</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Mode:</Text>
          <View style={styles.filterButtons}>
            {(['all', '1v1', '2v2', 'AI practice'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterButton,
                  filterMode === mode && styles.filterButtonActive
                ]}
                onPress={() => setFilterMode(mode)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterMode === mode && styles.filterButtonTextActive
                ]}>
                  {mode === 'all' ? 'All' : mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Fee:</Text>
          <View style={styles.filterButtons}>
            {(['all', 'low', 'medium', 'high'] as const).map((fee) => (
              <TouchableOpacity
                key={fee}
                style={[
                  styles.filterButton,
                  filterFee === fee && styles.filterButtonActive
                ]}
                onPress={() => setFilterFee(fee)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterFee === fee && styles.filterButtonTextActive
                ]}>
                  {fee === 'all' ? 'All' : fee}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && games.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9945FF" />
          <Text style={styles.loadingText}>Loading games...</Text>
        </View>
      ) : filteredGames.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {games.length === 0 ? 'No active games' : 'No games match your filters'}
          </Text>
          <Text style={styles.emptySubtext}>
            {games.length === 0 ? 'Be the first to create one!' : 'Try adjusting your filters'}
          </Text>
          {games.length === 0 && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateGame')}
            >
              <Text style={styles.createButtonText}>Create Game</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id || item.gameId?.toString()}
          renderItem={({ item }) => (
            <GameCard 
              game={item} 
              onJoin={() => handleGamePress(item.gameId || parseInt(item.id))} 
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshGames}
              tintColor="#9945FF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  backButton: {
    color: '#9945FF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#1a1a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f0f1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#9945FF',
    borderColor: '#9945FF',
  },
  filterButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ff4444',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
});
