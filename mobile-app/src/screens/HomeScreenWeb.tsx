import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButtonWeb } from '../components/WalletButtonWeb';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { connected } = useWallet();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎰 Magic Roulette</Text>
        <Text style={styles.subtitle}>High-Stakes GameFi on Solana</Text>
        <Text style={styles.devNote}>🖥️ Web/Desktop Development Mode</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.walletSection}>
          <WalletButtonWeb />
        </View>

        {connected && (
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={[styles.menuButton, styles.primaryButton]}
              onPress={() => navigation.navigate('GameLobby')}
            >
              <Text style={styles.menuButtonText}>🎮 Join Game</Text>
              <Text style={styles.menuButtonSubtext}>Play with real players</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('CreateGame')}
            >
              <Text style={styles.menuButtonText}>➕ Create Game</Text>
              <Text style={styles.menuButtonSubtext}>Start a new match</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.tertiaryButton]}
              onPress={() => navigation.navigate('PracticeMode')}
            >
              <Text style={styles.menuButtonText}>🤖 Practice Mode</Text>
              <Text style={styles.menuButtonSubtext}>Free AI practice</Text>
            </TouchableOpacity>
          </View>
        )}

        {!connected && (
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Connect your wallet to start playing
            </Text>
            <Text style={styles.infoSubtext}>
              Fast, fair, and fully decentralized gaming on Solana
            </Text>
            <View style={styles.walletList}>
              <Text style={styles.walletListTitle}>Supported Wallets:</Text>
              <Text style={styles.walletItem}>• Phantom</Text>
              <Text style={styles.walletItem}>• Solflare</Text>
              <Text style={styles.walletItem}>• And more...</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Solana</Text>
        <Text style={styles.footerSubtext}>Development Mode - Devnet</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  devNote: {
    fontSize: 14,
    color: '#14F195',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  walletSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  menuSection: {
    gap: 16,
  },
  menuButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#9945FF',
  },
  secondaryButton: {
    backgroundColor: '#14F195',
  },
  tertiaryButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#9945FF',
  },
  menuButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  menuButtonSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  infoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  infoText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  walletList: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  walletListTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  walletItem: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#444',
    marginTop: 4,
  },
});
