import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useGame } from '../hooks/useGame';
import { useWallet } from '../contexts/WalletContext';
import { GameStatus } from '../services/game';
import { lamportsToSol } from '../services/solana';
import { GameRoom, ChamberAnimation, WinnerModal } from '../components/game';

interface GamePlayScreenProps {
  route: any;
  navigation: any;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({ route, navigation }) => {
  const { gameId } = route.params;
  const { publicKey } = useWallet();
  const { game, loading, error, joinGame, takeShot, finalizeGame, refreshGame } =
    useGame(gameId);
  
  const [showAnimation, setShowAnimation] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [lastShot, setLastShot] = useState<{ chamber: number; isBullet: boolean } | null>(null);

  useEffect(() => {
    // TODO: Replace with WebSocket subscription
    const interval = setInterval(() => {
      refreshGame();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [refreshGame]);

  useEffect(() => {
    // Show winner modal when game finishes
    if (game?.status === GameStatus.Finished) {
      setShowWinner(true);
    }
  }, [game?.status]);

  const handleJoinGame = async () => {
    try {
      await joinGame(gameId);
      Alert.alert('Success', 'Joined game successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join game');
    }
  };

  const handleTakeShot = async () => {
    try {
      setShowAnimation(true);
      const result = await takeShot();
      
      // Show animation with result
      setLastShot({
        chamber: result?.chamber || 1,
        isBullet: result?.isBullet || false,
      });
      
      // Game state will auto-refresh
    } catch (error: any) {
      setShowAnimation(false);
      Alert.alert('Error', error.message || 'Failed to take shot');
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setLastShot(null);
  };

  const handleCloseWinner = () => {
    setShowWinner(false);
    navigation.navigate('Home');
  };

  const handleFinalizeGame = async () => {
    try {
      await finalizeGame();
      Alert.alert('Success', 'Game finalized!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to finalize game');
    }
  };

  const isMyTurn = () => {
    if (!game || !publicKey) return false;
    const playerIndex = game.players.findIndex((p) => p.equals(publicKey));
    return playerIndex === game.currentTurn;
  };

  const isPlayerInGame = () => {
    if (!game || !publicKey) return false;
    return game.players.some((p) => p.equals(publicKey));
  };

  if (loading && !game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9945FF" />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Game not found'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Convert game data to format expected by GameRoom component
  const gameRoomData = game ? {
    id: game.gameId?.toString() || '',
    entryFee: lamportsToSol(game.entryFee),
    gameMode: '1v1' as const,
    playerCount: game.players.length,
    maxPlayers: 2,
    status: game.status === GameStatus.InProgress ? 'active' as const : 'waiting' as const,
    createdAt: Date.now(),
    players: game.players.map((player, index) => ({
      publicKey: player.toBase58(),
      isAlive: true, // TODO: Track from game state
      shotsTaken: 0, // TODO: Track from game state
    })),
    currentTurn: publicKey?.toBase58(),
    currentPlayer: publicKey?.toBase58(),
  } : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Game #{game?.gameId || gameId}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {loading && !game ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9945FF" />
            <Text style={styles.loadingText}>Loading game...</Text>
          </View>
        ) : error || !game ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Game not found'}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : game.status === GameStatus.WaitingForPlayers && !isPlayerInGame() ? (
          <View style={styles.joinContainer}>
            <Text style={styles.joinTitle}>Join this game?</Text>
            <Text style={styles.joinFee}>{lamportsToSol(game.entryFee)} SOL</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleJoinGame}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Join Game</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : gameRoomData ? (
          <GameRoom
            game={gameRoomData}
            onShoot={handleTakeShot}
            loading={loading}
          />
        ) : null}
      </View>

      {/* Chamber Animation */}
      {showAnimation && lastShot && (
        <ChamberAnimation
          chamber={lastShot.chamber}
          isBullet={lastShot.isBullet}
          onComplete={handleAnimationComplete}
        />
      )}

      {/* Winner Modal */}
      {game && (
        <WinnerModal
          visible={showWinner}
          winner={game.winner?.toBase58()}
          prize={lamportsToSol(game.entryFee * game.players.length * 0.85)}
          onClose={handleCloseWinner}
        />
      )}
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
  backButtonText: {
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  joinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  joinTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  joinFee: {
    color: '#14F195',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
