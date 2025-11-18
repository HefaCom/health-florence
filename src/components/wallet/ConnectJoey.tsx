import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getSignClient, getWeb3Modal, joeyRequiredNamespaces, parseXRPLAccounts, JoeyAccount } from '../../lib/wallet/walletconnect';
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
	const wcModal = useMemo(() => getWeb3Modal(), []);

	const connect = useCallback(async () => {
		setIsConnecting(true);
		try {
			const client = await getSignClient();
			const { uri, approval } = await client.connect({
				requiredNamespaces: {
					...joeyRequiredNamespaces,
					xrpl: {
						...joeyRequiredNamespaces.xrpl,
						chains: [networkPreference],
					},
				},
			});

			if (uri) {
				wcModal.openModal({ uri });
			}

			const sess = await approval();
			setSession(sess);
			const accounts = parseXRPLAccounts(sess.namespaces);
			const preferred = accounts.find(a => a.chain === networkPreference) || accounts[0] || null;
			if (preferred) {
				setAccount(preferred);
				onConnected?.(preferred, sess);
			}
		} catch (e) {
			console.error('Joey connect failed', e);
		} finally {
			wcModal.closeModal();
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
		let unsub = () => {};
		(async () => {
			const client = await getSignClient();
			const handler = (updated: SessionTypes.Struct) => {
				if (updated.topic !== session?.topic) return;
				const accounts = parseXRPLAccounts(updated.namespaces);
				const preferred = accounts.find(a => a.chain === networkPreference) || accounts[0] || null;
				if (preferred) setAccount(preferred);
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
			<button
				type="button"
				onClick={connect}
				disabled={isConnecting}
				className={className || 'px-4 py-2 rounded bg-black text-white disabled:opacity-50'}
			>
				{isConnecting ? 'Connecting…' : 'Connect Joey Wallet'}
			</button>
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






