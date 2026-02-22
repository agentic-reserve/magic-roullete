import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import { 
  createMint, 
  mintTo, 
  transfer,
  getCompressedTokenAccountsByOwner 
} from "@lightprotocol/compressed-token";
import { DELEGATION_PROGRAM_ID } from "@magicblock-labs/ephemeral-rollups-sdk";

// Program ID
export const MAGIC_ROULETTE_PROGRAM_ID = new PublicKey(
  "MRou1etteGameFi11111111111111111111111111111"
);

// Game modes
export enum GameMode {
  OneVsOne = 0,
  TwoVsTwo = 1,
}

export enum GameStatus {
  WaitingForPlayers = 0,
  Delegated = 1,
  InProgress = 2,
  Finished = 3,
  Cancelled = 4,
}

export interface GameAccount {
  gameId: BN;
  creator: PublicKey;
  gameMode: GameMode;
  status: GameStatus;
  entryFee: BN;
  totalPot: BN;
  teamA: PublicKey[];
  teamB: PublicKey[];
  teamACount: number;
  teamBCount: number;
  bulletChamber: number;
  currentChamber: number;
  currentTurn: number;
  shotsTaken: number;
  vrfSeed: number[];
  vrfResult: number[] | null;
  winnerTeam: number | null;
  createdAt: BN;
  finishedAt: BN | null;
  bump: number;
}

export class MagicRouletteSDK {
  private baseConnection: Connection;
  private erConnection: Connection;
  private lightRpc: Rpc;
  private program: Program;
  private provider: AnchorProvider;

  constructor(
    baseRpcUrl: string,
    erRpcUrl: string,
    wallet: any,
    idl: any
  ) {
    // Separate connections for base layer and ER
    this.baseConnection = new Connection(baseRpcUrl, "confirmed");
    this.erConnection = new Connection(erRpcUrl, {
      commitment: "confirmed",
      // @ts-ignore
      skipPreflight: true, // Required for ER
    });

    // Light Protocol RPC for compressed tokens
    this.lightRpc = createRpc(baseRpcUrl, baseRpcUrl);

    // Anchor setup
    this.provider = new AnchorProvider(this.baseConnection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(idl, MAGIC_ROULETTE_PROGRAM_ID, this.provider);
  }

  // ============ Platform Management ============

  async initializePlatform(
    authority: Keypair,
    treasury: PublicKey,
    platformFeeBps: number = 500, // 5%
    treasuryFeeBps: number = 1000 // 10%
  ) {
    const [platformConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const tx = await this.program.methods
      .initializePlatform(platformFeeBps, treasuryFeeBps)
      .accounts({
        platformConfig,
        authority: authority.publicKey,
        treasury,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    return { tx, platformConfig };
  }

  // ============ Compressed Token Operations ============

  async createCompressedMint(payer: Keypair, decimals: number = 9) {
    const { mint, transactionSignature } = await createMint(
      this.lightRpc,
      payer,
      payer.publicKey,
      decimals
    );

    return { mint, signature: transactionSignature };
  }

  async mintCompressedTokens(
    payer: Keypair,
    mint: PublicKey,
    recipient: PublicKey,
    amount: number
  ) {
    const signature = await mintTo(
      this.lightRpc,
      payer,
      mint,
      recipient,
      payer,
      amount
    );

    return signature;
  }

  async getCompressedBalance(owner: PublicKey, mint: PublicKey): Promise<bigint> {
    const accounts = await this.lightRpc.getCompressedTokenAccountsByOwner(
      owner,
      { mint }
    );

    const totalBalance = accounts.items.reduce(
      (sum, account) => sum + BigInt(account.parsed.amount),
      BigInt(0)
    );

    return totalBalance;
  }

  async transferCompressedTokens(
    payer: Keypair,
    mint: PublicKey,
    amount: number,
    recipient: PublicKey
  ) {
    const signature = await transfer(
      this.lightRpc,
      payer,
      mint,
      amount,
      payer,
      recipient
    );

    return signature;
  }

  // ============ Game Management ============

  async createGame(
    creator: Keypair,
    gameMode: GameMode,
    entryFee: number,
    mint: PublicKey
  ) {
    const [platformConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    // Get current game count
    const platformData = await this.program.account.platformConfig.fetch(
      platformConfig
    );
    const gameId = platformData.totalGames;

    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const [gameVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("game_vault"), game.toBuffer()],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    // Generate VRF seed
    const vrfSeed = Keypair.generate().publicKey.toBuffer();

    const tx = await this.program.methods
      .createGame(
        { oneVsOne: gameMode === GameMode.OneVsOne ? {} : null, twoVsTwo: gameMode === GameMode.TwoVsTwo ? {} : null },
        new BN(entryFee),
        Array.from(vrfSeed)
      )
      .accounts({
        game,
        platformConfig,
        creator: creator.publicKey,
        mint,
        creatorTokenAccount: await this.getTokenAccount(creator.publicKey, mint),
        gameVault,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    return { tx, game, gameId };
  }

  async joinGame(
    player: Keypair,
    gameId: BN,
    mint: PublicKey
  ) {
    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const [gameVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("game_vault"), game.toBuffer()],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const tx = await this.program.methods
      .joinGame()
      .accounts({
        game,
        player: player.publicKey,
        mint,
        playerTokenAccount: await this.getTokenAccount(player.publicKey, mint),
        gameVault,
      })
      .signers([player])
      .rpc();

    return tx;
  }

  async delegateGame(payer: Keypair, gameId: BN) {
    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const tx = await this.program.methods
      .delegateGame()
      .accounts({
        game,
        payer: payer.publicKey,
        gameAccount: game,
        delegationProgram: DELEGATION_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();

    return tx;
  }

  async isDelegated(gameId: BN): Promise<boolean> {
    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const info = await this.baseConnection.getAccountInfo(game);
    return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
  }

  async takeShot(player: Keypair, gameId: BN) {
    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    // Use ER connection for gameplay
    const erProvider = new AnchorProvider(this.erConnection, this.provider.wallet, {
      commitment: "confirmed",
      skipPreflight: true,
    });
    const erProgram = new Program(this.program.idl, MAGIC_ROULETTE_PROGRAM_ID, erProvider);

    const tx = await erProgram.methods
      .takeShot()
      .accounts({
        game,
        player: player.publicKey,
      })
      .signers([player])
      .rpc();

    return tx;
  }

  async getGame(gameId: BN): Promise<GameAccount> {
    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
      MAGIC_ROULETTE_PROGRAM_ID
    );

    const gameData = await this.program.account.game.fetch(game);
    return gameData as GameAccount;
  }

  // ============ Helper Methods ============

  private async getTokenAccount(owner: PublicKey, mint: PublicKey): Promise<PublicKey> {
    // For Token-2022, derive ATA
    const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
    const [ata] = PublicKey.findProgramAddressSync(
      [owner.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );
    return ata;
  }
}
