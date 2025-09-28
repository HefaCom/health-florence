#!/usr/bin/env node

/**
 * XUMM Balance Fetcher Script
 * 
 * This script fetches HAIC and XRP balances from XUMM wallets
 * for all users in the Health Florence database.
 * 
 * Usage:
 *   node scripts/fetch-xumm-balances.js
 *   node scripts/fetch-xumm-balances.js --user-email user@example.com
 *   node scripts/fetch-xumm-balances.js --wallet-address rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
 */

import https from 'https';
import { generateClient } from 'aws-amplify/api';

// XUMM API Configuration
const XUMM_CONFIG = {
  apiKey: "81714331-6a90-496a-8af4-c0655922715a",
  apiSecret: "e7977f2c-5205-42a5-a800-3c7186672674",
  baseUrl: "https://xumm.app/api/v1"
};

// Parse command line arguments
const args = process.argv.slice(2);
const userEmail = args.find(arg => arg.startsWith('--user-email='))?.split('=')[1];
const walletAddress = args.find(arg => arg.startsWith('--wallet-address='))?.split('=')[1];

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

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
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
    
    // Extract XRP balance
    const xrpBalance = data.account_data?.Balance ? 
      parseFloat(data.account_data.Balance) / 1000000 : 0; // XRP is in drops
    
    // Look for HAIC token balance in trustlines
    let haicBalance = 0;
    if (data.account_lines?.lines) {
      const haicLine = data.account_lines.lines.find((line) => 
        line.currency === 'HAIC' || line.currency === 'HAIC'
      );
      if (haicLine) {
        haicBalance = parseFloat(haicLine.balance) || 0;
      }
    }

    return { xrp: xrpBalance, haic: haicBalance };
  } catch (error) {
    console.error(`❌ Error fetching balance for ${address}:`, error.message);
    return { xrp: 0, haic: 0 };
  }
}

/**
 * Get all users from database
 */
async function getAllUsers() {
  try {
    const client = generateClient();
    
    const listUsersQuery = /* GraphQL */ `
      query ListUsers {
        listUsers {
          items {
            id
            email
            firstName
            lastName
            preferences
          }
        }
      }
    `;

    const result = await client.graphql({
      query: listUsersQuery,
      authMode: 'apiKey'
    });

    return (result.data?.listUsers?.items || []);
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    return [];
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    const client = generateClient();
    
    const listUsersQuery = /* GraphQL */ `
      query ListUsers {
        listUsers {
          items {
            id
            email
            firstName
            lastName
            preferences
          }
        }
      }
    `;

    const result = await client.graphql({
      query: listUsersQuery,
      authMode: 'apiKey'
    });

    const users = result.data?.listUsers?.items || [];
    return users.find(user => user.email === email);
  } catch (error) {
    console.error('❌ Error fetching user:', error.message);
    return null;
  }
}

/**
 * Extract wallet address from user preferences
 */
function getWalletAddress(user) {
  if (!user.preferences) return null;
  
  try {
    const preferences = typeof user.preferences === 'string' 
      ? JSON.parse(user.preferences) 
      : user.preferences;
    
    return preferences?.wallet?.address || preferences?.xumm?.address;
  } catch (error) {
    console.warn(`⚠️  Could not parse preferences for ${user.email}`);
    return null;
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
  console.log('🚀 Starting XUMM Balance Fetcher...\n');
  
  let users = [];
  let totalHAIC = 0;
  let totalXRP = 0;
  let usersWithWallets = 0;
  let usersWithHAIC = 0;

  try {
    // Get users based on arguments
    if (userEmail) {
      console.log(`👤 Fetching balance for user: ${userEmail}`);
      const user = await getUserByEmail(userEmail);
      if (user) {
        users = [user];
      } else {
        console.error(`❌ User not found: ${userEmail}`);
        process.exit(1);
      }
    } else if (walletAddress) {
      console.log(`🔗 Fetching balance for wallet: ${walletAddress}`);
      const balance = await getWalletBalance(walletAddress);
      console.log(`\n📊 Wallet Balance:`);
      console.log(`   HAIC: ${formatBalance(balance.haic)}`);
      console.log(`   XRP:  ${formatBalance(balance.xrp)}`);
      process.exit(0);
    } else {
      console.log('👥 Fetching all users...');
      users = await getAllUsers();
    }

    if (users.length === 0) {
      console.log('❌ No users found');
      process.exit(1);
    }

    console.log(`📊 Processing ${users.length} users...\n`);

    // Process each user
    for (const user of users) {
      const walletAddress = getWalletAddress(user);
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
      
      if (!walletAddress) {
        console.log(`⚠️  ${userName} (${user.email}) - No wallet connected`);
        continue;
      }

      usersWithWallets++;
      const balance = await getWalletBalance(walletAddress);
      
      console.log(`👤 ${userName} (${user.email})`);
      console.log(`   Wallet: ${walletAddress}`);
      console.log(`   HAIC: ${formatBalance(balance.haic)}`);
      console.log(`   XRP:  ${formatBalance(balance.xrp)}`);
      console.log('');

      totalHAIC += balance.haic;
      totalXRP += balance.xrp;
      
      if (balance.haic > 0) {
        usersWithHAIC++;
      }
    }

    // Summary
    console.log('📈 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Users: ${users.length}`);
    console.log(`Users with Wallets: ${usersWithWallets}`);
    console.log(`Users with HAIC: ${usersWithHAIC}`);
    console.log(`Wallet Coverage: ${((usersWithWallets / users.length) * 100).toFixed(1)}%`);
    console.log(`Total HAIC Supply: ${formatBalance(totalHAIC)}`);
    console.log(`Total XRP Supply: ${formatBalance(totalXRP)}`);

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
  getAllUsers,
  getUserByEmail
};
