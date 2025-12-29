export const XRPL_CONFIG = {
    // Testnet Issuer Address (HAIC Token Issuer)
    // This should be an account with 'DefaultRipple' flag enabled
    // For production, this must be replaced with the persistent Cold Wallet address
    ISSUER_ADDRESS: 'roFYYcmHunBu8Qp8dLEYcqxsS3EDvyuUY',

    // XRPL Network Endpoint
    NETWORK_URL: 'wss://s.altnet.rippletest.net:51233',

    // Token Definitions
    TOKEN_CURRENCY: 'HAIC',
    MAX_SUPPLY: '1000000000', // 1 Billion

    // Timeouts & Limits
    CONNECTION_TIMEOUT: 20000,
    MAX_RETRIES: 5
};
