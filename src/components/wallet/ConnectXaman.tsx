import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { walletService } from "@/services/wallet.service";
import { useAuth } from "@/contexts/AuthContext";
import { xumm } from "@/lib/wallet/xaman";

interface ConnectXamanProps {
    onConnected: () => void;
}

export function ConnectXaman({ onConnected }: ConnectXamanProps) {
    const { user } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);

        try {
            // Use xumm.authorize() for browser-based sign-in
            // This handles the entire flow including Mobile redirection and Desktop popup
            // It returns a ResolvedFlow on success, or an Error (or null/false in some versions)
            const authorization = await xumm.authorize();

            if (!authorization) {
                throw new Error('Failed to initiate authorization');
            }

            if (authorization instanceof Error) {
                // User cancelled or error occurred
                console.log('Authorization error or cancellation:', authorization);
                // Don't toast on simple cancellation if possible, but Error usually implies failure
                if (authorization.message !== 'cancelled') {
                    toast.error(authorization.message || 'Connection failed');
                }
                return;
            }

            // At this point, authorization is ResolvedFlow from xumm
            const result = authorization;
            console.log('✅ Xaman authorization completed:', result);

            const account = result.me?.account;

            if (!account) {
                throw new Error('No account address received from Xaman');
            }

            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            // Link the wallet to user account
            await walletService.linkXamanWallet(user.id, {
                address: account,
                token: result.jwt || '',
                uui: result.me?.sub || ''
            });

            toast.success(`✅ Xaman wallet connected: ${account.slice(0, 8)}...${account.slice(-6)}`);
            onConnected();

        } catch (error) {
            console.error('Xaman Connection Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect Xaman wallet';
            toast.error(errorMessage);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2"
        >
            {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
            )}
            {isConnecting ? 'Connecting...' : 'Connect Xaman'}
        </Button>
    );
}
