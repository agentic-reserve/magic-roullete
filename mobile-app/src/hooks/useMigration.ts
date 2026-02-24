import { useState, useCallback, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { MigrationService, MigrationProgress, MigrationAnalytics } from '../lib/migration/MigrationService';
import { FeatureFlagService, FeatureFlag } from '../lib/migration/FeatureFlagService';
import { createLightProtocolService } from '../services/lightProtocol';
import { useProgram } from './useProgram';

/**
 * Hook for managing compressed token migration
 * Provides methods for checking eligibility, migrating tokens, and tracking progress
 */
export const useMigration = (userId: string) => {
  const { provider } = useProgram();
  const [showPrompt, setShowPrompt] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [analytics, setAnalytics] = useState<MigrationAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  const lightProtocol = createLightProtocolService(
    process.env.EXPO_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com'
  );
  const migrationService = MigrationService.getInstance(lightProtocol);
  const featureFlags = FeatureFlagService.getInstance();

  /**
   * Check if user is eligible for migration
   */
  const isEligible = useCallback((): boolean => {
    return migrationService.isEligibleForMigration(userId);
  }, [userId, migrationService]);

  /**
   * Check if auto-compression is enabled
   */
  const isAutoCompressionEnabled = useCallback((): boolean => {
    return migrationService.isAutoCompressionEnabled(userId);
  }, [userId, migrationService]);

  /**
   * Check if migration prompt should be shown
   */
  const shouldShowPrompt = useCallback((): boolean => {
    return featureFlags.shouldShowMigrationPrompt(userId) && isEligible();
  }, [userId, featureFlags, isEligible]);

  /**
   * Migrate SPL tokens to compressed format
   */
  const migrate = useCallback(
    async (mint: PublicKey, amount: bigint): Promise<string> => {
      if (!provider?.wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: Get keypairs from wallet adapter
        // For now, this is a placeholder
        throw new Error('Migration not yet fully implemented - wallet adapter integration needed');

        // const signature = await migrationService.migrateToCompressed(
        //   userId,
        //   payerKeypair,
        //   mint,
        //   amount,
        //   ownerKeypair
        // );

        // // Update progress
        // const newProgress = migrationService.getMigrationProgress(userId);
        // setProgress(newProgress);

        // // Update analytics
        // const newAnalytics = migrationService.getMigrationAnalytics(userId);
        // setAnalytics(newAnalytics);

        // return signature;
      } catch (err: any) {
        const errorMsg = err.message || 'Migration failed';
        setError(errorMsg);
        console.error('Migration error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, userId, migrationService]
  );

  /**
   * Enable auto-compression for deposits
   */
  const enableAutoCompression = useCallback(() => {
    featureFlags.enableAutoCompression(userId);
  }, [userId, featureFlags]);

  /**
   * Opt out of migration
   */
  const optOut = useCallback(() => {
    featureFlags.optOut(userId);
    setShowPrompt(false);
  }, [userId, featureFlags]);

  /**
   * Opt in to migration
   */
  const optIn = useCallback(() => {
    featureFlags.optIn(userId);
  }, [userId, featureFlags]);

  /**
   * Dismiss migration prompt
   */
  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  /**
   * Get migration progress
   */
  const getProgress = useCallback((): MigrationProgress | null => {
    return migrationService.getMigrationProgress(userId);
  }, [userId, migrationService]);

  /**
   * Get migration analytics
   */
  const getAnalytics = useCallback((): MigrationAnalytics | null => {
    return migrationService.getMigrationAnalytics(userId);
  }, [userId, migrationService]);

  /**
   * Get cost savings display text
   */
  const getCostSavings = useCallback((accountCount: number = 1): string => {
    return migrationService.getCostSavingsDisplay(accountCount);
  }, [migrationService]);

  /**
   * Get aggregated migration statistics
   */
  const getAggregatedStats = useCallback(() => {
    return migrationService.getAggregatedStats();
  }, [migrationService]);

  // Check if prompt should be shown on mount
  useEffect(() => {
    if (shouldShowPrompt()) {
      // Show prompt after a short delay to avoid interrupting initial load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowPrompt]);

  // Load progress and analytics on mount
  useEffect(() => {
    const loadedProgress = getProgress();
    const loadedAnalytics = getAnalytics();
    
    if (loadedProgress) {
      setProgress(loadedProgress);
    }
    if (loadedAnalytics) {
      setAnalytics(loadedAnalytics);
    }
  }, [getProgress, getAnalytics]);

  return {
    // State
    showPrompt,
    progress,
    analytics,
    loading,
    error,

    // Eligibility
    isEligible: isEligible(),
    isAutoCompressionEnabled: isAutoCompressionEnabled(),
    shouldShowPrompt: shouldShowPrompt(),

    // Actions
    migrate,
    enableAutoCompression,
    optOut,
    optIn,
    dismissPrompt,

    // Getters
    getProgress,
    getAnalytics,
    getCostSavings,
    getAggregatedStats,

    // Prompt control
    setShowPrompt,
  };
};
