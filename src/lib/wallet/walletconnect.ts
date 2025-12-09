import SignClient from '@walletconnect/sign-client';
type RequiredNamespace = {
	methods: string[];
	chains: string[];
	events: string[];
};
type RequiredNamespaces = Record<string, RequiredNamespace>;
import { WalletConnectModal } from '@walletconnect/modal';

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID : undefined);

if (!WALLETCONNECT_PROJECT_ID) {
	console.warn('WalletConnect project ID is not set. Set VITE_WALLETCONNECT_PROJECT_ID or NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.');
} else {
	console.log('[WalletConnect] Project ID loaded:', WALLETCONNECT_PROJECT_ID.slice(0, 8) + '...');
}

let signClientPromise: Promise<SignClient> | null = null;
let web3Modal: WalletConnectModal | null = null;

export function getWeb3Modal() {
	if (!web3Modal) {
		console.log('[WalletConnect] Initializing Web3Modal...');
		web3Modal = new WalletConnectModal({
			projectId: WALLETCONNECT_PROJECT_ID || '',
			themeMode: 'light',
		});
	}
	return web3Modal;
}

export async function getSignClient(): Promise<SignClient> {
	if (!signClientPromise) {
		console.log('[WalletConnect] Initializing SignClient...');
		signClientPromise = SignClient.init({
			projectId: WALLETCONNECT_PROJECT_ID || '',
			metadata: {
				name: 'Health Florence',
				description: 'HAIC XRPL Joey Wallet integration',
				url: 'https://health-florence.app',
				icons: ['https://health-florence.app/favicon.ico'],
			},
		});
	}
	return signClientPromise;
}

// Strict requirements (legacy support)
export const joeyRequiredNamespaces: RequiredNamespaces = {
	xrpl: {
		methods: [
			'xrpl_signTransaction',
			'xrpl_signAndSubmitTransaction',
			'xrpl_signMessage',
		],
		chains: ['xrpl:mainnet', 'xrpl:testnet'],
		events: ['accountsChanged'],
	},
};

// Permissive requirements (recommended)
export const joeyOptionalNamespaces: Record<string, any> = {
	xrpl: {
		methods: [
			'xrpl_signTransaction',
			'xrpl_signAndSubmitTransaction',
			'xrpl_signMessage',
		],
		chains: [
			'xrpl:0',       // Mainnet (CAIP-2 standard)
			'xrpl:1',       // Testnet (CAIP-2 standard)
			'xrpl:mainnet', // Legacy/Custom
			'xrpl:testnet'  // Legacy/Custom
		],
		events: ['accountsChanged'],
	},
};

export type JoeyAccount = {
	address: string;
	chain: string;
};

export function parseXRPLAccounts(namespaces: Record<string, any>): JoeyAccount[] {
	console.log('[WalletConnect] Parsing XRPL accounts from namespaces:', JSON.stringify(namespaces, null, 2));
	const accounts: JoeyAccount[] = [];

	if (!namespaces) {
		console.warn('[WalletConnect] No namespaces provided');
		return accounts;
	}

	// Search in all namespaces for XRPL accounts
	// Joey wallet might return them under 'xrpl', or specific chain IDs, or other keys
	Object.keys(namespaces).forEach(key => {
		const ns = namespaces[key];
		console.log(`[WalletConnect] Checking namespace '${key}':`, ns);

		if (ns && Array.isArray(ns.accounts)) {
			for (const acc of ns.accounts) {
				if (typeof acc !== 'string') continue;

				console.log(`[WalletConnect] Checking account: ${acc}`);

				// format: `${namespace}:${chainId}:${address}`
				const parts = acc.split(':');

				// We expect 3 parts for CAIP-10
				if (parts.length === 3) {
					const [namespace, chain, address] = parts;
					if (namespace === 'xrpl' && address) {
						console.log(`[WalletConnect] Found valid XRPL account: ${address} on chain ${chain}`);
						accounts.push({ address, chain: `xrpl:${chain}` });
					}
				}
			}
		}
	});

	// De-duplicate accounts by address and chain
	const uniqueAccounts = accounts.filter((acc, index, self) =>
		index === self.findIndex((t) => (
			t.address === acc.address && t.chain === acc.chain
		))
	);

	console.log('[WalletConnect] Total parsed unique accounts:', uniqueAccounts.length);
	return uniqueAccounts;
}

