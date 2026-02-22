/**
 * Setup Kamino Integration Tests
 * 
 * Fetches real Kamino devnet market data using the official SDK
 * and configures integration tests with actual addresses.
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '17d9dba-7315-4095-a0ed-acbf1a641dac';
const DEVNET_RPC = process.env.SOLANA_RPC_URL || `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const KAMINO_PROGRAM_ID = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD';
const KAMINO_MARKET_DEVNET = 'DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek';

interface KaminoConfig {
  network: string;
  rpcUrl: string;
  kaminoProgram: string;
  market: string;
  marketAuthority: string;
  reserves: {
    SOL?: {
      address: string;
      liquiditySupply: string;
      collateralMint: string;
      collateralSupply: string;
    };
  };
  oracles: {
    pythSolPrice: string;
    switchboardSolPrice: string;
  };
  updatedAt: string;
}

async function setupKaminoIntegration() {
  console.log('🚀 Setting up Kamino Integration Tests\n');

  const connection = new Connection(DEVNET_RPC, 'confirmed');

  // Check if Kamino SDK is installed
  let hasKaminoSDK = false;
  try {
    require.resolve('@kamino-finance/klend-sdk');
    hasKaminoSDK = true;
    console.log('✅ Kamino SDK found');
  } catch {
    console.log('⚠️  Kamino SDK not installed');
    console.log('   Run: npm install @kamino-finance/klend-sdk\n');
  }

  // Derive market authority
  const marketPubkey = new PublicKey(KAMINO_MARKET_DEVNET);
  const kaminoProgramId = new PublicKey(KAMINO_PROGRAM_ID);
  
  const [marketAuthority] = PublicKey.findProgramAddressSync(
    [marketPubkey.toBuffer()],
    kaminoProgramId
  );

  console.log('📋 Kamino Devnet Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Market:           ${KAMINO_MARKET_DEVNET}`);
  console.log(`Market Authority: ${marketAuthority.toBase58()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const config: KaminoConfig = {
    network: 'devnet',
    rpcUrl: DEVNET_RPC,
    kaminoProgram: KAMINO_PROGRAM_ID,
    market: KAMINO_MARKET_DEVNET,
    marketAuthority: marketAuthority.toBase58(),
    reserves: {},
    oracles: {
      pythSolPrice: 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix',
      switchboardSolPrice: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
    },
    updatedAt: new Date().toISOString(),
  };

  if (hasKaminoSDK) {
    try {
      console.log('🔍 Fetching reserve data from Kamino SDK...\n');
      
      // Dynamic import of Kamino SDK
      const { KaminoMarket, DEFAULT_RECENT_SLOT_DURATION_MS } = await import('@kamino-finance/klend-sdk');
      
      const market = await KaminoMarket.load(
        connection as any, // SDK expects different connection type
        marketPubkey,
        DEFAULT_RECENT_SLOT_DURATION_MS
      );

      if (!market) {
        throw new Error('Failed to load market');
      }

      console.log('✅ Market loaded successfully');

      // Get all reserves and find SOL
      const reserves = market.getReserves();
      const solReserveEntry = Array.from(reserves.entries()).find(([symbol]) => 
        symbol.toLowerCase() === 'sol' || symbol.toLowerCase() === 'wsol'
      );
      
      if (solReserveEntry) {
        const [symbol, solReserve] = solReserveEntry;
        console.log(`✅ ${symbol} Reserve found\n`);
        
        config.reserves.SOL = {
          address: solReserve.address.toBase58(),
          liquiditySupply: solReserve.state.liquidity.supplyVault.toBase58(),
          collateralMint: solReserve.state.collateral.mintPubkey.toBase58(),
          collateralSupply: solReserve.state.collateral.supplyVault.toBase58(),
        };

        console.log('📊 SOL Reserve Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Symbol:           ${symbol}`);
        console.log(`Address:          ${config.reserves.SOL.address}`);
        console.log(`Liquidity Supply: ${config.reserves.SOL.liquiditySupply}`);
        console.log(`Collateral Mint:  ${config.reserves.SOL.collateralMint}`);
        console.log(`Collateral Supply: ${config.reserves.SOL.collateralSupply}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('⚠️  SOL Reserve not found in market');
        console.log('   Available reserves:', Array.from(reserves.keys()).join(', '));
        console.log('   Using placeholder addresses\n');
      }
    } catch (error) {
      console.error('❌ Error loading Kamino market:', error);
      console.log('   Using placeholder addresses\n');
    }
  }

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
${config.reserves.SOL ? `
SOL_RESERVE=${config.reserves.SOL.address}
SOL_LIQUIDITY_SUPPLY=${config.reserves.SOL.liquiditySupply}
SOL_COLLATERAL_MINT=${config.reserves.SOL.collateralMint}
SOL_COLLATERAL_SUPPLY=${config.reserves.SOL.collateralSupply}
` : ''}
PYTH_SOL_PRICE=${config.oracles.pythSolPrice}
SWITCHBOARD_SOL_PRICE=${config.oracles.switchboardSolPrice}
`;

  const envPath = path.join(__dirname, '../tests/.env.kamino');
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Environment file saved to: ${envPath}\n`);

  // Print next steps
  console.log('📝 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!hasKaminoSDK) {
    console.log('1. Install Kamino SDK:');
    console.log('   npm install @kamino-finance/klend-sdk');
    console.log('   Then run this script again\n');
  }
  
  if (!config.reserves.SOL) {
    console.log('2. Verify Kamino market is active on devnet');
    console.log('   Visit: https://app.kamino.finance/?cluster=devnet\n');
  }

  console.log('3. Run integration tests:');
  console.log('   npm test -- --grep "Integration"\n');

  console.log('4. Or run specific test:');
  console.log('   npm test tests/kamino-integration.test.ts\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return config;
}

// Run if called directly
if (require.main === module) {
  setupKaminoIntegration()
    .then(() => {
      console.log('✅ Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { setupKaminoIntegration };
