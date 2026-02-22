/**
 * Helius RPC Integration for Magic Roulette Monitoring
 * 
 * Provides comprehensive transaction tracking, analytics, and audit capabilities
 * using Helius Enhanced Transaction API.
 */

import { Connection, PublicKey } from "@solana/web3.js";

export interface HeliusConfig {
  apiKey: string;
  cluster: "mainnet" | "devnet";
}

export interface TransactionFilter {
  slot?: {
    gte?: number;
    gt?: number;
    lte?: number;
    lt?: number;
  };
  blockTime?: {
    gte?: number;
    gt?: number;
    lte?: number;
    lt?: number;
    eq?: number;
  };
  signature?: {
    gte?: string;
    gt?: string;
    lte?: string;
    lt?: string;
  };
  status?: "succeeded" | "failed" | "any";
  tokenAccounts?: "none" | "balanceChanged" | "all";
}

export interface TransactionQuery {
  address: string;
  transactionDetails?: "signatures" | "full";
  sortOrder?: "asc" | "desc";
  commitment?: "confirmed" | "finalized";
  minContextSlot?: number;
  limit?: number;
  paginationToken?: string;
  encoding?: "json" | "jsonParsed" | "base58" | "base64";
  maxSupportedTransactionVersion?: number;
  filters?: TransactionFilter;
}

export interface TransactionSignature {
  signature: string;
  slot: number;
  transactionIndex: number;
  err: object | null;
  memo: string | null;
  blockTime: number | null;
  confirmationStatus: "processed" | "confirmed" | "finalized" | null;
}

export interface TransactionFull {
  slot: number;
  transactionIndex: number;
  transaction: any;
  meta: any;
  blockTime: number | null;
}

export interface TransactionResponse {
  data: (TransactionSignature | TransactionFull)[];
  paginationToken: string | null;
}

export class HeliusMonitor {
  private apiKey: string;
  private rpcUrl: string;

  constructor(config: HeliusConfig) {
    this.apiKey = config.apiKey;
    this.rpcUrl =
      config.cluster === "mainnet"
        ? `https://mainnet.helius-rpc.com?api-key=${config.apiKey}`
        : `https://devnet.helius-rpc.com?api-key=${config.apiKey}`;
  }

  /**
   * Get transactions for an address with advanced filtering
   */
  async getTransactionsForAddress(
    query: TransactionQuery
  ): Promise<TransactionResponse> {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getTransactionsForAddress",
        params: [
          query.address,
          {
            transactionDetails: query.transactionDetails || "signatures",
            sortOrder: query.sortOrder || "desc",
            commitment: query.commitment || "finalized",
            limit: query.limit || 100,
            ...(query.minContextSlot && { minContextSlot: query.minContextSlot }),
            ...(query.paginationToken && { paginationToken: query.paginationToken }),
            ...(query.encoding && { encoding: query.encoding }),
            ...(query.maxSupportedTransactionVersion && {
              maxSupportedTransactionVersion: query.maxSupportedTransactionVersion,
            }),
            ...(query.filters && { filters: query.filters }),
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Helius RPC Error: ${data.error.message}`);
    }

    return data.result;
  }

  /**
   * Monitor all games for a platform
   */
  async monitorPlatformGames(
    platformConfigAddress: string,
    options?: {
      startTime?: number;
      endTime?: number;
      status?: "succeeded" | "failed" | "any";
    }
  ): Promise<TransactionSignature[]> {
    const filters: TransactionFilter = {
      status: options?.status || "any",
    };

    if (options?.startTime || options?.endTime) {
      filters.blockTime = {};
      if (options.startTime) filters.blockTime.gte = options.startTime;
      if (options.endTime) filters.blockTime.lte = options.endTime;
    }

    const result = await this.getTransactionsForAddress({
      address: platformConfigAddress,
      transactionDetails: "signatures",
      sortOrder: "desc",
      limit: 1000,
      filters,
    });

    return result.data as TransactionSignature[];
  }

  /**
   * Get game history for a player
   */
  async getPlayerGameHistory(
    playerAddress: string,
    limit: number = 100
  ): Promise<TransactionSignature[]> {
    const result = await this.getTransactionsForAddress({
      address: playerAddress,
      transactionDetails: "signatures",
      sortOrder: "desc",
      limit,
      filters: {
        status: "succeeded",
      },
    });

    return result.data as TransactionSignature[];
  }

  /**
   * Get failed transactions for debugging
   */
  async getFailedTransactions(
    address: string,
    timeRange?: { start: number; end: number }
  ): Promise<TransactionFull[]> {
    const filters: TransactionFilter = {
      status: "failed",
    };

    if (timeRange) {
      filters.blockTime = {
        gte: timeRange.start,
        lte: timeRange.end,
      };
    }

    const result = await this.getTransactionsForAddress({
      address,
      transactionDetails: "full",
      sortOrder: "desc",
      limit: 100,
      filters,
      encoding: "jsonParsed",
    });

    return result.data as TransactionFull[];
  }

  /**
   * Get transactions in a specific time range
   */
  async getTransactionsByTimeRange(
    address: string,
    startTime: number,
    endTime: number
  ): Promise<TransactionSignature[]> {
    const result = await this.getTransactionsForAddress({
      address,
      transactionDetails: "signatures",
      sortOrder: "asc",
      limit: 1000,
      filters: {
        blockTime: {
          gte: startTime,
          lte: endTime,
        },
        status: "any",
      },
    });

    return result.data as TransactionSignature[];
  }

  /**
   * Get transactions in a specific slot range
   */
  async getTransactionsBySlotRange(
    address: string,
    startSlot: number,
    endSlot: number
  ): Promise<TransactionSignature[]> {
    const result = await this.getTransactionsForAddress({
      address,
      transactionDetails: "signatures",
      sortOrder: "asc",
      limit: 1000,
      filters: {
        slot: {
          gte: startSlot,
          lte: endSlot,
        },
      },
    });

    return result.data as TransactionSignature[];
  }

  /**
   * Paginate through all transactions
   */
  async *paginateTransactions(
    address: string,
    options?: {
      transactionDetails?: "signatures" | "full";
      filters?: TransactionFilter;
      limit?: number;
    }
  ): AsyncGenerator<TransactionSignature[] | TransactionFull[]> {
    let paginationToken: string | null = null;

    do {
      const result = await this.getTransactionsForAddress({
        address,
        transactionDetails: options?.transactionDetails || "signatures",
        sortOrder: "desc",
        limit: options?.limit || 100,
        paginationToken: paginationToken || undefined,
        filters: options?.filters,
      });

      yield result.data;
      paginationToken = result.paginationToken;
    } while (paginationToken);
  }

  /**
   * Get analytics for a game
   */
  async getGameAnalytics(gameAddress: string): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    firstTransaction: TransactionSignature | null;
    lastTransaction: TransactionSignature | null;
  }> {
    const allTransactions: TransactionSignature[] = [];

    for await (const batch of this.paginateTransactions(gameAddress, {
      transactionDetails: "signatures",
      limit: 1000,
    })) {
      allTransactions.push(...(batch as TransactionSignature[]));
    }

    const successful = allTransactions.filter((tx) => tx.err === null);
    const failed = allTransactions.filter((tx) => tx.err !== null);

    return {
      totalTransactions: allTransactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      firstTransaction: allTransactions[allTransactions.length - 1] || null,
      lastTransaction: allTransactions[0] || null,
    };
  }

  /**
   * Monitor for suspicious activity
   */
  async detectAnomalies(
    platformAddress: string,
    timeWindow: number = 3600 // 1 hour
  ): Promise<{
    highFailureRate: boolean;
    unusualVolume: boolean;
    suspiciousPatterns: string[];
  }> {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - timeWindow;

    const transactions = await this.getTransactionsByTimeRange(
      platformAddress,
      startTime,
      now
    );

    const failed = transactions.filter((tx) => tx.err !== null);
    const failureRate = failed.length / transactions.length;

    const suspiciousPatterns: string[] = [];

    // High failure rate
    const highFailureRate = failureRate > 0.3; // 30% failure rate
    if (highFailureRate) {
      suspiciousPatterns.push(
        `High failure rate: ${(failureRate * 100).toFixed(2)}%`
      );
    }

    // Unusual volume
    const avgTxPerHour = 100; // Expected average
    const unusualVolume = transactions.length > avgTxPerHour * 3;
    if (unusualVolume) {
      suspiciousPatterns.push(
        `Unusual volume: ${transactions.length} transactions in ${timeWindow}s`
      );
    }

    // Check for rapid-fire transactions (potential bot)
    const timestamps = transactions
      .map((tx) => tx.blockTime)
      .filter((t): t is number => t !== null)
      .sort();

    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i - 1] < 1) {
        // Less than 1 second apart
        suspiciousPatterns.push("Rapid-fire transactions detected");
        break;
      }
    }

    return {
      highFailureRate,
      unusualVolume,
      suspiciousPatterns,
    };
  }
}

/**
 * Example usage:
 * 
 * const monitor = new HeliusMonitor({
 *   apiKey: "your-helius-api-key",
 *   cluster: "devnet",
 * });
 * 
 * // Get all games
 * const games = await monitor.monitorPlatformGames(platformConfigAddress);
 * 
 * // Get player history
 * const history = await monitor.getPlayerGameHistory(playerAddress);
 * 
 * // Detect anomalies
 * const anomalies = await monitor.detectAnomalies(platformAddress);
 * if (anomalies.suspiciousPatterns.length > 0) {
 *   console.warn("Suspicious activity detected:", anomalies);
 * }
 */
