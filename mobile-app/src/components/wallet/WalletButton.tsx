import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface WalletButtonProps {
  onPress?: () => void;
  connected?: boolean;
  connecting?: boolean;
  publicKey?: string | null;
}

export function WalletButton({ 
  onPress, 
  connected = false, 
  connecting = false,
  publicKey = null 
}: WalletButtonProps) {
  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && publicKey) {
      return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
    }
    return 'Connect Wallet';
  };

  return (
    <TouchableOpacity
      style={[styles.button, connected && styles.buttonConnected]}
      onPress={onPress}
      disabled={connecting}
    >
      {connecting ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
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
