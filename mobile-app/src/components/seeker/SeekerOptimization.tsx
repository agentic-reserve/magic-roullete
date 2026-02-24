import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SeekerOptimizationProps {
  isSeeker: boolean;
  loadTime?: number;
  latency?: number;
}

export function SeekerOptimization({ isSeeker, loadTime, latency }: SeekerOptimizationProps) {
  if (!isSeeker) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ Seeker Optimizations Active</Text>
      <View style={styles.metrics}>
        {loadTime !== undefined && (
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Load Time</Text>
            <Text style={[styles.metricValue, loadTime < 100 && styles.metricGood]}>
              {loadTime}ms
            </Text>
          </View>
        )}
        {latency !== undefined && (
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Latency</Text>
            <Text style={[styles.metricValue, latency < 10 && styles.metricGood]}>
              {latency}ms
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9945FF',
    marginVertical: 8,
  },
  title: {
    color: '#14F195',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricGood: {
    color: '#14F195',
  },
});
