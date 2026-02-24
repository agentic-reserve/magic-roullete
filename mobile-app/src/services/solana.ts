import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import idl from '../../../target/idl/magic_roulette.json';

// Devnet RPC endpoint
export const RPC_ENDPOINT = 'https://brooks-dn4q23-fast-devnet.helius-rpc.com';

// Program ID
export const PROGRAM_ID = new PublicKey('HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam');

// Create connection
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Get program instance
export const getProgram = (provider: AnchorProvider) => {
  return new Program(idl as Idl, provider);
};

// Platform Config PDA
export const getPlatformConfigPDA = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    PROGRAM_ID
  );
  return pda;
};

// Game PDA
export const getGamePDA = (gameId: number) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), Buffer.from(gameId.toString())],
    PROGRAM_ID
  );
  return pda;
};

// Game Vault PDA
export const getGameVaultPDA = (gamePubkey: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_vault'), gamePubkey.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

// Player Stats PDA
export const getPlayerStatsPDA = (playerPubkey: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('player_stats'), playerPubkey.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

// Rewards PDA
export const getRewardsPDA = (playerPubkey: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('rewards'), playerPubkey.toBuffer()],
    PROGRAM_ID
  );
  return pda;
};

// Helper: Convert SOL to lamports
export const solToLamports = (sol: number): number => {
  return sol * 1_000_000_000;
};

// Helper: Convert lamports to SOL
export const lamportsToSol = (lamports: number): number => {
  return lamports / 1_000_000_000;
};
