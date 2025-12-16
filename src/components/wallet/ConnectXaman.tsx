import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { xumm } from "@/lib/wallet/xaman";

interface ConnectXamanProps {
    onConnected: () => void;
}

export function ConnectXaman({ onConnected }: ConnectXamanProps) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = useCallback(async () => {
        setIsConnecting(true);
        try {
            console.log('🚀 Starting Xaman PKCE connection...');
            // This will redirect the user to Xumm.app
            await xumm.authorize();
            // Code execution stops here due to redirect
        } catch (error) {
            console.error('Xaman Connection Error:', error);
            toast.error('Failed to initiate Xaman connection');
            setIsConnecting(false);
        }
    }, []);

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
            {isConnecting ? 'Redirecting...' : 'Connect Xaman'}
        </Button>
    );
}
