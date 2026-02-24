import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useGame } from '../hooks/useGame';
import { GameMode } from '../services/game';
import { MIN_ENTRY_FEE, MAX_ENTRY_FEE } from '../lib/constants';
import { validateEntryFee } from '../lib/utils';

interface CreateGameScreenProps {
  navigation: any;
}

export const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ navigation }) => {
  const { createGame, loading, useCompressedTokens, setUseCompressedTokens } = useGame();
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.OneVsOne);
  const [entryFee, setEntryFee] = useState('0.1');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateInput = (): boolean => {
    const fee = parseFloat(entryFee);
    
    if (isNaN(fee)) {
      setValidationError('Please enter a valid number');
      return false;
    }
    
    if (!validateEntryFee(fee, MIN_ENTRY_FEE, MAX_ENTRY_FEE)) {
      setValidationError(`Entry fee must be between ${MIN_ENTRY_FEE} and ${MAX_ENTRY_FEE} SOL`);
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleCreateGame = async () => {
    if (!validateInput()) {
      return;
    }

    try {
      const fee = parseFloat(entryFee);
      await createGame(gameMode, fee, useCompressedTokens);
      Alert.alert(
        'Success',
        useCompressedTokens
          ? 'Game created with compressed tokens! 1000x cost savings applied.'
          : 'Game created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('GameLobby'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create game');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Game</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Mode</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                gameMode === GameMode.OneVsOne && styles.modeButtonActive,
              ]}
              onPress={() => setGameMode(GameMode.OneVsOne)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  gameMode === GameMode.OneVsOne && styles.modeButtonTextActive,
                ]}
              >
                1v1
              </Text>
              <Text style={styles.modeButtonSubtext}>Two players</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                gameMode === GameMode.TwoVsTwo && styles.modeButtonActive,
              ]}
              onPress={() => setGameMode(GameMode.TwoVsTwo)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  gameMode === GameMode.TwoVsTwo && styles.modeButtonTextActive,
                ]}
              >
                2v2
              </Text>
              <Text style={styles.modeButtonSubtext}>Four players</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                gameMode === 'AI practice' && styles.modeButtonActive,
              ]}
              onPress={() => setGameMode('AI practice' as GameMode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  gameMode === 'AI practice' && styles.modeButtonTextActive,
                ]}
              >
                🤖
              </Text>
              <Text style={styles.modeButtonSubtext}>AI Practice</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entry Fee (SOL)</Text>
          <TextInput
            style={[styles.input, validationError && styles.inputError]}
            value={entryFee}
            onChangeText={(text) => {
              setEntryFee(text);
              setValidationError(null);
            }}
            keyboardType="decimal-pad"
            placeholder="0.1"
            placeholderTextColor="#666"
          />
          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : (
            <Text style={styles.hint}>
              Range: {MIN_ENTRY_FEE} - {MAX_ENTRY_FEE} SOL
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Use Compressed Tokens</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                useCompressedTokens && styles.toggleActive,
              ]}
              onPress={() => setUseCompressedTokens(!useCompressedTokens)}
            >
              <View
                style={[
                  styles.toggleThumb,
                  useCompressedTokens && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>
          {useCompressedTokens && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>💰 1000x Cost Savings</Text>
              <Text style={styles.savingsDetail}>
                Account cost: ~5,000 lamports vs ~2M for SPL
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prize Breakdown</Text>
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Winner Share:</Text>
              <Text style={styles.breakdownValue}>85%</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Platform Fee:</Text>
              <Text style={styles.breakdownValue}>5%</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Treasury Fee:</Text>
              <Text style={styles.breakdownValue}>10%</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateGame}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Game</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  backButton: {
    color: '#9945FF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a3e',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#14F195',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  toggleThumbActive: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  savingsBadge: {
    backgroundColor: '#14F19520',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14F195',
    marginBottom: 4,
  },
  savingsDetail: {
    fontSize: 11,
    color: '#14F195',
    opacity: 0.7,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#2a2a3e',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#9945FF',
    backgroundColor: '#9945FF20',
  },
  modeButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4,
  },
  modeButtonTextActive: {
    color: '#9945FF',
  },
  modeButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 8,
  },
  breakdown: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#888',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#14F195',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#9945FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
