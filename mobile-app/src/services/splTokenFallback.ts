import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint as createSplMint,
  mintTo as mintToSpl,
  transfer as transferSpl,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * SPL Token Fallback Service
 * 
 * Provides traditional SPL token operations as a fallback when
 * compressed token operations fail. This ensures the system can
 * continue operating even if Light Protocol is unavailable.
 * 
 * Cost Comparison:
 * - SPL token account: ~2,000,000 lamports (~$0.20)
 * - Compressed token account: ~5,000 lamports (~$0.0005)
 * 
 * This service is used automatically when compressed token operations
 * fail with retryable errors.
 */
export class SplTokenFallbackService {
  private connection: Connection;

  constructor(rpcEndpoint: string) {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
  }

  /**
   * Create a traditional SPL token mint
   * Cost: ~1,461,600 lamports
   */
  async createSplMint(
    payer: Keypair,
    authority: PublicKey,
    decimals: number = 9
  ): Promise<PublicKey> {
    try {
      const mint = await createSplMint(
        this.connection,
        payer,
        authority,
        null, // No freeze authority
        decimals,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );
      
      console.log('Created SPL mint (fallback):', mint.toBase58());
      return mint;
    } catch (error) {
      console.error('SPL mint creation failed:', error);
      throw new Error(
        `SPL mint creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mint SPL tokens to a recipient
   * Cost: ~2,039,280 lamports for account creation + ~5,000 for mint
   */
  async mintSplTokens(
    payer: Keypair,
    mint: PublicKey,
    recipient: PublicKey,
    authority: Keypair,
    amount: bigint
  ): Promise<string> {
    try {
      // Get or create associated token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        mint,
        recipient,
        false,
        'confirmed',
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Mint tokens
      const signature = await mintToSpl(
        this.connection,
        payer,
        mint,
        recipientTokenAccount.address,
        authority,
        amount,
        [],
        undefined,
        TOKEN_PROGRAM_ID
      );

      console.log('Minted SPL tokens (fallback):', signature);
      return signature;
    } catch (error) {
      console.error('SPL token minting failed:', error);
      throw new Error(
        `SPL token minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transfer SPL tokens between accounts
   * Cost: ~5,000 lamports
   */
  async transferSplTokens(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    sender: Keypair,
    recipient: PublicKey
  ): Promise<string> {
    try {
      // Get or create sender's token account
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        mint,
        sender.publicKey,
        false,
        'confirmed',
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Get or create recipient's token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        mint,
        recipient,
        false,
        'confirmed',
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Transfer tokens
      const signature = await transferSpl(
        this.connection,
        payer,
        senderTokenAccount.address,
        recipientTokenAccount.address,
        sender,
        amount,
        [],
        undefined,
        TOKEN_PROGRAM_ID
      );

      console.log('Transferred SPL tokens (fallback):', signature);
      return signature;
    } catch (error) {
      console.error('SPL token transfer failed:', error);
      throw new Error(
        `SPL token transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get connection instance for advanced operations
   */
  getConnection(): Connection {
    return this.connection;
  }
}

/**
 * Create a singleton instance of SplTokenFallbackService
 */
export function createSplTokenFallbackService(
  rpcEndpoint: string
): SplTokenFallbackService {
  return new SplTokenFallbackService(rpcEndpoint);
}
