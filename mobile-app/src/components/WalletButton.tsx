import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useWallet } from '../contexts/WalletContext';

export const WalletButton: React.FC = () => {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();

  const handlePress = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.button, connected && styles.buttonConnected]}
      onPress={handlePress}
      disabled={connecting}
    >
      {connecting ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.buttonText}>
            {connected && publicKey
              ? formatAddress(publicKey.toBase58())
              : 'Connect Wallet'}
          </Text>
          {connected && <View style={styles.indicator} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonConnected: {
    backgroundColor: '#14F195',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
