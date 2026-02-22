/**
 * Analytics Dashboard for Magic Roulette
 * 
 * Provides real-time analytics and monitoring using Helius RPC
 */

import { HeliusMonitor, TransactionSignature } from "./helius-integration";
import { PublicKey } from "@solana/web3.js";

export interface PlatformMetrics {
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalVolume: number;
  totalPlayers: number;
  averageGameDuration: number;
  successRate: number;
}

export interface PlayerMetrics {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalWagered: number;
  totalWinnings: number;
  netProfit: number;
  averageBet: number;
}

export interface GameMetrics {
  gameId: number;
  creator: string;
  players: string[];
  entryFee: number;
  totalPot: number;
  winner: string | null;
  duration: number;
  shotsTaken: number;
  status: string;
}

export class AnalyticsDashboard {
  private monitor: HeliusMonitor;
  private programId: PublicKey;

  constructor(heliusApiKey: string, programId: string, cluster: "mainnet" | "devnet") {
    this.monitor = new HeliusMonitor({
      apiKey: heliusApiKey,
      cluster,
    });
    this.programId = new PublicKey(programId);
  }

  /**
   * Get platform-wide metrics
   */
  async getPlatformMetrics(
    platformConfigAddress: string,
    timeRange?: { start: number; end: number }
  ): Promise<PlatformMetrics> {
    const transactions = timeRange
      ? await this.monitor.getTransactionsByTimeRange(
          platformConfigAddress,
          timeRange.start,
          timeRange.end
        )
      : await this.getAllTransactions(platformConfigAddress);

    const successful = transactions.filter((tx) => tx.err === null);
    const failed = transactions.filter((tx) => tx.err !== null);

    // Parse transaction data to extract metrics
    // This is simplified - in production, you'd parse the actual transaction data
    const totalGames = Math.floor(transactions.length / 10); // Estimate
    const completedGames = Math.floor(successful.length / 8); // Estimate

    return {
      totalGames,
      activeGames: totalGames - completedGames,
      completedGames,
      totalVolume: 0, // Would parse from transaction data
      totalPlayers: 0, // Would parse from transaction data
      averageGameDuration: 0, // Would calculate from timestamps
      successRate: successful.length / transactions.length,
    };
  }

  /**
   * Get player-specific metrics
   */
  async getPlayerMetrics(playerAddress: string): Promise<PlayerMetrics> {
    const history = await this.monitor.getPlayerGameHistory(playerAddress, 1000);

    // Parse transaction data to extract player metrics
    // This is simplified - in production, you'd parse the actual transaction data
    const gamesPlayed = Math.floor(history.length / 5); // Estimate
    const gamesWon = Math.floor(gamesPlayed * 0.4); // Estimate

    return {
      gamesPlayed,
      gamesWon,
      winRate: gamesWon / gamesPlayed,
      totalWagered: 0, // Would parse from transaction data
      totalWinnings: 0, // Would parse from transaction data
      netProfit: 0, // totalWinnings - totalWagered
      averageBet: 0, // totalWagered / gamesPlayed
    };
  }

  /**
   * Get real-time game monitoring
   */
  async monitorActiveGames(
    platformAddress: string
  ): Promise<{
    activeGames: number;
    recentActivity: TransactionSignature[];
    alerts: string[];
  }> {
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 300;

    const recentActivity = await this.monitor.getTransactionsByTimeRange(
      platformAddress,
      fiveMinutesAgo,
      now
    );

    // Detect anomalies
    const anomalies = await this.monitor.detectAnomalies(platformAddress, 300);

    const alerts: string[] = [];
    if (anomalies.highFailureRate) {
      alerts.push("⚠️ High failure rate detected");
    }
    if (anomalies.unusualVolume) {
      alerts.push("⚠️ Unusual transaction volume");
    }
    alerts.push(...anomalies.suspiciousPatterns.map((p) => `⚠️ ${p}`));

    return {
      activeGames: Math.floor(recentActivity.length / 3), // Estimate
      recentActivity: recentActivity.slice(0, 10),
      alerts,
    };
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(
    limit: number = 10
  ): Promise<
    Array<{
      player: string;
      gamesWon: number;
      winRate: number;
      totalWinnings: number;
    }>
  > {
    // This would require indexing all players
    // For now, return empty array
    // In production, you'd maintain a database of player stats
    return [];
  }

  /**
   * Get treasury analytics
   */
  async getTreasuryAnalytics(
    treasuryAddress: string
  ): Promise<{
    currentBalance: number;
    totalCollected: number;
    totalDistributed: number;
    rewardRate: number;
  }> {
    const transactions = await this.getAllTransactions(treasuryAddress);

    // Parse transaction data to calculate treasury metrics
    return {
      currentBalance: 0, // Would query on-chain
      totalCollected: 0, // Sum of all incoming
      totalDistributed: 0, // Sum of all outgoing
      rewardRate: 0, // totalDistributed / totalCollected
    };
  }

  /**
   * Export analytics report
   */
  async generateReport(
    platformAddress: string,
    timeRange: { start: number; end: number }
  ): Promise<{
    period: { start: Date; end: Date };
    platform: PlatformMetrics;
    topPlayers: Array<{ player: string; metrics: PlayerMetrics }>;
    treasury: any;
    anomalies: any;
  }> {
    const [platform, anomalies] = await Promise.all([
      this.getPlatformMetrics(platformAddress, timeRange),
      this.monitor.detectAnomalies(
        platformAddress,
        timeRange.end - timeRange.start
      ),
    ]);

    return {
      period: {
        start: new Date(timeRange.start * 1000),
        end: new Date(timeRange.end * 1000),
      },
      platform,
      topPlayers: [], // Would fetch top players
      treasury: {}, // Would fetch treasury data
      anomalies,
    };
  }

  /**
   * Helper: Get all transactions for an address
   */
  private async getAllTransactions(
    address: string
  ): Promise<TransactionSignature[]> {
    const allTransactions: TransactionSignature[] = [];

    for await (const batch of this.monitor.paginateTransactions(address, {
      transactionDetails: "signatures",
      limit: 1000,
    })) {
      allTransactions.push(...(batch as TransactionSignature[]));
    }

    return allTransactions;
  }
}

/**
 * Example usage:
 * 
 * const dashboard = new AnalyticsDashboard(
 *   "your-helius-api-key",
 *   "MRou1etteGameFi11111111111111111111111111111",
 *   "devnet"
 * );
 * 
 * // Get platform metrics
 * const metrics = await dashboard.getPlatformMetrics(platformConfigAddress);
 * console.log("Total games:", metrics.totalGames);
 * console.log("Success rate:", (metrics.successRate * 100).toFixed(2) + "%");
 * 
 * // Monitor active games
 * const monitoring = await dashboard.monitorActiveGames(platformAddress);
 * if (monitoring.alerts.length > 0) {
 *   console.warn("Alerts:", monitoring.alerts);
 * }
 * 
 * // Generate report
 * const report = await dashboard.generateReport(platformAddress, {
 *   start: Math.floor(Date.now() / 1000) - 86400, // Last 24 hours
 *   end: Math.floor(Date.now() / 1000),
 * });
 * console.log("Report:", JSON.stringify(report, null, 2));
 */
