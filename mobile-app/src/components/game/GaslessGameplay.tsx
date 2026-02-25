/**
 * Gasless Gameplay Component
 * Demonstrates zero-gas shot execution with Ephemeral Rollups
 * No wallet popups during gameplay
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AnchorProvider } from '@coral-xyz/anchor';
import { useWallet } from '../../contexts/WalletContext';
import { useGaslessGame, useGaslessPerformance } from '../../hooks/useGaslessGame';

interface GaslessGameplayProps {
  provider: AnchorProvider;
  gameId: number;
  onGameFinish?: () => void;
}

export const GaslessGameplay: React.FC<GaslessGameplayProps> = ({
  provider,
  gameId,
  onGameFinish,
}) => {
  const wallet = useWallet();
  const gaslessGame = useGaslessGame(provider);
  const performance = useGaslessPerformance();
  const [initialized, setInitialized] = useState(false);

  // Initialize gasless gameplay on mount
  useEffect(() => {
    const initialize = async () => {
      if (!initialized && wallet.connected) {
        try {
          await gaslessGame.initializeGaslessGame(gameId, 6);
          setInitialized(true);
        } catch (error) {
          console.error('Failed to initialize gasless gameplay:', error);
        }
      }
    };

    initialize();
  }, [gameId, wallet.connected, initialized]);

  // Handle shot execution
  const handleShot = async () => {
    try {
      const result = await gaslessGame.executeShot(gameId);
      
      // Record performance metrics
      performance.recordShot(result.latency, result.success);

      // Check if game is over
      if (result.gameOver) {
        await gaslessGame.finishGame(gameId);
        onGameFinish?.();
      }
    } catch (error: any) {
      console.error('Shot failed:', error);
    }
  };

  if (!wallet.connected) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please connect your wallet to play</Text>
      </View>
    );
  }

  if (!initialized || !gaslessGame.isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={styles.message}>Initializing gasless gameplay...</Text>
        <Text style={styles.subMessage}>
          Delegating to Ephemeral Rollup for zero-gas shots
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>🎮 Gasless Gameplay Active</Text>
        {wallet.gameSession && (
          <Text style={styles.sessionDetails}>
            Shots: {wallet.gameSession.shotsTaken}/{wallet.gameSession.maxShots}
          </Text>
        )}
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.metricsTitle}>⚡ Performance</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Avg Latency</Text>
            <Text style={styles.metricValue}>
              {gaslessGame.averageLatency?.toFixed(1) || '0'}ms
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Total Shots</Text>
            <Text style={styles.metricValue}>{performance.metrics.totalShots}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Success Rate</Text>
            <Text style={styles.metricValue}>
              {performance.metrics.successRate.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Last Shot Result */}
      {gaslessGame.lastShotResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Shot</Text>
          <Text style={styles.resultText}>
            Chamber: {gaslessGame.lastShotResult.chamber}
          </Text>
          <Text style={styles.resultText}>
            Result: {gaslessGame.lastShotResult.isBullet ? '💥 Bullet!' : '✅ Safe'}
          </Text>
          <Text style={styles.resultText}>
            Latency: {gaslessGame.lastShotResult.latency}ms
          </Text>
        </View>
      )}

      {/* Shoot Button */}
      <TouchableOpacity
        style={[styles.shootButton, gaslessGame.isLoading && styles.shootButtonDisabled]}
        onPress={handleShot}
        disabled={gaslessGame.isLoading}
      >
        {gaslessGame.isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.shootButtonText}>🎯 Take Shot (Zero Gas)</Text>
        )}
      </TouchableOpacity>

      {/* Error Display */}
      {gaslessGame.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {gaslessGame.error}</Text>
        </View>
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          ℹ️ Shots execute instantly on Ephemeral Rollup with zero gas fees.
          No wallet popups during gameplay!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  sessionInfo: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sessionDetails: {
    fontSize: 14,
    color: '#aaa',
  },
  metricsContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9945FF',
  },
  resultContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  shootButton: {
    backgroundColor: '#9945FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  shootButtonDisabled: {
    backgroundColor: '#555',
  },
  shootButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#fff',
  },
  infoBanner: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9945FF',
  },
  infoText: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 18,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subMessage: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
});
