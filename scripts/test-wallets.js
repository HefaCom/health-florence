#!/usr/bin/env node

/**
 * Test Multiple XUMM Wallets
 * 
 * Tests HAIC and XRP balance fetching for multiple wallet addresses.
 * 
 * Usage:
 *   node scripts/test-wallets.js
 */

import { getWalletBalance } from './simple-xumm-fetcher.js';

// Test wallet addresses (replace with actual addresses)
const TEST_WALLETS = [
  'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH', // Example address 1
  'rPT1Sjq2YGrBMTttX4GZHjKu9fFrrV1AH4', // Example address 2
  'rBithomp3nALiCgHs6uDCCx8DzKFSJ8YXv', // Example address 3
  // Add more test addresses here
];

/**
 * Test all wallets
 */
async function testAllWallets() {
  console.log('🚀 Testing Multiple XUMM Wallets...\n');
  
  let totalHAIC = 0;
  let totalXRP = 0;
  let walletsWithHAIC = 0;
  let walletsWithXRP = 0;

  for (let i = 0; i < TEST_WALLETS.length; i++) {
    const wallet = TEST_WALLETS[i];
    console.log(`\n🔗 Testing Wallet ${i + 1}/${TEST_WALLETS.length}: ${wallet}`);
    console.log('-'.repeat(60));
    
    try {
      const balance = await getWalletBalance(wallet);
      
      console.log(`HAIC: ${balance.haic.toFixed(6)}`);
      console.log(`XRP:  ${balance.xrp.toFixed(6)}`);
      
      totalHAIC += balance.haic;
      totalXRP += balance.xrp;
      
      if (balance.haic > 0) walletsWithHAIC++;
      if (balance.xrp > 0) walletsWithXRP++;
      
      // Add delay between requests to avoid rate limiting
      if (i < TEST_WALLETS.length - 1) {
        console.log('⏳ Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Error testing wallet ${wallet}:`, error.message);
    }
  }

  // Summary
  console.log('\n📈 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Wallets Tested: ${TEST_WALLETS.length}`);
  console.log(`Wallets with HAIC: ${walletsWithHAIC}`);
  console.log(`Wallets with XRP: ${walletsWithXRP}`);
  console.log(`Total HAIC Supply: ${totalHAIC.toFixed(6)}`);
  console.log(`Total XRP Supply: ${totalXRP.toFixed(6)}`);
  console.log(`Average HAIC per wallet: ${(totalHAIC / TEST_WALLETS.length).toFixed(6)}`);
  console.log(`Average XRP per wallet: ${(totalXRP / TEST_WALLETS.length).toFixed(6)}`);
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllWallets().catch(console.error);
}
