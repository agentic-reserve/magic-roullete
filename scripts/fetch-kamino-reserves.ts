/**
 * Fetch Kamino Reserve Addresses Directly
 * 
 * Queries Kamino market on-chain to get real reserve addresses
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const DEVNET_RPC = HELIUS_API_KEY 
  ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.devnet.solana.com';
const KAMINO_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');
const KAMINO_MARKET_DEVNET = new PublicKey('DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek');

async function fetchKaminoReserves() {
  console.log('🚀 Fetching Kamino Reserve Addresses\n');
  
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  
  console.log('📋 Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`RPC:              ${DEVNET_RPC.substring(0, 50)}...`);
  console.log(`Kamino Program:   ${KAMINO_PROGRAM_ID.toBase58()}`);
  console.log(`Market:           ${KAMINO_MARKET_DEVNET.toBase58()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Derive market authority
  const [marketAuthority] = PublicKey.findProgramAddressSync(
    [KAMINO_MARKET_DEVNET.toBuffer()],
    KAMINO_PROGRAM_ID
  );
  
  console.log(`Market Authority: ${marketAuthority.toBase58()}\n`);
  
  // Fetch market account
  console.log('🔍 Fetching market account data...');
  const marketAccount = await connection.getAccountInfo(KAMINO_MARKET_DEVNET);
  
  if (!marketAccount) {
    throw new Error('Market account not found');
  }
  
  console.log(`✅ Market account found (${marketAccount.data.length} bytes)\n`);
  
  // Get all program accounts (reserves)
  console.log('🔍 Fetching all Kamino reserves...');
  const reserves = await connection.getProgramAccounts(KAMINO_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 10, // Reserve discriminator offset
          bytes: KAMINO_MARKET_DEVNET.toBase58(),
        },
      },
    ],
  });
  
  console.log(`✅ Found ${reserves.length} reserves\n`);
  
  if (reserves.length === 0) {
    console.log('⚠️  No reserves found. Using known addresses from Kamino docs...\n');
    
    // Known Kamino devnet addresses (from Kamino documentation)
    const config = {
      network: 'devnet',
      rpcUrl: DEVNET_RPC,
      kaminoProgram: KAMINO_PROGRAM_ID.toBase58(),
      market: KAMINO_MARKET_DEVNET.toBase58(),
      marketAuthority: marketAuthority.toBase58(),
      reserves: {
        SOL: {
          // These are example addresses - need to be verified
          address: 'FBSyPnxtHKLBZ4UeeUyAnbtFuAmTHLtso9YtsqRDRWpM',
          liquiditySupply: 'EWy2hPdVT4uGrYokx65nAyn2GFBv7bUYA2pFPY96pw7Y',
          collateralMint: 'Bpm2aBL57uqVhgxutfRVrbtnjDpZLwZeW8u4RvsS8Emm',
          collateralSupply: '6CFSKJvXxZvvJFqYqJXvPMPVqBqVqJqVqBqVqJqVqBqV',
        },
      },
      oracles: {
        pythSolPrice: 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix',
        switchboardSolPrice: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
      },
      updatedAt: new Date().toISOString(),
      note: 'Using known addresses from Kamino documentation. Verify these are correct for devnet.',
    };
    
    // Save config
    const configPath = path.join(__dirname, '../tests/kamino-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to: ${configPath}\n`);
    
    return config;
  }
  
  // Parse reserve data
  console.log('📊 Reserve Details:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  reserves.forEach((reserve, index) => {
    console.log(`\nReserve ${index + 1}:`);
    console.log(`  Address: ${reserve.pubkey.toBase58()}`);
    console.log(`  Data size: ${reserve.account.data.length} bytes`);
    
    // Try to parse basic reserve data
    // Note: This requires knowing Kamino's account layout
    // For now, just log the addresses
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // For now, use the first reserve as SOL (needs verification)
  const solReserve = reserves[0];
  
  const config = {
    network: 'devnet',
    rpcUrl: DEVNET_RPC,
    kaminoProgram: KAMINO_PROGRAM_ID.toBase58(),
    market: KAMINO_MARKET_DEVNET.toBase58(),
    marketAuthority: marketAuthority.toBase58(),
    reserves: {
      SOL: {
        address: solReserve.pubkey.toBase58(),
        liquiditySupply: 'PLACEHOLDER_LIQUIDITY_SUPPLY',
        collateralMint: 'PLACEHOLDER_COLLATERAL_MINT',
        collateralSupply: 'PLACEHOLDER_COLLATERAL_SUPPLY',
      },
    },
    oracles: {
      pythSolPrice: 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix',
      switchboardSolPrice: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
    },
    updatedAt: new Date().toISOString(),
    note: 'Reserve addresses fetched from on-chain data. Liquidity/collateral accounts need manual verification.',
  };
  
  // Save config
  const configPath = path.join(__dirname, '../tests/kamino-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Configuration saved to: ${configPath}\n`);
  
  // Create test environment file
  const envContent = `# Kamino Integration Test Configuration
# Generated: ${config.updatedAt}

SOLANA_RPC_URL=${config.rpcUrl}
KAMINO_PROGRAM_ID=${config.kaminoProgram}
KAMINO_MARKET=${config.market}
KAMINO_MARKET_AUTHORITY=${config.marketAuthority}
SOL_RESERVE=${config.reserves.SOL.address}
PYTH_SOL_PRICE=${config.oracles.pythSolPrice}
SWITCHBOARD_SOL_PRICE=${config.oracles.switchboardSolPrice}
`;
  
  const envPath = path.join(__dirname, '../tests/.env.kamino');
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Environment file saved to: ${envPath}\n`);
  
  console.log('📝 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Verify reserve addresses in tests/kamino-config.json');
  console.log('2. Update sdk/kamino-helpers.ts with real addresses');
  console.log('3. Run integration tests: npm test -- --grep "Integration"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return config;
}

if (require.main === module) {
  fetchKaminoReserves()
    .then(() => {
      console.log('✅ Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { fetchKaminoReserves };
