/**
 * Offline Indicator Component
 * Task 5.6: Visual indicator for offline state
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '../../lib/offline/OfflineManager';

export function OfflineIndicator() {
  const { isOffline, offlineMessage, pendingCount } = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Offline Mode</Text>
          <Text style={styles.message}>{offlineMessage}</Text>
          {pendingCount > 0 && (
            <Text style={styles.pending}>
              {pendingCount} action{pendingCount > 1 ? 's' : ''} will sync when online
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
  },
  pending: {
    color: '#ffffff',
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
});
