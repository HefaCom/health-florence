import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getSignClient, getWeb3Modal, joeyOptionalNamespaces, parseXRPLAccounts, JoeyAccount } from '../../lib/wallet/walletconnect';
import type { SessionTypes } from '@walletconnect/types';

type Props = {
	onConnected?: (account: JoeyAccount, session: SessionTypes.Struct) => void;
	onDisconnected?: () => void;
	className?: string;
	networkPreference?: 'xrpl:mainnet' | 'xrpl:testnet';
};

export const ConnectJoey: React.FC<Props> = ({ onConnected, onDisconnected, className, networkPreference = 'xrpl:testnet' }) => {
	const [isConnecting, setIsConnecting] = useState(false);
	const [session, setSession] = useState<SessionTypes.Struct | null>(null);
	const [account, setAccount] = useState<JoeyAccount | null>(null);
	const [error, setError] = useState<string | null>(null);
	const wcModal = useMemo(() => getWeb3Modal(), []);

	const connect = useCallback(async () => {
		console.log('[Joey] Starting connection flow...');
		setIsConnecting(true);
		setError(null);

		let modalClosed = false;
		const closeModal = () => {
			if (!modalClosed) {
				wcModal.closeModal();
				modalClosed = true;
			}
		};

		try {
			console.log('[Joey] Initializing SignClient...');
			const client = await getSignClient();
			console.log('[Joey] SignClient initialized successfully');

			console.log('[Joey] Creating connection request with optional namespaces');
			const { uri, approval } = await client.connect({
				optionalNamespaces: joeyOptionalNamespaces,
			});

			if (uri) {
				console.log('[Joey] Opening WalletConnect modal with URI');
				wcModal.openModal({ uri });
			} else {
				console.warn('[Joey] No URI received from connect request');
			}

			// Add timeout for approval
			console.log('[Joey] Waiting for approval from Joey wallet app...');
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error('Connection timeout - please try again')), 120000); // 2 minute timeout
			});

			const sess = await Promise.race([approval(), timeoutPromise]);
			console.log('[Joey] Approval received! Session:', sess);

			// Validate session
			if (!sess || !sess.namespaces) {
				throw new Error('Invalid session received - missing namespaces');
			}

			console.log('[Joey] Parsing XRPL accounts from session...');
			const accounts = parseXRPLAccounts(sess.namespaces);
			console.log('[Joey] Parsed accounts:', accounts);

			if (accounts.length === 0) {
				const namespaceDump = JSON.stringify(sess.namespaces, null, 2);
				console.error('[Joey] No accounts parsed. Namespace dump:', namespaceDump);
				throw new Error(`No XRPL accounts found in session. Namespaces: ${namespaceDump}`);
			}

			const preferred = accounts.find(a => a.chain === networkPreference) || accounts[0];
			console.log('[Joey] Selected account:', preferred);

			if (!preferred || !preferred.address) {
				throw new Error('Invalid account data - missing address');
			}

			setSession(sess);
			setAccount(preferred);

			console.log('[Joey] Calling onConnected callback...');
			try {
				await onConnected?.(preferred, sess);
				console.log('[Joey] Connection successful!');
			} catch (callbackError) {
				console.error('[Joey] Error in onConnected callback:', callbackError);
				throw new Error('Failed to save wallet connection');
			}

			// Close modal after successful connection
			closeModal();
		} catch (e) {
			console.error('[Joey] Connection failed:', e);
			const errorMessage = e instanceof Error ? e.message : 'Failed to connect wallet';
			setError(errorMessage);

			// Close modal on error
			closeModal();
		} finally {
			setIsConnecting(false);
		}
	}, [networkPreference, onConnected, wcModal]);

	const disconnect = useCallback(async () => {
		try {
			const client = await getSignClient();
			if (session) {
				await client.disconnect({
					topic: session.topic,
					reason: { code: 6000, message: 'User disconnected' },
				});
			}
		} catch (e) {
			console.error('Joey disconnect failed', e);
		} finally {
			setSession(null);
			setAccount(null);
			onDisconnected?.();
		}
	}, [onDisconnected, session]);

	useEffect(() => {
		let unsub = () => { };
		(async () => {
			const client = await getSignClient();
			const handler = (updated: SessionTypes.Struct) => {
				if (updated.topic !== session?.topic) return;
				const accounts = parseXRPLAccounts(updated.namespaces);
				const preferred = accounts.find(a => a.chain === networkPreference) || accounts[0] || null;
				if (preferred) {
					setAccount(preferred);
					// Notify parent to persist the new account link
					console.log('[Joey] Account updated via session event:', preferred.address);
					onConnected?.(preferred, { ...updated, namespaces: updated.namespaces });
				}
			};
			client.on('session_update', ({ topic, params }) => {
				if (topic !== session?.topic) return;
				handler({ ...(session as SessionTypes.Struct), namespaces: params.namespaces });
			});
			client.on('session_delete', ({ topic }) => {
				if (topic !== session?.topic) return;
				setSession(null);
				setAccount(null);
				onDisconnected?.();
			});
			unsub = () => {
				client.removeAllListeners('session_update');
				client.removeAllListeners('session_delete');
			};
		})();
		return () => unsub();
	}, [networkPreference, onDisconnected, session]);

	if (!account) {
		return (
			<div className="space-y-2">
				<button
					type="button"
					onClick={connect}
					disabled={isConnecting}
					className={className || 'px-4 py-2 rounded bg-black text-white disabled:opacity-50'}
				>
					{isConnecting ? 'Connecting…' : 'Connect Joey Wallet'}
				</button>
				{error && (
					<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
						<strong>Connection failed:</strong> {error}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={className || 'flex items-center gap-2'}>
			<span className="text-sm font-medium">XRPL</span>
			<span className="text-xs text-gray-600">{account.chain}</span>
			<span className="text-xs font-mono">{account.address.slice(0, 6)}…{account.address.slice(-6)}</span>
			<button
				type="button"
				onClick={disconnect}
				className="ml-2 px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
			>
				Disconnect
			</button>
		</div>
	);
};

export default ConnectJoey;






