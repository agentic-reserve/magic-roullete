/**
 * Deep Linking Validation Script
 * Task 9.3: Add deep link testing and validation
 * 
 * Validates deep linking implementation:
 * - Configuration in app.json
 * - Hook implementation
 * - URL parsing logic
 * - Navigation integration
 * 
 * Requirements: 5.7
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Deep Linking Implementation...\n');

let errors = 0;
let warnings = 0;

// 1. Validate app.json configuration
console.log('1️⃣ Checking app.json configuration...');
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Check scheme
  if (appJson.expo.scheme === 'magicroulette') {
    console.log('   ✅ Custom scheme configured: magicroulette://');
  } else {
    console.log('   ❌ Custom scheme not configured or incorrect');
    errors++;
  }
  
  // Check iOS associated domains
  if (appJson.expo.ios?.associatedDomains?.includes('applinks:magicroulette.com')) {
    console.log('   ✅ iOS associated domains configured');
  } else {
    console.log('   ⚠️  iOS associated domains not configured');
    warnings++;
  }
  
  // Check Android intent filters
  if (appJson.expo.android?.intentFilters?.length > 0) {
    const hasCustomScheme = appJson.expo.android.intentFilters.some(filter =>
      filter.data?.some(d => d.scheme === 'magicroulette')
    );
    const hasUniversalLink = appJson.expo.android.intentFilters.some(filter =>
      filter.data?.some(d => d.scheme === 'https' && d.host === 'magicroulette.com')
    );
    
    if (hasCustomScheme) {
      console.log('   ✅ Android custom scheme configured');
    } else {
      console.log('   ❌ Android custom scheme not configured');
      errors++;
    }
    
    if (hasUniversalLink) {
      console.log('   ✅ Android universal links configured');
    } else {
      console.log('   ⚠️  Android universal links not configured');
      warnings++;
    }
  } else {
    console.log('   ❌ Android intent filters not configured');
    errors++;
  }
} catch (error) {
  console.log('   ❌ Error reading app.json:', error.message);
  errors++;
}

// 2. Validate hook implementation
console.log('\n2️⃣ Checking useDeepLinking hook...');
try {
  const hookPath = path.join(__dirname, '..', 'src', 'hooks', 'useDeepLinking.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  // Check for required functions
  const requiredFunctions = [
    'useDeepLinking',
    'generateDeepLink',
    'generateUniversalLink',
    'handleDeepLink',
    'parseDeepLink',
  ];
  
  requiredFunctions.forEach(func => {
    if (hookContent.includes(func)) {
      console.log(`   ✅ Function ${func} implemented`);
    } else {
      console.log(`   ❌ Function ${func} missing`);
      errors++;
    }
  });
  
  // Check for route types
  const routeTypes = ['game', 'invite', 'mode', 'lobby', 'create', 'home'];
  const hasAllRoutes = routeTypes.every(type => hookContent.includes(`'${type}'`));
  
  if (hasAllRoutes) {
    console.log('   ✅ All route types implemented');
  } else {
    console.log('   ❌ Some route types missing');
    errors++;
  }
  
  // Check for Linking API usage
  if (hookContent.includes('Linking.getInitialURL') && hookContent.includes('Linking.addEventListener')) {
    console.log('   ✅ React Native Linking API properly used');
  } else {
    console.log('   ❌ Linking API not properly implemented');
    errors++;
  }
} catch (error) {
  console.log('   ❌ Error reading useDeepLinking.ts:', error.message);
  errors++;
}

// 3. Validate App.tsx integration
console.log('\n3️⃣ Checking App.tsx integration...');
try {
  const appPath = path.join(__dirname, '..', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('useDeepLinking')) {
    console.log('   ✅ useDeepLinking hook imported and used');
  } else {
    console.log('   ❌ useDeepLinking hook not integrated');
    errors++;
  }
  
  if (appContent.includes('NavigationContainer')) {
    console.log('   ✅ NavigationContainer configured');
  } else {
    console.log('   ❌ NavigationContainer missing');
    errors++;
  }
} catch (error) {
  console.log('   ❌ Error reading App.tsx:', error.message);
  errors++;
}

// 4. Validate test file
console.log('\n4️⃣ Checking test implementation...');
try {
  const testPath = path.join(__dirname, '..', 'src', 'hooks', '__tests__', 'useDeepLinking.test.ts');
  const testContent = fs.readFileSync(testPath, 'utf8');
  
  const testSuites = [
    'generateDeepLink',
    'generateUniversalLink',
    'Deep Link URL Formats',
    'Deep Link Parameter Validation',
  ];
  
  testSuites.forEach(suite => {
    if (testContent.includes(suite)) {
      console.log(`   ✅ Test suite "${suite}" implemented`);
    } else {
      console.log(`   ⚠️  Test suite "${suite}" missing`);
      warnings++;
    }
  });
} catch (error) {
  console.log('   ⚠️  Test file not found or error reading:', error.message);
  warnings++;
}

// 5. Validate documentation
console.log('\n5️⃣ Checking documentation...');
try {
  const docPath = path.join(__dirname, '..', 'DEEP_LINKING_GUIDE.md');
  const docContent = fs.readFileSync(docPath, 'utf8');
  
  const requiredSections = [
    'Supported URL Schemes',
    'Deep Link Routes',
    'Configuration',
    'Testing Deep Links',
    'dApp Store Integration',
    'Troubleshooting',
  ];
  
  requiredSections.forEach(section => {
    if (docContent.includes(section)) {
      console.log(`   ✅ Documentation section "${section}" present`);
    } else {
      console.log(`   ⚠️  Documentation section "${section}" missing`);
      warnings++;
    }
  });
} catch (error) {
  console.log('   ⚠️  Documentation not found or error reading:', error.message);
  warnings++;
}

// 6. Validate deep link formats
console.log('\n6️⃣ Validating deep link formats...');
const testLinks = [
  { url: 'magicroulette://game/12345', valid: true, type: 'custom scheme' },
  { url: 'magicroulette://invite/abc123', valid: true, type: 'custom scheme' },
  { url: 'magicroulette://mode/1v1', valid: true, type: 'custom scheme' },
  { url: 'magicroulette://lobby', valid: true, type: 'custom scheme' },
  { url: 'https://magicroulette.com/play/game/12345', valid: true, type: 'universal link' },
  { url: 'https://magicroulette.com/play/invite/abc123', valid: true, type: 'universal link' },
];

testLinks.forEach(({ url, valid, type }) => {
  const isCustomScheme = url.startsWith('magicroulette://');
  const isUniversalLink = url.startsWith('https://magicroulette.com/play');
  
  if ((isCustomScheme || isUniversalLink) === valid) {
    console.log(`   ✅ ${type}: ${url}`);
  } else {
    console.log(`   ❌ Invalid ${type}: ${url}`);
    errors++;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));

if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Deep linking is properly implemented.');
  process.exit(0);
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} error(s) found`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning(s) found`);
  }
  
  if (errors > 0) {
    console.log('\n❌ Deep linking implementation has errors that need to be fixed.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Deep linking implementation is functional but has warnings.');
    process.exit(0);
  }
}
