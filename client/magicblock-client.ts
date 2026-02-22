import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { DELEGATION_PROGRAM_ID } from "@magicblock-labs/ephemeral-rollups-sdk";

const CONFIG = {
  SOLANA_RPC: "https://api.devnet.solana.com",
  ER_RPC: "https://devnet-router.magicblock.app",
  PROGRAM_ID: new PublicKey("MBVrf111111111111111111111111111111111111111"),
};

export class MagicBlockVRFClient {
  private baseConnection: Connection;
  private erConnection: Connection;
  private baseProgram: Program;
  private erProgram: Program;
  private wallet: Keypair;

  constructor(wallet: Keypair, idl: any) {
    this.wallet = wallet;
    this.baseConnection = new Connection(CONFIG.SOLANA_RPC, "confirmed");
    this.erConnection = new Connection(CONFIG.ER_RPC, "confirmed");

    const walletAdapter = new Wallet(wallet);
    const baseProvider = new AnchorProvider(this.baseConnection, walletAdapter, { commitment: "confirmed" });
    const erProvider = new AnchorProvider(this.erConnection, walletAdapter, { 
      commitment: "confirmed",
      skipPreflight: true 
    });

    this.baseProgram = new Program(idl, CONFIG.PROGRAM_ID, baseProvider);
    this.erProgram = new Program(idl, CONFIG.PROGRAM_ID, erProvider);
  }

  async isDelegated(accountPubkey: PublicKey): Promise<boolean> {
    const info = await this.baseConnection.getAccountInfo(accountPubkey);
    return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
  }

  async waitForDelegation(accountPubkey: PublicKey, timeout = 10000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.isDelegated(accountPubkey)) return true;
      await new Promise(r => setTimeout(r, 1000));
    }
    return false;
  }

  deriveGamePda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("game"), this.wallet.publicKey.toBuffer()],
      CONFIG.PROGRAM_ID
    );
  }

  async initialize(): Promise<{ signature: string; gamePda: PublicKey }> {
    const [gamePda] = this.deriveGamePda();
    console.log("Initializing game on base layer...");

    const signature = await this.baseProgram.methods
      .initialize()
      .accounts({
        payer: this.wallet.publicKey,
        game: gamePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([this.wallet])
      .rpc();

    console.log("✓ Initialized:", signature);
    return { signature, gamePda };
  }

  async delegate(gamePda: PublicKey): Promise<string> {
    if (await this.isDelegated(gamePda)) {
      console.log("Already delegated");
      return "";
    }

    console.log("Delegating to ER...");
    const signature = await this.baseProgram.methods
      .delegate()
      .accounts({ payer: this.wallet.publicKey, game: gamePda })
      .signers([this.wallet])
      .rpc();

    console.log("✓ Delegation tx:", signature);
    await this.waitForDelegation(gamePda);
    console.log("✓ Delegated");
    return signature;
  }

  async rollDice(gamePda: PublicKey): Promise<number> {
    console.log("Rolling dice...");
    
    await this.erProgram.methods
      .rollDice()
      .accounts({ payer: this.wallet.publicKey, game: gamePda })
      .signers([this.wallet])
      .rpc({ skipPreflight: true });

    console.log("Waiting for VRF callback...");
    await this.waitForResult(gamePda);

    const state = await this.erProgram.account.gameState.fetch(gamePda);
    console.log("✓ Dice result:", state.lastRoll.toString());
    return state.lastRoll.toNumber();
  }

  async randomInRange(gamePda: PublicKey, min: number, max: number): Promise<number> {
    console.log(`Requesting random in range ${min}-${max}...`);
    
    await this.erProgram.methods
      .randomInRange(min, max)
      .accounts({ payer: this.wallet.publicKey, game: gamePda })
      .signers([this.wallet])
      .rpc({ skipPreflight: true });

    console.log("Waiting for VRF callback...");
    await this.waitForResult(gamePda);

    const state = await this.erProgram.account.gameState.fetch(gamePda);
    console.log("✓ Random result:", state.lastRoll.toString());
    return state.lastRoll.toNumber();
  }

  async waitForResult(gamePda: PublicKey, timeout = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const state = await this.erProgram.account.gameState.fetch(gamePda);
      if (!state.pendingRequest) return;
      await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error("VRF callback timeout");
  }

  async undelegate(gamePda: PublicKey): Promise<string> {
    console.log("Undelegating...");
    
    const signature = await this.erProgram.methods
      .undelegate()
      .accounts({ payer: this.wallet.publicKey, game: gamePda })
      .signers([this.wallet])
      .rpc({ skipPreflight: true });

    console.log("✓ Undelegated:", signature);
    return signature;
  }

  async getGameState(gamePda: PublicKey, useER = true) {
    const program = useER ? this.erProgram : this.baseProgram;
    return await program.account.gameState.fetch(gamePda);
  }

  subscribeToGame(gamePda: PublicKey, callback: (state: any) => void): number {
    return this.erConnection.onAccountChange(gamePda, (accountInfo) => {
      try {
        const decoded = this.erProgram.coder.accounts.decode("GameState", accountInfo.data);
        callback(decoded);
      } catch (e) {
        console.error("Decode error:", e);
      }
    });
  }
}

export default MagicBlockVRFClient;
