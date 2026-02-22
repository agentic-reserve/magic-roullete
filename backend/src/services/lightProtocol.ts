/**
 * Light Protocol ZK Compression Service
 * 
 * Provides 1000x cost reduction for token accounts using ZK Compression
 * - Compressed token accounts: ~5,000 lamports vs ~2,000,000 for SPL
 * - Rent-free storage
 * - Perfect for high-volume mobile gaming
 */

import { createRpc, Rpc } from "@lightprotocol/stateless.js";
import {
  createMint,
  mintTo,
  transfer,
  compress,
  decompress,
  getCompressedTokenAccountsByOwner,
} from "@lightprotocol/compressed-token";
import { Connection, Keypair, PublicKey } from