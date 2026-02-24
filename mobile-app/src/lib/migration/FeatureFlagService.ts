/**
 * Feature Flag Service for gradual rollout of Q2 2026 features
 * Enables phase-based migration from SPL to compressed tokens
 */

export enum FeatureFlag {
  COMPRESSED_TOKENS = 'compressed_tokens',
  AUTO_COMPRESSION = 'auto_compression',
  MIGRATION_PROMPTS = 'migration_prompts',
}

export enum MigrationPhase {
  PHASE_1_PARALLEL = 'phase_1_parallel',       // Beta testers only, opt-in
  PHASE_2_GRADUAL = 'phase_2_gradual',         // All users, opt-out available
  PHASE_3_FULL = 'phase_3_full',               // Default compressed, auto-migration
  PHASE_4_DEPRECATION = 'phase_4_deprecation', // Compressed only
}

interface FeatureFlagConfig {
  enabled: boolean;
  phase: MigrationPhase;
  betaTestersOnly: boolean;
  allowOptOut: boolean;
}

interface UserFlags {
  userId: string;
  compressedTokensEnabled: boolean;
  autoCompressionEnabled: boolean;
  migrationPromptsEnabled: boolean;
  hasOptedOut: boolean;
  isBetaTester: boolean;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private currentPhase: MigrationPhase = MigrationPhase.PHASE_1_PARALLEL;
  private userFlags: Map<string, UserFlags> = new Map();

  private constructor() {}

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Set the current migration phase
   */
  setPhase(phase: MigrationPhase): void {
    this.currentPhase = phase;
    console.log(`Migration phase set to: ${phase}`);
  }

  /**
   * Get the current migration phase
   */
  getPhase(): MigrationPhase {
    return this.currentPhase;
  }

  /**
   * Check if a feature is enabled for a specific user
   */
  isFeatureEnabled(flag: FeatureFlag, userId: string): boolean {
    const userFlags = this.getUserFlags(userId);
    const config = this.getFeatureConfig(flag);

    // Check if user has opted out
    if (config.allowOptOut && userFlags.hasOptedOut) {
      return false;
    }

    // Check beta tester restriction
    if (config.betaTestersOnly && !userFlags.isBetaTester) {
      return false;
    }

    // Check feature-specific flags
    switch (flag) {
      case FeatureFlag.COMPRESSED_TOKENS:
        return config.enabled && userFlags.compressedTokensEnabled;
      case FeatureFlag.AUTO_COMPRESSION:
        return config.enabled && userFlags.autoCompressionEnabled;
      case FeatureFlag.MIGRATION_PROMPTS:
        return config.enabled && userFlags.migrationPromptsEnabled;
      default:
        return false;
    }
  }

  /**
   * Get feature configuration based on current phase
   */
  private getFeatureConfig(flag: FeatureFlag): FeatureFlagConfig {
    switch (this.currentPhase) {
      case MigrationPhase.PHASE_1_PARALLEL:
        return {
          enabled: flag === FeatureFlag.COMPRESSED_TOKENS,
          phase: MigrationPhase.PHASE_1_PARALLEL,
          betaTestersOnly: true,
          allowOptOut: true,
        };

      case MigrationPhase.PHASE_2_GRADUAL:
        return {
          enabled: true,
          phase: MigrationPhase.PHASE_2_GRADUAL,
          betaTestersOnly: false,
          allowOptOut: true,
        };

      case MigrationPhase.PHASE_3_FULL:
        return {
          enabled: true,
          phase: MigrationPhase.PHASE_3_FULL,
          betaTestersOnly: false,
          allowOptOut: false,
        };

      case MigrationPhase.PHASE_4_DEPRECATION:
        return {
          enabled: flag !== FeatureFlag.MIGRATION_PROMPTS, // No prompts needed
          phase: MigrationPhase.PHASE_4_DEPRECATION,
          betaTestersOnly: false,
          allowOptOut: false,
        };

      default:
        return {
          enabled: false,
          phase: MigrationPhase.PHASE_1_PARALLEL,
          betaTestersOnly: true,
          allowOptOut: true,
        };
    }
  }

  /**
   * Get user-specific flags
   */
  private getUserFlags(userId: string): UserFlags {
    if (!this.userFlags.has(userId)) {
      // Initialize with defaults based on current phase
      const defaultFlags: UserFlags = {
        userId,
        compressedTokensEnabled: false,
        autoCompressionEnabled: false,
        migrationPromptsEnabled: true,
        hasOptedOut: false,
        isBetaTester: false,
      };
      this.userFlags.set(userId, defaultFlags);
    }
    return this.userFlags.get(userId)!;
  }

  /**
   * Enable compressed tokens for a user
   */
  enableCompressedTokens(userId: string): void {
    const flags = this.getUserFlags(userId);
    flags.compressedTokensEnabled = true;
    this.userFlags.set(userId, flags);
  }

  /**
   * Enable auto-compression for a user
   */
  enableAutoCompression(userId: string): void {
    const flags = this.getUserFlags(userId);
    flags.autoCompressionEnabled = true;
    this.userFlags.set(userId, flags);
  }

  /**
   * Mark user as beta tester
   */
  markAsBetaTester(userId: string): void {
    const flags = this.getUserFlags(userId);
    flags.isBetaTester = true;
    this.userFlags.set(userId, flags);
  }

  /**
   * Allow user to opt out of migration
   */
  optOut(userId: string): void {
    const flags = this.getUserFlags(userId);
    flags.hasOptedOut = true;
    flags.compressedTokensEnabled = false;
    flags.autoCompressionEnabled = false;
    this.userFlags.set(userId, flags);
  }

  /**
   * Opt user back in to migration
   */
  optIn(userId: string): void {
    const flags = this.getUserFlags(userId);
    flags.hasOptedOut = false;
    flags.compressedTokensEnabled = true;
    this.userFlags.set(userId, flags);
  }

  /**
   * Dismiss migration prompts for a user
   */
  dismissMigrationPrompts(userId: string): void {
    const flags = this.getUserFlags(userId);
    flags.migrationPromptsEnabled = false;
    this.userFlags.set(userId, flags);
  }

  /**
   * Check if user should see migration prompts
   */
  shouldShowMigrationPrompt(userId: string): boolean {
    return this.isFeatureEnabled(FeatureFlag.MIGRATION_PROMPTS, userId);
  }

  /**
   * Get phase description for UI display
   */
  getPhaseDescription(): string {
    switch (this.currentPhase) {
      case MigrationPhase.PHASE_1_PARALLEL:
        return 'Beta testing compressed tokens (opt-in)';
      case MigrationPhase.PHASE_2_GRADUAL:
        return 'Gradual migration to compressed tokens';
      case MigrationPhase.PHASE_3_FULL:
        return 'Compressed tokens enabled by default';
      case MigrationPhase.PHASE_4_DEPRECATION:
        return 'Compressed tokens only';
      default:
        return 'Unknown phase';
    }
  }
}
