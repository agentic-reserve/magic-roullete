import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Card, LoadingSpinner } from '../components/ui';
import { GameHistory, PlayerStats } from '../lib/types';
import { formatSOL, formatDate, calculateWinRate } from '../lib/utils';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'prize'>('date');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from API
      // Mock data for now
      setStats({
        totalGames: 25,
        wins: 15,
        losses: 10,
        totalWagered: 5.5,
        lifetimeEarnings: 8.2,
        winRate: 60,
      });
      
      setHistory([
        {
          gameId: '1',
          entryFee: 0.5,
          result: 'won',
          prize: 0.95,
          timestamp: Date.now() - 3600000,
        },
        {
          gameId: '2',
          entryFee: 0.25,
          result: 'lost',
          prize: 0,
          timestamp: Date.now() - 7200000,
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(game => {
    if (filter === 'all') return true;
    return game.result === filter;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return b.timestamp - a.timestamp;
    }
    return b.prize - a.prize;
  });

  const renderHistoryItem = ({ item }: { item: GameHistory }) => (
    <Card style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
        <View style={[
          styles.resultBadge,
          item.result === 'won' ? styles.wonBadge : styles.lostBadge
        ]}>
          <Text style={styles.resultText}>
            {item.result === 'won' ? '✓ WON' : '✗ LOST'}
          </Text>
        </View>
      </View>
      
      <View style={styles.historyDetails}>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Entry Fee</Text>
          <Text style={styles.historyValue}>{item.entryFee} SOL</Text>
        </View>
        
        {item.result === 'won' && (
          <View style={styles.historyRow}>
            <Text style={styles.historyLabel}>Prize</Text>
            <Text style={[styles.historyValue, styles.prizeValue]}>
              +{item.prize} SOL
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      {stats && (
        <View style={styles.statsSection}>
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalGames}</Text>
                <Text style={styles.statLabel}>Total Games</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.winValue]}>{stats.wins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.lossValue]}>{stats.losses}</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
            
            <View style={styles.earningsSection}>
              <View style={styles.earningItem}>
                <Text style={styles.earningLabel}>Total Wagered</Text>
                <Text style={styles.earningValue}>{stats.totalWagered} SOL</Text>
              </View>
              
              <View style={styles.earningItem}>
                <Text style={styles.earningLabel}>Lifetime Earnings</Text>
                <Text style={[styles.earningValue, styles.earningPositive]}>
                  {stats.lifetimeEarnings} SOL
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      <View style={styles.historySection}>
        <View style={styles.historyControls}>
          <Text style={styles.historyTitle}>Game History</Text>
          
          <View style={styles.filterButtons}>
            {(['all', 'won', 'lost'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && styles.filterButtonActive
                ]}
                onPress={() => setFilter(f)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === f && styles.filterButtonTextActive
                ]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={sortedHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.gameId}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No games played yet</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsSection: {
    padding: 16,
  },
  statsCard: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  winValue: {
    color: '#14F195',
  },
  lossValue: {
    color: '#ff4444',
  },
  statLabel: {
    color: '#999',
    fontSize: 14,
  },
  earningsSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  earningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningLabel: {
    color: '#999',
    fontSize: 16,
  },
  earningValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  earningPositive: {
    color: '#14F195',
  },
  historySection: {
    flex: 1,
    padding: 16,
  },
  historyControls: {
    marginBottom: 16,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
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
  historyList: {
    paddingBottom: 16,
  },
  historyCard: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    color: '#999',
    fontSize: 14,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  wonBadge: {
    backgroundColor: '#14F195',
  },
  lostBadge: {
    backgroundColor: '#ff4444',
  },
  resultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyDetails: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyLabel: {
    color: '#999',
    fontSize: 14,
  },
  historyValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  prizeValue: {
    color: '#14F195',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
