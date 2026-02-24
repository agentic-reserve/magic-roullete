import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WalletStatusProps {
  connected: boolean;
  publicKey?: string | null;
}

export function WalletStatus({ connected, publicKey }: WalletStatusProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, connected ? styles.connected : styles.disconnected]} />
      <Text style={styles.text}>
        {connected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#14F195',
  },
  disconnected: {
    backgroundColor: '#ff4444',
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
});
