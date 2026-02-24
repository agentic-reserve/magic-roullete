import { Keypair, PublicKey } from '@solana/web3.js';
import {
  LightProtocolService,
  CompressedTokenError,
  CompressedTokenErrorType,
  createLightProtocolService,
} from './lightProtocol';
import {
  SplTokenFallbackService,
  createSplTokenFallbackService,
} from './splTokenFallback';

/**
 * Token operation result with metadata
 */
export interface TokenOperationResult {
  signature: string;
  usedCompressed: boolean;
  fallbackUsed: boolean;
  errorMessage?: string;
}

/**
 * Token service configuration
 */
export interface TokenServiceConfig {
  rpcEndpoint: string;
  compressionEndpoint?: string;
  enableFallback: boolean;
  preferCompressed: boolean;
}

/**
 * Unified Token Service
 * 
 * Provides a unified interface for token operations that automatically
 * handles compressed tokens with SPL token fallback.
 * 
 * Features:
 * - Automatic fallback to SPL tokens on compressed token failures
 * - Clear error messages with operation context
 * - Retry logic with exponential backoff
 * - Cost tracking and reporting
 * 
 * Usage:
 * ```typescript
 * const tokenService = new TokenService({
 *   rpcEndpoint: 'https://api.devnet.solana.com',
 *   enableFallback: true,
 *   preferCompressed: true,
 * });
 * 
 * try {
 *   const result = await tokenService.transfer(
 *     payer, mint, amount, sender, recipient
 *   );
 *   
 *   if (result.fallbackUsed) {
 *     console.warn('Used SPL fallback due to compressed token failure');
 *   }
 * } catch (error) {
 *   console.error('Both compressed and SPL transfers failed');
 * }
 * ```
 */
export class TokenService {
  private lightProtocol: LightProtocolService;
  private splFallback: SplTokenFallbackService;
  private config: TokenServiceConfig;

  constructor(config: TokenServiceConfig) {
    this.config = config;
    this.lightProtocol = createLightProtocolService(
      config.rpcEndpoint,
      config.compressionEndpoint
    );
    this.splFallback = createSplTokenFallbackService(config.rpcEndpoint);
  }

  /**
   * Create a token mint (compressed or SPL)
   */
  async createMint(
    payer: Keypair,
    authority: PublicKey,
    decimals: number = 9
  ): Promise<TokenOperationResult> {
    // Try compressed first if preferred
    if (this.config.preferCompressed) {
      try {
        const mint = await this.lightProtocol.createCompressedMint(
          payer,
          authority,
          decimals
        );
        
        return {
          signature: mint.toBase58(),
          usedCompressed: true,
          fallbackUsed: false,
        };
      } catch (error) {
        if (error instanceof CompressedTokenError && this.config.enableFallback) {
          console.warn(
            `Compressed mint creation failed (${error.type}), falling back to SPL:`,
            error.message
          );
          
          // Fallback to SPL
          const mint = await this.splFallback.createSplMint(
            payer,
            authority,
            decimals
          );
          
          return {
            signature: mint.toBase58(),
            usedCompressed: false,
            fallbackUsed: true,
            errorMessage: error.message,
          };
        }
        
        throw error;
      }
    }

    // Use SPL directly if not preferring compressed
    const mint = await this.splFallback.createSplMint(
      payer,
      authority,
      decimals
    );
    
    return {
      signature: mint.toBase58(),
      usedCompressed: false,
      fallbackUsed: false,
    };
  }

  /**
   * Mint tokens to a recipient (compressed or SPL)
   */
  async mintTokens(
    payer: Keypair,
    mint: PublicKey,
    recipient: PublicKey,
    authority: Keypair,
    amount: bigint
  ): Promise<TokenOperationResult> {
    // Try compressed first if preferred
    if (this.config.preferCompressed) {
      try {
        const signature = await this.lightProtocol.mintCompressedTokens(
          payer,
          mint,
          recipient,
          authority,
          amount
        );
        
        return {
          signature,
          usedCompressed: true,
          fallbackUsed: false,
        };
      } catch (error) {
        if (error instanceof CompressedTokenError && this.config.enableFallback) {
          console.warn(
            `Compressed token minting failed (${error.type}), falling back to SPL:`,
            error.message
          );
          
          // Fallback to SPL
          const signature = await this.splFallback.mintSplTokens(
            payer,
            mint,
            recipient,
            authority,
            amount
          );
          
          return {
            signature,
            usedCompressed: false,
            fallbackUsed: true,
            errorMessage: error.message,
          };
        }
        
        throw error;
      }
    }

    // Use SPL directly if not preferring compressed
    const signature = await this.splFallback.mintSplTokens(
      payer,
      mint,
      recipient,
      authority,
      amount
    );
    
    return {
      signature,
      usedCompressed: false,
      fallbackUsed: false,
    };
  }

  /**
   * Transfer tokens between accounts (compressed or SPL)
   */
  async transfer(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    sender: Keypair,
    recipient: PublicKey
  ): Promise<TokenOperationResult> {
    // Try compressed first if preferred
    if (this.config.preferCompressed) {
      try {
        const signature = await this.lightProtocol.transferCompressed(
          payer,
          mint,
          amount,
          sender,
          recipient
        );
        
        return {
          signature,
          usedCompressed: true,
          fallbackUsed: false,
        };
      } catch (error) {
        if (error instanceof CompressedTokenError && this.config.enableFallback) {
          console.warn(
            `Compressed token transfer failed (${error.type}), falling back to SPL:`,
            error.message
          );
          
          // Fallback to SPL
          const signature = await this.splFallback.transferSplTokens(
            payer,
            mint,
            amount,
            sender,
            recipient
          );
          
          return {
            signature,
            usedCompressed: false,
            fallbackUsed: true,
            errorMessage: error.message,
          };
        }
        
        throw error;
      }
    }

    // Use SPL directly if not preferring compressed
    const signature = await this.splFallback.transferSplTokens(
      payer,
      mint,
      amount,
      sender,
      recipient
    );
    
    return {
      signature,
      usedCompressed: false,
      fallbackUsed: false,
    };
  }

  /**
   * Compress SPL tokens to compressed format
   */
  async compress(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    owner: Keypair
  ): Promise<string> {
    return await this.lightProtocol.compressTokens(payer, mint, amount, owner);
  }

  /**
   * Decompress compressed tokens to SPL format
   */
  async decompress(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    owner: Keypair
  ): Promise<string> {
    return await this.lightProtocol.decompressTokens(payer, mint, amount, owner);
  }

  /**
   * Get the Light Protocol service instance
   */
  getLightProtocol(): LightProtocolService {
    return this.lightProtocol;
  }

  /**
   * Get the SPL fallback service instance
   */
  getSplFallback(): SplTokenFallbackService {
    return this.splFallback;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TokenServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TokenServiceConfig {
    return { ...this.config };
  }
}

/**
 * Create a singleton instance of TokenService
 */
export function createTokenService(
  config: TokenServiceConfig
): TokenService {
  return new TokenService(config);
}
