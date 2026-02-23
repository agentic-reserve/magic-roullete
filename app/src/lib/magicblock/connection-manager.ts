import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { DELEGATION_PROGRAM_ID } from "@magicblock-labs/ephemeral-rollups-sdk";

export interface ConnectionConfig {
  baseRpcUrl: string;
  erRpcUrl: string;
  commitment?: Commitment;
}

export class MagicBlockConnectionManager {
  public readonly baseConnection: Connection;
  public readonly erConnection: Connection;
  private readonly commitment: Commitment;

  constructor(config: ConnectionConfig) {
    this.commitment = config.commitment || "confirmed";
    this.baseConnection = new Connection(config.baseRpcUrl, this.commitment);
    this.erConnection = new Connection(config.erRpcUrl, {
      commitment: this.commitment,
      confirmTransactionInitialTimeout: 60000,
    });
  }

  async isDelegated(pubkey: PublicKey): Promise<boolean> {
    const info = await this.baseConnection.getAccountInfo(pubkey);
    return info?.owner.equals(DELEGATION_PROGRAM_ID) ?? false;
  }

  async getConnectionForAccount(pubkey: PublicKey): Promise<Connection> {
    const delegated = await this.isDelegated(pubkey);
    return delegated ? this.erConnection : this.baseConnection;
  }

  createBaseProvider(wallet: Wallet): AnchorProvider {
    return new AnchorProvider(this.baseConnection, wallet, {
      commitment: this.commitment,
    });
  }

  createERProvider(wallet: Wallet): AnchorProvider {
    return new AnchorProvider(this.erConnection, wallet, {
      commitment: this.commitment,
      skipPreflight: true,
    });
  }
}

export const DEVNET_CONFIG: ConnectionConfig = {
  baseRpcUrl: "https://api.devnet.solana.com",
  erRpcUrl: "https://devnet.magicblock.app",
  commitment: "confirmed",
};

export const MAINNET_CONFIG: ConnectionConfig = {
  baseRpcUrl: "https://api.mainnet-beta.solana.com",
  erRpcUrl: "https://mainnet.magicblock.app",
  commitment: "confirmed",
};
