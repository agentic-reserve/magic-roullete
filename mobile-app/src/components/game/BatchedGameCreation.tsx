import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTransactionBatching } from '../../hooks/useTransactionBatching';

/**
 * Batched Game Creation Component
 * 
 * Demonstrates transaction batching for game creation.
 * Combines entry fee deposit + game creation into single transaction
 * requiring only one wallet approval.
 * 
 * Benefits:
 * - Single wallet popup instead of two
 * - Faster execution (one transaction vs two)
 * - Better UX (less interruption)
 * - Lower total fees (one transaction fee)
 */
export function BatchedGameCreation() {
  const { batchCreateGame, executing, error } = useTransactionBatching();
  const [gameMode, setGameMode] = useState<'OneVsOne' | 'TwoVsTwo'>('OneVsOne');
  const [entryFee, setEntryFee] = useState(0.1);
  const [useCompressed, setUseCompressed] = useState(true);

  const handleCreateGame = async () => {
    const signature = await batchCreateGame(gameMode, entryFee, useCompressed);
    
    if (signature) {
      console.log('Game created successfully:', signature);
      // Navigate to game lobby or show success message
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Game (Batched)</Text>
      <Text style={styles.subtitle}>
        Single wallet approval for deposit + creation
      </Text>

      {/* Game Mode Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Game Mode</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              gameMode === 'OneVsOne' && styles.modeButtonActive,
            ]}
            onPress={() => setGameMode('OneVsOne')}
          >
            <Text
              style={[
                styles.modeButtonText,
                gameMode === 'OneVsOne' && styles.modeButtonTextActive,
              ]}
            >
              1v1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              gameMode === 'TwoVsTwo' && styles.modeButtonActive,
            ]}
            onPress={() => setGameMode('TwoVsTwo')}
          >
            <Text
              style={[
                styles.modeButtonText,
                gameMode === 'TwoVsTwo' && styles.modeButtonTextActive,
              ]}
            >
              2v2
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Entry Fee */}
      <View style={styles.section}>
        <Text style={styles.label}>Entry Fee: {entryFee} SOL</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.feeButton}
            onPress={() => setEntryFee(0.1)}
          >
            <Text style={styles.feeButtonText}>0.1 SOL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.feeButton}
            onPress={() => setEntryFee(0.5)}
          >
            <Text style={styles.feeButtonText}>0.5 SOL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.feeButton}
            onPress={() => setEntryFee(1.0)}
          >
            <Text style={styles.feeButtonText}>1.0 SOL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compressed Tokens Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setUseCompressed(!useCompressed)}
        >
          <View style={[styles.checkbox, useCompressed && styles.checkboxChecked]}>
            {useCompressed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxLabel}>
            <Text style={styles.label}>Use Compressed Tokens</Text>
            <Text style={styles.sublabel}>1000x cost savings</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Batching Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🚀 Transaction Batching</Text>
        <Text style={styles.infoText}>
          This will combine entry fee deposit and game creation into a single
          transaction, requiring only one wallet approval.
        </Text>
        <Text style={styles.infoText}>
          Benefits: Faster execution, lower fees, better UX
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, executing && styles.createButtonDisabled]}
        onPress={handleCreateGame}
        disabled={executing}
      >
        {executing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>
            Create Game (1 Approval)
          </Text>
        )}
      </TouchableOpacity>

      {/* Comparison */}
      <View style={styles.comparisonBox}>
        <Text style={styles.comparisonTitle}>Without Batching:</Text>
        <Text style={styles.comparisonText}>
          ❌ Approval 1: Deposit entry fee
        </Text>
        <Text style={styles.comparisonText}>
          ❌ Approval 2: Create game
        </Text>
        <Text style={styles.comparisonText}>
          = 2 wallet popups, 2 transaction fees
        </Text>
        
        <Text style={[styles.comparisonTitle, { marginTop: 12 }]}>
          With Batching:
        </Text>
        <Text style={styles.comparisonText}>
          ✅ Single approval: Deposit + Create
        </Text>
        <Text style={styles.comparisonText}>
          = 1 wallet popup, 1 transaction fee
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  feeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  feeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  comparisonBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
});
