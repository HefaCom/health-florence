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
}

let signClientPromise: Promise<SignClient> | null = null;
let web3Modal: WalletConnectModal | null = null;

export function getWeb3Modal() {
	if (!web3Modal) {
		web3Modal = new WalletConnectModal({
			projectId: WALLETCONNECT_PROJECT_ID || '',
			themeMode: 'light',
		});
	}
	return web3Modal;
}

export async function getSignClient(): Promise<SignClient> {
	if (!signClientPromise) {
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

export const joeyRequiredNamespaces: RequiredNamespaces = {
	// XRPL over WalletConnect via Joey Wallet
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

export type JoeyAccount = {
	address: string;
	chain: string;
};

export function parseXRPLAccounts(namespaces: Record<string, any>): JoeyAccount[] {
	const accounts: JoeyAccount[] = [];
	const ns = namespaces?.xrpl;
	if (!ns || !Array.isArray(ns.accounts)) return accounts;
	for (const acc of ns.accounts) {
		// format: `${namespace}:${chainId}:${address}`
		const [namespace, chain, address] = acc.split(':');
		if (namespace === 'xrpl' && address) {
			accounts.push({ address, chain: `xrpl:${chain}` });
		}
	}
	return accounts;
}


