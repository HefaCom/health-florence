#!/usr/bin/env node

/**
 * Test XUMM API Connection
 * 
 * Simple script to test if XUMM API is accessible and credentials are working.
 * 
 * Usage:
 *   node scripts/test-xumm-connection.js
 */

import https from 'https';

// XUMM API Configuration
const XUMM_CONFIG = {
  apiKey: "81714331-6a90-496a-8af4-c0655922715a",
  apiSecret: "e7977f2c-5205-42a5-a800-3c7186672674",
  baseUrl: "https://xumm.app/api/v1"
};

/**
 * Test XUMM API connection
 */
async function testXUMMConnection() {
  console.log('🚀 Testing XUMM API Connection...\n');
  
  console.log(`🔑 API Key: ${XUMM_CONFIG.apiKey.substring(0, 8)}...`);
  console.log(`🔐 API Secret: ${XUMM_CONFIG.apiSecret.substring(0, 8)}...`);
  console.log(`🌐 Base URL: ${XUMM_CONFIG.baseUrl}`);
  console.log('');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'xumm.app',
      port: 443,
      path: '/api/v1/ping',
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
      console.log(`📡 Response headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response body: ${data}`);
        
        if (res.statusCode === 200) {
          console.log('✅ XUMM API connection successful!');
          resolve({ success: true, status: res.statusCode, data });
        } else {
          console.log(`⚠️  XUMM API returned status ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Connection failed: ${error.message}`);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });

    req.end();
  });
}

/**
 * Test with a sample wallet address
 */
async function testWithSampleWallet() {
  console.log('\n🔗 Testing with sample wallet address...');
  
  // Use a well-known XRP address for testing
  const sampleAddress = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH';
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'xumm.app',
      port: 443,
      path: `/api/v1/account/${sampleAddress}`,
      method: 'GET',
      headers: {
        'X-API-Key': XUMM_CONFIG.apiKey,
        'X-API-Secret': XUMM_CONFIG.apiSecret,
        'Content-Type': 'application/json'
      }
    };

    console.log(`🔍 Testing account endpoint: ${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      console.log(`📡 Response status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Account data retrieved successfully!');
          console.log('📊 Sample account data:');
          console.log(JSON.stringify(jsonData, null, 2));
          resolve({ success: true, data: jsonData });
        } catch (error) {
          console.error('❌ Failed to parse account data:', error.message);
          console.log('Raw response:', data);
          resolve({ success: false, error: error.message, rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Account request failed: ${error.message}`);
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Account request timeout'));
    });

    req.end();
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Test basic connection
    const connectionResult = await testXUMMConnection();
    
    if (connectionResult.success) {
      console.log('\n🎉 XUMM API is accessible and credentials are working!');
      
      // Test with sample wallet
      try {
        const accountResult = await testWithSampleWallet();
        
        if (accountResult.success) {
          console.log('\n✅ Full XUMM integration test passed!');
          console.log('🚀 You can now use the balance fetching scripts.');
        } else {
          console.log('\n⚠️  Basic connection works, but account data retrieval failed.');
          console.log('This might be due to the sample wallet address or API permissions.');
        }
      } catch (error) {
        console.log('\n⚠️  Basic connection works, but account test failed:', error.message);
      }
    } else {
      console.log('\n❌ XUMM API connection failed!');
      console.log('Please check your API credentials and network connection.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  testXUMMConnection,
  testWithSampleWallet
};
