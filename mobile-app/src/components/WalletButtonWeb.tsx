import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { View, StyleSheet } from 'react-native';

export const WalletButtonWeb: React.FC = () => {
  return (
    <View style={styles.container}>
      <WalletMultiButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
