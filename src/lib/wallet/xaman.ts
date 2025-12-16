import { XummPkce } from 'xumm-oauth2-pkce';

/**
 * Initialize XUMM SDK for browser-side wallet connectivity (PKCE Flow)
 * 
 * We use the Authorization Code Flow (PKCE) which is secure for client-side applications.
 * This redirects the user to xumm.app to sign in, avoiding API Secret exposure and CORS issues.
 */

// Get API key from environment or use hardcoded value
const XUMM_API_KEY = import.meta.env.VITE_XUMM_API_KEY || '81714331-6a90-496a-8af4-c0655922715a';

// Validate API key exists
if (!XUMM_API_KEY) {
    throw new Error('XUMM API key is not configured. Please set VITE_XUMM_API_KEY environment variable.');
}

// Initialize XUMM PKCE SDK
export const xumm = new XummPkce(XUMM_API_KEY, {
    implicit: true, // Use implicit flow for simpler client-side setup if supported, or standard PKCE
    redirectUrl: window.location.href // Redirect back to the current page
});

// Log initialization (only in development)
if (import.meta.env.DEV) {
    console.log('✅ XUMM PKCE SDK initialized');
}

