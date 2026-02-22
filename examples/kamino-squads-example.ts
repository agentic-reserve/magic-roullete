/**
 * Magic Roulette - Kamino & Squads Integration Example
 * 
 * This example demonstrates:
 * 1. Creating a game with Kamino loan
 * 2. Playing the game
 * 3. Finalizing with automatic loan repayment
 * 4. Treasury management via Squads multisig
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { KaminoMarket, KaminoAction } from "@kamino-finance/klend-sdk";
import * as multisig from "@sqds/multisig";
import { MagicRoulette } from "../target/types/magic_roulette";

// ============================================================================
// SETUP
// ============================================================================

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = Keypair.fromSecretKey(/* your secret key */);
const program = anchor.workspace.MagicRoulette as Program<MagicRoulette>;

// Kamino devnet market
const KAMINO_MARKET = new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF");

// Squads multisig (created separately)
const SQUADS_MULTISIG = new PublicKey("YOUR_MULTISIG_ADDRESS");

// ============================================================================
// EXAMPLE 1: Create Game with Kamino Loan
// ============================================================================

async function createGameWithLoan() {
  console.log("🎮 Creating game with Kamino loan...\n");

  // Game parameters
  const entryFee = new BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
  const collateralAmount = new BN(0.11 * LAMPORTS_PER_SOL); // 0.11 SOL (110%)
  const gameMode = { oneVsOne: {} };
  const vrfSeed = Keypair.generate().publicKey.toBytes();

  // 1. Initialize Kamino market
  console.log("📊 Loading Kamino market...");
  const kaminoMarket = await KaminoMarket.load(connection, KAMINO_MARKET);
  
  // Get SOL reserve
  const solReserve = kaminoMarket.getReserveBySymbol("SOL");
  if (!solReserve) {
    throw new Error("SOL reserve not found");
  }

  // 2. Create or get player's obligation account
  console.log("📝 Setting up obligation account...");
  const [obligationPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("obligation"),
      KAMINO_MARKET.toBuffer(),
      wallet.publicKey.toBuffer(),
    ],
    kaminoMarket.programId
  );

  // 3. Get platform config
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  const platformData = await program.account.platformConfig.fetch(platformConfig);
  const gameId = platformData.totalGames;

  // 4. Derive game PDA
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), new BN(gameId).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  // 5. Derive game vault PDA
  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    program.programId
  );

  // 6. Create game with loan
  console.log("🎲 Creating game with loan...");
  const tx = await program.methods
    .createGameWithLoan(gameMode, entryFee, collateralAmount, Array.from(vrfSeed))
    .accounts({
      game: gamePda,
      platformConfig,
      player: wallet.publicKey,
      kaminoMarket: KAMINO_MARKET,
      kaminoReserve: solReserve.address,
      playerObligation: obligationPda,
      collateralAccount: wallet.publicKey, // Player's SOL account
      kaminoProgram: kaminoMarket.programId,
      gameVault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([wallet])
    .rpc();

  console.log("✅ Game created with loan!");
  console.log("   Transaction:", tx);
  console.log("   Game ID:", gameId.toString());
  console.log("   Entry Fee:", entryFee.toNumber() / LAMPORTS_PER_SOL, "SOL (borrowed)");
  console.log("   Collateral:", collateralAmount.toNumber() / LAMPORTS_PER_SOL, "SOL");
  console.log("   Game PDA:", gamePda.toString());
  console.log("   Obligation:", obligationPda.toString());

  return { gamePda, gameId, obligationPda };
}

// ============================================================================
// EXAMPLE 2: Join Game (Normal - No Loan)
// ============================================================================

async function joinGame(gamePda: PublicKey) {
  console.log("\n🎮 Joining game...\n");

  const player2 = Keypair.generate();
  
  // Airdrop SOL to player 2
  const airdropSig = await connection.requestAirdrop(
    player2.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);

  // Get game data
  const gameData = await program.account.game.fetch(gamePda);
  const entryFee = gameData.entryFee;

  // Derive game vault
  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    program.programId
  );

  // Join game
  const tx = await program.methods
    .joinGameSol()
    .accounts({
      game: gamePda,
      player: player2.publicKey,
      gameVault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([player2])
    .rpc();

  console.log("✅ Player 2 joined!");
  console.log("   Transaction:", tx);
  console.log("   Player 2:", player2.publicKey.toString());
  console.log("   Entry Fee:", entryFee.toNumber() / LAMPORTS_PER_SOL, "SOL");

  return player2;
}

// ============================================================================
// EXAMPLE 3: Finalize Game with Loan Repayment
// ============================================================================

async function finalizeGameWithLoanRepayment(
  gamePda: PublicKey,
  obligationPda: PublicKey,
  winner: PublicKey
) {
  console.log("\n🏆 Finalizing game with loan repayment...\n");

  // Get platform config
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  // Get game vault
  const [gameVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gamePda.toBuffer()],
    program.programId
  );

  // Get Squads vaults
  const [platformVault] = multisig.getVaultPda({
    multisigPda: SQUADS_MULTISIG,
    index: 0, // Platform fee vault
  });

  const [treasuryVault] = multisig.getVaultPda({
    multisigPda: SQUADS_MULTISIG,
    index: 1, // Treasury vault
  });

  // Load Kamino market
  const kaminoMarket = await KaminoMarket.load(connection, KAMINO_MARKET);
  const solReserve = kaminoMarket.getReserveBySymbol("SOL");

  // Finalize game
  console.log("💰 Finalizing and repaying loan...");
  const tx = await program.methods
    .finalizeGameWithLoanRepayment()
    .accounts({
      game: gamePda,
      platformConfig,
      gameVault,
      kaminoMarket: KAMINO_MARKET,
      kaminoReserve: solReserve!.address,
      playerObligation: obligationPda,
      kaminoProgram: kaminoMarket.programId,
      winner1: winner,
      winner2: PublicKey.default, // Not used for 1v1
      platformVault,
      treasuryVault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Game finalized!");
  console.log("   Transaction:", tx);
  console.log("   Winner:", winner.toString());
  console.log("   Loan repaid automatically");
  console.log("   Collateral returned to winner");
  console.log("   Fees sent to Squads multisig vaults");

  // Get final balances
  const gameData = await program.account.game.fetch(gamePda);
  console.log("\n📊 Final Stats:");
  console.log("   Total Pot:", gameData.totalPot.toNumber() / LAMPORTS_PER_SOL, "SOL");
  console.log("   Status:", Object.keys(gameData.status)[0]);
}

// ============================================================================
// EXAMPLE 4: Squads Multisig Treasury Withdrawal
// ============================================================================

async function withdrawTreasuryViaMultisig(amount: BN) {
  console.log("\n💸 Withdrawing from treasury via Squads multisig...\n");

  // Get platform config
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  // Get treasury vault
  const [treasuryVault] = multisig.getVaultPda({
    multisigPda: SQUADS_MULTISIG,
    index: 1,
  });

  // Get current transaction index
  const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
    connection,
    SQUADS_MULTISIG
  );
  const transactionIndex = BigInt(Number(multisigAccount.transactionIndex) + 1);

  // 1. Create vault transaction (withdrawal)
  console.log("📝 Creating withdrawal proposal...");
  const [transactionPda] = multisig.getTransactionPda({
    multisigPda: SQUADS_MULTISIG,
    index: transactionIndex,
  });

  const recipient = Keypair.generate().publicKey; // Example recipient

  const createTxSig = await multisig.rpc.vaultTransactionCreate({
    connection,
    feePayer: wallet,
    multisigPda: SQUADS_MULTISIG,
    transactionIndex,
    creator: wallet.publicKey,
    vaultIndex: 1, // Treasury vault
    ephemeralSigners: 0,
    transactionMessage: new anchor.web3.TransactionMessage({
      payerKey: treasuryVault,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      instructions: [
        anchor.web3.SystemProgram.transfer({
          fromPubkey: treasuryVault,
          toPubkey: recipient,
          lamports: amount.toNumber(),
        }),
      ],
    }),
  });

  console.log("✅ Withdrawal proposal created:", createTxSig);

  // 2. Create proposal
  console.log("📝 Creating proposal...");
  const [proposalPda] = multisig.getProposalPda({
    multisigPda: SQUADS_MULTISIG,
    transactionIndex,
  });

  const createProposalSig = await multisig.rpc.proposalCreate({
    connection,
    feePayer: wallet,
    multisigPda: SQUADS_MULTISIG,
    transactionIndex,
    creator: wallet,
  });

  console.log("✅ Proposal created:", createProposalSig);

  // 3. Approve proposal (need 3 approvals for 3-of-5 multisig)
  console.log("✅ Approving proposal (member 1)...");
  const approveSig = await multisig.rpc.proposalApprove({
    connection,
    feePayer: wallet,
    multisigPda: SQUADS_MULTISIG,
    transactionIndex,
    member: wallet,
  });

  console.log("✅ Approved:", approveSig);
  console.log("\n⏳ Waiting for 2 more approvals...");
  console.log("   After 3 approvals, wait 24 hours (time lock)");
  console.log("   Then execute the transaction");

  // Note: In real scenario, other members would approve
  // and then execute after time lock expires

  return { transactionPda, proposalPda };
}

// ============================================================================
// EXAMPLE 5: Initialize Platform with Squads Multisig
// ============================================================================

async function initializePlatformWithMultisig() {
  console.log("\n🏛️ Initializing platform with Squads multisig...\n");

  // 1. Create Squads multisig first
  console.log("🔐 Creating Squads multisig (3-of-5)...");
  
  const createKey = Keypair.generate();
  const [multisigPda] = multisig.getMultisigPda({
    createKey: createKey.publicKey,
  });

  // Team members
  const founder1 = wallet.publicKey;
  const founder2 = Keypair.generate().publicKey;
  const founder3 = Keypair.generate().publicKey;
  const dev1 = Keypair.generate().publicKey;
  const dev2 = Keypair.generate().publicKey;

  const createMultisigSig = await multisig.rpc.multisigCreateV2({
    connection,
    createKey,
    creator: wallet,
    multisigPda,
    configAuthority: null, // Immutable
    threshold: 3, // 3-of-5
    members: [
      { key: founder1, permissions: multisig.types.Permissions.all() },
      { key: founder2, permissions: multisig.types.Permissions.all() },
      { key: founder3, permissions: multisig.types.Permissions.all() },
      { key: dev1, permissions: multisig.types.Permissions.all() },
      { key: dev2, permissions: multisig.types.Permissions.all() },
    ],
    timeLock: 86400, // 24 hours
    rentCollector: null,
  });

  console.log("✅ Multisig created:", createMultisigSig);
  console.log("   Multisig PDA:", multisigPda.toString());
  console.log("   Threshold: 3-of-5");
  console.log("   Time Lock: 24 hours");

  // 2. Get Squads vaults
  const [platformVault] = multisig.getVaultPda({
    multisigPda,
    index: 0,
  });

  const [treasuryVault] = multisig.getVaultPda({
    multisigPda,
    index: 1,
  });

  console.log("   Platform Vault:", platformVault.toString());
  console.log("   Treasury Vault:", treasuryVault.toString());

  // 3. Initialize platform with multisig
  console.log("\n🎮 Initializing Magic Roulette platform...");
  
  const [platformConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  const platformFeeBps = 500; // 5%
  const treasuryFeeBps = 1000; // 10%

  const initPlatformTx = await program.methods
    .initializePlatformWithMultisig(platformFeeBps, treasuryFeeBps)
    .accounts({
      platformConfig,
      payer: wallet.publicKey,
      multisig: multisigPda,
      platformVault,
      treasuryVault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([wallet])
    .rpc();

  console.log("✅ Platform initialized!");
  console.log("   Transaction:", initPlatformTx);
  console.log("   Authority: Squads Multisig");
  console.log("   Platform Fee: 5%");
  console.log("   Treasury Fee: 10%");

  return { multisigPda, platformVault, treasuryVault };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🎰 Magic Roulette - Kamino & Squads Integration Example\n");
  console.log("=" .repeat(70));

  try {
    // Example 1: Initialize platform with multisig
    console.log("\n📍 STEP 1: Initialize Platform with Squads Multisig");
    console.log("=" .repeat(70));
    const { multisigPda } = await initializePlatformWithMultisig();

    // Example 2: Create game with Kamino loan
    console.log("\n📍 STEP 2: Create Game with Kamino Loan");
    console.log("=" .repeat(70));
    const { gamePda, obligationPda } = await createGameWithLoan();

    // Example 3: Join game
    console.log("\n📍 STEP 3: Player 2 Joins Game");
    console.log("=" .repeat(70));
    const player2 = await joinGame(gamePda);

    // Simulate game play (in real scenario, this would be in Private ER)
    console.log("\n📍 STEP 4: Playing Game (Simulated)");
    console.log("=" .repeat(70));
    console.log("🎲 Game in progress...");
    console.log("🎯 Player 1 wins!");

    // Example 4: Finalize with loan repayment
    console.log("\n📍 STEP 5: Finalize Game with Loan Repayment");
    console.log("=" .repeat(70));
    await finalizeGameWithLoanRepayment(gamePda, obligationPda, wallet.publicKey);

    // Example 5: Treasury withdrawal via multisig
    console.log("\n📍 STEP 6: Withdraw Treasury via Multisig");
    console.log("=" .repeat(70));
    const withdrawAmount = new BN(10 * LAMPORTS_PER_SOL);
    await withdrawTreasuryViaMultisig(withdrawAmount);

    console.log("\n" + "=" .repeat(70));
    console.log("✅ All examples completed successfully!");
    console.log("=" .repeat(70));

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export {
  createGameWithLoan,
  joinGame,
  finalizeGameWithLoanRepayment,
  withdrawTreasuryViaMultisig,
  initializePlatformWithMultisig,
};
