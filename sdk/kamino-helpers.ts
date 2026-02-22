/**
 * Kamino Finance Integration Helpers
 * 
 * Helper functions for integrating with Kamino Lend on Solana
 * Handles account derivation, market data fetching, and transaction building
 * Updated to use Helius RPC
 */

import { 
  PublicKey, 
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN, Program, AnchorProvider } from "@coral-xyz/anchor";

// Import Helius connection
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const HELIUS_RPC_URL = process.env.SOLANA_NETWORK === "mainnet-beta"
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Create Helius connection
export const heliusConnection = new Connection(HELIUS_RPC_URL, "confirmed");

// ============================================================================
// CONSTANTS
// ============================================================================

export const KAMINO_PROGRAM_ID = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");

// Kamino Main Market (Mainnet)
export const KAMINO_MAIN_MARKET_MAINNET = new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF");

// Kamino Devnet Market (if available - update with actual address)
export const KAMINO_MAIN_MARKET_DEVNET = new PublicKey("DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek");

// Oracle Program IDs
export const PYTH_PROGRAM_ID = new PublicKey("FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH");
export const SWITCHBOARD_PROGRAM_ID = new PublicKey("SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f");

// SOL Price Feeds (Devnet)
export const PYTH_SOL_PRICE_DEVNET = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");
export const SWITCHBOARD_SOL_PRICE_DEVNET = new PublicKey("GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR");

// ============================================================================
// TYPES
// ============================================================================

export interface KaminoMarketInfo {
  marketAddress: PublicKey;
  marketAuthority: PublicKey;
  solReserve: PublicKey;
  reserveLiquiditySupply: PublicKey;
  reserveCollateralMint: PublicKey;
  reserveCollateralSupply: PublicKey;
}

export interface KaminoObligationAccounts {
  obligation: PublicKey;
  obligationCollateral: PublicKey;
  playerCollateralAccount: PublicKey;
}

export interface CreateGameWithLoanAccounts {
  game: PublicKey;
  platformConfig: PublicKey;
  player: PublicKey;
  gameVault: PublicKey;
  
  // Kamino accounts
  lendingMarket: PublicKey;
  lendingMarketAuthority: PublicKey;
  reserve: PublicKey;
  reserveLiquiditySupply: PublicKey;
  reserveCollateralMint: PublicKey;
  reserveCollateralSupply: PublicKey;
  obligation: PublicKey;
  playerCollateralAccount: PublicKey;
  obligationCollateral: PublicKey;
  kaminoProgram: PublicKey;
  pythSolPrice: PublicKey;
  switchboardSolPrice: PublicKey;
  
  // Programs
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  rent: PublicKey;
  clock: PublicKey;
}

// ============================================================================
// ACCOUNT DERIVATION
// ============================================================================

/**
 * Derive Kamino lending market authority PDA
 */
export function deriveMarketAuthority(
  marketAddress: PublicKey,
  programId: PublicKey = KAMINO_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [marketAddress.toBuffer()],
    programId
  );
}

/**
 * Derive user's obligation account PDA
 * 
 * @param marketAddress - Kamino lending market address
 * @param owner - User's wallet address
 * @param seed - Obligation seed (usually 0 for first obligation)
 */
export function deriveObligationAddress(
  marketAddress: PublicKey,
  owner: PublicKey,
  seed: number = 0,
  programId: PublicKey = KAMINO_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("obligation"),
      marketAddress.toBuffer(),
      owner.toBuffer(),
      new BN(seed).toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
}

/**
 * Derive obligation collateral account PDA
 */
export function deriveObligationCollateral(
  obligation: PublicKey,
  reserve: PublicKey,
  programId: PublicKey = KAMINO_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("collateral"),
      obligation.toBuffer(),
      reserve.toBuffer(),
    ],
    programId
  );
}

/**
 * Get all Kamino accounts needed for create_game_with_loan instruction
 * 
 * @param player - Player's wallet address
 * @param gamePda - Game PDA address
 * @param platformConfigPda - Platform config PDA address
 * @param isDevnet - Whether to use devnet or mainnet addresses
 */
export async function getKaminoAccountsForGame(
  player: PublicKey,
  gamePda: PublicKey,
  platformConfigPda: PublicKey,
  isDevnet: boolean = true
): Promise<CreateGameWithLoanAccounts> {
  
  // Select market based on network
  const marketAddress = isDevnet ? KAMINO_MAIN_MARKET_DEVNET : KAMINO_MAIN_MARKET_MAINNET;
  
  // Derive market authority
  const [marketAuthority] = deriveMarketAuthority(marketAddress);
  
  // Derive user's obligation
  const [obligation] = deriveObligationAddress(marketAddress, player, 0);
  
  // TODO: Fetch actual reserve addresses from Kamino market
  // For now, using placeholder - need to query market.getReserve("SOL")
  const solReserve = new PublicKey("11111111111111111111111111111111"); // Placeholder
  const reserveLiquiditySupply = new PublicKey("11111111111111111111111111111111"); // Placeholder
  const reserveCollateralMint = new PublicKey("11111111111111111111111111111111"); // Placeholder
  const reserveCollateralSupply = new PublicKey("11111111111111111111111111111111"); // Placeholder
  
  // Derive obligation collateral
  const [obligationCollateral] = deriveObligationCollateral(obligation, solReserve);
  
  // Derive player's collateral token account (ATA for collateral mint)
  // TODO: Use getAssociatedTokenAddress from @solana/spl-token
  const playerCollateralAccount = new PublicKey("11111111111111111111111111111111"); // Placeholder
  
  // Derive game vault
  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    new PublicKey("JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq") // Your program ID
  );
  
  // Select price feeds based on network
  const pythSolPrice = isDevnet ? PYTH_SOL_PRICE_DEVNET : PYTH_SOL_PRICE_DEVNET; // Update mainnet
  const switchboardSolPrice = isDevnet ? SWITCHBOARD_SOL_PRICE_DEVNET : SWITCHBOARD_SOL_PRICE_DEVNET; // Update mainnet
  
  return {
    game: gamePda,
    platformConfig: platformConfigPda,
    player,
    gameVault,
    
    // Kamino accounts
    lendingMarket: marketAddress,
    lendingMarketAuthority: marketAuthority,
    reserve: solReserve,
    reserveLiquiditySupply,
    reserveCollateralMint,
    reserveCollateralSupply,
    obligation,
    playerCollateralAccount,
    obligationCollateral,
    kaminoProgram: KAMINO_PROGRAM_ID,
    pythSolPrice,
    switchboardSolPrice,
    
    // Programs
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
    clock: SYSVAR_CLOCK_PUBKEY,
  };
}

// ============================================================================
// KAMINO SDK INTEGRATION (Optional - requires @kamino-finance/klend-sdk)
// ============================================================================

/**
 * Fetch Kamino market data using official SDK
 * 
 * Requires: npm install @kamino-finance/klend-sdk
 * 
 * @example
 * ```typescript
 * import { KaminoMarket } from '@kamino-finance/klend-sdk';
 * 
 * const market = await KaminoMarket.load(
 *   heliusConnection,
 *   KAMINO_MAIN_MARKET_DEVNET,
 *   400 // slot duration
 * );
 * 
 * const solReserve = market.getReserve("SOL");
 * console.log("SOL Reserve:", solReserve.address.toString());
 * console.log("Liquidity Supply:", solReserve.stats.totalDepositsWads.toString());
 * ```
 */
export async function fetchKaminoMarketData(
  marketAddress: PublicKey
): Promise<any> {
  // This requires @kamino-finance/klend-sdk to be installed
  // Uncomment when ready to use:
  
  // const { KaminoMarket } = await import('@kamino-finance/klend-sdk');
  // const market = await KaminoMarket.load(heliusConnection, marketAddress, 400);
  // return market;
  
  throw new Error("Install @kamino-finance/klend-sdk to use this function");
}

// ============================================================================
// COLLATERAL CALCULATIONS
// ============================================================================

/**
 * Calculate required collateral for a given entry fee (110% ratio)
 */
export function calculateRequiredCollateral(entryFee: BN): BN {
  return entryFee.mul(new BN(110)).div(new BN(100));
}

/**
 * Calculate maximum borrow amount for given collateral (90.9% of collateral)
 */
export function calculateMaxBorrow(collateral: BN): BN {
  return collateral.mul(new BN(100)).div(new BN(110));
}

/**
 * Validate collateral meets minimum requirement
 */
export function validateCollateral(entryFee: BN, collateral: BN): boolean {
  const required = calculateRequiredCollateral(entryFee);
  return collateral.gte(required);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format lamports to SOL with decimals
 */
export function lamportsToSol(lamports: BN | number): string {
  const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
  return (amount / 1e9).toFixed(9);
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): BN {
  return new BN(Math.floor(sol * 1e9));
}

/**
 * Check if obligation exists for user
 */
export async function checkObligationExists(
  obligation: PublicKey
): Promise<boolean> {
  try {
    const accountInfo = await heliusConnection.getAccountInfo(obligation);
    return accountInfo !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Create game with Kamino loan
 * 
 * @example
 * ```typescript
 * import { Connection, PublicKey, Keypair } from '@solana/web3.js';
 * import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
 * import { getKaminoAccountsForGame, solToLamports } from './kamino-helpers';
 * 
 * const connection = new Connection("https://api.devnet.solana.com");
 * const wallet = Keypair.generate(); // Your wallet
 * const program = // Your Anchor program
 * 
 * // Game parameters
 * const entryFee = solToLamports(0.1); // 0.1 SOL
 * const collateral = solToLamports(0.11); // 0.11 SOL (110%)
 * const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));
 * 
 * // Derive PDAs
 * const [platformConfig] = PublicKey.findProgramAddressSync(
 *   [Buffer.from("platform")],
 *   program.programId
 * );
 * 
 * const [gamePda] = PublicKey.findProgramAddressSync(
 *   [Buffer.from("game"), new BN(0).toArrayLike(Buffer, "le", 8)],
 *   program.programId
 * );
 * 
 * // Get Kamino accounts
 * const accounts = await getKaminoAccountsForGame(
 *   wallet.publicKey,
 *   gamePda,
 *   platformConfig,
 *   true // devnet
 * );
 * 
 * // Create transaction
 * const tx = await program.methods
 *   .createGameWithLoan(
 *     { oneVsOne: {} },
 *     entryFee,
 *     collateral,
 *     vrfSeed
 *   )
 *   .accounts(accounts)
 *   .rpc();
 * 
 * console.log("Game created with loan:", tx);
 * ```
 */
