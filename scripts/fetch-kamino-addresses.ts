/**
 * Fetch Real Kamino Devnet Addresses
 * 
 * This script fetches actual Kamino market and reserve addresses from devnet
 * and updates the test configuration files.
 */

import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Kamino Program ID
const KAMINO_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD');

// Known Kamino markets
const KAMINO_MARKETS = {
  mainnet: new PublicKey('7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF'),
  devnet: new PublicKey('DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek'), // Placeholder - may need verification
};

interface KaminoAddresses {
  market: string;
  marketAuthority: string;
  solReserve: string;
  reserveLiquiditySupply: string;
  reserveCollateralMint: string;
  reserveCollateralSupply: string;
  pythSolPrice: string;
  switchboardSolPrice: string;
}

async function fetchKaminoAddresses(network: 'devnet' | 'mainnet'): Promise<KaminoAddresses> {
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  
  const connection = new Connection(rpcUrl, 'confirmed');
  const marketAddress = KAMINO_MARKETS[network];

  console.log(`\n🔍 Fetching Kamino ${network} addresses...`);
  console.log(`Market: ${marketAddress.toBase58()}`);

  try {
    // Fetch market account
    const marketAccount = await connection.getAccountInfo(marketAddress);
    
    if (!marketAccount) {
      throw new Error(`Market account not found: ${marketAddress.toBase58()}`);
    }

    console.log('✅ Market account found');

    // Derive market authority PDA
    const [marketAuthority] = PublicKey.findProgramAddressSync(
      [marketAddress.toBuffer()],
      KAMINO_PROGRAM_ID
    );

    console.log(`✅ Market Authority: ${marketAuthority.toBase58()}`);

    // For devnet, we'll use placeholder addresses that need to be verified
    // In production, you would parse the market account data to get actual reserve addresses
    const addresses: KaminoAddresses = {
      market: marketAddress.toBase58(),
      marketAuthority: marketAuthority.toBase58(),
      // These are placeholders - actual addresses need to be fetched from Kamino SDK or parsed from account data
      solReserve: 'PLACEHOLDER_SOL_RESERVE',
      reserveLiquiditySupply: 'PLACEHOLDER_LIQUIDITY_SUPPLY',
      reserveCollateralMint: 'PLACEHOLDER_COLLATERAL_MINT',
      reserveCollateralSupply: 'PLACEHOLDER_COLLATERAL_SUPPLY',
      pythSolPrice: 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix', // Known Pyth SOL/USD devnet
      switchboardSolPrice: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR', // Known Switchboard SOL/USD devnet
    };

    return addresses;
  } catch (error) {
    console.error('❌ Error fetching Kamino addresses:', error);
    throw error;
  }
}

async function updateTestConfig(addresses: KaminoAddresses) {
  const configPath = path.join(__dirname, '../tests/kamino-config.json');
  
  const config = {
    network: 'devnet',
    kaminoProgram: KAMINO_PROGRAM_ID.toBase58(),
    ...addresses,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n✅ Config saved to: ${configPath}`);
}

async function updateHelperFile(addresses: KaminoAddresses) {
  const helperPath = path.join(__dirname, '../sdk/kamino-helpers.ts');
  
  // Read existing file
  let content = fs.readFileSync(helperPath, 'utf-8');

  // Update placeholder addresses
  content = content.replace(
    /const solReserve = new PublicKey\(".*?"\);/,
    `const solReserve = new PublicKey("${addresses.solReserve}");`
  );
  content = content.replace(
    /const reserveLiquiditySupply = new PublicKey\(".*?"\);/,
    `const reserveLiquiditySupply = new PublicKey("${addresses.reserveLiquiditySupply}");`
  );
  content = content.replace(
    /const reserveCollateralMint = new PublicKey\(".*?"\);/,
    `const reserveCollateralMint = new PublicKey("${addresses.reserveCollateralMint}");`
  );
  content = content.replace(
    /const reserveCollateralSupply = new PublicKey\(".*?"\);/,
    `const reserveCollateralSupply = new PublicKey("${addresses.reserveCollateralSupply}");`
  );

  fs.writeFileSync(helperPath, content);
  console.log(`✅ Helper file updated: ${helperPath}`);
}

async function main() {
  console.log('🚀 Fetching Kamino Devnet Addresses\n');
  console.log('⚠️  Note: Some addresses are placeholders and need verification');
  console.log('   Install @kamino-finance/klend-sdk for accurate reserve addresses\n');

  try {
    // Fetch devnet addresses
    const addresses = await fetchKaminoAddresses('devnet');

    // Display addresses
    console.log('\n📋 Kamino Devnet Addresses:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(addresses).forEach(([key, value]) => {
      console.log(`${key.padEnd(25)}: ${value}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Update config file
    await updateTestConfig(addresses);

    // Update helper file
    // await updateHelperFile(addresses); // Uncomment when addresses are verified

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Install Kamino SDK: npm install @kamino-finance/klend-sdk');
    console.log('2. Run: npm run fetch-kamino-reserves (to get actual reserve addresses)');
    console.log('3. Run: npm test -- --grep "Integration"');

  } catch (error) {
    console.error('\n❌ Failed to fetch addresses:', error);
    process.exit(1);
  }
}

main();
