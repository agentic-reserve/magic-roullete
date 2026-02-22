/**
 * Kamino Finance Integration for Frontend
 * 
 * Handles Kamino lending operations for Magic Roulette
 * Updated to use Helius RPC
 */

import { 
  PublicKey, 
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN, Program, AnchorProvider } from "@coral-xyz/anchor";
import { heliusConnection } from "./helius-config";

// ============================================================================
// CONSTANTS
// ============================================================================

export const KAMINO_PROGRAM_ID = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");

// Kamino Markets
export const KAMINO_MAIN_MARKET_MAINNET = new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF");
export const KAMINO_MAIN_MARKET_DEVNET = new PublicKey("DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek");

// Price Feeds (Devnet)
export const PYTH_SOL_PRICE_DEVNET = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix");
export const SWITCHBOARD_SOL_PRICE_DEVNET = new PublicKey("GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR");

// Your program ID
export const MAGIC_ROULETTE_PROGRAM_ID = new PublicKey("JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq");

// ============================================================================
// TYPES
// ============================================================================

export interface KaminoLoanOption {
  entryFee: number; // in SOL
  collateralRequired: number; // in SOL (110% of entry fee)
  estimatedAPY: number; // Annual percentage yield
  loanDuration: string; // e.g., "~5 minutes"
}

export interface CreateGameWithLoanParams {
  gameMode: "oneVsOne" | "twoVsTwo";
  entryFee: BN;
  collateral: BN;
  vrfSeed: number[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate required collateral (110% of entry fee)
 */
export function calculateCollateral(entryFeeSol: number): number {
  return entryFeeSol * 1.1;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): BN {
  return new BN(Math.floor(sol * 1e9));
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: BN | number): number {
  const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
  return amount / 1e9;
}

/**
 * Format SOL amount for display
 */
export function formatSol(sol: number): string {
  return sol.toFixed(4);
}

/**
 * Validate collateral meets minimum requirement
 */
export function validateCollateral(entryFee: number, collateral: number): boolean {
  const required = calculateCollateral(entryFee);
  return collateral >= required;
}

// ============================================================================
// ACCOUNT DERIVATION
// ============================================================================

/**
 * Derive Kamino market authority PDA
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
 * Derive game PDA
 */
export function deriveGamePda(
  gameId: number,
  programId: PublicKey = MAGIC_ROULETTE_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("game"), new BN(gameId).toArrayLike(Buffer, "le", 8)],
    programId
  );
}

/**
 * Derive game vault PDA
 */
export function deriveGameVault(
  gamePda: PublicKey,
  programId: PublicKey = MAGIC_ROULETTE_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    programId
  );
}

/**
 * Derive platform config PDA
 */
export function derivePlatformConfig(
  programId: PublicKey = MAGIC_ROULETTE_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );
}

// ============================================================================
// KAMINO INTEGRATION
// ============================================================================

/**
 * Get all accounts needed for create_game_with_loan instruction
 */
export async function getKaminoAccountsForGame(
  connection: Connection,
  player: PublicKey,
  gameId: number,
  isDevnet: boolean = true
) {
  // Select market based on network
  const marketAddress = isDevnet ? KAMINO_MAIN_MARKET_DEVNET : KAMINO_MAIN_MARKET_MAINNET;
  
  // Derive accounts
  const [marketAuthority] = deriveMarketAuthority(marketAddress);
  const [obligation] = deriveObligationAddress(marketAddress, player, 0);
  const [gamePda] = deriveGamePda(gameId);
  const [gameVault] = deriveGameVault(gamePda);
  const [platformConfig] = derivePlatformConfig();
  
  // TODO: Fetch actual reserve addresses from Kamino market
  // For now, using placeholders - need to integrate @kamino-finance/klend-sdk
  const solReserve = new PublicKey("11111111111111111111111111111111");
  const reserveLiquiditySupply = new PublicKey("11111111111111111111111111111111");
  const reserveCollateralMint = new PublicKey("11111111111111111111111111111111");
  const reserveCollateralSupply = new PublicKey("11111111111111111111111111111111");
  
  const [obligationCollateral] = deriveObligationCollateral(obligation, solReserve);
  
  // TODO: Derive player's collateral token account (ATA)
  const playerCollateralAccount = new PublicKey("11111111111111111111111111111111");
  
  // Select price feeds
  const pythSolPrice = isDevnet ? PYTH_SOL_PRICE_DEVNET : PYTH_SOL_PRICE_DEVNET;
  const switchboardSolPrice = isDevnet ? SWITCHBOARD_SOL_PRICE_DEVNET : SWITCHBOARD_SOL_PRICE_DEVNET;
  
  return {
    game: gamePda,
    platformConfig,
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

/**
 * Check if user has an existing Kamino obligation
 */
export async function checkUserObligation(
  player: PublicKey,
  isDevnet: boolean = true
): Promise<boolean> {
  const marketAddress = isDevnet ? KAMINO_MAIN_MARKET_DEVNET : KAMINO_MAIN_MARKET_MAINNET;
  const [obligation] = deriveObligationAddress(marketAddress, player, 0);
  
  try {
    const accountInfo = await heliusConnection.getAccountInfo(obligation);
    return accountInfo !== null;
  } catch {
    return false;
  }
}

/**
 * Get loan options for different entry fees
 */
export function getLoanOptions(): KaminoLoanOption[] {
  return [
    {
      entryFee: 0.01,
      collateralRequired: 0.011,
      estimatedAPY: 5.2,
      loanDuration: "~5 minutes",
    },
    {
      entryFee: 0.05,
      collateralRequired: 0.055,
      estimatedAPY: 5.2,
      loanDuration: "~5 minutes",
    },
    {
      entryFee: 0.1,
      collateralRequired: 0.11,
      estimatedAPY: 5.2,
      loanDuration: "~5 minutes",
    },
    {
      entryFee: 0.5,
      collateralRequired: 0.55,
      estimatedAPY: 5.2,
      loanDuration: "~5 minutes",
    },
    {
      entryFee: 1.0,
      collateralRequired: 1.1,
      estimatedAPY: 5.2,
      loanDuration: "~5 minutes",
    },
  ];
}

/**
 * Calculate loan interest (simplified)
 */
export function calculateLoanInterest(
  loanAmount: number,
  durationMinutes: number = 5
): number {
  // Simplified calculation: 5.2% APY
  const annualRate = 0.052;
  const minutesPerYear = 365 * 24 * 60;
  const interest = loanAmount * annualRate * (durationMinutes / minutesPerYear);
  return interest;
}

/**
 * Calculate total repayment amount
 */
export function calculateRepaymentAmount(
  loanAmount: number,
  durationMinutes: number = 5
): number {
  const interest = calculateLoanInterest(loanAmount, durationMinutes);
  return loanAmount + interest;
}

/**
 * Calculate net winnings after loan repayment
 */
export function calculateNetWinnings(
  totalWinnings: number,
  loanAmount: number,
  durationMinutes: number = 5
): number {
  const repayment = calculateRepaymentAmount(loanAmount, durationMinutes);
  return totalWinnings - repayment;
}

// ============================================================================
// TRANSACTION BUILDERS
// ============================================================================

/**
 * Build create_game_with_loan transaction
 */
export async function buildCreateGameWithLoanTx(
  program: Program,
  connection: Connection,
  player: PublicKey,
  params: CreateGameWithLoanParams,
  gameId: number,
  isDevnet: boolean = true
): Promise<Transaction> {
  const accounts = await getKaminoAccountsForGame(
    connection,
    player,
    gameId,
    isDevnet
  );
  
  const ix = await program.methods
    .createGameWithLoan(
      params.gameMode === "oneVsOne" ? { oneVsOne: {} } : { twoVsTwo: {} },
      params.entryFee,
      params.collateral,
      params.vrfSeed
    )
    .accounts(accounts)
    .instruction();
  
  const tx = new Transaction().add(ix);
  tx.feePayer = player;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
  return tx;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  calculateCollateral,
  solToLamports,
  lamportsToSol,
  formatSol,
  validateCollateral,
  getKaminoAccountsForGame,
  checkUserObligation,
  getLoanOptions,
  calculateLoanInterest,
  calculateRepaymentAmount,
  calculateNetWinnings,
  buildCreateGameWithLoanTx,
};
