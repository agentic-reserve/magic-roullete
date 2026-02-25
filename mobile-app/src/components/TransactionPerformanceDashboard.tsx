/**
 * Transaction Performance Dashboard Component
 * 
 * Displays transaction signing performance metrics for monitoring
 * and debugging. Shows compliance with <200ms target.
 * 
 * Validates: Requirements 4.10
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTransactionSigningPerformance } from '../hooks/useTransactionSigningPerformance';

export const TransactionPerformanceDashboard: React.FC = () => {
  const stats = useTransactionSigningPerformance();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Signing Performance</Text>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Transactions</Text>
          <Text style={styles.metricValue}>{stats.totalTransactions}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Signing Time</Text>
          <Text style={[
            styles.metricValue,
            stats.averageSigningTime > 200 && styles.metricWarning
          ]}>
            {stats.averageSigningTime.toFixed(0)}ms
          </Text>
          <Text style={styles.metricTarget}>Target: &lt;200ms</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Target Compliance</Text>
          <Text style={[
            styles.metricValue,
            stats.targetComplianceRate < 95 && styles.metricWarning
          ]}>
            {stats.targetComplianceRate.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Device Type</Text>
          <Text style={styles.metricValue}>
            {stats.deviceType === 'seeker' ? '📱 Seeker' : '📱 Other'}
          </Text>
        </View>
      </View>

      <View style={[
        styles.statusBanner,
        stats.meetsTarget ? styles.statusSuccess : styles.statusWarning
      ]}>
        <Text style={styles.statusText}>
          {stats.meetsTarget 
            ? '✓ Performance target met' 
            : '⚠ Performance below target'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricWarning: {
    color: '#ff9800',
  },
  metricTarget: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  statusBanner: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusSuccess: {
    backgroundColor: '#4caf50',
  },
  statusWarning: {
    backgroundColor: '#ff9800',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
