import { PublicKey, Keypair } from '@solana/web3.js';
import { LightProtocolService } from '../../services/lightProtocol';
import { FeatureFlagService, FeatureFlag, MigrationPhase } from './FeatureFlagService';

/**
 * Migration status for tracking user progress
 */
export enum MigrationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

/**
 * Migration analytics data
 */
export interface MigrationAnalytics {
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  status: MigrationStatus;
  splAccountsCount: number;
  compressedAccountsCount: number;
  totalAmountMigrated: bigint;
  costSavings: number; // in lamports
  errorMessage?: string;
}

/**
 * Migration progress tracking
 */
export interface MigrationProgress {
  userId: string;
  totalAccounts: number;
  migratedAccounts: number;
  percentComplete: number;
  estimatedCostSavings: number; // in lamports
  currentStatus: MigrationStatus;
}

/**
 * Service for managing SPL to compressed token migration
 * Implements phase-based rollout with analytics and progress tracking
 */
export class MigrationService {
  private static instance: MigrationService;
  private lightProtocol: LightProtocolService;
  private featureFlags: FeatureFlagService;
  private analytics: Map<string, MigrationAnalytics> = new Map();
  private progress: Map<string, MigrationProgress> = new Map();

  private constructor(lightProtocol: LightProtocolService) {
    this.lightProtocol = lightProtocol;
    this.featureFlags = FeatureFlagService.getInstance();
  }

  static getInstance(lightProtocol: LightProtocolService): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService(lightProtocol);
    }
    return MigrationService.instance;
  }

  /**
   * Check if user is eligible for migration
   */
  isEligibleForMigration(userId: string): boolean {
    const phase = this.featureFlags.getPhase();
    
    // Phase 1: Beta testers only
    if (phase === MigrationPhase.PHASE_1_PARALLEL) {
      return this.featureFlags.isFeatureEnabled(FeatureFlag.COMPRESSED_TOKENS, userId);
    }
    
    // Phase 2+: All users eligible
    return true;
  }

  /**
   * Check if auto-compression is enabled for user
   */
  isAutoCompressionEnabled(userId: string): boolean {
    return this.featureFlags.isFeatureEnabled(FeatureFlag.AUTO_COMPRESSION, userId);
  }

  /**
   * Migrate SPL tokens to compressed format
   */
  async migrateToCompressed(
    userId: string,
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    owner: Keypair
  ): Promise<string> {
    // Check eligibility
    if (!this.isEligibleForMigration(userId)) {
      throw new Error('User not eligible for migration in current phase');
    }

    // Initialize analytics
    const analytics: MigrationAnalytics = {
      userId,
      startedAt: new Date(),
      status: MigrationStatus.IN_PROGRESS,
      splAccountsCount: 1,
      compressedAccountsCount: 0,
      totalAmountMigrated: 0n,
      costSavings: 0,
    };
    this.analytics.set(userId, analytics);

    // Initialize progress
    const progress: MigrationProgress = {
      userId,
      totalAccounts: 1,
      migratedAccounts: 0,
      percentComplete: 0,
      estimatedCostSavings: this.calculateCostSavings(1),
      currentStatus: MigrationStatus.IN_PROGRESS,
    };
    this.progress.set(userId, progress);

    try {
      // Compress tokens
      const signature = await this.lightProtocol.compressTokens(
        payer,
        mint,
        amount,
        owner
      );

      // Update analytics
      analytics.status = MigrationStatus.COMPLETED;
      analytics.completedAt = new Date();
      analytics.compressedAccountsCount = 1;
      analytics.totalAmountMigrated = amount;
      analytics.costSavings = this.calculateCostSavings(1);
      this.analytics.set(userId, analytics);

      // Update progress
      progress.migratedAccounts = 1;
      progress.percentComplete = 100;
      progress.currentStatus = MigrationStatus.COMPLETED;
      this.progress.set(userId, progress);

      // Enable compressed tokens for user
      this.featureFlags.enableCompressedTokens(userId);

      console.log(`Migration completed for user ${userId}: ${signature}`);
      return signature;
    } catch (error) {
      // Update analytics with error
      analytics.status = MigrationStatus.FAILED;
      analytics.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.analytics.set(userId, analytics);

      // Update progress
      progress.currentStatus = MigrationStatus.FAILED;
      this.progress.set(userId, progress);

      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Automatically compress tokens on deposit (Phase 3+)
   */
  async autoCompressOnDeposit(
    userId: string,
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    owner: Keypair
  ): Promise<string> {
    // Check if auto-compression is enabled
    if (!this.isAutoCompressionEnabled(userId)) {
      throw new Error('Auto-compression not enabled for user');
    }

    try {
      const signature = await this.lightProtocol.compressTokens(
        payer,
        mint,
        amount,
        owner
      );

      // Track analytics
      this.trackAutoCompression(userId, amount);

      return signature;
    } catch (error) {
      console.error('Auto-compression failed:', error);
      throw error;
    }
  }

  /**
   * Get migration progress for a user
   */
  getMigrationProgress(userId: string): MigrationProgress | null {
    return this.progress.get(userId) || null;
  }

  /**
   * Get migration analytics for a user
   */
  getMigrationAnalytics(userId: string): MigrationAnalytics | null {
    return this.analytics.get(userId) || null;
  }

  /**
   * Get aggregated migration statistics
   */
  getAggregatedStats(): {
    totalUsers: number;
    completedMigrations: number;
    inProgressMigrations: number;
    failedMigrations: number;
    totalCostSavings: number;
    migrationRate: number;
  } {
    const allAnalytics = Array.from(this.analytics.values());
    
    const completed = allAnalytics.filter(a => a.status === MigrationStatus.COMPLETED).length;
    const inProgress = allAnalytics.filter(a => a.status === MigrationStatus.IN_PROGRESS).length;
    const failed = allAnalytics.filter(a => a.status === MigrationStatus.FAILED).length;
    const totalCostSavings = allAnalytics.reduce((sum, a) => sum + a.costSavings, 0);

    return {
      totalUsers: allAnalytics.length,
      completedMigrations: completed,
      inProgressMigrations: inProgress,
      failedMigrations: failed,
      totalCostSavings,
      migrationRate: allAnalytics.length > 0 ? (completed / allAnalytics.length) * 100 : 0,
    };
  }

  /**
   * Calculate cost savings for migrating N accounts
   * SPL account: ~2,000,000 lamports
   * Compressed account: ~5,000 lamports
   * Savings per account: ~1,995,000 lamports (399x)
   */
  private calculateCostSavings(accountCount: number): number {
    const SPL_ACCOUNT_COST = 2_000_000;
    const COMPRESSED_ACCOUNT_COST = 5_000;
    const SAVINGS_PER_ACCOUNT = SPL_ACCOUNT_COST - COMPRESSED_ACCOUNT_COST;
    return accountCount * SAVINGS_PER_ACCOUNT;
  }

  /**
   * Track auto-compression analytics
   */
  private trackAutoCompression(userId: string, amount: bigint): void {
    let analytics = this.analytics.get(userId);
    
    if (!analytics) {
      analytics = {
        userId,
        startedAt: new Date(),
        status: MigrationStatus.COMPLETED,
        splAccountsCount: 0,
        compressedAccountsCount: 1,
        totalAmountMigrated: amount,
        costSavings: this.calculateCostSavings(1),
      };
    } else {
      analytics.compressedAccountsCount += 1;
      analytics.totalAmountMigrated += amount;
      analytics.costSavings = this.calculateCostSavings(analytics.compressedAccountsCount);
    }
    
    this.analytics.set(userId, analytics);
  }

  /**
   * Reset migration for a user (for testing/rollback)
   */
  resetMigration(userId: string): void {
    this.analytics.delete(userId);
    this.progress.delete(userId);
  }

  /**
   * Export analytics data for reporting
   */
  exportAnalytics(): MigrationAnalytics[] {
    return Array.from(this.analytics.values());
  }

  /**
   * Get cost savings display text
   */
  getCostSavingsDisplay(accountCount: number): string {
    const savings = this.calculateCostSavings(accountCount);
    const savingsSOL = savings / 1e9;
    const multiplier = 399; // 1,995,000 / 5,000 ≈ 399x
    
    return `Save ${savingsSOL.toFixed(4)} SOL (${multiplier}x cost reduction)`;
  }
}
