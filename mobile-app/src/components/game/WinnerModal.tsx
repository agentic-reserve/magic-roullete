import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface WinnerModalProps {
  visible: boolean;
  winner?: string | null;
  prize?: number;
  onClose?: () => void;
}

export function WinnerModal({ visible, winner, prize, onClose }: WinnerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🎉 Game Over!</Text>
          
          {winner && (
            <>
              <Text style={styles.winnerLabel}>Winner</Text>
              <Text style={styles.winnerAddress}>
                {winner.slice(0, 8)}...{winner.slice(-8)}
              </Text>
            </>
          )}

          {prize && (
            <View style={styles.prizeSection}>
              <Text style={styles.prizeLabel}>Prize</Text>
              <Text style={styles.prizeAmount}>{prize} SOL</Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Back to Lobby</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#14F195',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  winnerLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  winnerAddress: {
    color: '#14F195',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  prizeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  prizeLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  prizeAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
