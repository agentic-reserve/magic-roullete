/**
 * Wallet Connect/Disconnect Button Component
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useMobileWallet } from '../lib/wallet/MobileWalletProvider';

export function WalletButton() {
  const { account, connected, connecting, connect, disconnect } = useMobileWallet();

  const handlePress = async () => {
    try {
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet action failed:', error);
    }
  };

  if (connecting) {
    return (
      <View style={styles.button}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.buttonText}>Connecting...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.button, connected && styles.buttonConnected]} 
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>
        {connected 
          ? `${account?.address.slice(0, 4)}...${account?.address.slice(-4)}`
          : 'Connect Wallet'
        }
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonConnected: {
    backgroundColor: '#14F195',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
