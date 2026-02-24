/**
 * Migration module exports
 * Provides SPL to compressed token migration functionality with phase-based rollout
 */

export { FeatureFlagService, FeatureFlag, MigrationPhase } from './FeatureFlagService';
export { MigrationService, MigrationStatus } from './MigrationService';
export type { MigrationAnalytics, MigrationProgress } from './MigrationService';
