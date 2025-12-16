# XUMM Balance Fetcher Scripts

This directory contains scripts to fetch HAIC and XRP balances from XUMM wallets.

## Scripts Overview

### 1. `simple-xumm-fetcher.js` - Single Wallet Fetcher
Fetches balance for a single wallet address without database dependencies.

**Usage:**
```bash
node scripts/simple-xumm-fetcher.js <wallet-address>
```

**Example:**
```bash
node scripts/simple-xumm-fetcher.js rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
```

### 2. `fetch-xumm-balances.js` - Full Database Integration
Fetches balances for all users in the database with full AWS Amplify integration.

**Usage:**
```bash
# Fetch all users
node scripts/fetch-xumm-balances.js

# Fetch specific user
node scripts/fetch-xumm-balances.js --user-email user@example.com

# Fetch specific wallet
node scripts/fetch-xumm-balances.js --wallet-address rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
```

### 3. `test-wallets.js` - Multiple Wallet Tester
Tests multiple wallet addresses for balance fetching.

**Usage:**
```bash
node scripts/test-wallets.js
```

## Prerequisites

1. **Node.js** installed
2. **AWS Amplify** configured (for database scripts)
3. **XUMM API credentials** configured in the scripts

## Configuration

The XUMM API credentials are configured in each script:

```javascript
const XUMM_CONFIG = {
  apiKey: "apiKey",
  apiSecret: "apiSecret",
  baseUrl: "https://xumm.app/api/v1"
};
```

## Output Examples

### Single Wallet Output:
```
🚀 Starting Simple XUMM Balance Fetcher...

🔗 Wallet Address: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
🔑 API Key: 81714331...

🔍 Fetching balance for wallet: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
📡 Response status: 200

📊 WALLET BALANCE
==================================================
HAIC: 150.000000
XRP:  25.500000
✅ User has 150.000000 HAIC tokens!
✅ User has 25.500000 XRP!
```

### Database Integration Output:
```
🚀 Starting XUMM Balance Fetcher...

👥 Fetching all users...
📊 Processing 6 users...

👤 John Doe (john@example.com)
   Wallet: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
   HAIC: 150.000000
   XRP:  25.500000

👤 Jane Smith (jane@example.com)
   Wallet: rPT1Sjq2YGrBMTttX4GZHjKu9fFrrV1AH4
   HAIC: 75.000000
   XRP:  12.250000

📈 SUMMARY
==================================================
Total Users: 6
Users with Wallets: 4
Users with HAIC: 3
Wallet Coverage: 66.7%
Total HAIC Supply: 225.000000
Total XRP Supply: 37.750000
```

## Error Handling

The scripts include comprehensive error handling:

- **Network errors**: Retry logic and timeout handling
- **API errors**: Detailed error messages and status codes
- **JSON parsing**: Graceful handling of malformed responses
- **Rate limiting**: Built-in delays between requests

## Troubleshooting

### Common Issues:

1. **"Request timeout"**
   - Check internet connection
   - Verify XUMM API is accessible
   - Increase timeout in script if needed

2. **"Failed to parse JSON"**
   - Check API response format
   - Verify XUMM API credentials
   - Check if wallet address is valid

3. **"No HAIC trustline found"**
   - User may not have HAIC tokens
   - Trustline may not be established
   - Check if HAIC token is properly configured

### Debug Mode:

Add `console.log` statements in the scripts to see raw API responses:

```javascript
console.log('📊 Raw API Response:');
console.log(JSON.stringify(data, null, 2));
```

## Security Notes

- Wallet addresses are truncated in output for privacy
- API credentials are hardcoded (consider using environment variables)
- Scripts include rate limiting to avoid API abuse
- No sensitive data is logged or stored

## Integration with Admin Dashboard

These scripts use the same XUMM service logic as the admin dashboard:

- `xumm.service.ts` - Main service class
- `AdminDashboard.tsx` - Dashboard integration
- `AdminUsers.tsx` - User table integration

The scripts can be used to:
- Test XUMM API connectivity
- Verify wallet balance fetching
- Debug balance calculation issues
- Monitor HAIC token distribution