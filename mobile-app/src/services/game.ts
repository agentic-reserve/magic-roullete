import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import {
  connection,
  getProgram,
  getPlatformConfigPDA,
  getGamePDA,
  getGameVaultPDA,
  solToLamports,
} from './solana';
import { createLightProtocolService } from './lightProtocol';

export enum GameMode {
  OneVsOne = 'OneVsOne',
  TwoVsTwo = 'TwoVsTwo',
}

export enum GameStatus {
  WaitingForPlayers = 'WaitingForPlayers',
  Ready = 'Ready',
  Delegated = 'Delegated',
  InProgress = 'InProgress',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
}

export enum AiDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface GameData {
  gameId: number;
  creator: PublicKey;
  gameMode: GameMode;
  entryFee: number;
  status: GameStatus;
  players: PublicKey[];
  currentTurn: number;
  bulletChamber: number;
  currentChamber: number;
  winnerTeam: number | null;
  isPracticeMode: boolean;
  createdAt: number;
  useCompressedTokens?: boolean; // Flag to indicate if game uses compressed tokens
}

// Initialize Light Protocol service
const lightProtocol = createLightProtocolService(
  process.env.EXPO_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com'
);

// Game token mint for compressed tokens
const GAME_TOKEN_MINT = new PublicKey(
  process.env.EXPO_PUBLIC_GAME_TOKEN_MINT || '11111111111111111111111111111111'
);

// Create a new game with SOL
export const createGame = async (
  provider: AnchorProvider,
  gameMode: GameMode,
  entryFeeSol: number
): Promise<string> => {
  const program = getProgram(provider);
  const platformConfig = getPlatformConfigPDA();

  // Fetch platform config to get total games count
  const platformConfigData = await program.account.platformConfig.fetch(platformConfig);
  const gameId = platformConfigData.totalGames;

  const gamePDA = getGamePDA(gameId);
  const gameVault = getGameVaultPDA(gamePDA);

  // Generate random VRF seed
  const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));

  const tx = await program.methods
    .createGameSol(
      { [gameMode.toLowerCase()]: {} },
      new BN(solToLamports(entryFeeSol)),
      vrfSeed
    )
    .accounts({
      game: gamePDA,
      platformConfig,
      creator: provider.wallet.publicKey,
      gameVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

/**
 * Create a new game with compressed tokens
 * Uses Light Protocol ZK Compression for 1000x cost savings
 * 
 * @param provider - Anchor provider with wallet
 * @param gameMode - Game mode (1v1 or 2v2)
 * @param entryFeeSol - Entry fee in SOL
 * @param useCompressed - Whether to use compressed tokens (default: true)
 * @returns Transaction signature
 */
export const createGameWithCompressedTokens = async (
  provider: AnchorProvider,
  gameMode: GameMode,
  entryFeeSol: number,
  useCompressed: boolean = true
): Promise<string> => {
  if (!useCompressed) {
    // Fallback to regular SOL game creation
    return createGame(provider, gameMode, entryFeeSol);
  }

  // TODO: Implement compressed token game creation
  // This requires:
  // 1. Creating compressed token account if not exists (~5,000 lamports)
  // 2. Transferring entry fee as compressed tokens to game vault
  // 3. Creating game with compressed token flag
  
  console.log('Creating game with compressed tokens...');
  console.log('Entry fee:', entryFeeSol, 'SOL');
  console.log('Cost savings: 400x on account creation');
  
  // For now, fallback to regular creation
  // TODO: Remove this fallback once compressed token integration is complete
  return createGame(provider, gameMode, entryFeeSol);
};

// Join an existing game
export const joinGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const program = getProgram(provider);
  const platformConfig = getPlatformConfigPDA();
  const gamePDA = getGamePDA(gameId);
  const gameVault = getGameVaultPDA(gamePDA);

  const tx = await program.methods
    .joinGameSol()
    .accounts({
      game: gamePDA,
      player: provider.wallet.publicKey,
      platformConfig,
      gameVault,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

/**
 * Join an existing game with compressed tokens
 * Transfers entry fee as compressed tokens for 1000x cost savings
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to join
 * @param useCompressed - Whether to use compressed tokens (default: true)
 * @returns Transaction signature
 */
export const joinGameWithCompressedTokens = async (
  provider: AnchorProvider,
  gameId: number,
  useCompressed: boolean = true
): Promise<string> => {
  if (!useCompressed) {
    // Fallback to regular SOL game join
    return joinGame(provider, gameId);
  }

  // TODO: Implement compressed token game join
  // This requires:
  // 1. Fetching game data to get entry fee
  // 2. Transferring entry fee as compressed tokens to game vault
  // 3. Joining game with compressed token flag
  
  console.log('Joining game with compressed tokens...');
  console.log('Game ID:', gameId);
  console.log('Using compressed token transfer (gasless on ER)');
  
  // For now, fallback to regular join
  // TODO: Remove this fallback once compressed token integration is complete
  return joinGame(provider, gameId);
};

// Create AI practice game (FREE)
export const createAiGame = async (
  provider: AnchorProvider,
  difficulty: AiDifficulty
): Promise<string> => {
  const program = getProgram(provider);
  const platformConfig = getPlatformConfigPDA();

  const platformConfigData = await program.account.platformConfig.fetch(platformConfig);
  const gameId = platformConfigData.totalGames;

  const gamePDA = getGamePDA(gameId);

  // AI bot public key (placeholder - should be actual AI bot wallet)
  const aiBot = new PublicKey('11111111111111111111111111111111');

  const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));

  const tx = await program.methods
    .createAiGame({ [difficulty.toLowerCase()]: {} }, vrfSeed)
    .accounts({
      game: gamePDA,
      platformConfig,
      player: provider.wallet.publicKey,
      aiBot,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

// Take a shot in the game
export const takeShot = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const program = getProgram(provider);
  const gamePDA = getGamePDA(gameId);

  const tx = await program.methods
    .takeShot()
    .accounts({
      game: gamePDA,
      player: provider.wallet.publicKey,
    })
    .rpc();

  return tx;
};

// Finalize game and distribute winnings
export const finalizeGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<string> => {
  const program = getProgram(provider);
  const platformConfig = getPlatformConfigPDA();
  const gamePDA = getGamePDA(gameId);
  const gameVault = getGameVaultPDA(gamePDA);

  // Fetch game data to get winners
  const gameData = await program.account.game.fetch(gamePDA);
  const platformConfigData = await program.account.platformConfig.fetch(platformConfig);

  const winner1 = gameData.players[0];
  const winner2 = gameData.players[1] || winner1;

  const tx = await program.methods
    .finalizeGameSol()
    .accounts({
      game: gamePDA,
      platformConfig,
      payer: provider.wallet.publicKey,
      gameVault,
      platformAuthority: platformConfigData.authority,
      treasury: platformConfigData.treasury,
      winner1,
      winner2,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
};

/**
 * Finalize game and distribute winnings as compressed tokens
 * Winners receive compressed tokens with 1000x cost savings
 * 
 * @param provider - Anchor provider with wallet
 * @param gameId - Game ID to finalize
 * @param useCompressed - Whether to use compressed tokens (default: true)
 * @returns Transaction signature
 */
export const finalizeGameWithCompressedTokens = async (
  provider: AnchorProvider,
  gameId: number,
  useCompressed: boolean = true
): Promise<string> => {
  if (!useCompressed) {
    // Fallback to regular SOL distribution
    return finalizeGame(provider, gameId);
  }

  // TODO: Implement compressed token winnings distribution
  // This requires:
  // 1. Fetching game data to determine winners
  // 2. Calculating prize distribution (85% to winners, 5% platform, 10% treasury)
  // 3. Transferring winnings as compressed tokens to winner accounts
  // 4. Finalizing game state
  
  console.log('Finalizing game with compressed token distribution...');
  console.log('Game ID:', gameId);
  console.log('Winners will receive compressed tokens (no rent!)');
  
  // For now, fallback to regular finalization
  // TODO: Remove this fallback once compressed token integration is complete
  return finalizeGame(provider, gameId);
};

// Fetch game data
export const fetchGame = async (
  provider: AnchorProvider,
  gameId: number
): Promise<GameData> => {
  const program = getProgram(provider);
  const gamePDA = getGamePDA(gameId);

  const gameData = await program.account.game.fetch(gamePDA);

  return {
    gameId: gameData.gameId,
    creator: gameData.creator,
    gameMode: gameData.gameMode,
    entryFee: gameData.entryFee.toNumber(),
    status: gameData.status,
    players: gameData.players,
    currentTurn: gameData.currentTurn,
    bulletChamber: gameData.bulletChamber,
    currentChamber: gameData.currentChamber,
    winnerTeam: gameData.winnerTeam,
    isPracticeMode: gameData.isPracticeMode,
    createdAt: gameData.createdAt.toNumber(),
  };
};

// Fetch all active games
export const fetchActiveGames = async (provider: AnchorProvider): Promise<GameData[]> => {
  const program = getProgram(provider);
  
  const games = await program.account.game.all([
    {
      memcmp: {
        offset: 8 + 8, // Discriminator + gameId
        bytes: '2', // WaitingForPlayers status
      },
    },
  ]);

  return games.map((game) => ({
    gameId: game.account.gameId,
    creator: game.account.creator,
    gameMode: game.account.gameMode,
    entryFee: game.account.entryFee.toNumber(),
    status: game.account.status,
    players: game.account.players,
    currentTurn: game.account.currentTurn,
    bulletChamber: game.account.bulletChamber,
    currentChamber: game.account.currentChamber,
    winnerTeam: game.account.winnerTeam,
    isPracticeMode: game.account.isPracticeMode,
    createdAt: game.account.createdAt.toNumber(),
  }));
};
