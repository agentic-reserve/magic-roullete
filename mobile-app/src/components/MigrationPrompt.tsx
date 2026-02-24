import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MigrationService } from '../lib/migration/MigrationService';
import { FeatureFlagService } from '../lib/migration/FeatureFlagService';

interface MigrationPromptProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onMigrate: () => Promise<void>;
  onDismiss: () => void;
}

/**
 * Modal prompt encouraging users to migrate to compressed tokens
 * Displays cost savings and migration benefits
 */
export const MigrationPrompt: React.FC<MigrationPromptProps> = ({
  visible,
  userId,
  onClose,
  onMigrate,
  onDismiss,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureFlags = FeatureFlagService.getInstance();
  const phase = featureFlags.getPhase();
  const phaseDescription = featureFlags.getPhaseDescription();

  const handleMigrate = async () => {
    try {
      setLoading(true);
      setError(null);
      await onMigrate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    featureFlags.dismissMigrationPrompts(userId);
    onDismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>💰</Text>
              <Text style={styles.title}>Upgrade to Compressed Tokens</Text>
              <Text style={styles.subtitle}>Save 399x on storage costs</Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              <BenefitItem
                icon="⚡"
                title="1000x Cost Savings"
                description="~5,000 lamports vs ~2M for SPL tokens"
              />
              <BenefitItem
                icon="🔒"
                title="Same Security"
                description="ZK Compression with L1 Solana guarantees"
              />
              <BenefitItem
                icon="🚀"
                title="Instant Migration"
                description="One-click upgrade, no downtime"
              />
              <BenefitItem
                icon="💸"
                title="Lower Fees"
                description="Reduced transaction costs for all operations"
              />
            </View>

            {/* Cost Comparison */}
            <View style={styles.comparison}>
              <Text style={styles.comparisonTitle}>Cost Comparison</Text>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>SPL Token</Text>
                  <Text style={styles.comparisonValueOld}>~2,000,000</Text>
                  <Text style={styles.comparisonUnit}>lamports</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>Compressed</Text>
                  <Text style={styles.comparisonValueNew}>~5,000</Text>
                  <Text style={styles.comparisonUnit}>lamports</Text>
                </View>
              </View>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 1,995,000 lamports per account!</Text>
              </View>
            </View>

            {/* Phase Info */}
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseLabel}>Current Phase:</Text>
              <Text style={styles.phaseText}>{phaseDescription}</Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleMigrate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Migrate Now</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleDismiss}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.learnMoreButton}
                onPress={() => {
                  // TODO: Open documentation
                  console.log('Open migration docs');
                }}
              >
                <Text style={styles.learnMoreText}>Learn More →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => (
  <View style={styles.benefitItem}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <View style={styles.benefitContent}>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    maxWidth: 500,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#14F195',
    fontWeight: '600',
  },
  benefits: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  comparison: {
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonValueOld: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
    textDecorationLine: 'line-through',
  },
  comparisonValueNew: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14F195',
  },
  comparisonUnit: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#9945FF',
  },
  savingsBadge: {
    backgroundColor: '#14F19520',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14F195',
  },
  phaseInfo: {
    backgroundColor: '#9945FF20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  phaseLabel: {
    fontSize: 11,
    color: '#9945FF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phaseText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FF6B6B20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#9945FF',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  learnMoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    color: '#9945FF',
    fontWeight: '600',
  },
});
