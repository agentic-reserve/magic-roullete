/**
 * Home Screen - Main game lobby
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WalletButton } from '../components/WalletButton';
import { SeekerBadge } from '../components/SeekerBadge';
import { useMobileWallet } from '../lib/wallet/MobileWalletProvider';

export function HomeScreen({ navigation }: any) {
  const { connected } = useMobileWallet();

  const gameModesData = [
    {
      id: '1v1',
      title: '1v1 Mode',
      description: 'Two players compete head-to-head',
      entryFee: '0.1 SOL',
      players: '2 players',
      color: '#9945FF',
    },
    {
      id: '2v2',
      title: '2v2 Mode',
      description: 'Four players in two teams',
      entryFee: '0.2 SOL',
      players: '4 players',
      color: '#14F195',
    },
    {
      id: 'ai',
      title: 'AI Practice',
      description: 'Practice with AI opponent',
      entryFee: 'FREE',
      players: 'Solo',
      color: '#FF6B6B',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎲 Magic Roulette</Text>
          <Text style={styles.subtitle}>Russian Roulette on Solana</Text>
          <SeekerBadge />
        </View>

        {/* Wallet Connection */}
        <View style={styles.walletSection}>
          <WalletButton />
        </View>

        {/* Game Modes */}
        <View style={styles.gameModesSection}>
          <Text style={styles.sectionTitle}>Select Game Mode</Text>
          
          {gameModesData.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.gameModeCard, { borderColor: mode.color }]}
              onPress={() => {
                if (!connected) {
                  alert('Please connect your wallet first');
                  return;
                }
                navigation.navigate('Game', { mode: mode.id });
              }}
              disabled={!connected}
            >
              <View style={styles.gameModeHeader}>
                <Text style={styles.gameModeTitle}>{mode.title}</Text>
                <View style={[styles.entryFeeBadge, { backgroundColor: mode.color }]}>
                  <Text style={styles.entryFeeText}>{mode.entryFee}</Text>
                </View>
              </View>
              <Text style={styles.gameModeDescription}>{mode.description}</Text>
              <Text style={styles.gameModeInfo}>👥 {mode.players}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Section */}
        {connected && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0 SOL</Text>
                <Text style={styles.statLabel}>Total Winnings</Text>
              </View>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How to Play</Text>
          <Text style={styles.infoText}>
            1. Connect your Solana wallet{'\n'}
            2. Choose a game mode{'\n'}
            3. Pay the entry fee{'\n'}
            4. Take turns shooting{'\n'}
            5. Last player standing wins!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  walletSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gameModesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  gameModeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  gameModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameModeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  entryFeeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  entryFeeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  gameModeDescription: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  gameModeInfo: {
    fontSize: 12,
    color: '#888',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14F195',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 24,
  },
});
