import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCompressedTokens } from '../hooks/useCompressedTokens';

interface CompressedTokenBalanceProps {
  showDetails?: boolean;
  onPress?: () => void;
}

/**
 * Component to display compressed token balance with cost savings indicator
 * Shows the user's compressed token balance and highlights the 1000x cost savings
 */
export const CompressedTokenBalance: React.FC<CompressedTokenBalanceProps> = ({
  showDetails = false,
  onPress,
}) => {
  const { balance, loading, error, getBalance } = useCompressedTokens();

  // Format balance for display (assuming 9 decimals like SOL)
  const formatBalance = (balance: bigint): string => {
    const balanceNumber = Number(balance) / 1e9;
    return balanceNumber.toFixed(4);
  };

  const handleRefresh = () => {
    getBalance();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load balance</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Compressed Token Balance</Text>
        {loading && <ActivityIndicator size="small" color="#9945FF" />}
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>{formatBalance(balance)}</Text>
        <Text style={styles.unit}>cSOL</Text>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>💰 1000x Cost Savings</Text>
          </View>
          <Text style={styles.detailText}>
            Account cost: ~5,000 lamports vs ~2M for SPL
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14F195',
  },
  unit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  savingsBadge: {
    backgroundColor: '#14F19520',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14F195',
  },
  detailText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#9945FF',
    fontWeight: '600',
  },
});
