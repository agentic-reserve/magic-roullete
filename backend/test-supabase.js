// Quick Supabase connection test
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('1️⃣ Testing basic connection...');
    
    // Test 1: Check if we can query (even if tables don't exist yet)
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('⚠️  Connection successful, but tables not created yet');
        console.log('   Run the schema.sql in Supabase SQL Editor to create tables');
        return;
      }
      throw error;
    }
    
    console.log('✅ Connection successful!');
    console.log('✅ Tables exist and are accessible');
    
    // Test 2: Count records
    console.log('\n2️⃣ Checking database contents...');
    const tables = ['users', 'games', 'transactions', 'badges'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`   ${table}: ${count} records`);
      }
    }
    
    console.log('\n✅ Supabase is fully configured and ready!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your SUPABASE_URL is correct');
    console.error('2. Check your SUPABASE_ANON_KEY is correct');
    console.error('3. Verify your Supabase project is not paused');
    console.error('4. Check your internet connection');
    process.exit(1);
  }
}

testConnection();
