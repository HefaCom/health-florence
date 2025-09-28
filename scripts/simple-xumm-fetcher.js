#!/usr/bin/env node

/**
 * Simple XUMM Balance Fetcher
 * 
 * Fetches HAIC and XRP balances from XUMM wallets without database dependencies.
 * 
 * Usage:
 *   node scripts/simple-xumm-fetcher.js <wallet-address>
 *   node scripts/simple-xumm-fetcher.js rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
 */

import https from 'https';

// XUMM API Configuration
const XUMM_CONFIG = {
  apiKey: "81714331-6a90-496a-8af4-c0655922715a",
  apiSecret: "e7977f2c-5205-42a5-a800-3c7186672674",
  baseUrl: "https://xumm.app/api/v1",
  // Main application account address for balance monitoring
  // You can set this to any XRPL account address you want to monitor
  mainAccountAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH" // Replace with your main account address
};

/**
 * Make HTTP request to XUMM API
 */
function makeXUMMRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'xumm.app',
      port: 443,
      path: `/api/v1${endpoint}`,
      method: 'GET',
      headers: {
        'X-API-Key': XUMM_CONFIG.apiKey,
        'X-API-Secret': XUMM_CONFIG.apiSecret,
        'Content-Type': 'application/json'
      }
    };

    console.log(`🔍 Making request to: ${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      console.log(`📡 Response status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          console.error('❌ Failed to parse JSON response:');
          console.error('Raw response:', data);
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Get wallet balance from XUMM API
 */
async function getWalletBalance(address) {
  try {
    console.log(`🔍 Fetching balance for wallet: ${address}`);
    const data = await makeXUMMRequest(`/account/${address}`);
    
    console.log('📊 Raw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Extract XRP balance
    const xrpBalance = data.account_data?.Balance ? 
      parseFloat(data.account_data.Balance) / 1000000 : 0; // XRP is in drops
    
    // Look for HAIC token balance in trustlines
    let haicBalance = 0;
    if (data.account_lines?.lines) {
      console.log(`🔍 Found ${data.account_lines.lines.length} trustlines`);
      
      const haicLine = data.account_lines.lines.find((line) => {
        console.log(`   Trustline: ${line.currency} - ${line.balance}`);
        return line.currency === 'HAIC' || line.currency === 'HAIC';
      });
      
      if (haicLine) {
        haicBalance = parseFloat(haicLine.balance) || 0;
        console.log(`✅ Found HAIC trustline: ${haicBalance}`);
      } else {
        console.log(`⚠️  No HAIC trustline found`);
      }
    } else {
      console.log(`⚠️  No trustlines found`);
    }

    return { xrp: xrpBalance, haic: haicBalance };
  } catch (error) {
    console.error(`❌ Error fetching balance for ${address}:`, error.message);
    return { xrp: 0, haic: 0 };
  }
}

/**
 * Get XUMM API account balance (the main account associated with the API key)
 */
async function getXUMMAPIBalance() {
  try {
    console.log(`🔍 Using configured main account address...`);
    
    // Use the configured main account address
    const accountAddress = XUMM_CONFIG.mainAccountAddress;
    
    if (!accountAddress) {
      console.log('⚠️  No main account address configured');
      console.log('💡 Please set XUMM_CONFIG.mainAccountAddress to your main XRPL account address');
      return { xrp: 0, haic: 0 };
    }
    
    console.log(`🔗 Account Address: ${accountAddress}`);
    
    // Now get the balance using the XRP Ledger API
    console.log(`🔍 Fetching XRP balance from XRP Ledger...`);
    const xrpResponse = await fetch('https://s1.ripple.com:51234', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'account_info',
        params: [
          {
            account: accountAddress,
            ledger_index: 'validated'
          }
        ]
      })
    });

    if (!xrpResponse.ok) {
      throw new Error(`XRP Ledger API error: ${xrpResponse.status}`);
    }

    const xrpData = await xrpResponse.json();
    console.log('📊 XRP Ledger Response:');
    console.log(JSON.stringify(xrpData, null, 2));
    
    // Extract XRP balance
    const xrpBalance = xrpData.result?.account_data?.Balance ? 
      parseFloat(xrpData.result.account_data.Balance) / 1000000 : 0;
    
    // Get trustlines for HAIC tokens
    console.log(`🔍 Fetching trustlines from XRP Ledger...`);
    const trustlinesResponse = await fetch('https://s1.ripple.com:51234', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'account_lines',
        params: [
          {
            account: accountAddress,
            ledger_index: 'validated'
          }
        ]
      })
    });

    let haicBalance = 0;
    if (trustlinesResponse.ok) {
      const trustlinesData = await trustlinesResponse.json();
      console.log('📊 Trustlines Response:');
      console.log(JSON.stringify(trustlinesData, null, 2));
      
      if (trustlinesData.result?.lines) {
        console.log(`🔍 Found ${trustlinesData.result.lines.length} trustlines`);
        
        const haicLine = trustlinesData.result.lines.find((line) => {
          console.log(`   Trustline: ${line.currency} - ${line.balance}`);
          return line.currency === 'HAIC' || line.currency === 'HAIC';
        });
        
        if (haicLine) {
          haicBalance = parseFloat(haicLine.balance) || 0;
          console.log(`✅ Found HAIC trustline: ${haicBalance}`);
        } else {
          console.log(`⚠️  No HAIC trustline found`);
        }
      } else {
        console.log(`⚠️  No trustlines found`);
      }
    } else {
      console.log(`⚠️  Failed to fetch trustlines: ${trustlinesResponse.status}`);
    }

    return { xrp: xrpBalance, haic: haicBalance };
  } catch (error) {
    console.error(`❌ Error fetching XUMM API balance:`, error.message);
    return { xrp: 0, haic: 0 };
  }
}

/**
 * Format balance for display
 */
function formatBalance(balance) {
  return balance.toFixed(6);
}

/**
 * Main execution function
 */
async function main() {
  const walletAddress = process.argv[2];
  
  if (!walletAddress) {
    console.log('❌ Please provide a wallet address or use --api to fetch API balance');
    console.log('Usage: node scripts/simple-xumm-fetcher.js <wallet-address>');
    console.log('       node scripts/simple-xumm-fetcher.js --api');
    console.log('Example: node scripts/simple-xumm-fetcher.js rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
    process.exit(1);
  }

  console.log('🚀 Starting Simple XUMM Balance Fetcher...\n');
  console.log(`🔑 API Key: ${XUMM_CONFIG.apiKey.substring(0, 8)}...`);
  console.log('');

  try {
    let balance;
    
    if (walletAddress === '--api') {
      console.log('🔍 Fetching XUMM API account balance...');
      balance = await getXUMMAPIBalance();
      
      console.log('\n📊 XUMM API ACCOUNT BALANCE');
      console.log('='.repeat(50));
      console.log(`HAIC: ${formatBalance(balance.haic)}`);
      console.log(`XRP:  ${formatBalance(balance.xrp)}`);
      
      if (balance.haic > 0) {
        console.log(`✅ XUMM API account has ${formatBalance(balance.haic)} HAIC tokens!`);
      } else {
        console.log(`⚠️  XUMM API account has no HAIC tokens`);
      }
      
      if (balance.xrp > 0) {
        console.log(`✅ XUMM API account has ${formatBalance(balance.xrp)} XRP!`);
      } else {
        console.log(`⚠️  XUMM API account has no XRP`);
      }
    } else {
      console.log(`🔗 Wallet Address: ${walletAddress}`);
      balance = await getWalletBalance(walletAddress);
      
      console.log('\n📊 WALLET BALANCE');
      console.log('='.repeat(50));
      console.log(`HAIC: ${formatBalance(balance.haic)}`);
      console.log(`XRP:  ${formatBalance(balance.xrp)}`);
      
      if (balance.haic > 0) {
        console.log(`✅ User has ${formatBalance(balance.haic)} HAIC tokens!`);
      } else {
        console.log(`⚠️  User has no HAIC tokens`);
      }
      
      if (balance.xrp > 0) {
        console.log(`✅ User has ${formatBalance(balance.xrp)} XRP!`);
      } else {
        console.log(`⚠️  User has no XRP`);
      }
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  getWalletBalance,
  makeXUMMRequest
};
