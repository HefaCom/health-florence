import { Xumm } from 'xumm';

/**
 * Initialize XUMM SDK for browser-side wallet connectivity
 * 
 * For browser/client-side usage, only the API key is required.
 * The XUMM SDK handles QR code generation and payload subscriptions.
 * 
 * Note: API secret is only needed for server-side operations.
 * In a production environment, consider using environment variables.
 */

// Get API key from environment or use hardcoded value
const XUMM_API_KEY = import.meta.env.VITE_XUMM_API_KEY || '81714331-6a90-496a-8af4-c0655922715a';

// Validate API key exists
if (!XUMM_API_KEY) {
    throw new Error('XUMM API key is not configured. Please set VITE_XUMM_API_KEY environment variable.');
}

// Initialize XUMM SDK
export const xumm = new Xumm(XUMM_API_KEY);

// Log initialization (only in development)
if (import.meta.env.DEV) {
    console.log('✅ XUMM SDK initialized for browser-side wallet connectivity');
}
