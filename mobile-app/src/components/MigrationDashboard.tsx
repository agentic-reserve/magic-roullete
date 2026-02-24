import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMigration } from '../hooks/useMigration';
import { MigrationStatus } from '../lib/migration/MigrationService';

interface MigrationDashboardProps {
  userId: string;
}

/**
 * Dashboard component displaying migration progress and analytics
 * Shows cost savings, migration status, and aggregated statistics
 */
export const MigrationDashboard: React.FC<MigrationDashboardProps> = ({ userId }) => {
  const {
    progress,
    analytics,
    isEligible,
    isAutoCompressionEnabled,
    getCostSavings,
    getAggregatedStats,
    enableAutoCompression,
  } = useMigration(userId);

  const aggregatedStats = getAggregatedStats();

  const getStatusColor = (status: MigrationStatus): string => {
    switch (status) {
      case MigrationStatus.COMPLETED:
        return '#14F195';
      case MigrationStatus.IN_PROGRESS:
        return '#9945FF';
      case MigrationStatus.FAILED:
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: MigrationStatus): string => {
    switch (status) {
      case MigrationStatus.COMPLETED:
        return 'Completed';
      case MigrationStatus.IN_PROGRESS:
        return 'In Progress';
      case MigrationStatus.FAILED:
        return 'Failed';
      case MigrationStatus.NOT_STARTED:
        return 'Not Started';
      case MigrationStatus.ROLLED_BACK:
        return 'Rolled Back';
      default:
        return 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Migration Dashboard</Text>
        <Text style={styles.subtitle}>Track your compressed token migration</Text>
      </View>

      {/* Eligibility Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Eligibility Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Migration Eligible:</Text>
          <View style={[styles.badge, isEligible ? styles.badgeSuccess : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{isEligible ? 'Yes' : 'No'}</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Auto-Compression:</Text>
          <View
            style={[
              styles.badge,
              isAutoCompressionEnabled ? styles.badgeSuccess : styles.badgeInactive,
            ]}
          >
            <Text style={styles.badgeText}>
              {isAutoCompressionEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
        {!isAutoCompressionEnabled && isEligible && (
          <TouchableOpacity style={styles.enableButton} onPress={enableAutoCompression}>
            <Text style={styles.enableButtonText}>Enable Auto-Compression</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Migration Progress */}
      {progress && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Migration Progress</Text>
          
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentComplete}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress.percentComplete}% Complete</Text>

          <View style={styles.statsGrid}>
            <StatItem
              label="Total Accounts"
              value={progress.totalAccounts.toString()}
            />
            <StatItem
              label="Migrated"
              value={progress.migratedAccounts.toString()}
            />
            <StatItem
              label="Status"
              value={getStatusText(progress.currentStatus)}
              valueColor={getStatusColor(progress.currentStatus)}
            />
            <StatItem
              label="Est. Savings"
              value={`${(progress.estimatedCostSavings / 1e9).toFixed(4)} SOL`}
              valueColor="#14F195"
            />
          </View>
        </View>
      )}

      {/* Analytics */}
      {analytics && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Migration Analytics</Text>
          
          <View style={styles.statsGrid}>
            <StatItem
              label="SPL Accounts"
              value={analytics.splAccountsCount.toString()}
            />
            <StatItem
              label="Compressed Accounts"
              value={analytics.compressedAccountsCount.toString()}
            />
            <StatItem
              label="Total Migrated"
              value={`${(Number(analytics.totalAmountMigrated) / 1e9).toFixed(4)}`}
            />
            <StatItem
              label="Cost Savings"
              value={`${(analytics.costSavings / 1e9).toFixed(4)} SOL`}
              valueColor="#14F195"
            />
          </View>

          {analytics.startedAt && (
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Started:</Text>
              <Text style={styles.timeValue}>
                {new Date(analytics.startedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {analytics.completedAt && (
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Completed:</Text>
              <Text style={styles.timeValue}>
                {new Date(analytics.completedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {analytics.errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{analytics.errorMessage}</Text>
            </View>
          )}
        </View>
      )}

      {/* Aggregated Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Platform Statistics</Text>
        
        <View style={styles.statsGrid}>
          <StatItem
            label="Total Users"
            value={aggregatedStats.totalUsers.toString()}
          />
          <StatItem
            label="Completed"
            value={aggregatedStats.completedMigrations.toString()}
          />
          <StatItem
            label="In Progress"
            value={aggregatedStats.inProgressMigrations.toString()}
          />
          <StatItem
            label="Failed"
            value={aggregatedStats.failedMigrations.toString()}
          />
        </View>

        <View style={styles.platformStats}>
          <View style={styles.platformStatItem}>
            <Text style={styles.platformStatLabel}>Migration Rate</Text>
            <Text style={styles.platformStatValue}>
              {aggregatedStats.migrationRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.platformStatItem}>
            <Text style={styles.platformStatLabel}>Total Savings</Text>
            <Text style={[styles.platformStatValue, { color: '#14F195' }]}>
              {(aggregatedStats.totalCostSavings / 1e9).toFixed(4)} SOL
            </Text>
          </View>
        </View>
      </View>

      {/* Cost Savings Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💰 Cost Savings Breakdown</Text>
        <Text style={styles.infoText}>
          {getCostSavings(1)}
        </Text>
        <Text style={styles.infoSubtext}>
          SPL Token Account: ~2,000,000 lamports{'\n'}
          Compressed Account: ~5,000 lamports{'\n'}
          Savings: ~1,995,000 lamports (399x)
        </Text>
      </View>
    </ScrollView>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  valueColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, valueColor = '#fff' }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeSuccess: {
    backgroundColor: '#14F19520',
  },
  badgeInactive: {
    backgroundColor: '#66666620',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14F195',
  },
  enableButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14F195',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f0f1e',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FF6B6B20',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  platformStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  platformStatItem: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  platformStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  platformStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#9945FF20',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#9945FF40',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#14F195',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
});
