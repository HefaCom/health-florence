import { xrplService } from './xrpl.service';

export async function debugXRPLConnection() {
  console.log('🔍 Starting XRPL Debug Session...');
  
  try {
    // Test connection
    console.log('📡 Testing XRPL connection...');
    const connected = await xrplService.connect();
    if (!connected) {
      console.error('❌ Failed to connect to XRPL');
      return;
    }
    console.log('✅ Connected to XRPL successfully');
    
    // Test wallet initialization
    console.log('👛 Testing wallet initialization...');
    const wallet = await xrplService.initializeWallet();
    console.log('✅ Wallet initialized:', wallet.address);
    
    // Test a simple transaction submission
    console.log('📤 Testing transaction submission...');
    const testMerkleRoot = 'test-merkle-root-' + Date.now();
    const result = await xrplService.submitAuditTrail(testMerkleRoot);
    
    console.log('📊 Transaction Result:', JSON.stringify(result, null, 2));
    
    if (result.success && result.hash) {
      console.log('✅ Transaction submitted successfully');
      console.log('🔗 Transaction Hash:', result.hash);
      
      // Validate the hash
      const validation = xrplService.validateTransactionHash(result.hash);
      console.log('🔍 Hash Validation:', validation);
      
      if (validation.isValid) {
        console.log('✅ Hash is valid');
      } else {
        console.error('❌ Hash is invalid:', validation.error);
      }
    } else {
      console.error('❌ Transaction failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Debug session failed:', error);
  } finally {
    // Disconnect
    await xrplService.disconnect();
    console.log('🔌 Disconnected from XRPL');
  }
}

// Test hash validation
export function testHashValidation() {
  console.log('🔍 Testing Hash Validation...');
  
  const testHashes = [
    '', // Empty
    'invalid', // Invalid format
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Valid 64-char hex
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdeg', // Invalid char
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde', // Too short
    'pending', // Placeholder
    'redundant-12345678' // Placeholder
  ];
  
  testHashes.forEach(hash => {
    const validation = xrplService.validateTransactionHash(hash);
    console.log(`Hash: "${hash}" -> ${validation.isValid ? '✅ Valid' : '❌ Invalid'}: ${validation.error || 'N/A'}`);
  });
}

// Run debug if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).debugXRPL = debugXRPLConnection;
  (window as any).testHashValidation = testHashValidation;
} 