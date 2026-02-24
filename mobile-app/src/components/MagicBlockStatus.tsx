/**
 * MagicBlock Status Component
 * Displays ER delegation status and performance metrics
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MagicBlockStatusProps {
  isDelegated: boolean;
  erLatency: number | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const MagicBlockStatus: React.FC<MagicBlockStatusProps> = ({
  isDelegated,
  erLatency,
  isLoading = false,
  onRefresh,
}) => {
  const getStatusColor = () => {
    if (isLoading) return '#888';
    return isDelegated ? '#14F195' : '#9945FF';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    return isDelegated ? 'Ephemeral Rollup' : 'Base Layer';
  };

  const getLatencyColor = () => {
    if (!erLatency) return '#888';
    if (erLatency < 50) return '#14F195';
    if (erLatency < 200) return '#FFA500';
    return '#ff4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {erLatency !== null && (
          <View style={styles.latencyIndicator}>
            <Text style={[styles.latencyText, { color: getLatencyColor() }]}>
              {erLatency}ms
            </Text>
          </View>
        )}

        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={isLoading}
          >
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        )}
      </View>

      {isDelegated && (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            ⚡ Ultra-fast, gasless transactions enabled
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  latencyIndicator: {
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  latencyText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: '#9945FF',
    fontSize: 20,
    fontWeight: '700',
  },
  infoRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  infoText: {
    color: '#14F195',
    fontSize: 12,
  },
});
